import { Paper, Typography, Table, TableBody, TableRow, TableCell, TextField, Button, Box, Alert } from '@mui/material';
import TableHeaderRow from './TableHeaderRow';
import { formatRate, isOverHundred } from '../../utils/funnelCalculations';
import { PERCENT_OVER_100_ERROR } from '../../constants/funnelDefaults';

const STAGE_ROWS = [
    { rowKey: 'D', label: 'Aware', stageKey: 'stage4' },
    { rowKey: 'E', label: 'Interest Given Aware', stageKey: 'stage5' },
    { rowKey: 'F', label: 'Can afford', stageKey: 'stage6' },
    { rowKey: 'G', label: 'Sufficient Clinic Capacity', stageKey: 'stage7' },
];

// Stage 9, component 2 — Scenario Explorer. Moderate is still the user's
// literal point estimate (editable, same as before). Conservative/Optimistic
// are no longer manually typed — they're the 10th/90th percentile of a
// 100,000-run Monte Carlo simulation over each stage's Low-High range
// (entered on the stage inputs above), read-only here.
const ScenarioExplorerTable = ({ startN, moderatePercents, scenarioInputs, scenario, onCellChange, onReset }) => {
    const moderateValue = (stageKey) => scenarioInputs.moderateOverrides[stageKey] ?? moderatePercents[stageKey] ?? '';
    const simulatedRate = (column, rowKey) => {
        const rate = scenario[column].rows.find((r) => r.key === rowKey)?.rate;
        return formatRate(rate) ?? '—';
    };
    const hasPercentOver100 = STAGE_ROWS.some(({ stageKey }) => isOverHundred(moderateValue(stageKey)));

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Monte Carlo Simulation Results</Typography>
                <Button variant="outlined" onClick={onReset}>Reset Moderate overrides</Button>
            </Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Table G — Monte Carlo Simulation Results
            </Typography>
            <Table size="small">
                <TableHeaderRow columns={['Stage', 'Conservative', 'Moderate', 'Optimistic']} />
                <TableBody>
                    <TableRow>
                        <TableCell>Population with MDD</TableCell>
                        <TableCell>{Number(startN).toLocaleString()}</TableCell>
                        <TableCell>{Number(startN).toLocaleString()}</TableCell>
                        <TableCell>{Number(startN).toLocaleString()}</TableCell>
                    </TableRow>
                    {STAGE_ROWS.map(({ rowKey, label, stageKey }) => (
                        <TableRow key={rowKey}>
                            <TableCell>{label}</TableCell>
                            <TableCell>{simulatedRate('conservative', rowKey)}%</TableCell>
                            <TableCell>
                                <TextField
                                    size="small"
                                    type="number"
                                    value={moderateValue(stageKey)}
                                    onChange={(e) => onCellChange(stageKey, e.target.value === '' ? '' : Number(e.target.value))}
                                    sx={{ width: 90 }}
                                />
                                <Typography variant="caption" color="text.secondary" component="span"> %</Typography>
                            </TableCell>
                            <TableCell>{simulatedRate('optimistic', rowKey)}%</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>= Effective demand (funnel)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{Number(scenario.conservative.effectiveDemand).toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{Number(scenario.moderate.effectiveDemand).toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{Number(scenario.optimistic.effectiveDemand).toLocaleString()}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {hasPercentOver100 && (
                <Alert severity="error" sx={{ mt: 2 }}>{PERCENT_OVER_100_ERROR}</Alert>
            )}
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
                Conservative/Optimistic reflect a 100,000-run simulation (10th/90th percentile) over each stage's Low–High range; Moderate is your literal point estimate. Capacity check displayed separately.
            </Typography>
        </Paper>
    );
};

export default ScenarioExplorerTable;
