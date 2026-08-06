import { useState } from 'react';
import { Paper, Box, Typography, TextField, InputAdornment, Table, TableBody, TableRow, TableCell, Collapse, Link } from '@mui/material';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import Callout from './Callout';
import TableHeaderRow from './TableHeaderRow';
import {
    STAGE5_LABEL,
    STAGE4_5_COMBINED_TABLE,
    STAGE5_RATIONALE,
    STAGE5_CAVEAT,
    STAGE5_SOURCES,
    PROBABILITY_TYPES,
} from '../../constants/funnelDefaults';

// Stage 5 — Interest, Conditional on Awareness ("Among those who know about
// it, who would actually consider it?").
const StageInterest = ({ value, onChange }) => {
    const [rationaleOpen, setRationaleOpen] = useState(false);

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h5">Interest</Typography>
                <ProbabilityTypeTag type={PROBABILITY_TYPES.CONDITIONAL} priorStages="Funnel Input, Awareness" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                “Among those who know about it, who would actually consider it?”
            </Typography>

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                {STAGE5_LABEL}
            </Typography>
            <TextField
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                inputProps={{ 'aria-label': STAGE5_LABEL }}
                sx={{ mb: 2, minWidth: 320 }}
            />

            <Callout>{STAGE5_CAVEAT}</Callout>

            <Link component="button" type="button" variant="body2" onClick={() => setRationaleOpen((o) => !o)} sx={{ mb: 2, display: 'inline-block' }}>
                {rationaleOpen ? 'Hide rationale' : 'Why this default?'}
            </Link>
            <Collapse in={rationaleOpen}>
                <Callout>{STAGE5_RATIONALE}</Callout>
            </Collapse>
            <Table size="small">
                <TableHeaderRow columns={['Context', 'Aware', 'Interest | Aware', 'Combined', 'Rationale']} />
                <TableBody>
                    {STAGE4_5_COMBINED_TABLE.map((row) => (
                        <TableRow key={row.context} selected={!!row.isDefault}>
                            <TableCell>{row.context}{row.isDefault ? ' (default)' : ''}</TableCell>
                            <TableCell>{row.aware}</TableCell>
                            <TableCell>{row.interestGivenAware}</TableCell>
                            <TableCell>{row.combined}</TableCell>
                            <TableCell>{row.rationale}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 2 }}>
                Sources: {STAGE5_SOURCES.join(' ')}
            </Typography>
        </Paper>
    );
};

export default StageInterest;
