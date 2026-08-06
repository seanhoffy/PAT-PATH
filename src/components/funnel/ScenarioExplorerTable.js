import { Paper, Typography, Table, TableBody, TableRow, TableCell, TextField, Button, Box } from '@mui/material';
import TableHeaderRow from './TableHeaderRow';

const STAGE_ROWS = [
    { rowKey: 'D', label: 'Aware', stageKey: 'stage4' },
    { rowKey: 'E', label: 'Interested | Aware', stageKey: 'stage5' },
    { rowKey: 'F', label: 'Can afford', stageKey: 'stage6' },
    { rowKey: 'G', label: 'Can access provider', stageKey: 'stage7' },
];

// Stage 9, component 2 — editable Scenario Explorer. Conservative/Optimistic
// vary only Stage 4-7 rates (per agreed scope); the Stage 1-3 base number
// (row C) is identical across all three columns. Any edited cell recomputes
// downstream cells in that column and updates the funnel plot live.
const ScenarioExplorerTable = ({ startN, moderatePercents, scenarioInputs, scenario, onCellChange, onReset }) => {
    const cellValue = (column, stageKey) => {
        if (column === 'moderate') {
            return scenarioInputs.moderateOverrides[stageKey] ?? moderatePercents[stageKey] ?? '';
        }
        return scenarioInputs[column][stageKey] ?? '';
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Scenario Explorer</Typography>
                <Button variant="outlined" onClick={onReset}>Reset to defaults</Button>
            </Box>
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
                            {['conservative', 'moderate', 'optimistic'].map((column) => (
                                <TableCell key={column}>
                                    <TextField
                                        size="small"
                                        type="number"
                                        placeholder={column === 'moderate' ? undefined : '—'}
                                        value={cellValue(column, stageKey)}
                                        onChange={(e) => onCellChange(column, stageKey, e.target.value === '' ? '' : Number(e.target.value))}
                                        sx={{ width: 90 }}
                                    />
                                    <Typography variant="caption" color="text.secondary" component="span"> %</Typography>
                                </TableCell>
                            ))}
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
                Capacity check displayed separately.
            </Typography>
        </Paper>
    );
};

export default ScenarioExplorerTable;
