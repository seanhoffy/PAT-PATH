import { FormControl, InputLabel, Select, MenuItem, Box, Grid, Link, Typography } from '@mui/material';
import {
    AWARENESS_INTEREST_CONTEXTS,
    GEOGRAPHIC_ACCESS_CONTEXTS,
    CONTEXT_HELPER_TEXT,
} from '../../constants/funnelDefaults';

// CC-3: the two context dropdowns that determine which reference row is
// highlighted (and which value "Use suggested defaults" applies) for
// Stages 4-5 (Awareness/Interest) and Stage 7 (Geographic Access).
const ContextSelectors = ({ contexts, onContextChange, onResetDefaults }) => (
    <Box sx={{ mb: 2 }}>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel id="awareness-interest-context-label">Awareness / Interest context</InputLabel>
                    <Select
                        labelId="awareness-interest-context-label"
                        label="Awareness / Interest context"
                        value={contexts.awarenessInterest}
                        onChange={(e) => onContextChange('awarenessInterest', e.target.value)}
                    >
                        {AWARENESS_INTEREST_CONTEXTS.map(({ key, label }) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel id="geographic-access-context-label">Geographic Access context</InputLabel>
                    <Select
                        labelId="geographic-access-context-label"
                        label="Geographic Access context"
                        value={contexts.geographicAccess}
                        onChange={(e) => onContextChange('geographicAccess', e.target.value)}
                    >
                        {GEOGRAPHIC_ACCESS_CONTEXTS.map(({ key, label }) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {CONTEXT_HELPER_TEXT}
        </Typography>
        <Link component="button" type="button" variant="body2" onClick={onResetDefaults} sx={{ mt: 1, display: 'inline-block' }}>
            Use suggested defaults for this context
        </Link>
    </Box>
);

export default ContextSelectors;
