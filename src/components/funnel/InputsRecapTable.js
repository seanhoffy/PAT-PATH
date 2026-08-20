import { Paper, Box, Typography } from '@mui/material';
import FunnelRowsTable from './FunnelRowsTable';
import { STAGE9_RECAP_HELPER_TEXT } from '../../constants/funnelDefaults';

// Stage 9, component 1 — read-only Inputs Recap. Rows are the real funnel
// chain (Stage 3 output through Effective demand).
const InputsRecapTable = ({ funnelRows, bounds }) => (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Inputs Recap</Typography>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Table F — Funnel Chain Recap
        </Typography>
        <Box sx={{ mb: 1 }}>
            <FunnelRowsTable rows={funnelRows} bounds={bounds} />
        </Box>
        <Typography variant="body2" color="text.secondary">{STAGE9_RECAP_HELPER_TEXT}</Typography>
    </Paper>
);

export default InputsRecapTable;
