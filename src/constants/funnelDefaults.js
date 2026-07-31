// Data and verbatim copy for the Stages 4-9 demand funnel.
// Sourced from new_changes/PATpath_Stages4-9_Developer_Spec_v6.8.docx (+ PDF cross-check).

// ---------------------------------------------------------------------------
// CC-1: Funnel input population selector (the four existing Stage 3 cells)
// ---------------------------------------------------------------------------
export const FUNNEL_INPUT_CELLS = [
    { key: 'trialMDD', label: 'MDD — Trial' },
    { key: 'realMDD', label: 'MDD — Real-World' },
    { key: 'trialTRD', label: 'TRD — Trial' },
    { key: 'realTRD', label: 'TRD — Real-World' },
];
export const DEFAULT_FUNNEL_INPUT_CELL = 'realMDD';

// ---------------------------------------------------------------------------
// CC-3: Context dropdowns
// ---------------------------------------------------------------------------
export const AWARENESS_INTEREST_CONTEXTS = [
    { key: 'progressiveUrban', label: 'Progressive / Urban' },
    { key: 'moderateMixed', label: 'Moderate / Mixed' },
    { key: 'conservativeRural', label: 'Conservative / Rural' },
];
export const DEFAULT_AWARENESS_INTEREST_CONTEXT = 'moderateMixed';

export const GEOGRAPHIC_ACCESS_CONTEXTS = [
    { key: 'progressiveUrban', label: 'Progressive / Urban' },
    { key: 'mixedUrbanSuburban', label: 'Mixed Urban / Suburban' },
    { key: 'mixedUrbanRural', label: 'Mixed Urban-Rural' },
    { key: 'conservativeRural', label: 'Conservative / Rural' },
    { key: 'optedOut', label: 'Opted-Out' },
];
export const DEFAULT_GEOGRAPHIC_ACCESS_CONTEXT = 'mixedUrbanSuburban';

export const CONTEXT_HELPER_TEXT = "Awareness and interest depend on cultural context (3 buckets, source-backed); geographic access depends on population density (5 buckets, source-backed). Unusual combinations (e.g., Progressive / Urban awareness with Conservative / Rural access) are allowed.";

// ---------------------------------------------------------------------------
// CC-4: Methods preamble (static text block, rendered above Stages 4-9 inputs)
// ---------------------------------------------------------------------------
export const METHODS_PREAMBLE = "We have sought the most relevant data to provide the best possible empirical basis for this model. The field is evolving rapidly and we expect better estimates over time; defaults reflect best current evidence as of 2026 and will be updated as the evidence base matures. Each stage indicates whether its value is independent (a rate measured in the general population and applied here as a proxy — e.g., BCSP's ‘47% of adults are aware’) or conditional (a rate measured specifically among those who passed the prior stages — e.g., Corrigan's ‘among the aware, 47% would be interested’). Mathematically, both are multiplied against the prior stage's count; the tag tells users where each rate was estimated, which matters because applying general-population rates to a narrower subset introduces some slippage.";

// ---------------------------------------------------------------------------
// Stage 4 — Awareness (Independent). Pre-populates from Awareness/Interest context.
// ---------------------------------------------------------------------------
export const STAGE4_LABEL = 'Aware of psychedelic therapy (% of adults)';
export const STAGE4_DEFAULT = 47;

// Point-default values are the doc's literal stated defaults, not recomputed
// midpoints (see plan's cross-check notes on rounding).
export const STAGE4_CONTEXT_DEFAULTS = {
    progressiveUrban: { value: 60, range: '55–65%', rationale: 'Active psychedelic-policy discourse; e.g. Oregon, Colorado metro.' },
    moderateMixed: { value: 47, range: '47%', rationale: 'BCSP National Survey, 2023, n=1,500.' },
    conservativeRural: { value: 30, range: '25–35%', rationale: 'Low awareness anchor; PRRI 2024 conservative subgroup.' },
};
// Reference-only row shown alongside the table above; not a selectable dropdown option.
// Included per PDF (cross-check resolved: the docx omitted this row for Stage 4;
// it mirrors the identical row present for Stage 5 in both source documents).
export const STAGE4_REFERENCE_ROW = {
    label: 'Treated pop. + physician rec.',
    range: '60–70%',
    rationale: 'Corrigan uplift among aware, clinically eligible respondents.',
};

export const STAGE4_HELPER_TEXT = "Default: 47% of adults are aware of psychedelic therapy as a mental health treatment option. Source: UC Berkeley BCSP National Survey, 2023, n=1,500. Demographic gap: 29% of African-American respondents reported recent awareness vs. 47% overall.";
export const STAGE4_ADJUSTMENT_CAPTION = "Reduce to 25–35% for conservative or rural areas; increase to 55–65% for progressive urban areas with active psychedelic policy discourse (e.g., Oregon, Colorado metro).";

export const STAGE4_SOURCES = [
    'UC Berkeley Center for the Science of Psychedelics. (2023). Inaugural Berkeley Psychedelics Survey. n=1,500.',
    'PRRI. (2024). American Values Survey: Cannabis and Psychedelics. n=5,352.',
];

// ---------------------------------------------------------------------------
// Stage 5 — Interest, Conditional on Stages 3+4. Pre-populates from Awareness/Interest context.
// ---------------------------------------------------------------------------
export const STAGE5_LABEL = 'Interest given awareness — % who would pursue treatment with a realistic decision context (doctor recommendation / legal availability)';
export const STAGE5_DEFAULT = 47;

export const STAGE5_CONTEXT_DEFAULTS = {
    progressiveUrban: { value: 52, range: '50–55%' },
    moderateMixed: { value: 47, range: '45–50%' },
    conservativeRural: { value: 35, range: '30–40%' },
};
export const STAGE5_REFERENCE_ROW = { label: 'Treated pop. + physician rec.', value: 57, range: '55–60%' };

// Combined Stage 4+5 table, displayed read-only on the results page.
export const STAGE4_5_COMBINED_TABLE = [
    {
        context: 'Progressive / Urban',
        aware: '55–65%',
        interestGivenAware: '50–55%',
        combined: '28–36%',
        rationale: 'Higher awareness and interest; active psychedelic policy discourse.',
    },
    {
        context: 'Moderate / Mixed',
        aware: '47%',
        interestGivenAware: '45–50%',
        combined: '21–24%',
        rationale: 'Default; anchored by BCSP awareness + Corrigan conditional interest.',
        isDefault: true,
    },
    {
        context: 'Conservative / Rural',
        aware: '25–35%',
        interestGivenAware: '30–40%',
        combined: '8–14%',
        rationale: 'Lower awareness; lower interest amongst conservatives (17% support per PRRI).',
    },
    {
        context: 'Treated pop. + physician rec.',
        aware: '60–70%',
        interestGivenAware: '55–60%',
        combined: '33–42%',
        rationale: 'Corrigan uplift discounted for U.S. context and provider knowledge gaps.',
    },
];

export const STAGE5_RATIONALE = "The general-population figure of 28% positive attitudes (Ipsos/Psychedelic Alpha 2026; n≈900, ±3.3%) treats interest as independent of awareness or clinical status. Among people who are both aware and clinically eligible, interest is substantially higher. Corrigan et al. 2022 found 55% of mental health service users would accept psilocybin therapy if a doctor recommended it, with 25% neutral; those with depression/anxiety were significantly more likely to be interested (p=0.016). We adopt 47% as the conditional default.";
export const STAGE5_CAVEAT = "All survey estimates are upper bounds. Sheeran (2002), meta-analyzing 422 studies, found stated positive intentions translate into action only 53% of the time. Webb & Sheeran (2006) confirmed that even interventions that change intentions produce only small-to-medium behavior change. The Global Drug Survey found 59% of prior psychedelic users vs. 18% of non-users would accept psychedelic therapy for depression — prior experience is a strong moderator, and prior use varies by geography and demographics.";

export const STAGE5_SOURCES = [
    'Ipsos / Psychedelic Alpha. (2026). National probability sample, n≈900, ±3.3%.',
    'Corrigan K, et al. (2022). Irish J Medical Science, 191, 1385–1397. n=99.',
    'PRRI. (2024). American Values Survey. n=5,352.',
    'Wang SE, et al. (2024). Scientific Reports, 14, Article 26832. n=879.',
    'Garza-Mouriño I, et al. (2024). J Psychedelic Studies, 8(1), 43–65.',
    'Sheeran P. (2002). European Review of Social Psychology, 12, 1–36.',
    'Webb TL, Sheeran P. (2006). Psychological Bulletin, 132, 249–268.',
];

// ---------------------------------------------------------------------------
// Stage 6 — Can Afford, Conditional on Stages 4+5.
// Table A: user-selectable, feeds the funnel. Table B: informational only.
// ---------------------------------------------------------------------------
export const STAGE6_TABLE_A_ROWS = [
    {
        key: 'group',
        pricePoint: '$300–$500 (group)',
        context: 'Oregon group sessions',
        min: 40,
        max: 50,
        default: 45,
        represents: 'Aware-and-interested who could fund a group session OOP',
        source: 'Psychedelic Alpha Tracker, 2025',
    },
    {
        key: 'individual',
        pricePoint: '$1,000–$3,000 (individual)',
        context: 'Oregon / near-term market',
        min: null,
        max: null,
        default: 20,
        represents: 'Aware-and-interested who could fund an individual session OOP',
        source: 'OHA Q1–Q3 2025; OHSU OPEN',
        isDefault: true,
    },
    {
        key: 'fda',
        pricePoint: '$5,300–$8,250 (FDA Rx)',
        context: 'Post-approval, no coverage',
        min: 8,
        max: 15,
        default: 11.5,
        represents: 'Aware-and-interested who could fund an FDA-priced course OOP',
        source: 'Projected; cf. Spravato $18K–$45K/yr',
    },
];
export const STAGE6_TABLE_A_DENOMINATOR = '% of the aware-and-interested population who can afford this price point out of pocket.';
export const STAGE6_DEFAULT_ROW_KEY = 'individual';

export const STAGE6_TABLE_B_ROWS = [
    {
        pathway: 'Employer TPA (Enthea)',
        context: 'Employer-funded benefit',
        min: 35,
        max: 45,
        represents: 'Eligible employees whose employer would buy this benefit',
        source: 'Enthea KAT model; lower-bound anchor',
        footnote: "Enthea's ~$35/employee/year derives from its KAT book of business — the only empirical TPA data point currently available. Psilocybin's different utilization (fewer sessions per patient) could push the per-employee cost up or down (likely down). Treat 35–45% as a lower-bound anchor with substantial range, not a forecast.",
    },
    {
        pathway: 'Subsidized / sliding-scale',
        context: 'Foundation / equity programs',
        min: 30,
        max: 40,
        represents: 'Income-qualified enrollees reached by grant programs',
        source: 'Sheri Eckert Foundation; Oregon equity',
    },
    {
        pathway: 'Major insurer coverage',
        context: 'Post-approval, parity enforced',
        min: 55,
        max: 65,
        represents: 'Insured population with coverage',
        source: 'Projected; MH Parity Act (BrainFutures, 2024)',
    },
];

export const STAGE6_HEADER_RATIONALE = "Default: 20% can afford a $2,000 individual session with no insurance. The default is derived from NIMH/NHIS income-stratified data — the share of U.S. adults with depression whose household income clears a threshold sufficient for a $2,000 out-of-pocket session. Using stated income distributions rather than Oregon client demographics sidesteps the selection bias from revealed-preference data drawn from a population already filtered by geographic access. Users in markets with lower session costs or more diverse delivery formats may find 20% conservative and should adjust upward (see Table A row 1).";
export const STAGE6_COLORADO_CAVEAT = "Oregon provides the best available revealed-preference data on psilocybin affordability. Colorado's more permissive model may yield different access patterns as it matures; we will incorporate Colorado data as it accumulates.";

export const STAGE6_SOURCES = [
    'NIMH / NHIS income-stratified data on adults with depression (citation pending).',
    'Oregon Health Authority. (2025). OPS Data Dashboard, Q1–Q3.',
    'Psychedelic Alpha. (2025). Oregon Psilocybin Services Tracker. Avg client income ~$153K.',
    'OHSU OPEN / Rae A. (2025). Lucid News. Majority of clients >$200K; 3 below FPL.',
    'Enthea. (2025). KAP coverage; psilocybin planned. ~$35/employee/year.',
    'Petrie-Flom Center. (2024). Insurance Coverage for Psychedelic Therapy. Spravato $18K–$45K/yr.',
    'BrainFutures. (2024). A Path Toward Parity.',
];

// ---------------------------------------------------------------------------
// Stage 7 — Geographic Accessibility, Conditional on Stages 4-6.
// Pre-populates from Geographic Access context.
// ---------------------------------------------------------------------------
export const STAGE7_LABEL = 'Can reach a provider (% of affordable-and-interested who can physically access)';
export const STAGE7_DEFAULT = 72;

export const STAGE7_CONTEXT_DEFAULTS = {
    progressiveUrban: { value: 82, range: '80–85%', basis: 'Discount from standard MH access (~90%) for session length; Oregon metro data.' },
    mixedUrbanSuburban: { value: 72, range: '70–75%', basis: 'Oregon data + national MH access literature.' },
    mixedUrbanRural: { value: 50, range: '45–55%', basis: 'RHIhub 2025: 18% of larger rural >30 min from MH facility.' },
    conservativeRural: { value: 27, range: '20–35%', basis: 'RHIhub 2025: 40% of isolated rural >30 min from any MH care.' },
    optedOut: { value: 0, range: '0%', basis: 'Most Oregon rural counties opted out. See medical-tourism footnote.' },
};

export const STAGE7_SESSION_LENGTH_CALLOUT = "Unlike standard outpatient therapy (45–60 min sessions), psilocybin sessions last 6–8 hours. Travel distance, time off work, and recovery time are substantially more consequential. The geographic access percentages above already discount for this, but standard MH access benchmarks understate the problem for psilocybin therapy.";
export const STAGE7_MEDICAL_TOURISM_FOOTNOTE = "Some demand in opted-out jurisdictions may be met via travel to neighboring legal jurisdictions. This medical-tourism flow is not modeled in the default 0% but may be material in border counties. Override Stage 7 upward to model such scenarios.";
export const STAGE7_VETERANS_NOTE = "The defaults use general mental-health utilization patterns. Some populations — notably veterans — may not follow these patterns. Veterans have been a leading constituency driving psychedelic research and advocacy; institutional channels such as the VA could enable utilization rates exceeding what generalized MH-access models predict, even among rural or lower-SES subgroups that typically under-utilize MH services. Most relevant if PATpath extends to MDMA / PTSD.";

export const STAGE7_SOURCES = [
    'Rural Health Information Hub. (2025). Rural Mental Health Overview.',
    'Negaro SND, et al. (2023). Health Affairs Scholar, 1(6), qxad070.',
    'Oregon Health Authority. (2025). OPS Data Dashboard.',
    'Psychedelic Alpha. (2025). Oregon Psilocybin Services Tracker.',
    'National Rural Health Association. (2022). Mental Health in Rural Areas.',
];

// ---------------------------------------------------------------------------
// Stage 8 — Provider Capacity (Capacity check, parallel; not part of funnel math)
// ---------------------------------------------------------------------------
export const STAGE8_FACILITATORS_DEFAULT = 0;
export const STAGE8_FACILITATORS_HELPER = 'If unknown, estimate based on the number of existing ketamine clinics in your area (the most likely early adopters).';
export const STAGE8_THROUGHPUT_DEFAULT = 16;
export const STAGE8_THROUGHPUT_MIN = 1;
export const STAGE8_THROUGHPUT_MAX = 50;
export const STAGE8_MULTIPLIER_DEFAULT = 1;
export const STAGE8_MULTIPLIER_MIN = 1;
export const STAGE8_MULTIPLIER_MAX = 3;
export const STAGE8_MULTIPLIER_HELPER = 'If group-session models are available in your area, multiply by 2–3× to account for higher throughput.';

export const STAGE8_SECTION_HELPER_TEXT = "Stage 8 is a parallel sanity check, not part of the funnel multiplication. Estimate local capacity here and compare it to your Stage 7 output. If your funnel-estimated demand exceeds capacity, the UI will flag it and offer an optional capacity cap.";
export const STAGE8_WARNING_COPY = "Your calculated demand exceeds plausible local capacity. Consider applying the capacity cap below.";
export const STAGE8_THROUGHPUT_RATIONALE = "By Q1–Q3 2025, Oregon served 4,577 clients / ~377 facilitators — annualizing to ~6,100/yr, or ~16 clients per facilitator per year. This reflects maturing practices, growing awareness, and group sessions. Colorado data, as it accumulates, will cross-check this, particularly given that state's more permissive delivery model.";

export const STAGE8_WORKFORCE_PIPELINE_NOTES = [
    'Only 5% of graduate programs in counseling, social work, nursing, and psychology include psychedelic therapy in required courses (NORC/BrainFutures, 2024).',
    'Only 8% of non-ketamine providers feel staffing-ready today (BrainFutures/CEP, 2025).',
    '100% of ketamine-treating providers surveyed (n=7) plan to adopt psychedelic therapies within 6 months of FDA approval. Small sample; treat as directional.',
    '50% of providers across 15 states plan to add psychedelic therapies within 6 months of FDA approval; 60% anticipate insurance barriers (BrainFutures/CEP, 2025).',
];

export const STAGE8_SOURCES = [
    'Oregon Health Authority. (2025). OPS Data Dashboard.',
    'BrainFutures / CEP. (2025). Scaling Psychedelic Therapies in the Health System.',
    'NORC / BrainFutures. (2024). Survey on Psychedelic Therapy Curricula in Academia.',
];

// ---------------------------------------------------------------------------
// Stage 9 — Effective Demand & Results Page
// ---------------------------------------------------------------------------
export const STAGE9_METHODOLOGICAL_CAVEAT = "Multiplying six to seven uncertain percentages compounds error: a ±10 pp uncertainty per stage can produce a 5× range in final output. The stages aren't truly independent — people who can afford $2,000+ tend to be urban, educated, aware, and geographically proximate. Treating stages as independent likely overstates constraints for affluent urban populations and understates them for lower-income rural ones. Stage 5's conditional framing partially addresses this; residual interdependence remains. Treat any point estimate as approximate and use the Scenario Explorer.";

export const STAGE9_RECAP_HELPER_TEXT = 'To change a value, return to the corresponding stage above.';

export const STAGE9_OREGON_COMPARATOR_CAPTION = "The funnel estimate of ~4,500/yr aligns reasonably with Oregon's observed ~4,000/yr. Oregon's high prices and limited access likely constrain actual demand below what broader availability would produce. As a benchmark, effective demand in most plausible scenarios falls between 0.05% and 0.3% of total adults (~1–4% of the prevalence pool).";

// Worked Example A — hypothetical 500,000-adult urban/suburban population.
// Reference layout for Table 1 (Inputs Recap); reuse labels and Type tags verbatim.
export const WORKED_EXAMPLE_A = {
    label: 'Worked Example A — Hypothetical 500,000-adult urban/suburban population',
    totalAdults: 500000,
    rows: [
        { stage: 'A. Total adults', type: 'base', rate: '100%', n: 500000, note: '' },
        { stage: 'B. With MDD', type: 'independent', rate: '7%', n: 35000, note: 'NIMH prevalence' },
        { stage: 'C. Clinically eligible', type: 'conditional', rate: '56%', n: 19600, note: 'Rab et al. 2024 mid-range' },
        { stage: 'D. Aware', type: 'independent', rate: '47%', n: 9212, note: 'BCSP 2023' },
        { stage: 'E. Interested | Aware', type: 'conditional', rate: '47%', n: 4330, note: 'Corrigan conditional est.' },
        { stage: 'F. Can afford at $2,000', type: 'conditional', rate: '20%', n: 866, note: 'NIMH/NHIS income-stratified' },
        { stage: 'G. Can access provider', type: 'conditional', rate: '72%', n: 624, note: 'Urban/suburban default' },
    ],
    effectiveDemandPct: '~0.12%',
    effectiveDemandN: '~624/yr',
    note: '0.12% of total adults. Stage 8 capacity check displayed separately.',
};

// Worked Example B — Oregon real-world calibration (static comparator).
export const WORKED_EXAMPLE_B = {
    label: 'Worked Example B — Oregon real-world calibration (static comparator)',
    totalAdults: 3300000,
    rows: [
        { stage: 'A. Total adults (Oregon)', type: 'base', rate: '100%', n: 3300000, note: 'U.S. Census' },
        { stage: 'B. With MDD', type: 'independent', rate: '7%', n: 231000, note: 'NIMH prevalence' },
        { stage: 'C. Clinically eligible', type: 'conditional', rate: '56%', n: 129360, note: 'Rab et al. mid-range' },
        { stage: 'D. Aware', type: 'independent', rate: '60%', n: 77616, note: 'Progressive state w/ active program' },
        { stage: 'E. Interested | Aware', type: 'conditional', rate: '50%', n: 38808, note: 'Legal access in state' },
        { stage: 'F. Can afford at ~$2,000', type: 'conditional', rate: '18%', n: 6985, note: 'Oregon revealed: high-income skew' },
        { stage: 'G. Can access provider', type: 'conditional', rate: '65%', n: 4541, note: 'Portland-heavy; rural opt-outs' },
    ],
    effectiveDemandPct: '~0.14%',
    effectiveDemandN: '~4,541/yr',
    note: 'Actual OR: ~4,000/yr. Stage 8 capacity check: 377 × 16 = 6,032 — funnel below capacity, no warning.',
};

export const STAGE9_SOURCES = [
    'Oregon Health Authority. (2025). OPS Data Dashboard.',
    'Psychedelic Alpha. (2025). Oregon Psilocybin Services Tracker.',
];

// ---------------------------------------------------------------------------
// Probability-type tags (CC-2)
// ---------------------------------------------------------------------------
export const PROBABILITY_TYPES = {
    INDEPENDENT: 'independent',
    CONDITIONAL: 'conditional',
    CAPACITY: 'capacity',
};
