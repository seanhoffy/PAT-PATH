import {
    Paper,
    Grid,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Box,
} from '@mui/material';
import FunnelSection from '../funnel/FunnelSection';
import { cellValuesFromResults } from '../../utils/funnelCalculations';

const ResultsDisplay = ({ results, formData, onDownload, onSave, onUpdate, saving, modelCreatedOn, onFunnelStateChange, initialFunnelState, editingModelId, funnelReady }) => {

    if (!results) return null;

    return (
        <Paper id="results-section" elevation={2} sx={{ mt: 4, p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                        Potential (Maximum) Demand for {formData.modelTitle}
                    </Typography>
                    {modelCreatedOn && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Model Created On: {modelCreatedOn}
                        </Typography>
                    )}
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Based on Trial Exclusion Criteria*
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Based on User Entered Exclusion Criteria
                    </Typography>
                </Grid>
            </Grid>

            {/* MDD Results */}
            <Grid container spacing={3} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={4}>
                    <Typography variant="h6" sx={{ mt: 0, mb: 1 }}>
                        MDD
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
                        TRD
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
                * Stricter application (more adults excluded) based on trial data.
            </Typography>
            <Box sx={{ borderBottom: '2px solid rgba(0, 0, 0, 0.4)', mb: 3 }} />

            <FunnelSection
                cellValues={cellValuesFromResults(results)}
                onFunnelStateChange={onFunnelStateChange}
                initialState={initialFunnelState}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                <Button
                    color="primary"
                    type="submit"
                    variant="contained"
                    size="large"
                    onClick={() => onDownload()}
                    disabled={!funnelReady}
                >
                    Download PDF
                </Button>
                {editingModelId ? (
                    <>
                        <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            onClick={() => onUpdate()}
                            disabled={saving || !funnelReady}
                        >
                            {saving ? 'Updating...' : 'Update Model'}
                        </Button>
                        <Button
                            color="primary"
                            variant="outlined"
                            size="large"
                            onClick={() => onSave()}
                            disabled={saving || !funnelReady}
                        >
                            {saving ? 'Saving...' : 'Save as New'}
                        </Button>
                    </>
                ) : (
                    <Button
                        color="primary"
                        variant="outlined"
                        size="large"
                        onClick={() => onSave()}
                        disabled={saving || !funnelReady}
                    >
                        {saving ? 'Saving...' : 'Save to History'}
                    </Button>
                )}
            </Stack>
            {!funnelReady && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Complete Awareness, Interest, Afford, and Geographic Accessibility above to save or download this model.
                </Typography>
            )}
        </Paper>
    );
};

export default ResultsDisplay;
