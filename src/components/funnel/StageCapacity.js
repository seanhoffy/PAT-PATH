import { useState } from 'react';
import { Paper, Box, Typography, TextField, Grid, Alert, Button, List, ListItem, Link, Collapse, Divider } from '@mui/material';
import ProbabilityTypeTag from './ProbabilityTypeTag';
import Callout from './Callout';
import SourcesList from './SourcesList';
import { computeStage8Capacity } from '../../utils/funnelCalculations';
import {
    STAGE8_SECTION_A_HEADING,
    STAGE8_FACILITATORS_LABEL,
    STAGE8_FACILITATORS_HELPER,
    STAGE8_FACILITATORS_FTE_NOTE,
    STAGE8_CONVERSION_FACTOR_LABEL,
    STAGE8_CONVERSION_FACTOR_MIN,
    STAGE8_CONVERSION_FACTOR_MAX,
    STAGE8_CONVERSION_FACTOR_STEP,
    STAGE8_CONVERSION_FACTOR_HELPER,
    STAGE8_CONVERSION_FACTOR_WARNING,
    STAGE8_CONVERSION_FACTOR_ILLUSTRATIVE_RANGE,
    STAGE8_FTE_READOUT_LABEL,
    STAGE8_SECTION_B_HEADING,
    STAGE8_PCT_INDIVIDUAL_LABEL,
    STAGE8_PCT_INDIVIDUAL_PLACEHOLDER,
    STAGE8_PCT_INDIVIDUAL_HELPER,
    STAGE8_HOURS_INDIVIDUAL_LABEL,
    STAGE8_HOURS_INDIVIDUAL_SOURCE_NOTE,
    STAGE8_HOURS_GROUP_LABEL,
    STAGE8_HOURS_GROUP_SOURCE_NOTE,
    STAGE8_ADVANCED_DISCLOSURE_LABEL,
    STAGE8_ANNUAL_HOURS_LABEL,
    STAGE8_ANNUAL_HOURS_SOURCE_NOTE,
    STAGE8_SECTION_C_HEADING,
    STAGE8_SITE_CHECK_DISCLOSURE_LABEL,
    STAGE8_SITES_LABEL,
    STAGE8_SITES_HELPER,
    STAGE8_CLIENTS_PER_SITE_LABEL,
    STAGE8_CLIENTS_PER_SITE_HELPER,
    STAGE8_CLIENTS_PER_SITE_SOURCE_NOTE,
    STAGE8_SITE_INTERACTION_THRESHOLD,
    STAGE8_SITE_INTERACTION_WARNING,
    STAGE8_COMPUTED_CAPACITY_HEADING,
    STAGE8_METRIC_BLENDED_HOURS_LABEL,
    STAGE8_METRIC_CLIENTS_PER_FTE_LABEL,
    STAGE8_METRIC_WORKFORCE_LABEL,
    STAGE8_METRIC_SITE_CHECK_LABEL,
    STAGE8_BLANK_STATE_PROMPT,
    STAGE8_BENCHMARK_NOTE,
    STAGE8_CAPACITY_STATEMENT_NO_SITE,
    STAGE8_CAPACITY_STATEMENT_WITH_SITE_PREFIX,
    STAGE8_SECTION_HELPER_TEXT,
    STAGE8_WARNING_COPY,
    STAGE8_THROUGHPUT_RATIONALE,
    STAGE8_WORKFORCE_PIPELINE_NOTES,
    STAGE8_SOURCES,
    PROBABILITY_TYPES,
} from '../../constants/funnelDefaults';

const isBlank = (v) => v === '' || v === null || v === undefined || Number.isNaN(Number(v));

const LABEL_SX = { mb: 1, fontWeight: 500, minHeight: '3.4rem', display: 'flex', alignItems: 'flex-end' };

// Underlines one word within a label constant without duplicating its text.
const underlineWord = (text, word) => {
    const idx = text.indexOf(word);
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <Box component="span" sx={{ textDecoration: 'underline' }}>{word}</Box>
            {text.slice(idx + word.length)}
        </>
    );
};

// Shared read-only metric-card treatment for the "Computed capacity" summary.
const MetricCard = ({ label, value, sm, highlight }) => (
    <Grid item xs={12} sm={sm}>
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: highlight ? 'warning.light' : 'grey.100',
                border: highlight ? '1px solid' : 'none',
                borderColor: highlight ? 'warning.main' : 'transparent',
            }}
        >
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h6" fontWeight="bold" color={highlight ? 'warning.dark' : 'text.primary'}>{value}</Typography>
        </Paper>
    </Grid>
);

// Stage 8 — Provider Capacity ("Are there enough therapists?"). A parallel
// sanity check: its output is never multiplied into the funnel chain and is
// never one of the Stage 9 funnel-plot bars (rows A-G only).
//
// FTE-based revision: capacity is derived from headcount × conversion factor
// (FTE), blended individual/group facilitator-hours-per-client (Marseille et
// al. 2023), and an optional site-capacity check — not from an observed
// market-throughput default, which would double-count the demand suppression
// already modeled in Stages 4-7.
const StageCapacity = ({ stage8, effectiveDemand, displayedEffectiveDemand, capacityN, capacityReady, exceedsCapacity, onFieldChange, onApplyCap, onRemoveCap }) => {
    const [openDisclosures, setOpenDisclosures] = useState({
        advanced: false,
        siteCheck: false,
        pipelineNotes: false,
    });
    const toggleDisclosure = (key) => setOpenDisclosures((prev) => ({ ...prev, [key]: !prev[key] }));

    const detail = computeStage8Capacity(stage8);
    const pctIndividual = stage8.pctIndividual;
    const pctIndividualNum = Number(pctIndividual);
    // pctIndividual === '' would otherwise coerce to 0 via Number() — guard
    // so Fields 4/5 aren't grayed out before the user has entered anything.
    const pctEntered = !isBlank(pctIndividual);

    let bindComparison = '';
    if (detail.sitesFilled && detail.providerReady) {
        if (detail.siteCapacity < detail.providerCapacity) bindComparison = 'below';
        else if (detail.siteCapacity > detail.providerCapacity) bindComparison = 'above';
        else bindComparison = 'at';
    }

    const showInteractionWarning = detail.sitesFilled && detail.providerReady && detail.providerCapacity > 0
        && detail.siteCapacity < detail.providerCapacity * (1 - STAGE8_SITE_INTERACTION_THRESHOLD);

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h5">Provider Capacity</Typography>
                <ProbabilityTypeTag type={PROBABILITY_TYPES.CAPACITY} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                “Are there enough therapists?”
            </Typography>

            <Callout>{STAGE8_SECTION_HELPER_TEXT}</Callout>

            {/* Section A — Facilitator supply */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1, mb: 1 }}>
                {STAGE8_SECTION_A_HEADING}
            </Typography>
            <Grid container spacing={3} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={LABEL_SX}>{STAGE8_FACILITATORS_LABEL}</Typography>
                    <TextField
                        fullWidth
                        type="number"
                        value={stage8.facilitators}
                        onChange={(e) => onFieldChange('facilitators', e.target.value === '' ? '' : Number(e.target.value))}
                        inputProps={{ min: 0, step: 1, 'aria-label': STAGE8_FACILITATORS_LABEL }}
                        helperText={
                            <>
                                {STAGE8_FACILITATORS_HELPER}{' '}
                                <Box component="span" sx={{ fontWeight: 700 }}>{STAGE8_FACILITATORS_FTE_NOTE}</Box>
                            </>
                        }
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={LABEL_SX}>{STAGE8_CONVERSION_FACTOR_LABEL}</Typography>
                    <TextField
                        fullWidth
                        type="number"
                        value={stage8.conversionFactor}
                        onChange={(e) => onFieldChange('conversionFactor', e.target.value === '' ? '' : Number(e.target.value))}
                        inputProps={{
                            min: STAGE8_CONVERSION_FACTOR_MIN,
                            max: STAGE8_CONVERSION_FACTOR_MAX,
                            step: STAGE8_CONVERSION_FACTOR_STEP,
                            'aria-label': STAGE8_CONVERSION_FACTOR_LABEL,
                        }}
                        helperText={
                            <>
                                {STAGE8_CONVERSION_FACTOR_HELPER}{' '}
                                <Box component="span" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                    {STAGE8_CONVERSION_FACTOR_WARNING}
                                </Box>{' '}
                                {STAGE8_CONVERSION_FACTOR_ILLUSTRATIVE_RANGE}
                            </>
                        }
                    />
                </Grid>
            </Grid>

            <Box sx={{ backgroundColor: 'grey.100', borderRadius: 1, p: 1.5, mb: 3 }}>
                <Typography variant="body2">
                    {isBlank(stage8.facilitators)
                        ? `${STAGE8_FTE_READOUT_LABEL}: —`
                        : `${STAGE8_FTE_READOUT_LABEL}: ${detail.fte.toFixed(1)} FTE = ${stage8.facilitators} × ${stage8.conversionFactor}`}
                </Typography>
            </Box>

            {/* Section B — Delivery model mix */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                {STAGE8_SECTION_B_HEADING}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {STAGE8_PCT_INDIVIDUAL_LABEL}
                <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 1, mb: 1, gap: 2 }}>
                <TextField
                    type="number"
                    placeholder={STAGE8_PCT_INDIVIDUAL_PLACEHOLDER}
                    value={pctIndividual}
                    onChange={(e) => onFieldChange('pctIndividual', e.target.value === '' ? '' : Number(e.target.value))}
                    inputProps={{ min: 0, max: 100, 'aria-label': STAGE8_PCT_INDIVIDUAL_LABEL, style: { textAlign: 'center' } }}
                    sx={{ width: 160 }}
                />
                <Typography variant="body2" color="text.secondary">
                    {pctEntered ? `${pctIndividualNum}% individual · ${100 - pctIndividualNum}% group` : '— % individual · remainder % group'}
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {STAGE8_PCT_INDIVIDUAL_HELPER}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>{underlineWord(STAGE8_HOURS_INDIVIDUAL_LABEL, 'individual')}</Typography>
                    <TextField
                        fullWidth
                        type="number"
                        disabled={pctEntered && pctIndividualNum === 0}
                        value={stage8.hoursIndividual}
                        onChange={(e) => onFieldChange('hoursIndividual', e.target.value === '' ? '' : Number(e.target.value))}
                        inputProps={{ 'aria-label': STAGE8_HOURS_INDIVIDUAL_LABEL }}
                        helperText={STAGE8_HOURS_INDIVIDUAL_SOURCE_NOTE}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>{underlineWord(STAGE8_HOURS_GROUP_LABEL, 'group')}</Typography>
                    <TextField
                        fullWidth
                        type="number"
                        disabled={pctEntered && pctIndividualNum === 100}
                        value={stage8.hoursGroup}
                        onChange={(e) => onFieldChange('hoursGroup', e.target.value === '' ? '' : Number(e.target.value))}
                        inputProps={{ 'aria-label': STAGE8_HOURS_GROUP_LABEL }}
                        helperText={STAGE8_HOURS_GROUP_SOURCE_NOTE}
                    />
                </Grid>
            </Grid>

            <Link component="button" type="button" variant="body2" onClick={() => toggleDisclosure('advanced')} sx={{ display: 'inline-block', mt: 1, mb: 1 }}>
                {openDisclosures.advanced ? 'Hide advanced' : `▸ ${STAGE8_ADVANCED_DISCLOSURE_LABEL}`}
            </Link>
            <Collapse in={openDisclosures.advanced}>
                <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>{STAGE8_ANNUAL_HOURS_LABEL}</Typography>
                    <TextField
                        type="number"
                        value={stage8.annualHoursPerFTE}
                        onChange={(e) => onFieldChange('annualHoursPerFTE', e.target.value === '' ? '' : Number(e.target.value))}
                        inputProps={{ 'aria-label': STAGE8_ANNUAL_HOURS_LABEL }}
                        sx={{ width: 200, mb: 1 }}
                    />
                    <Callout>{STAGE8_ANNUAL_HOURS_SOURCE_NOTE}</Callout>
                </Box>
            </Collapse>

            <Divider sx={{ my: 2 }} />

            {/* Section A2/C — Site capacity check (optional) */}
            <Link component="button" type="button" variant="body2" onClick={() => toggleDisclosure('siteCheck')} sx={{ display: 'inline-block', mb: 1 }}>
                {openDisclosures.siteCheck ? 'Hide site capacity check' : `▸ ${STAGE8_SITE_CHECK_DISCLOSURE_LABEL}`}
            </Link>
            <Collapse in={openDisclosures.siteCheck}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{STAGE8_SECTION_C_HEADING}</Typography>
                <Grid container spacing={3} sx={{ mb: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={LABEL_SX}>{STAGE8_SITES_LABEL}</Typography>
                        <TextField
                            fullWidth
                            type="number"
                            value={stage8.sites}
                            onChange={(e) => onFieldChange('sites', e.target.value === '' ? '' : Number(e.target.value))}
                            inputProps={{ min: 0, step: 1, 'aria-label': STAGE8_SITES_LABEL }}
                            helperText={STAGE8_SITES_HELPER}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={LABEL_SX}>{STAGE8_CLIENTS_PER_SITE_LABEL}</Typography>
                        <TextField
                            fullWidth
                            type="number"
                            value={stage8.clientsPerSite}
                            onChange={(e) => onFieldChange('clientsPerSite', e.target.value === '' ? '' : Number(e.target.value))}
                            inputProps={{ 'aria-label': STAGE8_CLIENTS_PER_SITE_LABEL }}
                            helperText={`${STAGE8_CLIENTS_PER_SITE_SOURCE_NOTE} ${STAGE8_CLIENTS_PER_SITE_HELPER}`}
                        />
                    </Grid>
                </Grid>

                {detail.sitesFilled && (
                    <Box sx={{ backgroundColor: 'grey.100', borderRadius: 1, p: 1.5, mb: 2 }}>
                        <Typography variant="body2">
                            {`Site-arm capacity: ${Math.round(detail.siteCapacity).toLocaleString()} = ${stage8.sites} × ${stage8.clientsPerSite}`}
                            {bindComparison && ` — binds ${bindComparison} the workforce estimate (${Math.round(detail.providerCapacity).toLocaleString()})`}
                        </Typography>
                    </Box>
                )}

                {showInteractionWarning && (
                    <Alert severity="warning" sx={{ mb: 2 }}>{STAGE8_SITE_INTERACTION_WARNING}</Alert>
                )}
            </Collapse>

            <Divider sx={{ my: 2 }} />

            {/* Computed capacity */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>{STAGE8_COMPUTED_CAPACITY_HEADING}</Typography>
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <MetricCard
                    label={STAGE8_METRIC_BLENDED_HOURS_LABEL}
                    value={detail.providerReady ? `${detail.blendedHours.toFixed(1)} h` : '—'}
                    sm={detail.sitesFilled ? 3 : 4}
                />
                <MetricCard
                    label={STAGE8_METRIC_CLIENTS_PER_FTE_LABEL}
                    value={detail.providerReady ? detail.clientsPerFTE.toFixed(1) : '—'}
                    sm={detail.sitesFilled ? 3 : 4}
                />
                <MetricCard
                    label={STAGE8_METRIC_WORKFORCE_LABEL}
                    value={detail.providerReady ? Math.round(detail.providerCapacity).toLocaleString() : '—'}
                    sm={detail.sitesFilled ? 3 : 4}
                />
                {detail.sitesFilled && (
                    <MetricCard
                        label={STAGE8_METRIC_SITE_CHECK_LABEL}
                        value={detail.providerReady ? Math.round(detail.capacity).toLocaleString() : '—'}
                        sm={3}
                        highlight
                    />
                )}
            </Grid>

            {!detail.providerReady && (
                <Alert severity="warning" sx={{ mb: 2 }}>{STAGE8_BLANK_STATE_PROMPT}</Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{STAGE8_BENCHMARK_NOTE}</Typography>
            {detail.providerReady && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {detail.sitesFilled
                        ? `${STAGE8_CAPACITY_STATEMENT_WITH_SITE_PREFIX} ${Math.round(detail.capacity).toLocaleString()} clients per year. That figure is compared against your Stage 7 demand; if demand is higher, the model will flag it and offer an optional cap.`
                        : STAGE8_CAPACITY_STATEMENT_NO_SITE}
                </Typography>
            )}

            {/* Demand-vs-capacity comparison (unchanged from before this revision) */}
            {capacityReady ? (
                <>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Geographic Accessibility output (funnel-estimated demand)</Typography>
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
                    Complete the individual/group split above (field 3) to compare this against your Geographic Accessibility funnel-estimated demand.
                </Alert>
            )}

            <Callout title="Clients served per facilitator">{STAGE8_THROUGHPUT_RATIONALE}</Callout>

            <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => toggleDisclosure('pipelineNotes')}
                sx={{ display: 'inline-block', mt: 2, mb: 1 }}
            >
                {openDisclosures.pipelineNotes ? 'Hide workforce pipeline notes' : 'Workforce pipeline notes that may be helpful'}
            </Link>
            <Collapse in={openDisclosures.pipelineNotes}>
                <List dense>
                    {STAGE8_WORKFORCE_PIPELINE_NOTES.map((note) => (
                        <ListItem key={note} sx={{ display: 'list-item', listStyleType: 'disc', ml: 2 }}>
                            <Typography variant="body2" color="text.secondary">{note}</Typography>
                        </ListItem>
                    ))}
                </List>
            </Collapse>

            <SourcesList sources={STAGE8_SOURCES} />
        </Paper>
    );
};

export default StageCapacity;
