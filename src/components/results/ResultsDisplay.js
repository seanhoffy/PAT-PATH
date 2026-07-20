import {
    Paper,
    Grid,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    TextField,
    InputAdornment,
    Box,
} from '@mui/material';
import FunnelSection from '../funnel/FunnelSection';

const ResultsDisplay = ({ results, formData, onDownload, onSave, onUpdate, saving, actualPercents, setActualPercents, modelCreatedOn, onFunnelStateChange, initialFunnelState, editingModelId }) => {

    if (!results) return null;

    const handlePercentChange = (field) => (event) => {
        const { value } = event.target;
        // Allow empty input; treat invalid as 0 in calculations
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

    const baseTrialMDD = Number(results.trial.MDD) || 0;
    const baseRealMDD = Number(results.real.MDD) || 0;
    const baseTrialTRD = Number(results.trial.TRD) || 0;
    const baseRealTRD = Number(results.real.TRD) || 0;

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

    return (
        <Paper id="results-section" elevation={2} sx={{ mt: 4, p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>
                        Results for {formData.modelTitle}
                    </Typography>
                    {modelCreatedOn && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Model Created On: {modelCreatedOn}
                        </Typography>
                    )}
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Potential Psilocybin Demand Based on Trial Exclusion Criteria*
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Potential Psilocybin Demand Based on {formData.geographicArea} (Real World) Exclusion Criteria
                    </Typography>
                </Grid>
            </Grid>

            {/* MDD Results */}
            <Grid container spacing={3} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" sx={{ mt: 0, mb: 1 }}>
                        Major Depressive Disorder (MDD)
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                {parseInt(results.trial.MDD).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                {parseInt(results.real.MDD).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* TRD Results */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" sx={{ mt: 0, mb: 1 }}>
                        Treatment-Resistant Depression (TRD)
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                {parseInt(results.trial.TRD).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                {parseInt(results.real.TRD).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                * Stricter application (more people excluded) based on trial data.
            </Typography>
            <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 3 }} />

            {/* Calculated demand adjustment */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
                    Estimate what share of eligible individuals will translate potential psilocybin
                    demand into calculated treatment uptake.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Adjust the percentages below to approximate the proportion of trial-eligible and
                    real-world–eligible patients who are expected to initiate psilocybin-assisted
                    therapy.
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="MDD – Trial %"
                            type="number"
                            value={actualPercents.trialMDD === '' ? '' : actualPercents.trialMDD}
                            onChange={handlePercentChange('trialMDD')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">%</InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="MDD – Real World %"
                            type="number"
                            value={actualPercents.realMDD === '' ? '' : actualPercents.realMDD}
                            onChange={handlePercentChange('realMDD')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">%</InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="TRD – Trial %"
                            type="number"
                            value={actualPercents.trialTRD === '' ? '' : actualPercents.trialTRD}
                            onChange={handlePercentChange('trialTRD')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">%</InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="TRD – Real World %"
                            type="number"
                            value={actualPercents.realTRD === '' ? '' : actualPercents.realTRD}
                            onChange={handlePercentChange('realTRD')}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">%</InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Calculated outputs column headers */}
                <Grid container spacing={3} sx={{ mb: 1.5 }}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                            
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                        Calculated Psilocybin Demand Based on Trial Exclusion Criteria
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                        Calculated Psilocybin Demand Based on {formData.geographicArea} (Real World) Exclusion Criteria
                        </Typography>
                    </Grid>
                </Grid>

                {/* Actual outputs */}
                <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" sx={{ mt: 0, mb: 1 }}>
                            Major Depressive Disorder (MDD)
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {actualTrialMDD.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {actualRealMDD.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" sx={{ mt: 0, mb: 1 }}>
                            Treatment-Resistant Depression (TRD)
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {actualTrialTRD.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {actualRealTRD.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <FunnelSection
                cellValues={{
                    trialMDD: actualTrialMDD,
                    realMDD: actualRealMDD,
                    trialTRD: actualTrialTRD,
                    realTRD: actualRealTRD,
                }}
                onFunnelStateChange={onFunnelStateChange}
                initialState={initialFunnelState}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    size="large"
                    onClick={() => onDownload(actualSummary)}
                >
                    Download PDF
                </Button>
                {editingModelId ? (
                    <>
                        <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            onClick={() => onUpdate(actualSummary)}
                            disabled={saving}
                        >
                            {saving ? 'Updating...' : 'Update Model'}
                        </Button>
                        <Button
                            color="primary"
                            variant="outlined"
                            size="large"
                            onClick={() => onSave(actualSummary)}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save as New'}
                        </Button>
                    </>
                ) : (
                    <Button
                        color="primary"
                        variant="outlined"
                        size="large"
                        onClick={() => onSave(actualSummary)}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save to History'}
                    </Button>
                )}
            </Stack>
        </Paper>
    );
};

export default ResultsDisplay;

