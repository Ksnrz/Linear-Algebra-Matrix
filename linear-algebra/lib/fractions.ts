/**
 * Fraction class for exact rational arithmetic
 */
export class Fraction {
  numerator: number;
  denominator: number;

  constructor(numerator: number, denominator: number = 1) {
    if (denominator === 0) {
      throw new Error("Denominator cannot be zero");
    }

    // Handle negative denominators
    if (denominator < 0) {
      numerator = -numerator;
      denominator = -denominator;
    }

    // Handle zero numerator
    if (numerator === 0) {
      this.numerator = 0;
      this.denominator = 1;
    } else {
      const gcd = Fraction.gcd(Math.abs(numerator), Math.abs(denominator));
      this.numerator = numerator / gcd;
      this.denominator = denominator / gcd;
    }
  }

  /**
   * Greatest Common Divisor (Euclidean algorithm)
   */
  static gcd(a: number, b: number): number {
    return b === 0 ? a : Fraction.gcd(b, a % b);
  }

  /**
   * Least Common Multiple
   */
  static lcm(a: number, b: number): number {
    return Math.abs(a * b) / Fraction.gcd(a, b);
  }

  /**
   * Add two fractions
   */
  static add(f1: Fraction | number, f2: Fraction | number): Fraction {
    const a = typeof f1 === "number" ? new Fraction(f1) : f1;
    const b = typeof f2 === "number" ? new Fraction(f2) : f2;

    const lcm = Fraction.lcm(a.denominator, b.denominator);
    const num = a.numerator * (lcm / a.denominator) + b.numerator * (lcm / b.denominator);
    return new Fraction(num, lcm);
  }

  /**
   * Subtract two fractions
   */
  static subtract(f1: Fraction | number, f2: Fraction | number): Fraction {
    const a = typeof f1 === "number" ? new Fraction(f1) : f1;
    const b = typeof f2 === "number" ? new Fraction(f2) : f2;

    const lcm = Fraction.lcm(a.denominator, b.denominator);
    const num = a.numerator * (lcm / a.denominator) - b.numerator * (lcm / b.denominator);
    return new Fraction(num, lcm);
  }

  /**
   * Multiply two fractions
   */
  static multiply(f1: Fraction | number, f2: Fraction | number): Fraction {
    const a = typeof f1 === "number" ? new Fraction(f1) : f1;
    const b = typeof f2 === "number" ? new Fraction(f2) : f2;

    return new Fraction(a.numerator * b.numerator, a.denominator * b.denominator);
  }

  /**
   * Divide two fractions
   */
  static divide(f1: Fraction | number, f2: Fraction | number): Fraction {
    const a = typeof f1 === "number" ? new Fraction(f1) : f1;
    const b = typeof f2 === "number" ? new Fraction(f2) : f2;

    if (b.numerator === 0) {
      throw new Error("Division by zero");
    }

    return new Fraction(a.numerator * b.denominator, a.denominator * b.numerator);
  }

  /**
   * Convert to decimal (for checking operations)
   */
  toDecimal(): number {
    return this.numerator / this.denominator;
  }

  /**
   * Convert to string representation
   * Format: "n" for integers, "n/d" for fractions
   */
  toString(): string {
    if (this.denominator === 1) {
      return this.numerator.toString();
    }
    return `${this.numerator}/${this.denominator}`;
  }

  /**
   * Check if fraction equals zero
   */
  isZero(): boolean {
    return this.numerator === 0;
  }

  /**
   * Check if fraction is close to zero (within epsilon for comparison)
   */
  isNearZero(epsilon: number = 1e-10): boolean {
    return Math.abs(this.toDecimal()) < epsilon;
  }

  /**
   * Check if two fractions are equal
   */
  equals(other: Fraction | number): boolean {
    const b = typeof other === "number" ? new Fraction(other) : other;
    return this.numerator === b.numerator && this.denominator === b.denominator;
  }

  /**
   * Get absolute value
   */
  abs(): Fraction {
    return new Fraction(Math.abs(this.numerator), this.denominator);
  }

  /**
   * Get negative of this fraction
   */
  negate(): Fraction {
    return new Fraction(-this.numerator, this.denominator);
  }
}

/**
 * Convert a number or Fraction to Fraction
 */
export const toFraction = (value: number | Fraction): Fraction => {
  return typeof value === "number" ? new Fraction(value) : value;
};

/**
 * Matrix of Fractions type
 */
export type FractionMatrix = Fraction[][];

/**
 * Convert regular number matrix to Fraction matrix
 */
export const numberMatrixToFractions = (matrix: number[][]): FractionMatrix => {
  return matrix.map(row => row.map(val => new Fraction(val)));
};

/**
 * Convert Fraction matrix to number matrix (for display/calculation)
 */
export const fractionMatrixToNumbers = (matrix: FractionMatrix): number[][] => {
  return matrix.map(row => row.map(f => f.toDecimal()));
};

/**
 * Deep clone a Fraction matrix
 */
export const cloneFractionMatrix = (matrix: FractionMatrix): FractionMatrix => {
  return matrix.map(row => row.map(f => new Fraction(f.numerator, f.denominator)));
};

/**
 * Format Fraction matrix for display (as strings)
 */
export const formatFractionMatrix = (matrix: FractionMatrix | (Fraction | number)[][]): string[][] => {
  return matrix.map(row =>
    row.map(val => {
      const frac = typeof val === "number" ? new Fraction(val) : val;
      return frac.toString();
    })
  );
};
