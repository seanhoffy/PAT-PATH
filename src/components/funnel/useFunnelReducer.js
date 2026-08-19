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
    stage4: { value: '' },
    stage5: { value: '' },
    stage6: {
        selectedRow: null,
        rowValues: buildStage6RowValues(),
        userDefined: { price: '', pct: '', source: '' },
    },
    stage7: { value: '' },
    stage8: {
        facilitators: '',          // Field 1 — headcount, blank default
        conversionFactor: 0.20,    // Field 2 — pre-filled, fully editable
        pctIndividual: '',         // Field 3 — required, deliberately blank
        hoursIndividual: 29.6,     // Field 4 — Sunstone individual default
        hoursGroup: 20.2,          // Field 5 — Sunstone group-monitoring default
        annualHoursPerFTE: 1890,   // Field 6 — advanced, collapsed by default
        sites: '',                 // Field 7 — optional site check, blank default
        clientsPerSite: 275,       // Field 8 — Oregon observed default
        capacityCapApplied: false,
    },
    scenario: {
        moderateOverrides: {},
        conservative: {},
        optimistic: {},
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
            return { ...state, [stage]: { value } };
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
            const { column, stage, value } = action; // column: 'conservative' | 'moderate' | 'optimistic'
            if (column === 'moderate') {
                return {
                    ...state,
                    scenario: {
                        ...state.scenario,
                        moderateOverrides: { ...state.scenario.moderateOverrides, [stage]: value },
                    },
                };
            }
            return {
                ...state,
                scenario: {
                    ...state.scenario,
                    [column]: { ...state.scenario[column], [stage]: value },
                },
            };
        }

        case 'RESET_SCENARIO_EXPLORER':
            return {
                ...state,
                scenario: { moderateOverrides: {}, conservative: {}, optimistic: {} },
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
