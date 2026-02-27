import {
  Fraction,
  FractionMatrix,
  cloneFractionMatrix,
  numberMatrixToFractions,
  toFraction,
} from "./fractions";

export type FractionEliminationStep = {
  matrix: Fraction[][];
  operation: string;
  description: string;
};

export type FractionEliminationResult = {
  result: Fraction[][];
  steps: FractionEliminationStep[];
};

export type SystemClassification = "unique" | "infinite" | "none";

/**
 * Format Fraction for display in operations
 */
const formatFraction = (frac: Fraction | number): string => {
  if (typeof frac === "number") {
    frac = new Fraction(frac);
  }
  return frac.toString();
};

/**
 * Gaussian Elimination with Fraction Arithmetic - stops at Row Echelon Form (REF)
 * @param augmentedMatrix - The augmented matrix [A|b] as numbers or Fractions
 * @returns Object containing final matrix and all steps with operations
 */
export const gaussianEliminationWithFractions = (
  augmentedMatrix: (number | Fraction)[][]
): FractionEliminationResult => {
  const steps: FractionEliminationStep[] = [];

  // Convert to Fraction matrix
  const m: FractionMatrix = augmentedMatrix.map(row =>
    row.map(val => (typeof val === "number" ? new Fraction(val) : val))
  );

  const rows = m.length;
  const cols = m[0].length;

  // Initial step
  steps.push({
    matrix: cloneFractionMatrix(m),
    operation: "Initial",
    description: "Starting augmented matrix [A|b]",
  });

  // Forward elimination to Row Echelon Form
  for (let col = 0; col < Math.min(rows, cols - 1); col++) {
    // Partial Pivoting: find pivot with largest absolute value
    let maxRow = col;
    for (let row = col + 1; row < rows; row++) {
      if (Math.abs(m[row][col].toDecimal()) > Math.abs(m[maxRow][col].toDecimal())) {
        maxRow = row;
      }
    }

    // Swap rows if needed
    if (maxRow !== col) {
      [m[col], m[maxRow]] = [m[maxRow], m[col]];
      steps.push({
        matrix: cloneFractionMatrix(m),
        operation: `R${col + 1} ↔ R${maxRow + 1}`,
        description: `Swap row ${col + 1} and row ${maxRow + 1} (partial pivoting)`,
      });
    }

    // Check for zero pivot
    if (m[col][col].isNearZero()) {
      continue;
    }

    // Eliminate below pivot
    for (let row = col + 1; row < rows; row++) {
      if (m[row][col].isNearZero()) continue;

      const factor = Fraction.divide(m[row][col], m[col][col]);
      const factorStr = formatFraction(factor);

      for (let j = col; j < cols; j++) {
        m[row][j] = Fraction.subtract(m[row][j], Fraction.multiply(factor, m[col][j]));
      }

      steps.push({
        matrix: cloneFractionMatrix(m),
        operation: `R${row + 1} - ${factorStr}R${col + 1}`,
        description: `Eliminate below pivot: R${row + 1} = R${row + 1} - ${factorStr}R${col + 1}`,
      });
    }
  }

  return { result: m, steps };
};

/**
 * Gauss-Jordan Elimination with Fraction Arithmetic - produces Reduced Row Echelon Form (RREF)
 * @param augmentedMatrix - The augmented matrix [A|b] as numbers or Fractions
 * @returns Object containing final matrix and all steps with operations
 */
export const gaussJordanWithFractions = (
  augmentedMatrix: (number | Fraction)[][]
): FractionEliminationResult => {
  const steps: FractionEliminationStep[] = [];

  // Convert to Fraction matrix
  const m: FractionMatrix = augmentedMatrix.map(row =>
    row.map(val => (typeof val === "number" ? new Fraction(val) : val))
  );

  const rows = m.length;
  const cols = m[0].length;

  // Initial step
  steps.push({
    matrix: cloneFractionMatrix(m),
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
      if (Math.abs(m[row][col].toDecimal()) > Math.abs(m[maxRow][col].toDecimal())) {
        maxRow = row;
      }
    }

    // Swap rows if needed
    if (maxRow !== currentRow) {
      [m[currentRow], m[maxRow]] = [m[maxRow], m[currentRow]];
      steps.push({
        matrix: cloneFractionMatrix(m),
        operation: `R${currentRow + 1} ↔ R${maxRow + 1}`,
        description: `Swap row ${currentRow + 1} and row ${maxRow + 1} (partial pivoting)`,
      });
    }

    // Check for zero pivot
    if (m[currentRow][col].isNearZero()) {
      currentRow++;
      continue;
    }

    // Scale pivot row to make pivot = 1
    const pivotValue = m[currentRow][col];
    if (!pivotValue.equals(new Fraction(1))) {
      const scaleFactor = Fraction.divide(1, pivotValue);
      const scaleStr = formatFraction(scaleFactor);

      for (let j = 0; j < cols; j++) {
        m[currentRow][j] = Fraction.multiply(scaleFactor, m[currentRow][j]);
      }

      steps.push({
        matrix: cloneFractionMatrix(m),
        operation: `${scaleStr}R${currentRow + 1}`,
        description: `Scale row ${currentRow + 1} by ${scaleStr} to make pivot = 1`,
      });
    }

    // Eliminate above and below pivot
    for (let row = 0; row < rows; row++) {
      if (row === currentRow) continue;
      if (m[row][col].isNearZero()) continue;

      const factor = m[row][col];
      const factorStr = formatFraction(factor);

      for (let j = 0; j < cols; j++) {
        m[row][j] = Fraction.subtract(m[row][j], Fraction.multiply(factor, m[currentRow][j]));
      }

      steps.push({
        matrix: cloneFractionMatrix(m),
        operation: `R${row + 1} - ${factorStr}R${currentRow + 1}`,
        description: `Eliminate in column ${col + 1}: R${row + 1} = R${row + 1} - ${factorStr}R${currentRow + 1}`,
      });
    }

    currentRow++;
  }

  return { result: m, steps };
};

/**
 * Extract solution vector from RREF matrix (as Fractions)
 */
export const extractSolutionFromRREFFractions = (rrefMatrix: FractionMatrix): Fraction[] => {
  return rrefMatrix.map(row => row[row.length - 1]);
};

/**
 * Extract solution vector from REF matrix using back substitution (as Fractions)
 */
export const extractSolutionFromREFFractions = (refMatrix: FractionMatrix): Fraction[] => {
  const n = refMatrix.length;
  const solution: Fraction[] = Array(n).fill(null).map(() => new Fraction(0));

  // Back substitution
  for (let i = n - 1; i >= 0; i--) {
    if (i < refMatrix[0].length - 1) {
      let sum: Fraction = refMatrix[i][refMatrix[i].length - 1];
      for (let j = i + 1; j < n; j++) {
        sum = Fraction.subtract(sum, Fraction.multiply(refMatrix[i][j], solution[j]));
      }
      if (!refMatrix[i][i].isNearZero()) {
        solution[i] = Fraction.divide(sum, refMatrix[i][i]);
      }
    }
  }

  return solution;
};

/**
 * Classify an augmented matrix as unique, infinite, or no solution.
 */
export const classifyAugmentedSystemFractions = (
  matrix: FractionMatrix
): SystemClassification => {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  let rankA = 0;
  let rankAugmented = 0;

  for (let i = 0; i < rows; i++) {
    const hasCoeff = matrix[i].slice(0, cols - 1).some((v) => !v.isNearZero());
    const hasAny = matrix[i].some((v) => !v.isNearZero());

    if (hasCoeff) rankA++;
    if (hasAny) rankAugmented++;
  }

  if (rankA < rankAugmented) return "none";
  if (rankA < cols - 1) return "infinite";
  return "unique";
};
