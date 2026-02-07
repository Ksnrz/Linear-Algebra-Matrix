export type EliminationStep = {
  matrix: number[][];
  operation: string;
  description: string;
};

export type EliminationResult = {
  result: number[][];
  steps: EliminationStep[];
};

/**
 * Format number to remove trailing .0000
 */
const formatNumber = (num: number, decimals: number = 4): string => {
  const fixed = num.toFixed(decimals);
  return parseFloat(fixed) === Math.floor(parseFloat(fixed))
    ? Math.floor(parseFloat(fixed)).toString()
    : fixed.replace(/\.?0+$/, "");
};

/**
 * Gaussian Elimination with Partial Pivoting - stops at Row Echelon Form (REF)
 * @param augmentedMatrix - The augmented matrix [A|b]
 * @returns Object containing final matrix and all steps with operations
 */
export const gaussianEliminationWithDetailedSteps = (
  augmentedMatrix: number[][]
): EliminationResult => {
  const steps: EliminationStep[] = [];
  const m = JSON.parse(JSON.stringify(augmentedMatrix)); // Deep copy
  const rows = m.length;
  const cols = m[0].length;

  // Initial step
  steps.push({
    matrix: m.map((row: number[]) => [...row]),
    operation: "Initial",
    description: "Starting augmented matrix [A|b]",
  });

  // Forward elimination to Row Echelon Form
  for (let col = 0; col < Math.min(rows, cols - 1); col++) {
    // Partial Pivoting: find pivot
    let maxRow = col;
    for (let row = col + 1; row < rows; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[maxRow][col])) {
        maxRow = row;
      }
    }

    // Swap rows if needed
    if (maxRow !== col) {
      [m[col], m[maxRow]] = [m[maxRow], m[col]];
      steps.push({
        matrix: m.map((row: number[]) => [...row]),
        operation: `R${col + 1} ↔ R${maxRow + 1}`,
        description: `Swap row ${col + 1} and row ${maxRow + 1} (partial pivoting)`,
      });
    }

    // Check for zero pivot
    if (Math.abs(m[col][col]) < 1e-10) {
      continue;
    }

    // Eliminate below pivot
    for (let row = col + 1; row < rows; row++) {
      if (Math.abs(m[row][col]) < 1e-10) continue;

      const factor = m[row][col] / m[col][col];
      const factorStr = formatNumber(factor);

      for (let j = col; j < cols; j++) {
        m[row][j] -= factor * m[col][j];
      }

      // Clean up floating point errors
      for (let j = 0; j < cols; j++) {
        if (Math.abs(m[row][j]) < 1e-10) m[row][j] = 0;
      }

      steps.push({
        matrix: m.map((row: number[]) => [...row]),
        operation: `R${row + 1} - ${factorStr}R${col + 1}`,
        description: `Eliminate below pivot: R${row + 1} = R${row + 1} - ${factorStr}R${col + 1}`,
      });
    }
  }

  return { result: m, steps };
};

/**
 * Gauss-Jordan Elimination with Partial Pivoting - produces Reduced Row Echelon Form (RREF)
 * @param augmentedMatrix - The augmented matrix [A|b]
 * @returns Object containing final matrix and all steps with operations
 */
export const gaussJordanWithDetailedSteps = (
  augmentedMatrix: number[][]
): EliminationResult => {
  const steps: EliminationStep[] = [];
  const m = JSON.parse(JSON.stringify(augmentedMatrix)); // Deep copy
  const rows = m.length;
  const cols = m[0].length;

  // Initial step
  steps.push({
    matrix: m.map((row: number[]) => [...row]),
    operation: "Initial",
    description: "Starting augmented matrix [A|b]",
  });

  let currentRow = 0;

  // Process each column
  for (let col = 0; col < Math.min(rows, cols - 1); col++) {
    if (currentRow >= rows) break;

    // Partial Pivoting: find pivot
    let maxRow = currentRow;
    for (let row = currentRow + 1; row < rows; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[maxRow][col])) {
        maxRow = row;
      }
    }

    // Swap rows if needed
    if (maxRow !== currentRow) {
      [m[currentRow], m[maxRow]] = [m[maxRow], m[currentRow]];
      steps.push({
        matrix: m.map((row: number[]) => [...row]),
        operation: `R${currentRow + 1} ↔ R${maxRow + 1}`,
        description: `Swap row ${currentRow + 1} and row ${maxRow + 1} (partial pivoting)`,
      });
    }

    // Check for zero pivot
    if (Math.abs(m[currentRow][col]) < 1e-10) {
      currentRow++;
      continue;
    }

    // Scale pivot row to make pivot = 1
    const pivotValue = m[currentRow][col];
    if (Math.abs(pivotValue - 1) > 1e-10) {
      const scaleFactor = 1 / pivotValue;
      const scaleStr = formatNumber(scaleFactor);

      for (let j = 0; j < cols; j++) {
        m[currentRow][j] /= pivotValue;
      }

      // Clean up floating point errors
      for (let j = 0; j < cols; j++) {
        if (Math.abs(m[currentRow][j]) < 1e-10) m[currentRow][j] = 0;
        if (Math.abs(m[currentRow][j] - Math.round(m[currentRow][j])) < 1e-10) {
          m[currentRow][j] = Math.round(m[currentRow][j]);
        }
      }

      steps.push({
        matrix: m.map((row: number[]) => [...row]),
        operation: `${scaleStr}R${currentRow + 1}`,
        description: `Scale row ${currentRow + 1} by ${scaleStr} to make pivot = 1`,
      });
    }

    // Eliminate above and below pivot
    for (let row = 0; row < rows; row++) {
      if (row === currentRow) continue;
      if (Math.abs(m[row][col]) < 1e-10) continue;

      const factor = m[row][col];
      const factorStr = formatNumber(factor);

      for (let j = 0; j < cols; j++) {
        m[row][j] -= factor * m[currentRow][j];
      }

      // Clean up floating point errors
      for (let j = 0; j < cols; j++) {
        if (Math.abs(m[row][j]) < 1e-10) m[row][j] = 0;
        if (Math.abs(m[row][j] - Math.round(m[row][j])) < 1e-10) {
          m[row][j] = Math.round(m[row][j]);
        }
      }

      steps.push({
        matrix: m.map((row: number[]) => [...row]),
        operation: `R${row + 1} - ${factorStr}R${currentRow + 1}`,
        description: `Eliminate in column ${col + 1}: R${row + 1} = R${row + 1} - ${factorStr}R${currentRow + 1}`,
      });
    }

    currentRow++;
  }

  return { result: m, steps };
};

/**
 * Extract solution vector from RREF matrix
 * @param rreffMatrix - Matrix in RREF form
 * @returns Solution vector from last column
 */
export const extractSolutionFromRREF = (rrefMatrix: number[][]): number[] => {
  return rrefMatrix.map((row) => row[row.length - 1]);
};

/**
 * Extract solution vector from REF matrix using back substitution
 * @param refMatrix - Matrix in REF form (augmented)
 * @returns Solution vector from back substitution
 */
export const extractSolutionFromREF = (refMatrix: number[][]): number[] => {
  const n = refMatrix.length;
  const solution = Array(n).fill(0);

  // Back substitution
  for (let i = n - 1; i >= 0; i--) {
    if (i < refMatrix[0].length - 1) {
      let sum = refMatrix[i][refMatrix[i].length - 1];
      for (let j = i + 1; j < n; j++) {
        sum -= refMatrix[i][j] * solution[j];
      }
      if (Math.abs(refMatrix[i][i]) > 1e-10) {
        solution[i] = sum / refMatrix[i][i];
      }
    }
  }

  return solution;
};
