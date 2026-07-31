import { useReducer } from 'react';
import {
    DEFAULT_FUNNEL_INPUT_CELL,
    DEFAULT_AWARENESS_INTEREST_CONTEXT,
    DEFAULT_GEOGRAPHIC_ACCESS_CONTEXT,
    STAGE4_CONTEXT_DEFAULTS,
    STAGE5_CONTEXT_DEFAULTS,
    STAGE7_CONTEXT_DEFAULTS,
    STAGE6_TABLE_A_ROWS,
    STAGE6_DEFAULT_ROW_KEY,
    STAGE8_FACILITATORS_DEFAULT,
    STAGE8_THROUGHPUT_DEFAULT,
    STAGE8_MULTIPLIER_DEFAULT,
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
    stage4: { value: STAGE4_CONTEXT_DEFAULTS[DEFAULT_AWARENESS_INTEREST_CONTEXT].value, overridden: false },
    stage5: { value: STAGE5_CONTEXT_DEFAULTS[DEFAULT_AWARENESS_INTEREST_CONTEXT].value, overridden: false },
    stage6: {
        selectedRow: STAGE6_DEFAULT_ROW_KEY,
        rowValues: buildStage6RowValues(),
        userDefined: { price: '', pct: '', source: '' },
    },
    stage7: { value: STAGE7_CONTEXT_DEFAULTS[DEFAULT_GEOGRAPHIC_ACCESS_CONTEXT].value, overridden: false },
    stage8: {
        facilitators: STAGE8_FACILITATORS_DEFAULT,
        throughput: STAGE8_THROUGHPUT_DEFAULT,
        multiplier: STAGE8_MULTIPLIER_DEFAULT,
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
            const { dropdown, value } = action;
            const nextContexts = { ...state.contexts, [dropdown]: value };

            if (dropdown === 'awarenessInterest') {
                const stage4Default = STAGE4_CONTEXT_DEFAULTS[value];
                const stage5Default = STAGE5_CONTEXT_DEFAULTS[value];
                return {
                    ...state,
                    contexts: nextContexts,
                    stage4: state.stage4.overridden ? state.stage4 : { value: stage4Default.value, overridden: false },
                    stage5: state.stage5.overridden ? state.stage5 : { value: stage5Default.value, overridden: false },
                };
            }

            if (dropdown === 'geographicAccess') {
                const stage7Default = STAGE7_CONTEXT_DEFAULTS[value];
                return {
                    ...state,
                    contexts: nextContexts,
                    stage7: state.stage7.overridden ? state.stage7 : { value: stage7Default.value, overridden: false },
                };
            }

            return { ...state, contexts: nextContexts };
        }

        case 'RESET_CONTEXT_DEFAULTS': {
            const stage4Default = STAGE4_CONTEXT_DEFAULTS[state.contexts.awarenessInterest];
            const stage5Default = STAGE5_CONTEXT_DEFAULTS[state.contexts.awarenessInterest];
            const stage7Default = STAGE7_CONTEXT_DEFAULTS[state.contexts.geographicAccess];
            return {
                ...state,
                stage4: { value: stage4Default.value, overridden: false },
                stage5: { value: stage5Default.value, overridden: false },
                stage7: { value: stage7Default.value, overridden: false },
            };
        }

        case 'SET_FUNNEL_INPUT_SELECTION':
            return { ...state, funnelInputSelection: action.value };

        case 'SET_STAGE_VALUE': {
            const { stage, value } = action; // stage: 'stage4' | 'stage5' | 'stage7'
            return { ...state, [stage]: { value, overridden: true } };
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
export const useFunnelReducer = (restoredState) => useReducer(funnelReducer, undefined, () => restoredState || initialFunnelState());
