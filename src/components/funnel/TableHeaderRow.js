import { TableHead, TableRow, TableCell } from '@mui/material';
import { COLORS } from '../../constants/colors';

// Shared dark-header-row treatment for the funnel section's read-only
// tables, matching the spec document's own table styling. `columns` is an
// array of header cell labels (use '' for a blank leading column, e.g. a
// radio-button column with no header text).
//
// `superHeader` (optional): { label, startIndex, span } — adds a second row
// above the normal column labels with one spanning cell (e.g. "% that can
// afford" over adjacent Base Case / Range columns), blank elsewhere. Used by
// every table that has both a Base Case and a Range column.
const TableHeaderRow = ({ columns, superHeader }) => (
    <TableHead>
        {superHeader && (
            <TableRow sx={{ backgroundColor: COLORS.primary }}>
                {columns.map((col, index) => {
                    if (index === superHeader.startIndex) {
                        return (
                            <TableCell
                                key={`super-${index}`}
                                colSpan={superHeader.span}
                                sx={{ color: COLORS.white, fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', pb: 0.5 }}
                            >
                                {superHeader.label}
                            </TableCell>
                        );
                    }
                    if (index > superHeader.startIndex && index < superHeader.startIndex + superHeader.span) {
                        return null;
                    }
                    return <TableCell key={`super-blank-${index}`} sx={{ backgroundColor: COLORS.primary, borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }} />;
                })}
            </TableRow>
        )}
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
