const { sampleCorrelation } = require('simple-statistics');

function calculatePearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);

    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
}

const x = Array.from({ length: 1000 }, () => Math.random() * 100);
const y = x.map(val => val * 2.5 + Math.random() * 20);

const x2 = Array.from({ length: 1000 }, () => Math.random() * 100);
const y2 = Array.from({ length: 1000 }, () => Math.random() * 100);

const x3 = Array.from({ length: 1000 }, () => Math.random() * 100);
const y3 = x3.map(val => -1 * val + Math.random() * 10);

console.log("=== Correlated Data ===");
console.log("Custom function:", calculatePearsonCorrelation(x, y));
console.log("Simple-Statistics:", sampleCorrelation(x, y));

console.log("\n=== Uncorrelated Data ===");
console.log("Custom function:", calculatePearsonCorrelation(x2, y2));
console.log("Simple-Statistics:", sampleCorrelation(x2, y2));

console.log("\n=== Negatively Correlated Data ===");
console.log("Custom function:", calculatePearsonCorrelation(x3, y3));
console.log("Simple-Statistics:", sampleCorrelation(x3, y3));

const diff1 = Math.abs(calculatePearsonCorrelation(x, y) - sampleCorrelation(x, y));
const diff2 = Math.abs(calculatePearsonCorrelation(x2, y2) - sampleCorrelation(x2, y2));
const diff3 = Math.abs(calculatePearsonCorrelation(x3, y3) - sampleCorrelation(x3, y3));

console.log("\nMaximum Difference across 3 tests:", Math.max(diff1, diff2, diff3));
