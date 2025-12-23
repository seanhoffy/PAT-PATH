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
import { auth } from '../firebase';
import { fetchSavedModels, deleteSavedModel, fetchUserProfile } from '../utils/firebaseHelpers';

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

    const renderModelCard = (model) => {
        const created = model.createdAt ? new Date(model.createdAt).toLocaleString() : '';
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
                            {model.geographicArea || 'No area specified'} — {created}
                        </Typography>
                        {model.motivation && (
                            <Typography variant="body2" color="text.secondary">
                                Motivation: {model.motivation}
                            </Typography>
                        )}
                    </Box>
                    <Button variant="outlined" color="error" onClick={() => handleDelete(model.id)}>
                        Delete
                    </Button>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Inputs</Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Title: {model.inputs?.modelTitle || '—'}</Typography>
                                <Typography variant="body2" color="text.secondary">Area: {model.inputs?.geographicArea || '—'}</Typography>
                                <Typography variant="body2" color="text.secondary">MDD: {model.inputs?.MDD ? parseInt(model.inputs.MDD).toLocaleString() : '—'}</Typography>
                                <Typography variant="body2" color="text.secondary">TRD %: {model.inputs?.TRD_P ?? '—'}</Typography>
                                <Typography variant="body2" color="text.secondary">TRD: {model.inputs?.TRD ? parseInt(model.inputs.TRD).toLocaleString() : '—'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Manic/Psychotic: {model.inputs?.manic_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Suicide: {model.inputs?.suicide_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Diabetes: {model.inputs?.diabetes_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Stroke: {model.inputs?.stroke_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Heart Attack: {model.inputs?.heart_attack_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Blood Pressure: {model.inputs?.blood_pressure_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Epilepsy: {model.inputs?.epilepsy_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Personality: {model.inputs?.personality_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Hepatic: {model.inputs?.hepatic_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Psychological (Double Count): {model.inputs?.psycological_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Health (Double Count): {model.inputs?.health_P ?? '—'}%</Typography>
                                <Typography variant="body2" color="text.secondary">Comorbid Hepatic: {model.inputs?.comorbid_hepatic_P ?? '—'}%</Typography>
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
                                <Typography variant="body2" fontWeight="bold">Actual Demand Inputs (Percent)</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    MDD Trial: {model.outputs?.actual?.percents?.trialMDD ?? '—'}% &nbsp;|&nbsp; MDD Real: {model.outputs?.actual?.percents?.realMDD ?? '—'}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    TRD Trial: {model.outputs?.actual?.percents?.trialTRD ?? '—'}% &nbsp;|&nbsp; TRD Real: {model.outputs?.actual?.percents?.realTRD ?? '—'}%
                                </Typography>
                            </Grid>

                            {/* Actual demand outputs */}
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="bold">Actual Demand (MDD)</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Trial: {model.outputs?.actual?.MDD?.trial != null ? parseInt(model.outputs.actual.MDD.trial).toLocaleString() : '—'} &nbsp;/&nbsp; Real: {model.outputs?.actual?.MDD?.real != null ? parseInt(model.outputs.actual.MDD.real).toLocaleString() : '—'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" fontWeight="bold">Actual Demand (TRD)</Typography>
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
            </div>
        </ThemeProvider>
    );
};

export default HistoryPage;

