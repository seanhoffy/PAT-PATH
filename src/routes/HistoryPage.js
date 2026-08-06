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
import MyDocument from '../components/pdf/pdf.js';
import { pdf } from '@react-pdf/renderer';
import { auth } from '../firebase';
import { fetchSavedModels, deleteSavedModel, fetchUserProfile } from '../utils/firebaseHelpers';
import { COLORS } from '../constants/colors';
import { EXCLUSION_CRITERIA_FIELDS, DOUBLE_COUNTING_FIELDS } from '../constants/formFields';
import { deriveFunnelDisplay, cellValuesFromResults, stage6TierLabel } from '../utils/funnelCalculations';
import FunnelRowsTable from '../components/funnel/FunnelRowsTable';
import {
    AWARENESS_INTEREST_CONTEXTS,
    GEOGRAPHIC_ACCESS_CONTEXTS,
    FUNNEL_INPUT_CELLS,
} from '../constants/funnelDefaults';

const labelFromList = (list, key) => list.find((item) => item.key === key)?.label || key;

const HistoryPage = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    const [savedModels, setSavedModels] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loadingModels, setLoadingModels] = useState(true);

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
        navigate('/home', { state: { editModel: model } });
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
            const modelCreatedOn = model.modelCreatedOn || model.calculatedAt || null;
            const calculatedAt = model.calculatedAt || null; // For backward compatibility

            // Generate PDF
            const blob = await pdf(<MyDocument formData={formData} results={results} modelCreatedOn={modelCreatedOn} calculatedAt={calculatedAt} funnelState={model.funnel || null} />).toBlob();
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
            modelTitle: 'Organization',
            geographicArea: 'Geographic Area',
            MDD: 'Patients with MDD',
            TRD_P: 'Percentage With TRD',
            TRD: 'Patients with TRD',
        };

        return labelMap[fieldKey] || fieldKey;
    };

    const renderModelCard = (model) => {
        const funnelDisplay = model.funnel
            ? deriveFunnelDisplay(model.funnel, cellValuesFromResults(model.outputs))
            : null;

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
                        {model.funnel && (
                            <>
                                <Typography variant="body2" color="text.secondary">
                                    Population context: {model.funnel.contexts?.awarenessInterest} / {model.funnel.contexts?.geographicAccess}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    Effective Demand: {model.funnel.effectiveDemand != null ? `${Number(model.funnel.effectiveDemand).toLocaleString()}/yr` : '—'}
                                </Typography>
                            </>
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
                        </Grid>
                    </Grid>
                </Grid>

                {funnelDisplay && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Demand Funnel</Typography>
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Awareness / Interest context: {labelFromList(AWARENESS_INTEREST_CONTEXTS, model.funnel.contexts?.awarenessInterest)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Geographic Accessibility context: {labelFromList(GEOGRAPHIC_ACCESS_CONTEXTS, model.funnel.contexts?.geographicAccess)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Funnel input population: {labelFromList(FUNNEL_INPUT_CELLS, model.funnel.funnelInputSelection)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Afford selected tier: {stage6TierLabel(model.funnel.stage6)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Facilitators / throughput / multiplier: {model.funnel.stage8?.facilitators} / {model.funnel.stage8?.throughput} / {model.funnel.stage8?.multiplier}x
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Estimated annual capacity: {Number(funnelDisplay.capacityN).toLocaleString()}/yr
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    Effective Demand: {Number(funnelDisplay.displayedEffectiveDemand).toLocaleString()}/yr
                                    {model.funnel.stage8?.capacityCapApplied ? ' (capacity cap applied)' : ''}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="text.secondary">Scenario Explorer — effective demand</Typography>
                                <Typography variant="body2" color="text.secondary">Conservative: {Number(funnelDisplay.scenario.conservative.effectiveDemand).toLocaleString()}/yr</Typography>
                                <Typography variant="body2" color="text.secondary">Moderate: {Number(funnelDisplay.scenario.moderate.effectiveDemand).toLocaleString()}/yr</Typography>
                                <Typography variant="body2" color="text.secondary">Optimistic: {Number(funnelDisplay.scenario.optimistic.effectiveDemand).toLocaleString()}/yr</Typography>
                            </Grid>
                        </Grid>
                        <FunnelRowsTable rows={funnelDisplay.funnelRows} />
                    </>
                )}
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
            </div>
        </ThemeProvider>
    );
};

export default HistoryPage;

