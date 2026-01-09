import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
    Container,
    Typography,
    Paper,
    Box,
    Grid,
    Divider,
    Button,
    Stack,
} from '@mui/material';
import NavBar from '../components/NavBar';
import ThemeProvider from '../components/common/ThemeProvider';
import EditModelDialog from '../components/dialogs/EditModelDialog';
import MyDocument from '../components/pdf/pdf.js';
import { pdf } from '@react-pdf/renderer';
import { auth } from '../firebase';
import { fetchSavedModels, deleteSavedModel, fetchUserProfile, updateSavedModel } from '../utils/firebaseHelpers';
import { calculateAllResults } from '../utils/calculations';
import { CALCULATION_CONSTANTS } from '../constants/calculations';
import { COLORS } from '../constants/colors';
import { EXCLUSION_CRITERIA_FIELDS, DOUBLE_COUNTING_FIELDS } from '../constants/formFields';

const HistoryPage = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    const [savedModels, setSavedModels] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loadingModels, setLoadingModels] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingModel, setEditingModel] = useState(null);

    const loadData = useCallback(async () => {
        if (!user?.uid) return;
        setLoadingModels(true);
        const [models, userProfile] = await Promise.all([
            fetchSavedModels(user.uid),
            fetchUserProfile(user.uid),
        ]);
        setSavedModels(models || []);
        setProfile(userProfile);
        setLoadingModels(false);
    }, [user]);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate('/');
            return;
        }
        loadData();
    }, [user, loading, navigate, loadData]);

    const handleDelete = async (id) => {
        if (!user?.uid) return;
        const res = await deleteSavedModel(user.uid, id);
        if (!res.success) {
            alert(res.message || 'Failed to delete model.');
            return;
        }
        setSavedModels((prev) => prev.filter((m) => m.id !== id));
    };

    const handleEdit = (model) => {
        setEditingModel(model);
        setEditDialogOpen(true);
    };

    const handleDownloadPDF = async (model) => {
        try {
            // Extract data from saved model
            const formData = model.inputs || {};
            const results = {
                trial: model.outputs?.trial || {},
                real: model.outputs?.real || {},
                comorbid: model.outputs?.comorbid || {},
            };
            const actual = model.outputs?.actual || null;
            const modelCreatedOn = model.modelCreatedOn || model.calculatedAt || null;
            const calculatedAt = model.calculatedAt || null; // For backward compatibility

            // Generate PDF
            const blob = await pdf(<MyDocument formData={formData} results={results} actual={actual} modelCreatedOn={modelCreatedOn} calculatedAt={calculatedAt} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Create filename from model title and area, replace spaces with underscores
            const title = formData.modelTitle || 'Untitled_model';
            const area = formData.geographicArea || 'Unknown_area';
            const filename = `${title.replace(/\s+/g, '_')}.${area.replace(/\s+/g, '_')}.pdf`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF.');
        }
    };

    const handleSaveEdit = async (formData, actualPercents) => {
        if (!user?.uid || !editingModel) return;

        try {
            // Merge formData with original model inputs: if a field is blank/null, preserve original value
            const originalInputs = editingModel.inputs || {};
            const mergedFormData = { ...originalInputs };
            
            // Only update fields that have non-blank values
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                // For string fields, update if not empty string
                if (typeof value === 'string' && value.trim() !== '') {
                    mergedFormData[key] = value;
                }
                // For numeric fields, update if not null/undefined/empty string
                else if (value !== null && value !== undefined && value !== '') {
                    mergedFormData[key] = value;
                }
                // Otherwise, keep original value (already in mergedFormData from spread)
            });

            // Recalculate TRD if MDD or TRD_P changed
            if (mergedFormData.MDD !== null && mergedFormData.TRD_P !== null) {
                mergedFormData.TRD = mergedFormData.MDD * (mergedFormData.TRD_P / CALCULATION_CONSTANTS.PERCENTAGE_DIVISOR);
            } else {
                mergedFormData.TRD = 0;
            }

            // Recalculate results with merged form data
            const newResults = calculateAllResults(mergedFormData);

            // Calculate actual demand values
            const baseTrialMDD = Number(newResults.trial.MDD) || 0;
            const baseRealMDD = Number(newResults.real.MDD) || 0;
            const baseTrialTRD = Number(newResults.trial.TRD) || 0;
            const baseRealTRD = Number(newResults.real.TRD) || 0;

            const actualTrialMDD = Math.round(
                baseTrialMDD * ((Number(actualPercents.trialMDD) || 0) / 100)
            );
            const actualRealMDD = Math.round(
                baseRealMDD * ((Number(actualPercents.realMDD) || 0) / 100)
            );
            const actualTrialTRD = Math.round(
                baseTrialTRD * ((Number(actualPercents.trialTRD) || 0) / 100)
            );
            const actualRealTRD = Math.round(
                baseRealTRD * ((Number(actualPercents.realTRD) || 0) / 100)
            );

            const actualSummary = {
                percents: actualPercents,
                MDD: {
                    trial: actualTrialMDD,
                    real: actualRealMDD,
                },
                TRD: {
                    trial: actualTrialTRD,
                    real: actualRealTRD,
                },
            };

            // Construct updated model payload
            const updatedModel = {
                title: mergedFormData.modelTitle || 'Untitled model',
                geographicArea: mergedFormData.geographicArea || '',
                motivation: mergedFormData.motivation || '',
                inputs: mergedFormData,
                outputs: {
                    ...newResults,
                    actual: actualSummary,
                },
                modelCreatedOn: editingModel.modelCreatedOn || editingModel.calculatedAt || null, // Preserve original calculation datetime
            };

            // Update the model in Firestore
            const res = await updateSavedModel(user.uid, editingModel.id, updatedModel);
            if (!res.success) {
                alert(res.message || 'Failed to update model.');
                return;
            }

            // Reload saved models
            await loadData();
            setEditDialogOpen(false);
            setEditingModel(null);
            alert('Model updated successfully.');
        } catch (error) {
            console.error('Error updating model:', error);
            alert('Failed to update model.');
        }
    };

    // Helper function to get full label for a field key
    const getFieldLabel = (fieldKey) => {
        // Check exclusion criteria fields
        const exclusionField = EXCLUSION_CRITERIA_FIELDS.find(([key]) => key === fieldKey);
        if (exclusionField) return exclusionField[1];

        // Check double counting fields
        const doubleCountingField = DOUBLE_COUNTING_FIELDS.find(([key]) => key === fieldKey);
        if (doubleCountingField) return doubleCountingField[1];

        // Handle other fields
        const labelMap = {
            modelTitle: 'Model Title',
            geographicArea: 'Geographic Area',
            MDD: 'Patients with MDD',
            TRD_P: 'Percentage With TRD',
            TRD: 'Patients with TRD',
        };

        return labelMap[fieldKey] || fieldKey;
    };

    const renderModelCard = (model) => {
        return (
            <Paper
                key={model.id}
                elevation={1}
                sx={{
                    p: { xs: 2, sm: 3 },
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: '1px solid #e0e0e0',
                }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                    <Box>
                        <Typography variant="h6" sx={{ mb: 0.25 }}>{model.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Geographic Area: {model.geographicArea || 'No area specified'}
                        </Typography>
                        {(model.modelCreatedOn || model.calculatedAt) && (
                            <Typography variant="body2" color="text.secondary">
                                Model Created On: {model.modelCreatedOn || model.calculatedAt}
                            </Typography>
                        )}
                        {model.motivation && (
                            <Typography variant="body2" color="text.secondary">
                                Scenario: {model.motivation}
                            </Typography>
                        )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button 
                            variant="outlined" 
                            onClick={() => handleEdit(model)}
                            sx={{
                                borderColor: COLORS.primary,
                                color: COLORS.primary,
                                '&:hover': {
                                    borderColor: COLORS.primaryHover,
                                    backgroundColor: 'rgba(2, 62, 116, 0.05)',
                                }
                            }}
                        >
                            Edit
                        </Button>
                        <Button 
                            variant="contained"
                            onClick={() => handleDownloadPDF(model)}
                            sx={{
                                backgroundColor: COLORS.primary,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: COLORS.primaryHover,
                                }
                            }}
                        >
                            Download PDF
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => handleDelete(model.id)}>
                            Delete
                        </Button>
                    </Stack>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Inputs</Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Population Information</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('modelTitle')}: {model.inputs?.modelTitle || '—'}</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('geographicArea')}: {model.inputs?.geographicArea || '—'}</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('MDD')}: {model.inputs?.MDD ? parseInt(model.inputs.MDD).toLocaleString() : '—'}</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('TRD_P')}: {model.inputs?.TRD_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('TRD')}: {model.inputs?.TRD ? parseInt(model.inputs.TRD).toLocaleString() : '—'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Characteristics of MDD Population</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('manic_P')}: {model.inputs?.manic_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('suicide_P')}: {model.inputs?.suicide_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('diabetes_P')}: {model.inputs?.diabetes_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('stroke_P')}: {model.inputs?.stroke_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('heart_attack_P')}: {model.inputs?.heart_attack_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('blood_pressure_P')}: {model.inputs?.blood_pressure_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('epilepsy_P')}: {model.inputs?.epilepsy_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('personality_P')}: {model.inputs?.personality_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('hepatic_P')}: {model.inputs?.hepatic_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('psycological_P')}: {model.inputs?.psycological_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('health_P')}: {model.inputs?.health_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">{getFieldLabel('comorbid_hepatic_P')}: {model.inputs?.comorbid_hepatic_P ?? '—'}%</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Outputs</Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="bold">Trial (MDD / TRD)</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {model.outputs?.trial?.MDD ? parseInt(model.outputs.trial.MDD).toLocaleString() : '—'} / {model.outputs?.trial?.TRD ? parseInt(model.outputs.trial.TRD).toLocaleString() : '—'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="bold">Real World (MDD / TRD)</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {model.outputs?.real?.MDD ? parseInt(model.outputs.real.MDD).toLocaleString() : '—'} / {model.outputs?.real?.TRD ? parseInt(model.outputs.real.TRD).toLocaleString() : '—'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="bold">Comorbid (MDD / TRD)</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {model.outputs?.comorbid?.MDD ? parseInt(model.outputs.comorbid.MDD).toLocaleString() : '—'} / {model.outputs?.comorbid?.TRD ? parseInt(model.outputs.comorbid.TRD).toLocaleString() : '—'}
                                </Typography>
                            </Grid>

                            {/* Actual demand percentages */}
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="bold">Calculated Demand Inputs (Percent)</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    MDD Trial: {model.outputs?.actual?.percents?.trialMDD ?? '—'}% &nbsp;|&nbsp; MDD Real: {model.outputs?.actual?.percents?.realMDD ?? '—'}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    TRD Trial: {model.outputs?.actual?.percents?.trialTRD ?? '—'}% &nbsp;|&nbsp; TRD Real: {model.outputs?.actual?.percents?.realTRD ?? '—'}%
                                </Typography>
                            </Grid>

                            {/* Actual demand outputs */}
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="bold">Calculated Demand (MDD)</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Trial: {model.outputs?.actual?.MDD?.trial != null ? parseInt(model.outputs.actual.MDD.trial).toLocaleString() : '—'} &nbsp;/&nbsp; Real: {model.outputs?.actual?.MDD?.real != null ? parseInt(model.outputs.actual.MDD.real).toLocaleString() : '—'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="bold">Calculated Demand (TRD)</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Trial: {model.outputs?.actual?.TRD?.trial != null ? parseInt(model.outputs.actual.TRD.trial).toLocaleString() : '—'} &nbsp;/&nbsp; Real: {model.outputs?.actual?.TRD?.real != null ? parseInt(model.outputs.actual.TRD.real).toLocaleString() : '—'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    return (
        <ThemeProvider>
            <div className="App">
                <NavBar />
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                            Your Account
                        </Typography>
                        <Typography variant="body1">
                            Name: {profile?.name || '—'}
                        </Typography>
                        <Typography variant="body1">
                            Email: {user?.email || '—'}
                        </Typography>
                        <Typography variant="body1">
                            User Type: {profile?.user_type || '—'}
                        </Typography>
                    </Paper>

                    <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#fff8e1', border: '1px solid #f0d17a' }}>
                        <Typography variant="body1" fontWeight="bold">
                            Store up to 10 user-defined models. CEP does not access these reports; they are restricted to your user ID.
                        </Typography>
                    </Paper>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffffff' }}>Saved Models</Typography>
                        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                            {savedModels.length}/10 used
                        </Typography>
                    </Stack>

                    {loadingModels ? (
                        <Typography sx={{ color: '#ffffff' }}>Loading your saved models...</Typography>
                    ) : savedModels.length === 0 ? (
                        <Typography sx={{ color: '#ffffff' }}>No saved models yet. Run a model and use “Save to History”.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            {savedModels.map(renderModelCard)}
                        </Stack>
                    )}
                </Container>
                <EditModelDialog
                    open={editDialogOpen}
                    onClose={() => {
                        setEditDialogOpen(false);
                        setEditingModel(null);
                    }}
                    model={editingModel}
                    onSave={handleSaveEdit}
                />
            </div>
        </ThemeProvider>
    );
};

export default HistoryPage;

