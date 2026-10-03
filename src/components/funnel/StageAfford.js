import { Fragment } from 'react';
import {
    Paper, Box, Typography, Table, TableBody, TableRow, TableCell, TextField, Alert, InputAdornment,
} from '@mui/material';
import { NumericFormat } from 'react-number-format';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import Callout from './Callout';
import TableHeaderRow from './TableHeaderRow';
import SourcesList from './SourcesList';
import FunnelPlot from './FunnelPlot';
import { isOverHundred, isOutOfBounds } from '../../utils/funnelCalculations';
import { requiredFieldSx } from '../../constants/colors';
import {
    STAGE6_TABLE_A_ROWS,
    STAGE6_COLORADO_CAVEAT,
    STAGE6_SOURCES,
    STAGE6_SPLIT_LABEL,
    STAGE6_SPLIT_HELPER,
    STAGE6_GUIDANCE_HEADING,
    STAGE6_GUIDANCE_HELPER,
    STAGE6_AFFORDABILITY_ERROR,
    STAGE6_PRICE_ERROR,
    PROBABILITY_TYPES,
    PERCENT_OVER_100_ERROR,
    BOUNDS_ORDER_ERROR,
} from '../../constants/funnelDefaults';

const isBlank = (v) => v === '' || v === null || v === undefined || Number.isNaN(Number(v));

const ROW_META = [
    { key: 'individual', label: 'Individual' },
    { key: 'group', label: 'Group' },
];

// Static InputProps so $/% show inside the field even while it's blank —
// react-number-format's own prefix/suffix only render once a value is
// typed, so the adornment is attached to the underlying TextField instead.
const DOLLAR_ADORNMENT = { startAdornment: <InputAdornment position="start">$</InputAdornment> };
const PERCENT_ADORNMENT = { endAdornment: <InputAdornment position="end">%</InputAdornment> };

// Stage 6 — Can Afford, Conditional on Stages 4+5 ("Who can pay for treatment?").
// Table C is reference-only guidance; Table D is two fixed rows (Individual /
// Group), not a selectable preset list — the user enters their own Price/
// Base Case/Range/Comment for each delivery format, and the two rows blend
// into one Can-Afford% via the % Individual/Group split (which also feeds
// Stage 8's hours-per-client mix, so it's only entered here).
const BLANK_ROW = { price: '', low: '', high: '', pct: '', comment: '' };

const StageAfford = ({ stage6, onRowFieldChange, onSplitChange, previewRows }) => {
    // Defensive fallback for a never-migrated legacy stage6 shape (pre-refactor
    // saved models) — useFunnelReducer already merges these in on restore, but
    // this keeps the component itself from crashing if that merge is ever
    // bypassed (e.g. a raw object passed in some other way).
    const individual = stage6.individual || BLANK_ROW;
    const group = stage6.group || BLANK_ROW;
    const { pctIndividual } = stage6;

    const splitEntered = !isBlank(pctIndividual);
    const groupSplit = splitEntered ? 100 - Number(pctIndividual) : null;
    const rowFor = (key) => (key === 'individual' ? individual : group);

    const affordabilityBackwards = !isBlank(individual.pct) && !isBlank(group.pct)
        && Number(individual.pct) > Number(group.pct);
    const priceBackwards = !isBlank(individual.price) && !isBlank(group.price)
        && Number(group.price) > Number(individual.price);
    const hasPercentOver100 = [
        pctIndividual, individual.pct, individual.low, individual.high, group.pct, group.low, group.high,
    ].some(isOverHundred);
    const baseOutOfBounds = isOutOfBounds(individual.low, individual.pct, individual.high)
        || isOutOfBounds(group.low, group.pct, group.high);

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h5">Can Afford</Typography>
                <ProbabilityTypeTag type={PROBABILITY_TYPES.CONDITIONAL} priorStages="Awareness, Interest" />
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>
                “Who can pay for treatment?”
            </Typography>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                {STAGE6_SPLIT_LABEL}
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 1, gap: 2 }}>
                <NumericFormat
                    customInput={TextField}
                    size="small"
                    decimalScale={2}
                    InputProps={PERCENT_ADORNMENT}
                    value={pctIndividual}
                    onValueChange={(values) => onSplitChange(values.value === '' ? '' : values.floatValue)}
                    inputProps={{ min: 0, max: 100, style: { textAlign: 'center' } }}
                    sx={{ width: 120, ...requiredFieldSx(isBlank(pctIndividual)) }}
                />
                <Typography variant="body2" color="text.secondary">
                    {splitEntered ? `${Number(pctIndividual)}% individual · ${groupSplit}% group` : '— % individual · remainder % group'}
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {STAGE6_SPLIT_HELPER}
            </Typography>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Table C — {STAGE6_GUIDANCE_HEADING}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {STAGE6_GUIDANCE_HELPER}
            </Typography>
            <Table size="small">
                <TableHeaderRow
                    columns={['Price', 'Context', 'Base Case', 'Range', 'Source']}
                    superHeader={{ label: '% that can afford', startIndex: 2, span: 2 }}
                />
                <TableBody>
                    {STAGE6_TABLE_A_ROWS.map((row) => (
                        <TableRow key={row.key}>
                            <TableCell>{row.pricePoint}</TableCell>
                            <TableCell>{row.context}</TableCell>
                            <TableCell>{row.default}%</TableCell>
                            <TableCell>{row.min != null && row.max != null ? `${row.min}–${row.max}%` : '—'}</TableCell>
                            <TableCell>{row.source}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Callout>{STAGE6_COLORADO_CAVEAT}</Callout>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                Table D — % of People Who Can Afford at Various Price Points
            </Typography>

            <Table size="small">
                <TableHeaderRow
                    columns={['', 'Price', 'Base Case', 'Range', 'Comment']}
                    superHeader={{ label: '% that can afford', startIndex: 2, span: 2 }}
                />
                <TableBody>
                    {ROW_META.map(({ key, label }) => {
                        const row = rowFor(key);
                        // A row's own split % is 0 whenever the *other* row is
                        // entered at 100% — either way, this row currently
                        // contributes nothing to the blended Can-Afford%, so
                        // its Price/Base Case/Range inputs are moot until the
                        // split above changes.
                        const rowSplit = key === 'individual' ? pctIndividual : groupSplit;
                        const zeroWeighted = splitEntered && Number(rowSplit) === 0;
                        return (
                            <Fragment key={key}>
                                <TableRow sx={zeroWeighted ? { opacity: 0.45 } : undefined}>
                                    <TableCell sx={{ fontWeight: 600 }}>{label}</TableCell>
                                    <TableCell>
                                        <NumericFormat
                                            customInput={TextField}
                                            size="small"
                                            thousandSeparator
                                            InputProps={DOLLAR_ADORNMENT}
                                            value={row.price}
                                            onValueChange={(values) => onRowFieldChange(key, 'price', values.value === '' ? '' : values.floatValue)}
                                            inputProps={{ style: { textAlign: 'center' } }}
                                            sx={{ width: 110 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <NumericFormat
                                            customInput={TextField}
                                            size="small"
                                            decimalScale={2}
                                            InputProps={PERCENT_ADORNMENT}
                                            value={row.pct}
                                            onValueChange={(values) => onRowFieldChange(key, 'pct', values.value === '' ? '' : values.floatValue)}
                                            inputProps={{ style: { textAlign: 'center' } }}
                                            sx={{ width: 100, ...requiredFieldSx(isBlank(row.pct)) }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={1}>
                                            <NumericFormat
                                                customInput={TextField}
                                                size="small"
                                                decimalScale={2}
                                                label="Low"
                                                InputProps={PERCENT_ADORNMENT}
                                                value={row.low}
                                                onValueChange={(values) => onRowFieldChange(key, 'low', values.value === '' ? '' : values.floatValue)}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                                sx={{ width: 90 }}
                                            />
                                            <NumericFormat
                                                customInput={TextField}
                                                size="small"
                                                decimalScale={2}
                                                label="High"
                                                InputProps={PERCENT_ADORNMENT}
                                                value={row.high}
                                                onValueChange={(values) => onRowFieldChange(key, 'high', values.value === '' ? '' : values.floatValue)}
                                                inputProps={{ style: { textAlign: 'center' } }}
                                                sx={{ width: 90 }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            value={row.comment}
                                            onChange={(e) => onRowFieldChange(key, 'comment', e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow>
                                {zeroWeighted && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ py: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                {label} is weighted 0% in the split above, so these values don’t affect the model right now.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        );
                    })}
                </TableBody>
            </Table>

            {hasPercentOver100 && (
                <Alert severity="error" sx={{ mt: 2 }}>{PERCENT_OVER_100_ERROR}</Alert>
            )}
            {baseOutOfBounds && (
                <Alert severity="error" sx={{ mt: 2 }}>{BOUNDS_ORDER_ERROR}</Alert>
            )}
            {affordabilityBackwards && (
                <Alert severity="error" sx={{ mt: 2 }}>{STAGE6_AFFORDABILITY_ERROR}</Alert>
            )}
            {priceBackwards && (
                <Alert severity="error" sx={{ mt: 2 }}>{STAGE6_PRICE_ERROR}</Alert>
            )}

            {previewRows?.length > 1 && <FunnelPlot rows={previewRows} title="Results so far" />}

            <SourcesList sources={STAGE6_SOURCES} />
        </Paper>
    );
};

export default StageAfford;
