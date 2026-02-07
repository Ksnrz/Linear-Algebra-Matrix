import React from 'react'

interface MatrixInputProps {
    matrix: number[][];
    setMatrix: (matrix: number[][]) => void;
    size: number;
    showB?: boolean;
    bVector?: number[];
    setBVector?: (b: number[]) => void;
}

export default function MatrixInput({ matrix, setMatrix, size, showB = false, bVector = [], setBVector }: MatrixInputProps) {
    const handleInputChange = (row: number, col: number, value: string) => {
        const newMatrix = matrix.map((r) => [...r]);
        newMatrix[row][col] = value === '' ? 0 : parseFloat(value) || 0;
        setMatrix(newMatrix);
    };

    const handleBChange = (row: number, value: string) => {
        if (!setBVector) return;
        const newB = [...(bVector || [])];
        newB[row] = value === '' ? 0 : parseFloat(value) || 0;
        setBVector(newB);
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
                                    value={value === 0 && matrix[rowIndex][colIndex] === 0 ? '' : String(value)}
                                    onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                                    placeholder="0"
                                    className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-center text-slate-100 placeholder-slate-500 transition focus:border-emerald-400 focus:outline-none"
                                />
                            ))}

                            {showB && (
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-slate-400 mb-1">b{rowIndex + 1}</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        pattern="[0-9.+\-eE]*"
                                        value={(bVector && bVector[rowIndex]) === 0 ? '' : String((bVector && bVector[rowIndex]) ?? '')}
                                        onChange={(e) => handleBChange(rowIndex, e.target.value)}
                                        placeholder="0"
                                        className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-center text-slate-100 placeholder-slate-500 transition focus:border-emerald-400 focus:outline-none"
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
