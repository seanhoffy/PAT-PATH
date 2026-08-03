import { Paper, Box, Typography, TextField, InputAdornment, Grid, Alert, Button, List, ListItem, Link } from '@mui/material';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import Callout from './Callout';
import {
    STAGE8_FACILITATORS_HELPER,
    STAGE8_THROUGHPUT_DEFAULT,
    STAGE8_THROUGHPUT_MIN,
    STAGE8_THROUGHPUT_MAX,
    STAGE8_MULTIPLIER_DEFAULT,
    STAGE8_MULTIPLIER_MIN,
    STAGE8_MULTIPLIER_MAX,
    STAGE8_MULTIPLIER_HELPER,
    STAGE8_SECTION_HELPER_TEXT,
    STAGE8_WARNING_COPY,
    STAGE8_THROUGHPUT_RATIONALE,
    STAGE8_WORKFORCE_PIPELINE_NOTES,
    STAGE8_SOURCES,
    PROBABILITY_TYPES,
} from '../../constants/funnelDefaults';

// Stage 8 — Provider Capacity ("Are there enough therapists?"). A parallel
// sanity check: its output is never multiplied into the funnel chain and is
// never one of the Stage 9 funnel-plot bars (rows A-G only).
const StageCapacity = ({ stage8, effectiveDemand, displayedEffectiveDemand, capacityN, capacityReady, exceedsCapacity, onFieldChange, onApplyCap, onRemoveCap }) => (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h5">Stage 8 — Provider Capacity</Typography>
            <ProbabilityTypeTag type={PROBABILITY_TYPES.CAPACITY} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            “Are there enough therapists?”
        </Typography>

        <Callout>{STAGE8_SECTION_HELPER_TEXT}</Callout>

        <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Licensed / trained facilitators in your target area"
                    type="number"
                    value={stage8.facilitators}
                    onChange={(e) => onFieldChange('facilitators', e.target.value === '' ? '' : Number(e.target.value))}
                    helperText={STAGE8_FACILITATORS_HELPER}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Annual throughput per facilitator"
                    type="number"
                    value={stage8.throughput}
                    onChange={(e) => onFieldChange('throughput', e.target.value === '' ? '' : Number(e.target.value))}
                    InputProps={{ inputProps: { min: STAGE8_THROUGHPUT_MIN, max: STAGE8_THROUGHPUT_MAX } }}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Group-session multiplier"
                    type="number"
                    value={stage8.multiplier}
                    onChange={(e) => onFieldChange('multiplier', e.target.value === '' ? '' : Number(e.target.value))}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">×</InputAdornment>,
                        inputProps: { min: STAGE8_MULTIPLIER_MIN, max: STAGE8_MULTIPLIER_MAX },
                    }}
                    helperText={STAGE8_MULTIPLIER_HELPER}
                />
            </Grid>
        </Grid>

        <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => {
                onFieldChange('throughput', STAGE8_THROUGHPUT_DEFAULT);
                onFieldChange('multiplier', STAGE8_MULTIPLIER_DEFAULT);
            }}
            sx={{ display: 'inline-block', mb: 2 }}
        >
            Use suggested throughput ({STAGE8_THROUGHPUT_DEFAULT}) &amp; multiplier ({STAGE8_MULTIPLIER_DEFAULT}×)
        </Link>

        {capacityReady ? (
            <>
                <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Stage 7 output (funnel-estimated demand)</Typography>
                        <Typography variant="h6">{Number(effectiveDemand || 0).toLocaleString()}/yr</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Estimated annual capacity</Typography>
                        <Typography variant="h6">{Number(capacityN || 0).toLocaleString()}/yr</Typography>
                    </Grid>
                </Grid>

                {exceedsCapacity && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {STAGE8_WARNING_COPY}
                    </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Effective demand (displayed)</Typography>
                    <Typography variant="h5" color={stage8.capacityCapApplied ? 'warning.main' : 'text.primary'}>
                        {Number(displayedEffectiveDemand || 0).toLocaleString()}/yr
                        {stage8.capacityCapApplied ? ' (capacity cap applied)' : ''}
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    {!stage8.capacityCapApplied ? (
                        <Button variant="outlined" onClick={onApplyCap} disabled={!exceedsCapacity}>
                            Apply capacity cap
                        </Button>
                    ) : (
                        <Button variant="outlined" onClick={onRemoveCap}>
                            Remove capacity cap
                        </Button>
                    )}
                </Box>
            </>
        ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
                Enter your facilitator, throughput, and multiplier assumptions above to see how this compares to funnel-estimated demand.
            </Alert>
        )}

        <Callout title="Throughput rationale">{STAGE8_THROUGHPUT_RATIONALE}</Callout>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
            Workforce pipeline notes
        </Typography>
        <List dense>
            {STAGE8_WORKFORCE_PIPELINE_NOTES.map((note) => (
                <ListItem key={note} sx={{ display: 'list-item', listStyleType: 'disc', ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">{note}</Typography>
                </ListItem>
            ))}
        </List>

        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
            Sources: {STAGE8_SOURCES.join(' ')}
        </Typography>
    </Paper>
);

export default StageCapacity;
