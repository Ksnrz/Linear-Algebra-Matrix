import React from 'react'

interface MatrixInputProps {
    matrix: number[][];
    setMatrix: (matrix: number[][]) => void;
    size: number;
}

export default function MatrixInput({ matrix, setMatrix, size }: MatrixInputProps) {
    const handleInputChange = (row: number, col: number, value: string) => {
        const newMatrix = matrix.map((r) => [...r]);
        newMatrix[row][col] = value === '' ? 0 : parseFloat(value) || 0;
        setMatrix(newMatrix);
    };

    return (
        <div className="flex flex-col gap-4">
            <label className="text-sm text-slate-300">Matrix A ({size}x{size})</label>
            <div className="flex justify-center gap-2 p-4 rounded-2xl border border-slate-800 bg-slate-950/50">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                    {matrix.map((row, rowIndex) =>
                        row.map((value, colIndex) => (
                            <input
                                key={`${rowIndex}-${colIndex}`}
                                type="number"
                                step="1"
                                value={value === 0 && matrix[rowIndex][colIndex] === 0 ? '' : value}
                                onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                                placeholder="0"
                                className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-center text-slate-100 placeholder-slate-500 transition focus:border-emerald-400 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                style={{ MozAppearance: 'textfield' }}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
