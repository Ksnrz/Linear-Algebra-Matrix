// ฟังก์ชันสำหรับ Gaussian Elimination
export function solveGaussian(matrix: number[][], b: number[]): number[] {
  // 1. Forward Elimination (ทำ Matrix ให้เป็น Upper Triangular)
  // [ใส่ Comment อธิบายอาจารย์ตรงนี้]
  
  // 2. Back Substitution (หาค่า x จากล่างขึ้นบน)
  // [ใส่ Comment อธิบายอาจารย์ตรงนี้]
  
  return result; // คืนค่าคำตอบ x1, x2, x3
}

// ฟังก์ชันสำหรับหา Inverse Matrix
export function findInverse(matrix: number[][]): number[][] {
  // ใช้ Gauss-Jordan โดยต่อท้ายด้วย Identity Matrix [A|I]
  // [ใส่ Comment อธิบายแนวคิด]
    return inverse; // คืนค่า Inverse Matrix
}