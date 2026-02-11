import React, { useEffect, useState } from 'react'

interface MatrixInputProps {
    matrix: number[][];
    setMatrix: (matrix: number[][]) => void;
    size: number;
    showB?: boolean;
    bVector?: number[];
    setBVector?: (b: number[]) => void;
}

export default function MatrixInput({ matrix, setMatrix, size, showB = false, bVector = [], setBVector }: MatrixInputProps) {
    // Local string inputs to allow intermediate values like '-' or '1.' while typing
    const [inputs, setInputs] = useState<string[][]>(() =>
        Array.from({ length: size }, (_, r) =>
            Array.from({ length: size }, (_, c) => {
                const v = matrix[r]?.[c] ?? 0;
                return v === 0 ? '' : String(v);
            })
        )
    );

    useEffect(() => {
        setInputs(
            Array.from({ length: size }, (_, r) =>
                Array.from({ length: size }, (_, c) => {
                    const v = matrix[r]?.[c] ?? 0;
                    return v === 0 ? '' : String(v);
                })
            )
        );
    }, [matrix, size]);

    const handleInputChange = (row: number, col: number, value: string) => {
        const newInputs = inputs.map((r) => [...r]);
        newInputs[row][col] = value;
        setInputs(newInputs);

        const parsed = parseFloat(value);
        if (!Number.isNaN(parsed)) {
            const newMatrix = matrix.map((r) => [...r]);
            newMatrix[row][col] = parsed;
            setMatrix(newMatrix);
        }
        // if parsed is NaN (e.g. '-' or ''), don't update numeric matrix yet
    };

    const [bInputs, setBInputs] = useState<string[]>(() =>
        Array.from({ length: size }, (_, i) => {
            const v = (bVector || [])[i] ?? 0;
            return v === 0 ? '' : String(v);
        })
    );

    useEffect(() => {
        setBInputs(
            Array.from({ length: size }, (_, i) => {
                const v = (bVector || [])[i] ?? 0;
                return v === 0 ? '' : String(v);
            })
        );
    }, [bVector, size]);

    const handleBChange = (row: number, value: string) => {
        const newBInputs = [...bInputs];
        newBInputs[row] = value;
        setBInputs(newBInputs);
        if (!setBVector) return;
        const parsed = parseFloat(value);
        if (!Number.isNaN(parsed)) {
            const newB = [...(bVector || [])];
            newB[row] = parsed;
            setBVector(newB);
        }
    };

    const columns = size + (showB ? 1 : 0);

    return (
        <div className="flex flex-col gap-4">
            <label className="text-sm text-slate-300">Matrix A ({size}x{size})</label>
            <div className="flex justify-center gap-2 p-4 rounded-2xl border border-slate-800 bg-slate-950/50">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                    {matrix.map((row, rowIndex) => (
                        // render each row as a fragment of inputs followed by optional b input
                        <React.Fragment key={rowIndex}>
                            {row.map((value, colIndex) => (
                                <input
                                    key={`${rowIndex}-${colIndex}`}
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9.+\-eE]*"
                                    value={inputs[rowIndex]?.[colIndex] ?? ''}
                                    onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                                    placeholder="0"
                                    className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-center text-slate-100 placeholder-slate-500 transition focus:border-emerald-400 focus:outline-none"
                                />
                            ))}

                            {showB && (
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9.+\-eE]*"
                                    value={bInputs[rowIndex] ?? ''}
                                    onChange={(e) => handleBChange(rowIndex, e.target.value)}
                                    placeholder="0"
                                    className="w-16 rounded-lg border border-amber-600 bg-amber-950 px-2 py-2 text-center text-amber-100 placeholder-amber-400 transition focus:border-amber-400 focus:outline-none"
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
