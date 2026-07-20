import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { FUNNEL_INPUT_CELLS } from '../../constants/funnelDefaults';

// CC-1: selector over the four existing Stage 3 "Calculated Psilocybin Demand"
// cells. Displays the selected cell's count as the new funnel's starting N.
const FunnelInputSelector = ({ cellValues, selection, onChange }) => {
    const selectedValue = cellValues?.[selection] ?? 0;

    return (
        <Box sx={{ mb: 2 }}>
            <FormControl sx={{ minWidth: 260 }}>
                <InputLabel id="funnel-input-selector-label">Funnel input population</InputLabel>
                <Select
                    labelId="funnel-input-selector-label"
                    label="Funnel input population"
                    value={selection}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {FUNNEL_INPUT_CELLS.map(({ key, label }) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Funnel starting N: <strong>{Number(selectedValue).toLocaleString()}</strong>
            </Typography>
        </Box>
    );
};

export default FunnelInputSelector;
