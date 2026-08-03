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
                },
            },
        },
    },
});

