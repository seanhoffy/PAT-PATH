import { useEffect, useMemo } from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import { COLORS } from '../../constants/colors';
import MethodsPreamble from './MethodsPreamble';
import FunnelInputSelector from './FunnelInputSelector';
import StageAwareness from './StageAwareness';
import StageInterest from './StageInterest';
import StageAfford from './StageAfford';
import StageGeographic from './StageGeographic';
import StageCapacity from './StageCapacity';
import InputsRecapTable from './InputsRecapTable';
import ScenarioExplorerTable from './ScenarioExplorerTable';
import DemandDistributionChart from './DemandDistributionChart';
import SensitivityTornadoChart from './SensitivityTornadoChart';
import FunnelPlot from './FunnelPlot';
import Callout from './Callout';
import { useFunnelReducer, getModeratePercents } from './useFunnelReducer';
import { deriveFunnelCore, buildFunnelScenario, buildFunnelRows, buildPartialFunnelRows, validateFunnelRequiredStages, getStageInputBounds, getStage6SplitSummary } from '../../utils/funnelCalculations';
import { STAGE9_MONTE_CARLO_EXPLAINER } from '../../constants/funnelDefaults';

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
        stage8Capacity,
    } = deriveFunnelCore(state, cellValues);

    // The Monte Carlo simulation (100,000 iterations) is the expensive part
    // of Stage 9 — memoized on just the pieces that feed it, so editing a
    // Stage 8 capacity field (or anything else) doesn't rerun it. Each of
    // stage4-7/scenario keeps a stable object reference across unrelated
    // dispatches (the reducer only replaces the slice it actually touches),
    // so reference equality here is sufficient — no need to list every field.
    const scenario = useMemo(
        () => buildFunnelScenario(funnelInputN, state),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [funnelInputN, state.stage4, state.stage5, state.stage6, state.stage7, state.scenario]
    );

    const funnelReady = validateFunnelRequiredStages(state).isValid;
    const stageInputBounds = getStageInputBounds(state);

    // Live "Results so far" preview under each of Stages 4-7 — each bounded
    // to its own stage (never shows a later stage's bar even if that one's
    // already filled in too), per buildPartialFunnelRows.
    const stage4PreviewRows = buildPartialFunnelRows(funnelInputN, state, 'stage4');
    const stage5PreviewRows = buildPartialFunnelRows(funnelInputN, state, 'stage5');
    const stage6PreviewRows = buildPartialFunnelRows(funnelInputN, state, 'stage6');
    const stage7PreviewRows = buildPartialFunnelRows(funnelInputN, state, 'stage7');

    const moderatePercents = getModeratePercents(state);

    // Conservative can't exceed the displayed (possibly capacity-capped)
    // Effective Demand — the simulated Conservative figure is uncapped, so
    // once a capacity cap pulls Effective Demand below it, showing the raw
    // simulated number next to it would read as a lower bound above the
    // estimate. Scoped to this hero display only — the Scenario Explorer
    // table below keeps showing the uncapped simulated figures.
    const displayConservative = state.stage8.capacityCapApplied
        ? Math.min(scenario.conservative.effectiveDemand, displayedEffectiveDemand)
        : scenario.conservative.effectiveDemand;

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
            stage8Capacity,
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
                Reference info and typical ranges are provided if needed. All required fields are light blue.
            </Callout>

            <FunnelInputSelector
                cellValues={cellValues}
                selection={state.funnelInputSelection}
                onChange={(value) => dispatch({ type: 'SET_FUNNEL_INPUT_SELECTION', value })}
            />

            <StageAwareness
                value={state.stage4.value}
                low={state.stage4.low}
                high={state.stage4.high}
                awarenessInterestContext={state.contexts.awarenessInterest}
                onContextChange={(dropdown, value) => dispatch({ type: 'SET_CONTEXT', dropdown, value })}
                onChange={(value) => dispatch({ type: 'SET_STAGE_VALUE', stage: 'stage4', value })}
                onRangeChange={(bound, value) => dispatch({ type: 'SET_STAGE_RANGE', stage: 'stage4', bound, value })}
                previewRows={stage4PreviewRows}
            />

            <StageInterest
                value={state.stage5.value}
                low={state.stage5.low}
                high={state.stage5.high}
                onChange={(value) => dispatch({ type: 'SET_STAGE_VALUE', stage: 'stage5', value })}
                onRangeChange={(bound, value) => dispatch({ type: 'SET_STAGE_RANGE', stage: 'stage5', bound, value })}
                previewRows={stage5PreviewRows}
            />

            <StageAfford
                stage6={state.stage6}
                onRowFieldChange={(row, field, value) => dispatch({ type: 'SET_STAGE6_ROW_FIELD', row, field, value })}
                onSplitChange={(value) => dispatch({ type: 'SET_STAGE6_SPLIT', value })}
                previewRows={stage6PreviewRows}
            />

            <StageGeographic
                value={state.stage7.value}
                low={state.stage7.low}
                high={state.stage7.high}
                geographicAccessContext={state.contexts.geographicAccess}
                onContextChange={(dropdown, value) => dispatch({ type: 'SET_CONTEXT', dropdown, value })}
                onChange={(value) => dispatch({ type: 'SET_STAGE_VALUE', stage: 'stage7', value })}
                onRangeChange={(bound, value) => dispatch({ type: 'SET_STAGE_RANGE', stage: 'stage7', bound, value })}
                previewRows={stage7PreviewRows}
            />

            <StageCapacity
                stage8={state.stage8}
                pctIndividual={state.stage6.pctIndividual}
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
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>
                “Your realistic annual utilization estimate.”
            </Typography>
            {funnelReady ? (
                <>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            mb: 3,
                            textAlign: 'center',
                            backgroundColor: COLORS.primary,
                            color: COLORS.white,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.85 }}>
                            Effective Demand
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="center" gap={3}>
                            <Box sx={{ minWidth: 90 }}>
                                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block' }}>
                                    Conservative
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {Number(displayConservative || 0).toLocaleString()}
                                </Typography>
                            </Box>
                            <Typography variant="h2" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
                                {Number(displayedEffectiveDemand || 0).toLocaleString()}
                                <Typography component="span" variant="h5" sx={{ ml: 1, opacity: 0.85 }}>
                                    /yr
                                </Typography>
                            </Typography>
                            <Box sx={{ minWidth: 90 }}>
                                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block' }}>
                                    Optimistic
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {Number(scenario.optimistic.effectiveDemand || 0).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                        {state.stage8.capacityCapApplied && (
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>
                                (capacity cap applied)
                            </Typography>
                        )}
                    </Paper>

                    <InputsRecapTable funnelRows={funnelRows} bounds={stageInputBounds} stage6SplitSummary={getStage6SplitSummary(state.stage6)} />

                    {!scenario.hasSimulationVariance && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Conservative and Optimistic currently equal the point estimate — add a Low/High range to any stage above to see a realistic spread.
                        </Alert>
                    )}

                    <ScenarioExplorerTable
                        startN={funnelInputN}
                        moderatePercents={moderatePercents}
                        scenarioInputs={state.scenario}
                        scenario={scenario}
                        onCellChange={(stage, value) => dispatch({ type: 'SET_SCENARIO_CELL', stage, value })}
                        onReset={() => dispatch({ type: 'RESET_SCENARIO_EXPLORER' })}
                    />

                    <Callout title="What is a Monte Carlo simulation?">{STAGE9_MONTE_CARLO_EXPLAINER}</Callout>

                    <DemandDistributionChart
                        simulationRuns={scenario.simulationRuns}
                        conservative={scenario.conservative}
                        moderate={scenario.moderate}
                        optimistic={scenario.optimistic}
                    />

                    <SensitivityTornadoChart tornado={scenario.tornado} pointEstimate={scenario.moderate.effectiveDemand} />

                    <FunnelPlot rows={moderateRows} />
                </>
            ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Final Results requires completing all required data entry.
                </Alert>
            )}
        </Box>
    );
};

export default FunnelSection;
