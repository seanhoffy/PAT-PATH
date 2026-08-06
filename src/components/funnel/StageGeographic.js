import { Paper, Box, Typography, TextField, InputAdornment, Table, TableBody, TableRow, TableCell, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import Callout from './Callout';
import TableHeaderRow from './TableHeaderRow';
import {
    STAGE7_LABEL,
    STAGE7_CONTEXT_DEFAULTS,
    STAGE7_SESSION_LENGTH_CALLOUT,
    STAGE7_MEDICAL_TOURISM_FOOTNOTE,
    STAGE7_VETERANS_NOTE,
    STAGE7_SOURCES,
    DEFAULT_GEOGRAPHIC_ACCESS_CONTEXT,
    GEOGRAPHIC_ACCESS_CONTEXTS,
    GEOGRAPHIC_ACCESS_CONTEXT_HELPER_TEXT,
    PROBABILITY_TYPES,
} from '../../constants/funnelDefaults';

const CONTEXT_ROW_LABELS = {
    progressiveUrban: 'Progressive / Urban',
    mixedUrbanSuburban: 'Mixed Urban / Suburban',
    mixedUrbanRural: 'Mixed Urban-Rural',
    conservativeRural: 'Conservative / Rural',
    optedOut: 'Opted-Out',
};

// Stage 7 — Geographic Accessibility, Conditional on Stages 4-6 ("Who can
// physically reach a provider?").
const StageGeographic = ({ value, geographicAccessContext, onContextChange, onChange }) => (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h5">Geographic Accessibility</Typography>
            <ProbabilityTypeTag type={PROBABILITY_TYPES.CONDITIONAL} priorStages="Awareness, Interest, Afford" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            “Who can physically reach a provider?”
        </Typography>

        <FormControl sx={{ mb: 1, minWidth: 320 }}>
            <InputLabel id="geographic-access-context-label">Geographic Access context</InputLabel>
            <Select
                labelId="geographic-access-context-label"
                label="Geographic Access context"
                value={geographicAccessContext}
                onChange={(e) => onContextChange('geographicAccess', e.target.value)}
            >
                {GEOGRAPHIC_ACCESS_CONTEXTS.map(({ key, label }) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
            </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {GEOGRAPHIC_ACCESS_CONTEXT_HELPER_TEXT}
        </Typography>

        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {STAGE7_LABEL}
        </Typography>
        <TextField
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            inputProps={{ 'aria-label': STAGE7_LABEL }}
            sx={{ mb: 2, minWidth: 320 }}
        />

        <Callout>{STAGE7_SESSION_LENGTH_CALLOUT}</Callout>
        {geographicAccessContext === 'optedOut' && <Callout>{STAGE7_MEDICAL_TOURISM_FOOTNOTE}</Callout>}

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
            Geographic Accessibility table
        </Typography>
        <Table size="small">
            <TableHeaderRow columns={['Setting', 'Default', 'Basis']} />
            <TableBody>
                {Object.entries(STAGE7_CONTEXT_DEFAULTS).map(([key, row]) => (
                    <TableRow key={key} selected={key === geographicAccessContext}>
                        <TableCell>{CONTEXT_ROW_LABELS[key]}{key === DEFAULT_GEOGRAPHIC_ACCESS_CONTEXT ? ' (default)' : ''}</TableCell>
                        <TableCell>{row.range}</TableCell>
                        <TableCell>{row.basis}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

        <Callout title="Veterans / specific populations">{STAGE7_VETERANS_NOTE}</Callout>

        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 2 }}>
            Sources: {STAGE7_SOURCES.join(' ')}
        </Typography>
    </Paper>
);

export default StageGeographic;
