import { useEffect, useMemo } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import MethodsPreamble from './MethodsPreamble';
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
import { deriveFunnelDisplay, buildFunnelRows, validateFunnelRequiredStages } from '../../utils/funnelCalculations';
import { STAGE9_METHODOLOGICAL_CAVEAT, STAGE9_OREGON_COMPARATOR_CAPTION } from '../../constants/funnelDefaults';

// Top-level container for Stages 4-9. Owns the reducer and composes every
// cross-cutting piece and stage subcomponent. Lifts its whole state upward
// via onFunnelStateChange, mirroring the results/setResults lifted-state
// pattern already used elsewhere in the app.
const FunnelSection = ({ cellValues, onFunnelStateChange, initialState }) => {
    const [state, dispatch] = useFunnelReducer(initialState);

    const {
        funnelInputN,
        funnelRows,
        effectiveDemand,
        displayedEffectiveDemand,
        capacityN,
        capacityReady,
        exceedsCapacity,
        scenario,
    } = deriveFunnelDisplay(state, cellValues);

    const funnelReady = validateFunnelRequiredStages(state).isValid;

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
            <Typography variant="h4" sx={{ mb: 1, textAlign: 'center' }}>
                Demand Funnel
            </Typography>
            <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mb: 3, fontStyle: 'bold', textAlign: 'center', maxWidth: '860px', mx: 'auto' }}
            >
                This next section narrows the raw prevalence estimate down to a realistic annual utilization
                number by applying real world funnel factors including: <strong>awareness, interest, affordability,
                    geographic access, and provider capacity</strong>.
            </Typography>

            <MethodsPreamble />

            <Callout>
                You will need to provide plausible estimates for these values in your location.
                Reference info and typical ranges are provided if needed.
            </Callout>

            <FunnelInputSelector
                cellValues={cellValues}
                selection={state.funnelInputSelection}
                onChange={(value) => dispatch({ type: 'SET_FUNNEL_INPUT_SELECTION', value })}
            />

            <StageAwareness
                value={state.stage4.value}
                awarenessInterestContext={state.contexts.awarenessInterest}
                onContextChange={(dropdown, value) => dispatch({ type: 'SET_CONTEXT', dropdown, value })}
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
                onContextChange={(dropdown, value) => dispatch({ type: 'SET_CONTEXT', dropdown, value })}
                onChange={(value) => dispatch({ type: 'SET_STAGE_VALUE', stage: 'stage7', value })}
            />

            <StageCapacity
                stage8={state.stage8}
                effectiveDemand={effectiveDemand}
                displayedEffectiveDemand={displayedEffectiveDemand}
                capacityN={capacityN}
                capacityReady={capacityReady}
                exceedsCapacity={exceedsCapacity}
                onFieldChange={(field, value) => dispatch({ type: 'SET_STAGE8_FIELD', field, value })}
                onApplyCap={() => dispatch({ type: 'APPLY_CAPACITY_CAP' })}
                onRemoveCap={() => dispatch({ type: 'REMOVE_CAPACITY_CAP' })}
            />

            <Typography variant="h5" sx={{ mt: 4 }}>
                Effective Demand
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                “Your realistic annual utilization estimate.”
            </Typography>
            <Callout title="Methodological caveat">{STAGE9_METHODOLOGICAL_CAVEAT}</Callout>

            {funnelReady ? (
                <>
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
                </>
            ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Complete Awareness, Interest, Afford, and Geographic Accessibility above to see your funnel and effective-demand estimate.
                </Alert>
            )}

            <Callout title="Oregon comparator">{STAGE9_OREGON_COMPARATOR_CAPTION}</Callout>
        </Box>
    );
};

export default FunnelSection;
