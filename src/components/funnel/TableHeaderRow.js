import { TableHead, TableRow, TableCell } from '@mui/material';
import { COLORS } from '../../constants/colors';

// Shared dark-header-row treatment for the funnel section's read-only
// tables, matching the spec document's own table styling. `columns` is an
// array of header cell labels (use '' for a blank leading column, e.g. a
// radio-button column with no header text).
const TableHeaderRow = ({ columns }) => (
    <TableHead>
        <TableRow sx={{ backgroundColor: COLORS.primary }}>
            {columns.map((col, index) => (
                <TableCell key={`${col}-${index}`} sx={{ color: COLORS.white, fontWeight: 'bold', textAlign: 'center' }}>
                    {col}
                </TableCell>
            ))}
        </TableRow>
    </TableHead>
);

export default TableHeaderRow;
