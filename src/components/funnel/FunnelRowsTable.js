import { Table, TableBody, TableRow, TableCell } from '@mui/material';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import TableHeaderRow from './TableHeaderRow';
import { PROBABILITY_TYPES } from '../../constants/funnelDefaults';

const TYPE_MAP = {
    independent: PROBABILITY_TYPES.INDEPENDENT,
    conditional: PROBABILITY_TYPES.CONDITIONAL,
};

// Read-only funnel row table (Stage 3 output through Effective demand).
// Shared by the live Inputs Recap and the History page's saved-model cards
// so both render identically off the same data shape.
const FunnelRowsTable = ({ rows }) => (
    <Table size="small">
        <TableHeaderRow columns={['Stage', 'Probability type', 'Value entered', 'N passing this gate']} />
        <TableBody>
            {rows.map((row) => (
                <TableRow key={row.key}>
                    <TableCell>{row.stage}</TableCell>
                    <TableCell>{row.type === 'base' ? '—' : <ProbabilityTypeTag type={TYPE_MAP[row.type]} />}</TableCell>
                    <TableCell>{row.rate !== null && row.rate !== undefined ? `${row.rate}%` : '—'}</TableCell>
                    <TableCell>{Number(row.n).toLocaleString()}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

export default FunnelRowsTable;
