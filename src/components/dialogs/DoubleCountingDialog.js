import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Paper,
    Grid,
    TextField,
    InputAdornment,
} from '@mui/material';
import { DOUBLE_COUNTING_FIELDS } from '../../constants/formFields';

const DoubleCountingDialog = ({ open, onClose, formData, onInputChange }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>Adjust Exclusion Criteria for Double Counting</DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    These inputs allow you flexibility to adjust for double counting if needed as some exclusion criteria overlap. The default values come from the same study in the "about" section and should only be changed if you have access to better or more recent data on overlapping disorders and you are an expert in this field.
                </Typography>
                <Typography variant="body2">
                    Psychological Problems: Percentage of MDD subjects with a mental disorder and/or a suicide attempt in the past year.
                </Typography>
                <Typography variant="body2">
                    Health Conditions: Percentage of MDD subjects with diabetes, stroke, heart attack in the last year, and/or high blood pressure (140+/90+ and treatment-resistant).
                </Typography>
                <Typography variant="body2" sx={{ mb: 4 }}>
                    Lower Hepatic Impairment: Percentage of MDD subjects with this condition.
                </Typography>
                <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
                    <Grid container spacing={3}>
                        {DOUBLE_COUNTING_FIELDS.map(([key, label]) => (
                            <Grid item xs={12} sm={6} md={4} key={key}>
                                <TextField
                                    fullWidth
                                    label={label}
                                    name={key}
                                    type="number"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                    value={formData[key]}
                                    onChange={onInputChange}
                                    variant="outlined"
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DoubleCountingDialog;

