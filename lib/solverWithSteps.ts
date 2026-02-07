import {
  inverseMatrix,
  gaussianElimination,
  gaussJordan,
  luFactorization,
  cramersRule,
  type Matrix,
} from "./matrixUtils";
import {
  gaussianEliminationWithDetailedSteps,
  gaussJordanWithDetailedSteps,
  extractSolutionFromRREF,
  extractSolutionFromREF,
  type EliminationStep,
} from "./eliminationWithSteps";
import {
  gaussianEliminationWithFractions,
  gaussJordanWithFractions,
  extractSolutionFromRREFFractions,
  extractSolutionFromREFFractions,
  type FractionEliminationStep,
} from "./fractionElimination";
import { Fraction, type FractionMatrix } from "./fractions";

export type Step = {
  title: string;
  description: string;
  data?: Matrix | number[] | FractionMatrix | Fraction[];
};

export type SolverResult = {
  result: any;
  steps: Step[];
};

export const gaussianEliminationWithSteps = (
  A: Matrix,
  b: number[]
): SolverResult => {
  // Create augmented matrix [A|b]
  const augmented: (number | Fraction)[][] = A.map((row, i) => [...row, b[i]]);

  // Use fraction-based elimination function
  const { result: refMatrix, steps: elimSteps } = gaussianEliminationWithFractions(augmented);

  // Extract solution via back substitution
  const solution = extractSolutionFromREFFractions(refMatrix);

  // Convert elimination steps to Step format
  const steps: Step[] = elimSteps.map((elimStep: FractionEliminationStep) => ({
    title: elimStep.operation,
    description: elimStep.description,
    data: elimStep.matrix,
  }));

  // Add final solution step
  steps.push({
    title: "Solution",
    description: "Back substitution complete - final solution",
    data: solution,
  });

  return { result: solution, steps };
};

export const gaussJordanWithSteps = (
  A: Matrix,
  b?: number[]
): SolverResult => {
  // Create augmented matrix [A|b]
  const augmented: (number | Fraction)[][] = A.map((row, i) => (b ? [...row, b[i]] : [...row, 0]));

  // Use fraction-based elimination function
  const { result: rrefMatrix, steps: elimSteps } = gaussJordanWithFractions(augmented);

  // Extract solution from RREF (last column)
  const solution = extractSolutionFromRREFFractions(rrefMatrix);

  // Convert elimination steps to Step format
  const steps: Step[] = elimSteps.map((elimStep: FractionEliminationStep) => ({
    title: elimStep.operation,
    description: elimStep.description,
    data: elimStep.matrix,
  }));

  // Add final solution step
  steps.push({
    title: "Solution",
    description: "Gauss-Jordan elimination complete - solution extracted from RREF",
    data: solution,
  });

  return { result: solution, steps };
};

export const luFactorizationWithSteps = (
  A: Matrix,
  b: number[]
): SolverResult => {
  const steps: Step[] = [];
  const n = A.length;

  steps.push({
    title: "Step 1: Initial Matrix A and Vector b",
    description: "Starting with matrix A and vector b",
    data: A.map((row, i) => [...row, b[i]]),
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

  // Forward substitution: Ly = b
  const y: number[] = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) {
      sum += L[i][j] * y[j];
    }
    y[i] = (b[i] - sum) / L[i][i];
  }

  steps.push({
    title: "Step 4: Forward Substitution (Ly = b)",
    description: "Solving Ly = b gives y vector",
    data: y,
  });

  // Back substitution: Ux = y
  const x: number[] = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += U[i][j] * x[j];
    }
    x[i] = (y[i] - sum) / U[i][i];
  }

  steps.push({
    title: "Step 5: Back Substitution (Ux = y)",
    description: "Solving Ux = y gives solution x",
    data: x,
  });

  return { result: x, steps };
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
