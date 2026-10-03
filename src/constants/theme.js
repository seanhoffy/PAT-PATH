import { createTheme } from '@mui/material';
import { COLORS } from './colors';

export const appTheme = createTheme({
    palette: {
        background: {
            default: COLORS.primary,
        },
        primary: {
            main: COLORS.primary,
        },
        text: {
            // MUI's default text.secondary (used by all the "subtitle" helper
            // text and, by inheritance, input labels) is a medium gray —
            // darkened here for readability.
            secondary: '#000000',
        },
    },
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                // Default outlined-input border is a light gray (rgba(0,0,0,0.23));
                // darkened so input boxes read clearly rather than faint.
                notchedOutline: {
                    borderColor: 'rgba(0, 0, 0, 0.6)',
                    // The border's "notch" gap width is sized from this invisible
                    // <legend>, which mirrors the label text but doesn't pick up
                    // the shrunk label's enlarged font-size below — bump it to
                    // match so the gap is wide enough and the bigger label text
                    // doesn't collide with the outline stroke.
                    '& legend': {
                        fontSize: '0.88em',
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#000000',
                    // Once a field has a value (or is focused), MUI "shrinks"
                    // the label up onto the border — bump it up in size/weight
                    // there so a filled-in field reads more clearly.
                    '&.MuiInputLabel-shrink': {
                        fontSize: '1.1rem',
                        fontWeight: 600,
                    },
                    // The red "*" MUI auto-appends for `required` fields is
                    // retired app-wide in favor of the light-blue empty-field
                    // tint (see COLORS.requiredEmpty) — `required` itself stays
                    // on each field for aria-required, just not shown visually.
                    '& .MuiFormLabel-asterisk': {
                        display: 'none',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                // Vertical gridlines between columns (MUI tables only draw
                // horizontal row dividers by default) — applies to every
                // table app-wide, header rows included, for a consistent
                // grid look. Last cell in a row skips it so rows don't end
                // in a stray line against the table's own outer edge.
                root: {
                    borderRight: '1px solid rgba(224, 224, 224, 0.5)',
                    '&:last-child': {
                        borderRight: 'none',
                    },
                },
            },
        },
        MuiTableBody: {
            styleOverrides: {
                // The table's own bottom edge (its last row's border) is the
                // same faint divider as every other row by default — darkened
                // here, app-wide, so each table reads as visually "closed"
                // rather than trailing off.
                root: {
                    '& tr:last-child > td': {
                        borderBottom: '2px solid rgba(0, 0, 0, 0.4)',
                    },
                },
            },
        },
    },
});

