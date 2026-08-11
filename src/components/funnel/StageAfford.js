import {
    Paper, Box, Typography, Radio, RadioGroup, Table, TableBody, TableRow, TableCell,
    TextField,
} from '@mui/material';
import { NumericFormat } from 'react-number-format';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import Callout from './Callout';
import TableHeaderRow from './TableHeaderRow';
import SourcesList from './SourcesList';
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
// Table C is user-selectable and feeds the funnel; Table D is read-only/informational.
const StageAfford = ({ stage6, onSelectRow, onRowValueChange, onUserDefinedChange }) => {
    const { selectedRow, rowValues, userDefined } = stage6;

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h5">Can Afford</Typography>
                <ProbabilityTypeTag type={PROBABILITY_TYPES.CONDITIONAL} priorStages="Awareness, Interest" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                “Who can pay for treatment?”
            </Typography>

            <Callout>{STAGE6_HEADER_RATIONALE}</Callout>
            <Callout>{STAGE6_COLORADO_CAVEAT}</Callout>

            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                Table C — Out-of-Pocket Price Tiers ({STAGE6_TABLE_A_DENOMINATOR})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Select most relevant context below
            </Typography>
            <RadioGroup value={selectedRow} onChange={(e) => onSelectRow(e.target.value)}>
                <Table size="small">
                    <TableHeaderRow columns={['', 'Price point', 'Context', '%', 'Source']} />
                    <TableBody>
                        {STAGE6_TABLE_A_ROWS.map((row) => (
                            <TableRow key={row.key} selected={selectedRow === row.key}>
                                <TableCell>
                                    <Radio value={row.key} />
                                </TableCell>
                                <TableCell>{row.pricePoint}{row.isDefault ? ' (default)' : ''}</TableCell>
                                <TableCell>{row.context}</TableCell>
                                <TableCell>
                                    <NumericFormat
                                        customInput={TextField}
                                        size="small"
                                        suffix=" %"
                                        disabled={selectedRow !== row.key}
                                        value={rowValues[row.key]}
                                        onValueChange={(values) => onRowValueChange(row.key, values.value === '' ? '' : values.floatValue)}
                                        inputProps={{ style: { textAlign: 'right' } }}
                                        sx={{ width: 70 }}
                                    />
                                </TableCell>
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
                                <NumericFormat
                                    customInput={TextField}
                                    size="small"
                                    suffix=" %"
                                    disabled={selectedRow !== 'userDefined'}
                                    value={userDefined.pct}
                                    onValueChange={(values) => onUserDefinedChange('pct', values.value === '' ? '' : values.floatValue)}
                                    inputProps={{ style: { textAlign: 'right' } }}
                                    sx={{ width: 70 }}
                                />
                            </TableCell>
                            <TableCell>
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
                Table D — Coverage / Subsidy Pathways (informational only, may inform user defined value)
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

            <SourcesList sources={STAGE6_SOURCES} />
        </Paper>
    );
};

export default StageAfford;
