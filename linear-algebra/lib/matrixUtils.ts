export type Matrix = number[][];

const EPS = 1e-10;

const clone = (A: Matrix): Matrix => A.map((row) => [...row]);

const swapRows = (A: Matrix, i: number, j: number) => {
  const tmp = A[i];
  A[i] = A[j];
  A[j] = tmp;
};

const identity = (n: number): Matrix =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

const isSquare = (A: Matrix) =>
  A.length > 0 && A.every((row) => row.length === A.length);

// วิธีที่ 1: Gaussian Elimination (Back Substitution)
export const gaussianElimination = (A: Matrix, b: number[]): number[] => {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let k = 0; k < n; k += 1) {
    // Partial pivoting
    let pivotRow = k;
    let maxVal = Math.abs(M[k][k]);
    for (let i = k + 1; i < n; i += 1) {
      const val = Math.abs(M[i][k]);
      if (val > maxVal) {
        maxVal = val;
        pivotRow = i;
      }
    }
    if (maxVal < EPS) {
      throw new Error("Matrix is singular or nearly singular.");
    }
    if (pivotRow !== k) swapRows(M, k, pivotRow);

    for (let i = k + 1; i < n; i += 1) {
      const factor = M[i][k] / M[k][k];
      for (let j = k; j <= n; j += 1) {
        M[i][j] -= factor * M[k][j];
      }
    }
  }

  const x = Array.from({ length: n }, () => 0);
  for (let i = n - 1; i >= 0; i -= 1) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j += 1) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }

  return x;
};

// วิธีที่ 2: Gauss-Jordan Elimination (RREF)
export const gaussJordan = (A: Matrix, b?: number[]): Matrix => {
  const M = clone(A);
  const rows = M.length;
  const cols = M[0]?.length ?? 0;

  if (b) {
    for (let i = 0; i < rows; i += 1) {
      M[i].push(b[i]);
    }
  }

  let lead = 0;
  for (let r = 0; r < rows; r += 1) {
    if (lead >= cols) break;

    let i = r;
    while (Math.abs(M[i][lead]) < EPS) {
      i += 1;
      if (i === rows) {
        i = r;
        lead += 1;
        if (lead === cols) return M;
      }
    }
    if (i !== r) swapRows(M, i, r);

    const pivot = M[r][lead];
    for (let j = 0; j < M[r].length; j += 1) {
      M[r][j] /= pivot;
    }

    for (let k = 0; k < rows; k += 1) {
      if (k === r) continue;
      const factor = M[k][lead];
      for (let j = 0; j < M[k].length; j += 1) {
        M[k][j] -= factor * M[r][j];
      }
    }
    lead += 1;
  }
  return M;
};

// วิธีที่ 3: LU Factorization (Doolittle)
export const luFactorization = (A: Matrix): { L: Matrix; U: Matrix } => {
  if (!isSquare(A)) {
    throw new Error("Matrix must be square for LU factorization.");
  }
  const n = A.length;
  const L = identity(n);
  const U = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));

  for (let i = 0; i < n; i += 1) {
    for (let k = i; k < n; k += 1) {
      let sum = 0;
      for (let j = 0; j < i; j += 1) {
        sum += L[i][j] * U[j][k];
      }
      U[i][k] = A[i][k] - sum;
    }

    for (let k = i + 1; k < n; k += 1) {
      let sum = 0;
      for (let j = 0; j < i; j += 1) {
        sum += L[k][j] * U[j][i];
      }
      if (Math.abs(U[i][i]) < EPS) {
        throw new Error("Zero pivot encountered in LU factorization.");
      }
      L[k][i] = (A[k][i] - sum) / U[i][i];
    }
  }

  return { L, U };
};

// วิธีที่ 4: Inverse Matrix (Gauss-Jordan on [A|I])
export const inverseMatrix = (A: Matrix): Matrix => {
  if (!isSquare(A)) {
    throw new Error("Matrix must be square to compute inverse.");
  }
  const n = A.length;
  const M = A.map((row, i) => [...row, ...identity(n)[i]]);

  for (let i = 0; i < n; i += 1) {
    let pivotRow = i;
    let maxVal = Math.abs(M[i][i]);
    for (let r = i + 1; r < n; r += 1) {
      const val = Math.abs(M[r][i]);
      if (val > maxVal) {
        maxVal = val;
        pivotRow = r;
      }
    }
    if (maxVal < EPS) {
      throw new Error("Matrix is singular or nearly singular.");
    }
    if (pivotRow !== i) swapRows(M, i, pivotRow);

    const pivot = M[i][i];
    for (let j = 0; j < 2 * n; j += 1) {
      M[i][j] /= pivot;
    }
    for (let r = 0; r < n; r += 1) {
      if (r === i) continue;
      const factor = M[r][i];
      for (let j = 0; j < 2 * n; j += 1) {
        M[r][j] -= factor * M[i][j];
      }
    }
  }

  return M.map((row) => row.slice(n));
};

// วิธีที่ 5: Cramer's Rule
export const cramersRule = (A: Matrix, b: number[]): number[] => {
  if (!isSquare(A)) {
    throw new Error("Matrix must be square for Cramer's Rule.");
  }
  const detA = determinant(A);
  if (Math.abs(detA) < EPS) {
    throw new Error("det(A) = 0, no unique solution.");
  }
  const n = A.length;
  const result = Array.from({ length: n }, () => 0);
  for (let col = 0; col < n; col += 1) {
    const Ai = clone(A);
    for (let row = 0; row < n; row += 1) {
      Ai[row][col] = b[row];
    }
    result[col] = determinant(Ai) / detA;
  }
  return result;
};

const determinant = (A: Matrix): number => {
  if (!isSquare(A)) {
    throw new Error("Matrix must be square to compute determinant.");
  }
  const n = A.length;
  const M = clone(A);
  let det = 1;
  let swaps = 0;

  for (let k = 0; k < n; k += 1) {
    let pivotRow = k;
    let maxVal = Math.abs(M[k][k]);
    for (let i = k + 1; i < n; i += 1) {
      const val = Math.abs(M[i][k]);
      if (val > maxVal) {
        maxVal = val;
        pivotRow = i;
      }
    }
    if (maxVal < EPS) return 0;
    if (pivotRow !== k) {
      swapRows(M, k, pivotRow);
      swaps += 1;
    }
    const pivot = M[k][k];
    det *= pivot;
    for (let i = k + 1; i < n; i += 1) {
      const factor = M[i][k] / pivot;
      for (let j = k; j < n; j += 1) {
        M[i][j] -= factor * M[k][j];
      }
    }
  }

  return swaps % 2 === 0 ? det : -det;
};
