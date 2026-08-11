import { Paper, Box, Typography, TextField, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { NumericFormat } from 'react-number-format';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import Callout from './Callout';
import TableHeaderRow from './TableHeaderRow';
import SourcesList from './SourcesList';
import {
    STAGE5_LABEL,
    STAGE4_5_COMBINED_TABLE,
    STAGE5_CAVEAT,
    STAGE5_SOURCES,
    PROBABILITY_TYPES,
} from '../../constants/funnelDefaults';

// Stage 5 — Interest, Conditional on Awareness ("Among those who know about
// it, who would actually consider it?").
const StageInterest = ({ value, onChange }) => {
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
            <NumericFormat
                customInput={TextField}
                suffix=" %"
                value={value}
                onValueChange={(values) => onChange(values.value === '' ? '' : values.floatValue)}
                inputProps={{ 'aria-label': STAGE5_LABEL, style: { textAlign: 'right' } }}
                sx={{ mb: 2, width: 80 }}
            />

            <Callout>{STAGE5_CAVEAT}</Callout>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                Table B — Combined Awareness + Interest
            </Typography>
            <Table size="small">
                <TableHeaderRow columns={['Context', 'Aware', 'Interest Given Aware', 'Combined', 'Rationale', 'Source']} />
                <TableBody>
                    {STAGE4_5_COMBINED_TABLE.map((row) => (
                        <TableRow key={row.context} selected={!!row.isDefault}>
                            <TableCell>{row.context}{row.isDefault ? ' (default)' : ''}</TableCell>
                            <TableCell>{row.aware}</TableCell>
                            <TableCell>{row.interestGivenAware}</TableCell>
                            <TableCell>{row.combined}</TableCell>
                            <TableCell>{row.rationale}</TableCell>
                            <TableCell>{row.source || '—'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <SourcesList sources={STAGE5_SOURCES} />
        </Paper>
    );
};

export default StageInterest;
