import { Paper, Box, Typography, TextField, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import Callout from './Callout';
import FunnelRowsTable from './FunnelRowsTable';
import {
    STAGE9_RECAP_HELPER_TEXT,
    ILLUSTRATIVE_TOTAL_ADULTS_LABEL,
    ILLUSTRATIVE_COMPARISON_NOTE,
} from '../../constants/funnelDefaults';

// Stage 9, component 1 — read-only Inputs Recap. Rows are the real funnel
// chain (Stage 3 output through Effective demand). The illustrative
// Total-Adults/prevalence/eligibility comparison is optional, shown only if
// the user enters a Total Adults figure, and is never wired into the real
// funnel math (which always starts from the selected Stage-3 2x2 cell).
const InputsRecapTable = ({ funnelRows, displayedEffectiveDemand, capacityCapApplied, illustrative, illustrativeComparison, onIllustrativeTotalAdultsChange }) => (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Inputs Recap</Typography>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            Effective demand: {Number(displayedEffectiveDemand || 0).toLocaleString()}/yr
            {capacityCapApplied ? ' (capacity cap applied)' : ''}
        </Typography>

        <Box sx={{ mb: 1 }}>
            <FunnelRowsTable rows={funnelRows} />
        </Box>
        <Typography variant="body2" color="text.secondary">{STAGE9_RECAP_HELPER_TEXT}</Typography>

        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Illustrative comparison (optional)</Typography>
            <Callout>{ILLUSTRATIVE_COMPARISON_NOTE}</Callout>
            <TextField
                label={ILLUSTRATIVE_TOTAL_ADULTS_LABEL}
                type="number"
                value={illustrative.totalAdults}
                onChange={(e) => onIllustrativeTotalAdultsChange(e.target.value === '' ? '' : Number(e.target.value))}
                sx={{ minWidth: 320, mb: 2 }}
            />
            {illustrativeComparison && (
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Stage</TableCell>
                            <TableCell>Rate</TableCell>
                            <TableCell>N</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>A. Total adults</TableCell>
                            <TableCell>100%</TableCell>
                            <TableCell>{illustrativeComparison.totalAdults.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>B. With MDD</TableCell>
                            <TableCell>{illustrative.prevalencePct}%</TableCell>
                            <TableCell>{illustrativeComparison.withMDD.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>C. Clinically eligible</TableCell>
                            <TableCell>{illustrative.eligiblePct}%</TableCell>
                            <TableCell>{illustrativeComparison.clinicallyEligible.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            )}
        </Box>
    </Paper>
);

export default InputsRecapTable;
