import { Paper, Typography } from '@mui/material';
import { COLORS } from '../../constants/colors';

// Shared bordered-box treatment for static caveats/footnotes/rationale/preamble
// text throughout the funnel section. Deliberately reuses the app's existing
// color palette rather than introducing a new one.
const Callout = ({ title, children, sx }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            my: 2,
            backgroundColor: '#f7f9fc',
            borderLeft: `4px solid ${COLORS.primary}`,
            borderRadius: 1,
            ...sx,
        }}
    >
        {title && (
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                {title}
            </Typography>
        )}
        <Typography variant="body2" color="text.secondary" component="div">
            {children}
        </Typography>
    </Paper>
);

export default Callout;
