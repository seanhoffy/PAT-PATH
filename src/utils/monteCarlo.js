// Monte Carlo simulation engine for the Scenario Explorer. Pure, no React/DOM
// dependency — same rule as funnelCalculations.js. `buildFunnelRows` is
// passed in by the caller rather than imported, since funnelCalculations.js
// imports `runFunnelSimulation` from this file and importing back would be
// circular.

// mulberry32 — deterministic 32-bit PRNG, no new dependency needed. Given the
// same seed it always produces the same sequence, which is what makes the
// simulation reproducible across reloads/PDF exports.
export const mulberry32 = (seed) => {
    let t = seed >>> 0;
    return () => {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
};

/**
 * One draw from a triangular(low, mode, high) distribution — favors the
 * middle rather than sampling uniformly, per the methodology memo ("Pick one
 * number at random from inside each range, favouring the middle"). Clamps
 * mode into [low, high] defensively and short-circuits a zero-width range
 * (low === high, e.g. a stage the user hasn't given a range for) rather than
 * dividing by zero.
 */
export const sampleTriangular = (low, mode, high, rng) => {
    if (high <= low) return low;
    const m = Math.min(Math.max(mode, low), high);
    const u = rng();
    const c = (m - low) / (high - low);
    return u < c
        ? low + Math.sqrt(u * (high - low) * (m - low))
        : high - Math.sqrt((1 - u) * (high - low) * (high - m));
};

// Nearest-rank percentile: returns the actual sorted element at rank p,
// rather than interpolating — so the result is always a real simulated run
// (with real per-stage sampled rates), not a synthetic average.
const nearestRank = (sortedAsc, p) =>
    sortedAsc[Math.min(sortedAsc.length - 1, Math.ceil(p * sortedAsc.length) - 1)];

/**
 * Runs the funnel `iterations` times, each time sampling one value per stage
 * from its {low, mode, high} range, and returns the 10th/90th percentile
 * outcomes plus the full sorted run list (for the distribution histogram).
 * `ranges`: { stage4: {low, mode, high}, stage5, stage6, stage7 }.
 */
export const runFunnelSimulation = (startN, ranges, seed, iterations, buildFunnelRows) => {
    const rng = mulberry32(seed);
    const runs = new Array(iterations);
    for (let i = 0; i < iterations; i++) {
        runs[i] = buildFunnelRows(startN, {
            stage4: sampleTriangular(ranges.stage4.low, ranges.stage4.mode, ranges.stage4.high, rng),
            stage5: sampleTriangular(ranges.stage5.low, ranges.stage5.mode, ranges.stage5.high, rng),
            stage6: sampleTriangular(ranges.stage6.low, ranges.stage6.mode, ranges.stage6.high, rng),
            stage7: sampleTriangular(ranges.stage7.low, ranges.stage7.mode, ranges.stage7.high, rng),
        });
    }
    runs.sort((a, b) => a.effectiveDemand - b.effectiveDemand);
    return {
        sorted: runs,
        conservative: nearestRank(runs, 0.10),
        optimistic: nearestRank(runs, 0.90),
    };
};
