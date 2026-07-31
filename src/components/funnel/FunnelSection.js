import { useEffect, useMemo } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import MethodsPreamble from './MethodsPreamble';
import ContextSelectors from './ContextSelectors';
import FunnelInputSelector from './FunnelInputSelector';
import StageAwareness from './StageAwareness';
import StageInterest from './StageInterest';
import StageAfford from './StageAfford';
import StageGeographic from './StageGeographic';
import StageCapacity from './StageCapacity';
import InputsRecapTable from './InputsRecapTable';
import ScenarioExplorerTable from './ScenarioExplorerTable';
import FunnelPlot from './FunnelPlot';
import Callout from './Callout';
import { useFunnelReducer, getModeratePercents } from './useFunnelReducer';
import { deriveFunnelDisplay, buildFunnelRows } from '../../utils/funnelCalculations';
import { STAGE9_METHODOLOGICAL_CAVEAT, STAGE9_OREGON_COMPARATOR_CAPTION } from '../../constants/funnelDefaults';

// Top-level container for Stages 4-9. Owns the reducer and composes every
// cross-cutting piece and stage subcomponent. Lifts its whole state upward
// via onFunnelStateChange, mirroring the existing actualPercents/setActualPercents
// lifted-state pattern already used for the Stage 1-3 2x2 grid.
const FunnelSection = ({ cellValues, onFunnelStateChange, initialState }) => {
    const [state, dispatch] = useFunnelReducer(initialState);

    const {
        funnelInputN,
        funnelRows,
        effectiveDemand,
        displayedEffectiveDemand,
        capacityN,
        exceedsCapacity,
        scenario,
    } = deriveFunnelDisplay(state, cellValues);

    const moderatePercents = getModeratePercents(state);

    // Memoized on the primitive Moderate-column percents (not on `scenario`,
    // which is a fresh object every render) so the funnel plot only gets a
    // new `rows` reference when a value it actually renders changes — typing
    // in Conservative/Optimistic cells or Stage 8 fields won't re-render it.
    const moderateRows = useMemo(
        () => buildFunnelRows(funnelInputN, moderatePercents).rows,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [funnelInputN, moderatePercents.stage4, moderatePercents.stage5, moderatePercents.stage6, moderatePercents.stage7]
    );

    useEffect(() => {
        if (!onFunnelStateChange) return;
        onFunnelStateChange(state, {
            funnelInputN,
            funnelRows,
            effectiveDemand,
            displayedEffectiveDemand,
            capacityN,
            exceedsCapacity,
            scenario,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, funnelInputN]);

    return (
        <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h4" sx={{ mb: 2 }}>
                Stages 4–9: Realistic Utilization Funnel
            </Typography>

            <MethodsPreamble />

            <FunnelInputSelector
                cellValues={cellValues}
                selection={state.funnelInputSelection}
                onChange={(value) => dispatch({ type: 'SET_FUNNEL_INPUT_SELECTION', value })}
            />

            <ContextSelectors
                contexts={state.contexts}
                onContextChange={(dropdown, value) => dispatch({ type: 'SET_CONTEXT', dropdown, value })}
                onResetDefaults={() => dispatch({ type: 'RESET_CONTEXT_DEFAULTS' })}
            />

            <StageAwareness
                value={state.stage4.value}
                awarenessInterestContext={state.contexts.awarenessInterest}
                onChange={(value) => dispatch({ type: 'SET_STAGE_VALUE', stage: 'stage4', value })}
            />

            <StageInterest
                value={state.stage5.value}
                onChange={(value) => dispatch({ type: 'SET_STAGE_VALUE', stage: 'stage5', value })}
            />

            <StageAfford
                stage6={state.stage6}
                onSelectRow={(key) => dispatch({ type: 'SET_STAGE6_ROW', key })}
                onRowValueChange={(key, value) => dispatch({ type: 'SET_STAGE6_ROW_VALUE', key, value })}
                onUserDefinedChange={(field, value) => dispatch({ type: 'SET_STAGE6_USER_DEFINED', field, value })}
            />

            <StageGeographic
                value={state.stage7.value}
                geographicAccessContext={state.contexts.geographicAccess}
                onChange={(value) => dispatch({ type: 'SET_STAGE_VALUE', stage: 'stage7', value })}
            />

            <StageCapacity
                stage8={state.stage8}
                effectiveDemand={effectiveDemand}
                displayedEffectiveDemand={displayedEffectiveDemand}
                capacityN={capacityN}
                exceedsCapacity={exceedsCapacity}
                onFieldChange={(field, value) => dispatch({ type: 'SET_STAGE8_FIELD', field, value })}
                onApplyCap={() => dispatch({ type: 'APPLY_CAPACITY_CAP' })}
                onRemoveCap={() => dispatch({ type: 'REMOVE_CAPACITY_CAP' })}
            />

            <Typography variant="h5" sx={{ mt: 4 }}>
                Stage 9 — Effective Demand
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                “Your realistic annual utilization estimate.”
            </Typography>
            <Callout title="Methodological caveat">{STAGE9_METHODOLOGICAL_CAVEAT}</Callout>

            <InputsRecapTable
                funnelRows={funnelRows}
                displayedEffectiveDemand={displayedEffectiveDemand}
                capacityCapApplied={state.stage8.capacityCapApplied}
            />

            <ScenarioExplorerTable
                startN={funnelInputN}
                moderatePercents={moderatePercents}
                scenarioInputs={state.scenario}
                scenario={scenario}
                onCellChange={(column, stage, value) => dispatch({ type: 'SET_SCENARIO_CELL', column, stage, value })}
                onReset={() => dispatch({ type: 'RESET_SCENARIO_EXPLORER' })}
            />

            <FunnelPlot rows={moderateRows} />

            <Callout title="Oregon comparator">{STAGE9_OREGON_COMPARATOR_CAPTION}</Callout>
        </Box>
    );
};

export default FunnelSection;
