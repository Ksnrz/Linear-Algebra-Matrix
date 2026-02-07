'use client';
import { useState, useEffect } from "react";
import MatrixInput from "../../components/MatrixInput";
import { inverseMatrix, gaussianElimination, gaussJordan, luFactorization, cramersRule, type Matrix } from "../../lib/matrixUtils";

const createMatrix = (size: number): number[][] => {
  return Array(size).fill(null).map(() => Array(size).fill(0));
};

const presets = [
  {
    title: "Example 1: 3x3 System",
    description: "2x1 + x2 + 3x3 = 1, 3x1 + 2x2 + x3 = 4, x1 - x2 + 2x3 = 3",
  },
  {
    title: "Example 2: 4x4 System",
    description: "Mixed coefficients, random right-hand side.",
  },
  {
    title: "Example 3: Inverse of 3x3",
    description: "Find A^{-1} for a non-singular 3x3 matrix.",
  },
  {
    title: "Example 4: Solve Ax=b and A^{-1}",
    description: "Compute solution and inverse in one go.",
  },
];

export default function Home() {
  const [method, setMethod] = useState("inverse");
  const [size, setSize] = useState(3);
  const [matrix, setMatrix] = useState(createMatrix(3));
  const [bVector, setBVector] = useState<number[]>([0, 0, 0]);
  const [result, setResult] = useState<Matrix | number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMatrix(createMatrix(size));
    setBVector(Array(size).fill(0));
  }, [size]);

  const handleSolve = () => {
    setError(null);
    try {
      let solveResult: Matrix | number[];

      switch (method) {
        case "inverse":
          solveResult = inverseMatrix(matrix);
          break;
        case "gaussElim":
          solveResult = gaussianElimination(matrix, bVector);
          break;
        case "gaussJordan":
          const rref = gaussJordan(matrix, bVector);
          solveResult = rref;
          break;
        case "lu":
          const { L, U } = luFactorization(matrix);
          solveResult = { L, U } as any;
          break;
        case "cramer":
          solveResult = cramersRule(matrix, bVector);
          break;
        default:
          solveResult = [];
      }

      setResult(solveResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResult(null);
    }
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
                    onChange={(e) => setSize(Number(e.target.value))}
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

              {error && (
                <div className="mt-4 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-400">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {result && (
                <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-emerald-400">Result:</h3>
                  <div className="overflow-x-auto">
                    {Array.isArray(result) && result.length > 0 && typeof result[0] === 'number' ? (
                      <div>
                        <p className="mb-2 text-xs text-slate-400">Solution Vector:</p>
                        <div className="flex flex-wrap gap-2">
                          {(result as number[]).map((val, i) => (
                            <div
                              key={i}
                              className="rounded border border-slate-600 bg-slate-950 px-3 py-2 text-right">
                              <p className="text-xs text-slate-400">x{i + 1}</p>
                              <p className="font-mono text-xl text-emerald-300 font-semibold">
                                {val.toFixed(4)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {typeof result === 'object' && 'L' in result ? (
                          <div>
                            <div className="mb-4">
                              <p className="mb-2 text-xs text-slate-400">Lower Triangular (L):</p>
                              <div className="inline-block rounded border border-slate-600 bg-slate-950 p-3">
                                {(result.L as Matrix).map((row, i) => (
                                  <div key={i} className="font-mono text-xs text-emerald-300">
                                    {row.map((val, j) => (
                                      <span key={j} className="mr-3 inline-block w-12 text-right">
                                        {val.toFixed(4)}
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
                                        {val.toFixed(4)}
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
                                      {typeof val === 'number' ? val.toFixed(4) : val}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
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
