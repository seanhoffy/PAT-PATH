import { Paper, Typography, Table, TableBody, TableRow, TableCell, TextField, Button, Box } from '@mui/material';
import TableHeaderRow from './TableHeaderRow';
import { formatRate } from '../../utils/funnelCalculations';

const STAGE_ROWS = [
    { rowKey: 'D', label: 'Aware', stageKey: 'stage4' },
    { rowKey: 'E', label: 'Interest Given Aware', stageKey: 'stage5' },
    { rowKey: 'F', label: 'Can afford', stageKey: 'stage6' },
    { rowKey: 'G', label: 'Can access provider', stageKey: 'stage7' },
];

// Stage 9, component 2 — Scenario Explorer. Moderate is still the user's
// literal point estimate (editable, same as before). Conservative/Optimistic
// are no longer manually typed — they're the 10th/90th percentile of a
// 10,000-run Monte Carlo simulation over each stage's Low-High range
// (entered on the stage inputs above), read-only here.
const ScenarioExplorerTable = ({ startN, moderatePercents, scenarioInputs, scenario, onCellChange, onReset }) => {
    const moderateValue = (stageKey) => scenarioInputs.moderateOverrides[stageKey] ?? moderatePercents[stageKey] ?? '';
    const simulatedRate = (column, rowKey) => {
        const rate = scenario[column].rows.find((r) => r.key === rowKey)?.rate;
        return formatRate(rate) ?? '—';
    };

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
                        <TableCell>Funnel Input</TableCell>
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
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
                Conservative/Optimistic reflect a 10,000-run simulation (10th/90th percentile) over each stage's Low–High range; Moderate is your literal point estimate. Capacity check displayed separately.
            </Typography>
        </Paper>
    );
};

export default ScenarioExplorerTable;
