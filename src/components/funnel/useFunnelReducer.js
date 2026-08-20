import { useReducer } from 'react';
import {
    DEFAULT_FUNNEL_INPUT_CELL,
    DEFAULT_AWARENESS_INTEREST_CONTEXT,
    DEFAULT_GEOGRAPHIC_ACCESS_CONTEXT,
    STAGE6_TABLE_A_ROWS,
} from '../../constants/funnelDefaults';
// Re-exported so existing imports of these two helpers from this module keep
// working; the canonical definitions live in funnelCalculations.js (shared
// with the PDF export and History page).
export { getStage6Value, getModeratePercents } from '../../utils/funnelCalculations';

const buildStage6RowValues = () => {
    const values = {};
    STAGE6_TABLE_A_ROWS.forEach((row) => {
        values[row.key] = row.default;
    });
    return values;
};

export const initialFunnelState = () => ({
    contexts: {
        awarenessInterest: DEFAULT_AWARENESS_INTEREST_CONTEXT,
        geographicAccess: DEFAULT_GEOGRAPHIC_ACCESS_CONTEXT,
    },
    funnelInputSelection: DEFAULT_FUNNEL_INPUT_CELL,
    // Stage 4/5/6/7 start blank rather than pre-filled with our reference
    // estimates — the user should knowingly choose their own regional value,
    // not silently inherit it.
    stage4: { value: '', low: '', high: '' },
    stage5: { value: '', low: '', high: '' },
    stage6: {
        selectedRow: null,
        rowValues: buildStage6RowValues(),
        userDefined: { price: '', pct: '', source: '', low: '', high: '' },
    },
    stage7: { value: '', low: '', high: '' },
    stage8: {
        facilitators: '',          // Field 1 — headcount, blank default
        conversionFactor: 0.20,    // Field 2 — pre-filled, fully editable
        pctIndividual: '',         // Field 3 — required, deliberately blank
        hoursIndividual: 29.6,     // Field 4 — Sunstone individual default
        hoursGroup: 20.2,          // Field 5 — Sunstone group-monitoring default
        annualHoursPerFTE: 1890,   // Field 6 — advanced, collapsed by default
        siteMode: 'program',       // Site check approach — 'program' (A) or 'siteBySite' (B)
        sites: '',                 // Field 7 — Option A, optional site check, blank default
        clientsPerSite: 275,       // Field 8 — Option A, Oregon observed default
        siteGroups: [{ id: 1, count: '', clientsPerSite: '' }], // Option B rows
        capacityCapApplied: false,
    },
    // Monte Carlo Scenario Explorer: seed is generated once, at model-creation
    // time, so the simulation (a pure function of startN/ranges/seed) always
    // reproduces the same Conservative/Optimistic on reload — no snapshot of
    // results needs to be stored. conservative/optimistic are no longer
    // manually-typed override maps.
    scenario: {
        seed: Math.floor(Math.random() * 2 ** 31),
        moderateOverrides: {},
    },
});

export const funnelReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CONTEXT': {
            // Switching context no longer auto-fills Stage 4/5/7 — it only
            // changes which reference row each stage's "defaults" table
            // highlights. Silently overwriting a blank-or-typed value here
            // would undercut the whole point of starting these fields empty.
            const { dropdown, value } = action;
            return { ...state, contexts: { ...state.contexts, [dropdown]: value } };
        }

        case 'SET_FUNNEL_INPUT_SELECTION':
            return { ...state, funnelInputSelection: action.value };

        case 'SET_STAGE_VALUE': {
            const { stage, value } = action; // stage: 'stage4' | 'stage5' | 'stage7'
            // Preserve low/high — this used to reset to `{ value }` alone,
            // which silently dropped the Monte Carlo range on every edit.
            return { ...state, [stage]: { ...state[stage], value } };
        }

        case 'SET_STAGE_RANGE': {
            const { stage, bound, value } = action; // bound: 'low' | 'high'
            return { ...state, [stage]: { ...state[stage], [bound]: value } };
        }

        case 'SET_STAGE6_ROW':
            return { ...state, stage6: { ...state.stage6, selectedRow: action.key } };

        case 'SET_STAGE6_ROW_VALUE':
            return {
                ...state,
                stage6: {
                    ...state.stage6,
                    rowValues: { ...state.stage6.rowValues, [action.key]: action.value },
                },
            };

        case 'SET_STAGE6_USER_DEFINED':
            return {
                ...state,
                stage6: {
                    ...state.stage6,
                    userDefined: { ...state.stage6.userDefined, [action.field]: action.value },
                },
            };

        case 'SET_STAGE8_FIELD':
            return { ...state, stage8: { ...state.stage8, [action.field]: action.value } };

        case 'APPLY_CAPACITY_CAP':
            return { ...state, stage8: { ...state.stage8, capacityCapApplied: true } };

        case 'REMOVE_CAPACITY_CAP':
            return { ...state, stage8: { ...state.stage8, capacityCapApplied: false } };

        case 'SET_SCENARIO_CELL': {
            // Conservative/Optimistic are no longer manually-typed (they're
            // simulation-derived) — this only ever adjusts the Moderate column now.
            const { stage, value } = action;
            return {
                ...state,
                scenario: {
                    ...state.scenario,
                    moderateOverrides: { ...state.scenario.moderateOverrides, [stage]: value },
                },
            };
        }

        case 'RESET_SCENARIO_EXPLORER':
            // Preserve `seed` — only Moderate's overrides are ever reset now.
            return {
                ...state,
                scenario: { ...state.scenario, moderateOverrides: {} },
            };

        default:
            return state;
    }
};

// If `restoredState` is provided (e.g. hydrated from Firestore autosave), it
// is used as the initial state directly rather than deriving fresh defaults.
// Stage 8 gets one exception: an old saved model's stage8 shape (facilitators/
// throughput/multiplier/capacityCapApplied only) is merged UNDER the new
// field defaults, so a resumed old model gets sensible values (conversionFactor
// 0.20, hoursIndividual 29.6, etc.) for fields it never had, while its old
// `facilitators` count and `capacityCapApplied` flag are preserved. Orphaned
// legacy keys (`throughput`, `multiplier`) simply ride along, unused.
export const useFunnelReducer = (restoredState) => useReducer(
    funnelReducer,
    undefined,
    () => {
        if (!restoredState) return initialFunnelState();
        return { ...restoredState, stage8: { ...initialFunnelState().stage8, ...restoredState.stage8 } };
    }
);
