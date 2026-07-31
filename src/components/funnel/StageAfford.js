import {
    Paper, Box, Typography, Radio, RadioGroup, Table, TableBody, TableRow, TableCell,
    TextField, InputAdornment,
} from '@mui/material';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import Callout from './Callout';
import TableHeaderRow from './TableHeaderRow';
import {
    STAGE6_TABLE_A_ROWS,
    STAGE6_TABLE_A_DENOMINATOR,
    STAGE6_TABLE_B_ROWS,
    STAGE6_HEADER_RATIONALE,
    STAGE6_COLORADO_CAVEAT,
    STAGE6_SOURCES,
    PROBABILITY_TYPES,
} from '../../constants/funnelDefaults';

// Stage 6 — Can Afford, Conditional on Stages 4+5 ("Who can pay for treatment?").
// Table A is user-selectable and feeds the funnel; Table B is read-only/informational.
const StageAfford = ({ stage6, onSelectRow, onRowValueChange, onUserDefinedChange }) => {
    const { selectedRow, rowValues, userDefined } = stage6;

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h5">Stage 6 — Can Afford</Typography>
                <ProbabilityTypeTag type={PROBABILITY_TYPES.CONDITIONAL} priorStages="Stages 4 + 5" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                “Who can pay for treatment?”
            </Typography>

            <Callout>{STAGE6_HEADER_RATIONALE}</Callout>
            <Callout>{STAGE6_COLORADO_CAVEAT}</Callout>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                Table A — Out-of-Pocket Price Tiers ({STAGE6_TABLE_A_DENOMINATOR})
            </Typography>
            <RadioGroup value={selectedRow} onChange={(e) => onSelectRow(e.target.value)}>
                <Table size="small">
                    <TableHeaderRow columns={['', 'Price point', 'Context', '%', 'What this % represents', 'Source']} />
                    <TableBody>
                        {STAGE6_TABLE_A_ROWS.map((row) => (
                            <TableRow key={row.key} selected={selectedRow === row.key}>
                                <TableCell>
                                    <Radio value={row.key} />
                                </TableCell>
                                <TableCell>{row.pricePoint}{row.isDefault ? ' (default)' : ''}</TableCell>
                                <TableCell>{row.context}</TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        disabled={selectedRow !== row.key}
                                        value={rowValues[row.key]}
                                        onChange={(e) => onRowValueChange(row.key, e.target.value === '' ? '' : Number(e.target.value))}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                            inputProps: { min: row.min ?? 0, max: row.max ?? 100 },
                                        }}
                                        sx={{ width: 110 }}
                                    />
                                </TableCell>
                                <TableCell>{row.represents}</TableCell>
                                <TableCell>{row.source}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow selected={selectedRow === 'userDefined'}>
                            <TableCell>
                                <Radio value="userDefined" />
                            </TableCell>
                            <TableCell colSpan={2}>
                                <TextField
                                    size="small"
                                    label="Price point"
                                    disabled={selectedRow !== 'userDefined'}
                                    value={userDefined.price}
                                    onChange={(e) => onUserDefinedChange('price', e.target.value)}
                                    sx={{ width: 160 }}
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    size="small"
                                    type="number"
                                    disabled={selectedRow !== 'userDefined'}
                                    value={userDefined.pct}
                                    onChange={(e) => onUserDefinedChange('pct', e.target.value === '' ? '' : Number(e.target.value))}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                        inputProps: { min: 0, max: 100 },
                                    }}
                                    sx={{ width: 110 }}
                                />
                            </TableCell>
                            <TableCell colSpan={2}>
                                <TextField
                                    size="small"
                                    label="Source"
                                    fullWidth
                                    disabled={selectedRow !== 'userDefined'}
                                    value={userDefined.source}
                                    onChange={(e) => onUserDefinedChange('source', e.target.value)}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </RadioGroup>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                Table B — Coverage / Subsidy Pathways (informational only, does not feed the funnel)
            </Typography>
            <Table size="small">
                <TableHeaderRow columns={['Pathway', 'Context', 'Best est.', 'What this % represents', 'Source']} />
                <TableBody>
                    {STAGE6_TABLE_B_ROWS.map((row) => (
                        <TableRow key={row.pathway}>
                            <TableCell>{row.pathway}</TableCell>
                            <TableCell>{row.context}</TableCell>
                            <TableCell>{row.min}–{row.max}%</TableCell>
                            <TableCell>{row.represents}</TableCell>
                            <TableCell>{row.source}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {STAGE6_TABLE_B_ROWS.filter((r) => r.footnote).map((row) => (
                <Callout key={row.pathway} title={`Footnote — ${row.pathway}`}>{row.footnote}</Callout>
            ))}

            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 2 }}>
                Sources: {STAGE6_SOURCES.join(' ')}
            </Typography>
        </Paper>
    );
};

export default StageAfford;
