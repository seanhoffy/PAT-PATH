import { Fragment } from 'react';
import { Table, TableBody, TableRow, TableCell } from '@mui/material';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import TableHeaderRow from './TableHeaderRow';
import { PROBABILITY_TYPES } from '../../constants/funnelDefaults';
import { formatRate } from '../../utils/funnelCalculations';

const TYPE_MAP = {
    independent: PROBABILITY_TYPES.INDEPENDENT,
    conditional: PROBABILITY_TYPES.CONDITIONAL,
};

const ROW_KEY_TO_STAGE = { D: 'stage4', E: 'stage5', F: 'stage6', G: 'stage7' };

const boundCell = (bounds, rowKey, bound) => {
    const stageKey = ROW_KEY_TO_STAGE[rowKey];
    const raw = stageKey ? bounds?.[stageKey]?.[bound] : null;
    const formatted = formatRate(raw);
    return formatted !== null ? `${formatted}%` : '—';
};

// Read-only funnel row table (Stage 3 output through Effective demand).
// Shared by the live Inputs Recap and the History page's saved-model cards
// so both render identically off the same data shape. `bounds` (from
// getStageInputBounds) is optional — omit it to hide the Low/High columns.
// `stage6SplitSummary` (from getStage6SplitSummary), if present, adds one
// purely informational row after "Can afford" (key 'F') showing its
// Individual/Group breakdown — it carries no N of its own since the real
// running total is already on the blended "Can afford" row above it.
const FunnelRowsTable = ({ rows, bounds, stage6SplitSummary }) => {
    const columnCount = bounds ? 6 : 4;
    return (
        <Table size="small">
            <TableHeaderRow columns={bounds
                ? ['Stage', 'Probability type', 'Lower Bound', 'Base Case', 'Upper Bound', 'People with MDD Retained']
                : ['Stage', 'Probability type', 'Base Case', 'People with MDD Retained']} />
            <TableBody>
                {rows.map((row) => (
                    <Fragment key={row.key}>
                        <TableRow>
                            <TableCell>{row.stage}</TableCell>
                            <TableCell>{row.type === 'base' ? '—' : <ProbabilityTypeTag type={TYPE_MAP[row.type]} />}</TableCell>
                            {bounds && <TableCell>{boundCell(bounds, row.key, 'low')}</TableCell>}
                            <TableCell>{formatRate(row.rate) !== null ? `${formatRate(row.rate)}%` : '—'}</TableCell>
                            {bounds && <TableCell>{boundCell(bounds, row.key, 'high')}</TableCell>}
                            <TableCell>{Number(row.n).toLocaleString()}</TableCell>
                        </TableRow>
                        {row.key === 'F' && stage6SplitSummary && (
                            <TableRow>
                                <TableCell sx={{ pl: 3 }}>↳ Individual / Group split</TableCell>
                                <TableCell colSpan={columnCount - 1}>
                                    <em>{stage6SplitSummary}</em>
                                </TableCell>
                            </TableRow>
                        )}
                    </Fragment>
                ))}
            </TableBody>
        </Table>
    );
};

export default FunnelRowsTable;
