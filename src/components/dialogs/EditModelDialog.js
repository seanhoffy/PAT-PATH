import React, { useState, useEffect } from 'react';
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
    Box,
} from '@mui/material';
import { NumericFormat } from 'react-number-format';
import { EXCLUSION_CRITERIA_FIELDS, DOUBLE_COUNTING_FIELDS } from '../../constants/formFields';
import { CALCULATION_CONSTANTS } from '../../constants/calculations';
import { COLORS } from '../../constants/colors';
import { isStringField } from '../../utils/formValidation';

const EditModelDialog = ({ open, onClose, model, onSave }) => {
    const [formData, setFormData] = useState({});
    const [actualPercents, setActualPercents] = useState({
        trialMDD: 100,
        realMDD: 100,
        trialTRD: 100,
        realTRD: 100,
    });

    // Initialize form data from model when dialog opens
    useEffect(() => {
        if (open && model) {
            setFormData(model.inputs || {});
            // Initialize actual percents from saved model or use defaults
            if (model.outputs?.actual?.percents) {
                setActualPercents({
                    trialMDD: model.outputs.actual.percents.trialMDD ?? 100,
                    realMDD: model.outputs.actual.percents.realMDD ?? 100,
                    trialTRD: model.outputs.actual.percents.trialTRD ?? 100,
                    realTRD: model.outputs.actual.percents.realTRD ?? 100,
                });
            } else {
                setActualPercents({
                    trialMDD: 100,
                    realMDD: 100,
                    trialTRD: 100,
                    realTRD: 100,
                });
            }
        }
    }, [open, model]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            let newValue;

            if (isStringField(name)) {
                newValue = value;
            } else {
                if (value === '' || value === null || value === undefined) {
                    newValue = null;
                } else {
                    newValue = parseFloat(value);
                }
            }

            const newData = { ...prev, [name]: newValue };

            // Auto-calculate TRD when MDD or TRD_P changes
            if (name === 'MDD' || name === 'TRD_P') {
                if (newData.MDD !== null && newData.TRD_P !== null) {
                    newData.TRD = newData.MDD * (newData.TRD_P / CALCULATION_CONSTANTS.PERCENTAGE_DIVISOR);
                } else {
                    newData.TRD = 0;
                }
            }

            return newData;
        });
    };

    const handleMDDChange = (values) => {
        const updatedMDD = values.value === '' ? null : parseFloat(values.value);
        setFormData((prev) => {
            const newData = { ...prev, MDD: updatedMDD };
            if (updatedMDD !== null && newData.TRD_P !== null) {
                newData.TRD = updatedMDD * (newData.TRD_P / CALCULATION_CONSTANTS.PERCENTAGE_DIVISOR);
            } else {
                newData.TRD = 0;
            }
            return newData;
        });
    };

    const handlePercentChange = (field) => (event) => {
        const { value } = event.target;
        if (value === '') {
            setActualPercents((prev) => ({ ...prev, [field]: '' }));
            return;
        }
        const numeric = Number(value);
        setActualPercents((prev) => ({
            ...prev,
            [field]: Number.isFinite(numeric) ? numeric : 0,
        }));
    };

    const handleSave = () => {
        onSave(formData, actualPercents);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', color: COLORS.primary, fontWeight: 'bold', pb: 1 }}>
                Edit Model
            </DialogTitle>
            <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* General Info */}
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem' }}>General Info</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Model Title"
                                    variant="outlined"
                                    name="modelTitle"
                                    value={formData.modelTitle || ''}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Geographic Area"
                                    variant="outlined"
                                    name="geographicArea"
                                    value={formData.geographicArea || ''}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Motivation"
                                    variant="outlined"
                                    name="motivation"
                                    value={formData.motivation || ''}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Additional Comments"
                                    variant="outlined"
                                    name="additionalComments"
                                    value={formData.additionalComments || ''}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Prevalence */}
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem' }}>Prevalence</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <NumericFormat
                                    customInput={TextField}
                                    fullWidth
                                    size="small"
                                    label="Patients with MDD"
                                    name="MDD"
                                    thousandSeparator=","
                                    value={formData.MDD ?? undefined}
                                    placeholder="Enter number"
                                    onValueChange={handleMDDChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Percentage With TRD"
                                    name="TRD_P"
                                    type="number"
                                    value={formData.TRD_P ?? ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter percentage"
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <NumericFormat
                                    customInput={TextField}
                                    fullWidth
                                    size="small"
                                    label="Patients with TRD (Calculated)"
                                    name="TRD"
                                    thousandSeparator=","
                                    value={formData.TRD}
                                    disabled
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Exclusion Criteria */}
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem' }}>Exclusion Criteria</Typography>
                        <Grid container spacing={2}>
                            {EXCLUSION_CRITERIA_FIELDS.map(([key, label]) => (
                                <Grid item xs={12} sm={6} md={4} key={key}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={label}
                                        name={key}
                                        type="number"
                                        placeholder="Enter percentage"
                                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                        value={formData[key] ?? ''}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    {/* Double Counting */}
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem' }}>Double Counting</Typography>
                        <Grid container spacing={2}>
                            {DOUBLE_COUNTING_FIELDS.map(([key, label]) => (
                                <Grid item xs={12} sm={4} key={key}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={label}
                                        name={key}
                                        type="number"
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                        }}
                                        value={formData[key] ?? ''}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    {/* Actual Demand Percentages */}
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem' }}>Actual Demand Percentages</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="MDD Trial %"
                                    type="number"
                                    value={actualPercents.trialMDD === '' ? '' : actualPercents.trialMDD}
                                    onChange={handlePercentChange('trialMDD')}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="MDD Real %"
                                    type="number"
                                    value={actualPercents.realMDD === '' ? '' : actualPercents.realMDD}
                                    onChange={handlePercentChange('realMDD')}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="TRD Trial %"
                                    type="number"
                                    value={actualPercents.trialTRD === '' ? '' : actualPercents.trialTRD}
                                    onChange={handlePercentChange('trialTRD')}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="TRD Real %"
                                    type="number"
                                    value={actualPercents.realTRD === '' ? '' : actualPercents.realTRD}
                                    onChange={handlePercentChange('realTRD')}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
                <Button
                    onClick={onClose}
                    color="primary"
                    variant="outlined"
                    sx={{
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        borderRadius: 2,
                        border: `2px solid ${COLORS.primary}`,
                        '&:hover': {
                            border: `2px solid ${COLORS.primaryHover}`,
                            backgroundColor: 'rgba(2, 62, 116, 0.05)',
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    sx={{
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        borderRadius: 2,
                        backgroundColor: COLORS.primary,
                        '&:hover': {
                            backgroundColor: COLORS.primaryHover
                        }
                    }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditModelDialog;

