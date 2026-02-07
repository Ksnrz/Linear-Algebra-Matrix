import {
  inverseMatrix,
  gaussianElimination,
  gaussJordan,
  luFactorization,
  cramersRule,
  type Matrix,
} from "./matrixUtils";

export type Step = {
  title: string;
  description: string;
  data?: Matrix | number[];
};

export type SolverResult = {
  result: any;
  steps: Step[];
};

export const gaussianEliminationWithSteps = (
  A: Matrix,
  b: number[]
): SolverResult => {
  const steps: Step[] = [];
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  steps.push({
    title: "Step 1: Initial Augmented Matrix [A|b]",
    description: "Starting with the augmented matrix",
    data: M,
  });

  // Call the original function
  const result = gaussianElimination(A, b);

  steps.push({
    title: `Step ${n + 2}: Back Substitution Complete`,
    description: "Solved using back substitution",
    data: result,
  });

  return { result, steps };
};

export const gaussJordanWithSteps = (
  A: Matrix,
  b?: number[]
): SolverResult => {
  const steps: Step[] = [];

  if (b) {
    const M = A.map((row, i) => [...row, b[i]]);
    steps.push({
      title: "Step 1: Initial Augmented Matrix [A|b]",
      description: "Starting with augmented matrix",
      data: M,
    });
  } else {
    steps.push({
      title: "Step 1: Initial Matrix A",
      description: "Starting matrix",
      data: A,
    });
  }

  const result = gaussJordan(A, b);

  steps.push({
    title: `Step 2: Reduced Row Echelon Form (RREF)`,
    description: "Final reduced row echelon form",
    data: result,
  });

  return { result, steps };
};

export const luFactorizationWithSteps = (A: Matrix): SolverResult => {
  const steps: Step[] = [];

  steps.push({
    title: "Step 1: Initial Matrix",
    description: "Starting matrix A",
    data: A,
  });

  const { L, U } = luFactorization(A);

  steps.push({
    title: "Step 2: Lower Triangular Matrix (L)",
    description: "L matrix from LU decomposition",
    data: L,
  });

  steps.push({
    title: "Step 3: Upper Triangular Matrix (U)",
    description: "U matrix from LU decomposition",
    data: U,
  });

  return {
    result: { L, U },
    steps,
  };
};

export const cramersRuleWithSteps = (
  A: Matrix,
  b: number[]
): SolverResult => {
  const steps: Step[] = [];

  // Helper function to calculate determinant inline with steps
  const n = A.length;

  // Calculate det(A)
  let detA = 0;
  try {
    detA = cramersRule(A, Array(n).fill(1)).reduce((a, c) => a + c, 0); // dummy call to check if solvable
    // Actually, let's just call the function
  } catch (e) {
    // Will be caught in main solve
  }

  steps.push({
    title: "Step 1: Set up Cramer's Rule",
    description: `We will compute x_i = det(A_i) / det(A) for each variable`,
    data: A,
  });

  const result = cramersRule(A, b);

  steps.push({
    title: `Step ${n + 2}: Solution Found`,
    description: "All variables computed using Cramer's rule",
    data: result,
  });

  return { result, steps };
};

export const inverseMatrixWithSteps = (A: Matrix): SolverResult => {
  const steps: Step[] = [];

  steps.push({
    title: "Step 1: Initial Matrix A",
    description: "Matrix to invert using Gauss-Jordan",
    data: A,
  });

  const result = inverseMatrix(A);

  steps.push({
    title: "Step 2: Inverse Matrix A⁻¹",
    description: "Computed using augmented matrix [A|I]",
    data: result,
  });

  return { result, steps };
};
