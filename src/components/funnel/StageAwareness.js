import { Paper, Box, Typography, TextField, InputAdornment, Table, TableBody, TableRow, TableCell, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import Callout from './Callout';
import TableHeaderRow from './TableHeaderRow';
import {
    STAGE4_LABEL,
    STAGE4_CONTEXT_DEFAULTS,
    STAGE4_REFERENCE_ROW,
    STAGE4_HELPER_TEXT,
    STAGE4_ADJUSTMENT_CAPTION,
    STAGE4_SOURCES,
    DEFAULT_AWARENESS_INTEREST_CONTEXT,
    AWARENESS_INTEREST_CONTEXTS,
    AWARENESS_INTEREST_CONTEXT_HELPER_TEXT,
    PROBABILITY_TYPES,
} from '../../constants/funnelDefaults';

const CONTEXT_ROW_LABELS = {
    progressiveUrban: 'Progressive / Urban',
    moderateMixed: 'Moderate / Mixed',
    conservativeRural: 'Conservative / Rural',
};

// Stage 4 — Awareness ("Who knows this therapy exists?"). Independent.
const StageAwareness = ({ value, awarenessInterestContext, onContextChange, onChange }) => {
    const showAdjustmentCaption = awarenessInterestContext !== DEFAULT_AWARENESS_INTEREST_CONTEXT;

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h5">Awareness</Typography>
                <ProbabilityTypeTag type={PROBABILITY_TYPES.INDEPENDENT} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                “Who knows this therapy exists?”
            </Typography>

            <FormControl sx={{ mb: 1, minWidth: 320 }}>
                <InputLabel id="awareness-interest-context-label">Awareness / Interest context</InputLabel>
                <Select
                    labelId="awareness-interest-context-label"
                    label="Awareness / Interest context"
                    value={awarenessInterestContext}
                    onChange={(e) => onContextChange('awarenessInterest', e.target.value)}
                >
                    {AWARENESS_INTEREST_CONTEXTS.map(({ key, label }) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {AWARENESS_INTEREST_CONTEXT_HELPER_TEXT}
            </Typography>

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                {STAGE4_LABEL}
            </Typography>
            <TextField
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                inputProps={{ 'aria-label': STAGE4_LABEL }}
                sx={{ mb: 2, minWidth: 320 }}
            />

            <Callout>{STAGE4_HELPER_TEXT}</Callout>
            {showAdjustmentCaption && <Callout>{STAGE4_ADJUSTMENT_CAPTION}</Callout>}

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                Context-driven defaults
            </Typography>
            <Table size="small">
                <TableHeaderRow columns={['Context', 'Aware', 'Rationale anchor']} />
                <TableBody>
                    {Object.entries(STAGE4_CONTEXT_DEFAULTS).map(([key, row]) => (
                        <TableRow key={key} selected={key === awarenessInterestContext}>
                            <TableCell>{CONTEXT_ROW_LABELS[key]}{key === DEFAULT_AWARENESS_INTEREST_CONTEXT ? ' (default)' : ''}</TableCell>
                            <TableCell>{row.range}</TableCell>
                            <TableCell>{row.rationale}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow>
                        <TableCell>{STAGE4_REFERENCE_ROW.label}</TableCell>
                        <TableCell>{STAGE4_REFERENCE_ROW.range}</TableCell>
                        <TableCell>{STAGE4_REFERENCE_ROW.rationale}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 2 }}>
                Sources: {STAGE4_SOURCES.join(' ')}
            </Typography>
        </Paper>
    );
};

export default StageAwareness;
