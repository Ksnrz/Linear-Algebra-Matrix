'use client';
import { useState } from "react";
import MatrixInput from "../../components/MatrixInput";
import { type Matrix } from "../../lib/matrixUtils";
import {
  gaussianEliminationWithSteps,
  gaussJordanWithSteps,
  luFactorizationWithSteps,
  cramersRuleWithSteps,
  inverseMatrixWithSteps,
  type Step,
  type SolverResult,
} from "../../lib/solverWithSteps";
import { Fraction, type FractionMatrix } from "../../lib/fractions";

const createMatrix = (size: number): number[][] => {
  return Array(size).fill(null).map(() => Array(size).fill(0));
};

const formatNumber = (num: number | Fraction): string => {
  if (num instanceof Fraction) {
    return num.toString();
  }
  const fixed = num.toFixed(4);
  return parseFloat(fixed) === Math.floor(parseFloat(fixed))
    ? Math.floor(parseFloat(fixed)).toString()
    : fixed.replace(/\.?0+$/, "");
};

type Preset = {
  title: string;
  description?: string;
  method: "inverse" | "gaussElim" | "gaussJordan" | "lu" | "cramer";
  size: number;
  matrix: number[][];
  bVector?: number[];
};

const presets: Preset[] = [
  {
    title: "Example 1: 3x3 System",
    description: "3x3 system with unique solution.",
    method: "gaussElim",
    size: 3,
    matrix: [
      [2, 1, 3],
      [4, 3, 5],
      [6, 5, 5],
    ],
    bVector: [1, 1, -3],
  },
  {
    title: "Example 2: 4x4 System",
    description: "4x4 system",
    method: "gaussElim",
    size: 4,
    matrix: [
      [2, -1, -3, 1],
      [1, 1, 1, -2],
      [3, 2, -3, -4],
      [-1, -4, 1, 1],
    ],
    bVector: [9, 10, 6, 6],
  },
  {
    title: "Example 3: Inverse of 3x3",
    description: "Find A^{-1} for a non-singular 3x3 matrix.",
    method: "inverse",
    size: 3,
    matrix: [
      [1, 2, -3],
      [-1, 1, -1],
      [0, -2, 3],
    ]
  },
  {
    title: "Example 4: Solve Ax=b and A^{-1}",
    description: "Compute solution and inverse in one go.",
    method: "inverse",
    size: 3,
    matrix: [
      [1, 2, 3],
      [-1, -1, -1],
      [1, 2, 3],
    ],
    bVector: [5, 3, -1],
  },
];

export default function Home() {
  const [method, setMethod] = useState("inverse");
  const [size, setSize] = useState(3);
  const [matrix, setMatrix] = useState(createMatrix(3));
  const [bVector, setBVector] = useState<number[]>([0, 0, 0]);
  const [result, setResult] = useState<Matrix | number[] | { L: Matrix; U: Matrix } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [showSteps, setShowSteps] = useState(false);

  const applyPreset = (preset: Preset) => {
    setMethod(preset.method);
    setSize(preset.size);
    setMatrix(preset.matrix.map(row => [...row]));
    setBVector(preset.bVector ? [...preset.bVector] : Array(preset.size).fill(0));
    setResult(null);
    setError(null);
    setSteps([]);
    setShowSteps(false);
  }

  const onSizeChange = (newSize: number) => {
    setSize(newSize);
    setMatrix(createMatrix(newSize));
    setBVector(Array(newSize).fill(0));
    setError(null);
  };

  const handleSolve = () => {
    setError(null);
    setSteps([]);
    setShowSteps(false);
    try {
      let solverResult: SolverResult;

      switch (method) {
        case "inverse":
          solverResult = inverseMatrixWithSteps(matrix);
          break;
        case "gaussElim":
          solverResult = gaussianEliminationWithSteps(matrix, bVector);
          break;
        case "gaussJordan":
          solverResult = gaussJordanWithSteps(matrix, bVector);
          break;
        case "lu":
          solverResult = luFactorizationWithSteps(matrix, bVector);
          break;
        case "cramer":
          solverResult = cramersRuleWithSteps(matrix, bVector);
          break;
        default:
          solverResult = { result: [], steps: [] };
      }

      setResult(solverResult.result);
      setSteps(solverResult.steps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResult(null);
      setSteps([]);
    }
  };

  const handleClear = () => {
    setMatrix(createMatrix(size));
    setBVector(Array(size).fill(0));
    setResult(null);
    setError(null);
    setSteps([]);
    setShowSteps(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-semibold">Matrix Calculator</h1>
              <p className="text-sm text-slate-300">
                Add your matrix inputs and select a method to solve
              </p>
              <div className="flex gap-4">
                <div>
                  <label className="text-md text-slate-300 mr-3">Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="mt-2 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100 transition hover:border-emerald-300/40">
                    <option value="inverse">Inverse Matrix</option>
                    <option value="gaussElim">Gauss Elimination Pivoting</option>
                    <option value="gaussJordan">Gauss Jordan Elimination</option>
                    <option value="lu">LU Factorization</option>
                    <option value="cramer">Cramer's rule</option>
                  </select>
                </div>
                <div>
                  <label className='text-md text-slate-300 mr-3'>Matrix size</label>
                  <select
                    value={size}
                    onChange={(e) => onSizeChange(Number(e.target.value))}
                    className="mt-2 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100 transition hover:border-emerald-300/40">
                    <option value="2">2x2</option>
                    <option value="3">3x3</option>
                    <option value="4">4x4</option>
                    <option value="5">5x5</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <MatrixInput matrix={matrix} setMatrix={setMatrix} size={size} showB={method === 'gaussElim' || method === 'cramer' || method === 'lu' || method === 'gaussJordan'} bVector={bVector} setBVector={setBVector} />
              </div>

              <button
                onClick={handleSolve}
                className="mt-6 w-full rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-95">
                Solve
              </button>

              <button
                onClick={handleClear}
                className="w-full rounded-lg bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-600 active:scale-95">
                Clear
              </button>

              {error && (
                <div className="mt-4 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-400">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {steps.length > 0 && (
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="mt-4 w-full rounded-lg bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700 active:scale-95">
                  {showSteps ? "Hide Steps" : "Show Steps"}
                </button>
              )}

              {showSteps && steps.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-cyan-400">Solution Steps:</h3>
                  <div className="flex flex-col gap-3">
                    {steps.map((step, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-700 bg-slate-950/50 p-4">
                        <p className="mb-2 font-medium text-cyan-300">{step.title}</p>
                        <p className="mb-3 text-sm text-slate-300">{step.description}</p>
                        {step.data && (
                          <div className="rounded bg-slate-950 p-3 overflow-x-auto text-xs font-mono text-emerald-300">
                            {Array.isArray(step.data) && step.data.length > 0 && typeof step.data[0] === "number" ? (
                              <div className="flex gap-1 flex-wrap">
                                {(step.data as number[]).map((val, i) => (
                                  <div key={i} className="inline">
                                    [{formatNumber(val)}]
                                  </div>
                                ))}
                              </div>
                            ) : Array.isArray(step.data) && step.data.length > 0 && step.data[0] instanceof Fraction ? (
                              <div>
                                {step.data[0] instanceof Fraction ? (
                                  // This is a Fraction[]
                                  <div className="flex gap-1 flex-wrap">
                                    {(step.data as Fraction[]).map((val, i) => (
                                      <div key={i} className="inline">
                                        [{formatNumber(val)}]
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ) : Array.isArray(step.data) && Array.isArray(step.data[0]) ? (
                              <table className="w-full border-collapse">
                                <tbody>
                                  {(step.data as any[][]).map((row, i) => (
                                    <tr key={i}>
                                      {row.map((val, j) => (
                                        <td key={j} className="border border-slate-600 px-2 py-1 text-right">
                                          {formatNumber(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result && (
                <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-emerald-400">Result:</h3>
                  <div className="overflow-x-auto">
                    {Array.isArray(result) && result.length > 0 && (typeof result[0] === 'number' || result[0] instanceof Fraction) ? (
                      <div>
                        <p className="mb-2 text-xs text-slate-400">Solution Vector:</p>
                        <div className="flex flex-wrap gap-2">
                          {(result as any[]).map((val, i) => (
                            <div
                              key={i}
                              className="rounded border border-slate-600 bg-slate-950 px-3 py-2 text-right">
                              <p className="text-xs text-slate-400">x{i + 1}</p>
                              <p className="font-mono text-xl text-emerald-300 font-semibold">
                                {formatNumber(val)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : typeof result === 'object' && result !== null && 'L' in result && 'U' in result ? (
                      <div>
                        <div className="mb-4">
                          <p className="mb-2 text-xs text-slate-400">Lower Triangular (L):</p>
                          <div className="inline-block rounded border border-slate-600 bg-slate-950 p-3">
                            {(result.L as Matrix).map((row, i) => (
                              <div key={i} className="font-mono text-xs text-emerald-300">
                                {row.map((val, j) => (
                                  <span key={j} className="mr-3 inline-block w-12 text-right">
                                    {formatNumber(val)}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs text-slate-400">Upper Triangular (U):</p>
                          <div className="inline-block rounded border border-slate-600 bg-slate-950 p-3">
                            {(result.U as Matrix).map((row, i) => (
                              <div key={i} className="font-mono text-xs text-emerald-300">
                                {row.map((val, j) => (
                                  <span key={j} className="mr-3 inline-block w-12 text-right">
                                    {formatNumber(val)}
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <table className="w-full border-collapse text-xs">
                        <tbody>
                          {(result as Matrix).map((row, i) => (
                            <tr key={i}>
                              {row.map((val, j) => (
                                <td key={j} className="border border-slate-600 px-2 py-1 text-right font-mono text-emerald-300">
                                  {formatNumber(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Presets
              </p>
              <h3 className="mt-2 text-xl font-semibold">Test Cases</h3>
              <div className="mt-4 flex flex-col gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => applyPreset(preset)}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-emerald-300/40 hover:bg-slate-900/80">
                    <p className="font-medium">{preset.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>

    </main>
  );
}
