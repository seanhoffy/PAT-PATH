// Pure calculation functions for the Stages 4-9 demand funnel.
// No React/DOM references so these are reusable across the on-screen components,
// the PDF export, and (if ever added) tests.

import { STAGE6_TABLE_A_ROWS } from '../constants/funnelDefaults';

/**
 * Percent retained relative to the prior stage's N, rounded to 1 decimal place.
 */
const pctOfPrior = (n, prior) => {
    if (!prior || prior <= 0) return 0;
    return Math.round((n / prior) * 1000) / 10;
};

/**
 * Human-readable label for Stage 6's currently-selected tier, including the
 * "User-defined" catch-all row (which has no entry in STAGE6_TABLE_A_ROWS).
 * Shared by the History page and the PDF export so a custom entry's actual
 * price point is surfaced instead of the raw "userDefined" key.
 */
export const stage6TierLabel = (stage6) => {
    if (!stage6) return '—';
    if (stage6.selectedRow === 'userDefined') {
        return `Custom — ${stage6.userDefined?.price || '—'}`;
    }
    return STAGE6_TABLE_A_ROWS.find((r) => r.key === stage6.selectedRow)?.pricePoint || stage6.selectedRow;
};

/**
 * Chain-multiply Stage 4-7 percentages against a starting N (the selected
 * Stage-3 2x2 cell value, per CC-1). Always recomputes top-to-bottom from
 * raw inputs rather than patching incrementally.
 */
export const computeFunnelChain = (startN, { stage4, stage5, stage6, stage7 }) => {
    const base = Number(startN) || 0;
    const d = base * ((Number(stage4) || 0) / 100);
    const e = d * ((Number(stage5) || 0) / 100);
    const f = e * ((Number(stage6) || 0) / 100);
    const g = f * ((Number(stage7) || 0) / 100);
    return {
        D: Math.round(d),
        E: Math.round(e),
        F: Math.round(f),
        G: Math.round(g),
    };
};

/**
 * Build the funnel row list (Stage-3 output through Effective Demand) plus the
 * final effective-demand figure, for a given starting N and set of Stage 4-7
 * percentages. Shared by the Inputs Recap, the Scenario Explorer, and the
 * funnel plot so row-shaping logic lives in exactly one place.
 */
export const buildFunnelRows = (startN, percents) => {
    const base = Number(startN) || 0;
    const chain = computeFunnelChain(base, percents);

    const rows = [
        {
            key: 'C',
            stage: 'Funnel Input',
            type: 'base',
            rate: null,
            n: Math.round(base),
            pctOfPrior: null,
        },
        {
            key: 'D',
            stage: 'Aware',
            type: 'independent',
            rate: percents.stage4,
            n: chain.D,
            pctOfPrior: pctOfPrior(chain.D, base),
        },
        {
            key: 'E',
            stage: 'Interested | Aware',
            type: 'conditional',
            rate: percents.stage5,
            n: chain.E,
            pctOfPrior: pctOfPrior(chain.E, chain.D),
        },
        {
            key: 'F',
            stage: 'Can afford',
            type: 'conditional',
            rate: percents.stage6,
            n: chain.F,
            pctOfPrior: pctOfPrior(chain.F, chain.E),
        },
        {
            key: 'G',
            stage: 'Can access provider',
            type: 'conditional',
            rate: percents.stage7,
            n: chain.G,
            pctOfPrior: pctOfPrior(chain.G, chain.F),
        },
    ];

    return { rows, effectiveDemand: chain.G };
};

/**
 * Build (or recompute) one Scenario Explorer column. Conservative/Optimistic
 * vary only Stage 4-7 percentages; the starting N (Stage 1-3 base) is shared
 * across all three columns per the agreed scope.
 */
export const buildScenarioColumn = (startN, percents) => buildFunnelRows(startN, percents);

const isBlank = (v) => v === '' || v === null || v === undefined || Number.isNaN(Number(v));

/**
 * Stage 8 — capacity check. Independent of the funnel chain; never multiplies
 * into it. All blending happens in the hours domain (clients-per-FTE is a
 * reciprocal quantity — averaging it directly across the individual/group
 * split would be mathematically wrong; see Marseille et al. 2023 sourcing
 * notes). Internal math is kept at full precision; callers round for display.
 */
export const computeStage8Capacity = (stage8) => {
    const headcount = Number(stage8?.facilitators) || 0;
    const conversionFactor = Number(stage8?.conversionFactor) || 0;
    const fte = headcount * conversionFactor;

    // Field 3 is deliberately undefaulted — while blank, no implicit split
    // (not 50%, not a stale prior value) is substituted; the provider arm
    // simply does not compute.
    const providerReady = !isBlank(stage8?.pctIndividual);
    let blendedHours = null;
    let clientsPerFTE = null;
    let providerCapacity = null;

    if (providerReady) {
        const pct = Number(stage8.pctIndividual) / 100;
        const hoursIndividual = Number(stage8.hoursIndividual) || 0;
        const hoursGroup = Number(stage8.hoursGroup) || 0;
        blendedHours = pct * hoursIndividual + (1 - pct) * hoursGroup;

        const annualHoursPerFTE = Number(stage8.annualHoursPerFTE) || 0;
        clientsPerFTE = blendedHours > 0 ? annualHoursPerFTE / blendedHours : 0;
        providerCapacity = fte * clientsPerFTE;
    }

    const sitesFilled = !isBlank(stage8?.sites);
    const siteCapacity = sitesFilled
        ? (Number(stage8.sites) || 0) * (Number(stage8.clientsPerSite) || 0)
        : null;

    // Take the minimum of the two arms rather than multiplying constraints,
    // to limit double-counting the workforce/site interaction (a facilitator
    // with no room to work in has a low effective FTE, i.e. the two arms are
    // not fully independent).
    let capacity = null;
    let bindingArm = null; // 'workforce' | 'sites'
    if (providerReady) {
        if (sitesFilled) {
            capacity = Math.min(providerCapacity, siteCapacity);
            bindingArm = providerCapacity <= siteCapacity ? 'workforce' : 'sites';
        } else {
            capacity = providerCapacity;
            bindingArm = 'workforce';
        }
    }

    return { fte, blendedHours, clientsPerFTE, providerCapacity, siteCapacity, capacity, bindingArm, providerReady, sitesFilled };
};

export const capacityExceeded = (finalFunnelN, capacityN) => {
    return (Number(finalFunnelN) || 0) > (Number(capacityN) || 0);
};

/**
 * Stages 4-7 are required for the funnel chain to mean anything; Stage 8
 * (capacity) is an independent, optional sanity check. Used to gate the
 * on-screen funnel display and to block saving/downloading an incomplete
 * model.
 */
export const validateFunnelRequiredStages = (funnelState) => {
    const stage6 = funnelState?.stage6;
    const stage6Value = stage6?.selectedRow === 'userDefined'
        ? stage6.userDefined?.pct
        : stage6?.rowValues?.[stage6?.selectedRow];

    if (
        isBlank(funnelState?.stage4?.value)
        || isBlank(funnelState?.stage5?.value)
        || !stage6?.selectedRow
        || isBlank(stage6Value)
        || isBlank(funnelState?.stage7?.value)
    ) {
        return { isValid: false, message: 'Please complete Awareness, Interest, Afford, and Geographic Accessibility before saving or downloading.' };
    }
    return { isValid: true };
};

/**
 * Whether Stage 8 has enough input to compute a capacity figure. The sole
 * gate is Field 3 (percent individual) — headcount/conversion factor being
 * blank still yields a valid (zero) FTE and capacity, not an "incomplete"
 * state.
 */
export const isStage8Complete = (stage8) => !isBlank(stage8?.pctIndividual);

/**
 * Resolves Stage 6's currently-selected row to its effective % (the real
 * funnel input for Stage 6).
 */
export const getStage6Value = (stage6) => {
    if (stage6.selectedRow === 'userDefined') {
        return Number(stage6.userDefined.pct) || 0;
    }
    return Number(stage6.rowValues[stage6.selectedRow]) || 0;
};

/**
 * The Moderate column always reflects the live Stage 4-7 inputs, unless the
 * user has directly overridden a specific cell in the Scenario Explorer.
 */
export const getModeratePercents = (funnelState) => ({
    stage4: funnelState.scenario.moderateOverrides.stage4 ?? funnelState.stage4.value,
    stage5: funnelState.scenario.moderateOverrides.stage5 ?? funnelState.stage5.value,
    stage6: funnelState.scenario.moderateOverrides.stage6 ?? getStage6Value(funnelState.stage6),
    stage7: funnelState.scenario.moderateOverrides.stage7 ?? funnelState.stage7.value,
});

/**
 * Converts the Stage 1-3 base results (the "Potential Demand" 2x2 grid) into
 * the { trialMDD, realMDD, trialTRD, realTRD } shape CC-1's selector expects.
 * This is the funnel's starting N — Stage 1-3 output is used directly, with
 * no further user-adjustable percentage layered on top.
 */
export const cellValuesFromResults = (results) => ({
    trialMDD: Number(results?.trial?.MDD) || 0,
    realMDD: Number(results?.real?.MDD) || 0,
    trialTRD: Number(results?.trial?.TRD) || 0,
    realTRD: Number(results?.real?.TRD) || 0,
});

/**
 * Given a raw funnel reducer state and the Stage-3 2x2 cell values, derive
 * every display-ready figure (funnel rows, effective demand, capacity check,
 * scenario columns). Shared by the live app (FunnelSection), the PDF export,
 * and the History page so this computation lives in exactly one place.
 */
export const deriveFunnelDisplay = (funnelState, cellValues) => {
    if (!funnelState) return null;

    const funnelInputN = Number(cellValues?.[funnelState.funnelInputSelection]) || 0;
    const stage6Value = getStage6Value(funnelState.stage6);
    const livePercents = {
        stage4: funnelState.stage4.value,
        stage5: funnelState.stage5.value,
        stage6: stage6Value,
        stage7: funnelState.stage7.value,
    };
    const { rows: funnelRows, effectiveDemand } = buildFunnelRows(funnelInputN, livePercents);

    const stage8Capacity = computeStage8Capacity(funnelState.stage8);
    const capacityReady = stage8Capacity.providerReady;
    const capacityN = stage8Capacity.capacity ?? 0;
    const exceedsCapacity = capacityReady && capacityExceeded(effectiveDemand, capacityN);
    // Clamp rather than substitute: the cap should only ever pull the
    // displayed figure DOWN toward capacity, never show a stale capacity
    // number that's now higher than the (recalculated) real demand. Also
    // require capacityReady: a legacy saved model may have capacityCapApplied
    // true under the OLD field shape, where capacityN now resolves to 0 (no
    // pctIndividual to compute from) — without this guard the clamp would
    // wrongly zero out that model's displayed demand instead of just falling
    // back to the uncapped figure.
    const displayedEffectiveDemand = (funnelState.stage8.capacityCapApplied && capacityReady)
        ? Math.min(capacityN, effectiveDemand)
        : effectiveDemand;

    const moderatePercents = getModeratePercents(funnelState);
    const scenario = {
        conservative: buildFunnelRows(funnelInputN, { ...moderatePercents, ...funnelState.scenario.conservative }),
        moderate: buildFunnelRows(funnelInputN, moderatePercents),
        optimistic: buildFunnelRows(funnelInputN, { ...moderatePercents, ...funnelState.scenario.optimistic }),
    };

    return {
        funnelInputN,
        funnelRows,
        effectiveDemand,
        displayedEffectiveDemand,
        capacityN,
        capacityReady,
        exceedsCapacity,
        stage8Capacity,
        scenario,
    };
};
