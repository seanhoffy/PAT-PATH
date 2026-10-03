import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { deriveFunnelDisplay, cellValuesFromResults, getStage6Value, stage6SummaryLabel, getStage6SplitSummary, formatRate, getStageInputBounds } from '../../utils/funnelCalculations';
import {
    AWARENESS_INTEREST_CONTEXTS,
    GEOGRAPHIC_ACCESS_CONTEXTS,
    FUNNEL_INPUT_CELLS,
} from '../../constants/funnelDefaults';

const labelFromList = (list, key) => list.find((item) => item.key === key)?.label || key;

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    section: {
        marginBottom: 6,
        padding: 8,
        borderBottom: "1px solid #000",
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    text: {
        fontSize: 12,
    },
    table: {
        display: 'table',
        width: '100%',  // Full width
        marginTop: 30,  // Added extra margin
        border: '1px solid #000',  // Box around the whole table
        borderRadius: 5, // Optional: Rounded corners for the table box
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000', // Line between rows
    },
    tableCell: {
        width: '33.33%', // Each column takes 1/3 of the table's width
        padding: 10,  // Increased padding for more space
        textAlign: 'center',
        borderRight: '1px solid #000', // Line between columns
    },
    tableHeader: {
        fontWeight: 'bold',
        backgroundColor: '#f2f2f2', // Light grey background for header
    },
    tableLastCell: {
        borderRight: 'none', // No right border for the last cell
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 6,
        color: '#023e74'
    },
    inputGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        gap: 8,
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    inputItem: {
        width: '45%',
        marginBottom: 5
    },
    label: {
        fontSize: 10,
        color: '#666'
    },
    value: {
        fontSize: 12,
        marginTop: 2
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10
    },
    resultsGrid: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    resultItem: {
        width: '45%'
    },
    infoItem: {
        width: '48%',  // Slightly wider to accommodate content
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10
    },
    infoLabel: {
        fontSize: 11,
        color: '#666',
        marginRight: 4,
        width: '35%',  // Fixed width for label
    },
    infoValue: {
        fontSize: 11,
        width: '65%',  // Fixed width for value
        color: '#000'
    },
    infoSection: {
        marginBottom: 10
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    infoColumn: {
        width: '48%'
    },
    generalInfoLabel: {  // Renamed from infoLabel
        fontSize: 11,
        color: '#666',
        marginBottom: 2
    },
    generalInfoValue: {  // Renamed from infoValue
        fontSize: 12,
        color: '#000'
    },
    funnelTable: {
        marginTop: 4,
        marginBottom: 6,
    },
    funnelTableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #ddd',
        paddingVertical: 3,
    },
    funnelTableHeaderRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        paddingVertical: 3,
    },
    funnelTableCell: {
        flex: 1,
        fontSize: 9,
        paddingHorizontal: 2,
    },
    funnelTableHeaderCell: {
        flex: 1,
        fontSize: 9,
        fontWeight: 'bold',
        paddingHorizontal: 2,
    },
    funnelBarRow: {
        marginBottom: 6,
    },
    funnelBarLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    funnelBarLabel: {
        fontSize: 9,
    },
    funnelBarValue: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    funnelBarTrack: {
        height: 10,
        backgroundColor: '#eef1f5',
        borderRadius: 2,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    funnelBarFill: {
        height: 10,
        backgroundColor: '#c2410c',
        borderRadius: 2,
    },
});

// Native react-pdf reconstruction of the funnel plot (a chart of
// proportionally-decreasing horizontal bars), since @react-pdf/renderer
// cannot render a live Recharts/SVG/canvas element. Bar widths are
// proportional to each row's N relative to the first row's N, and centered
// in their track (via funnelBarTrack's justifyContent) so the taper reads
// as an actual funnel shape rather than a left-aligned staircase.
const FunnelBarChart = ({ rows }) => {
    const maxN = Number(rows?.[0]?.n) || 1;
    return (
        <View>
            {rows.map((row) => (
                <View key={row.key} style={styles.funnelBarRow} wrap={false}>
                    <View style={styles.funnelBarLabelRow}>
                        <Text style={styles.funnelBarLabel}>{row.stage}</Text>
                        <Text style={styles.funnelBarValue}>
                            {Number(row.n).toLocaleString()}{row.pctOfPrior !== null ? ` (${row.pctOfPrior}% of prior)` : ''}
                        </Text>
                    </View>
                    <View style={styles.funnelBarTrack}>
                        <View style={[styles.funnelBarFill, { width: `${Math.min(100, (Number(row.n) / maxN) * 100)}%` }]} />
                    </View>
                </View>
            ))}
        </View>
    );
};

const RECAP_ROW_KEY_TO_STAGE = { D: 'stage4', E: 'stage5', F: 'stage6', G: 'stage7' };

const FunnelRecapTable = ({ rows, bounds, stage6SplitSummary }) => {
    const boundCell = (rowKey, bound) => {
        const stageKey = RECAP_ROW_KEY_TO_STAGE[rowKey];
        const raw = stageKey ? bounds?.[stageKey]?.[bound] : null;
        const formatted = formatRate(raw);
        return formatted !== null ? `${formatted}%` : '—';
    };

    return (
        <View style={styles.funnelTable}>
            <View style={styles.funnelTableHeaderRow} wrap={false}>
                <Text style={styles.funnelTableHeaderCell}>Stage</Text>
                <Text style={styles.funnelTableHeaderCell}>Type</Text>
                <Text style={styles.funnelTableHeaderCell}>Lower Bound</Text>
                <Text style={styles.funnelTableHeaderCell}>Base Case</Text>
                <Text style={styles.funnelTableHeaderCell}>Upper Bound</Text>
                <Text style={styles.funnelTableHeaderCell}>Retained</Text>
            </View>
            {rows.map((row) => (
                <View key={row.key}>
                    <View style={styles.funnelTableRow} wrap={false}>
                        <Text style={styles.funnelTableCell}>{row.stage}</Text>
                        <Text style={styles.funnelTableCell}>{row.type === 'base' ? '—' : row.type}</Text>
                        <Text style={styles.funnelTableCell}>{boundCell(row.key, 'low')}</Text>
                        <Text style={styles.funnelTableCell}>{formatRate(row.rate) !== null ? `${formatRate(row.rate)}%` : '—'}</Text>
                        <Text style={styles.funnelTableCell}>{boundCell(row.key, 'high')}</Text>
                        <Text style={styles.funnelTableCell}>{Number(row.n).toLocaleString()}</Text>
                    </View>
                    {row.key === 'F' && stage6SplitSummary && (
                        <View style={styles.funnelTableRow} wrap={false}>
                            <Text style={[styles.funnelTableCell, { fontStyle: 'italic' }]}>↳ Individual / Group split</Text>
                            <Text style={[styles.funnelTableCell, { flex: 5, fontStyle: 'italic' }]}>{stage6SplitSummary}</Text>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
};

const ScenarioExplorerPdfTable = ({ startN, scenario }) => {
    const stageRows = [
        { label: 'Aware', rowKey: 'D' },
        { label: 'Interested', rowKey: 'E' },
        { label: 'Can afford', rowKey: 'F' },
        { label: 'Sufficient Clinic Capacity', rowKey: 'G' },
    ];
    const findRow = (column, rowKey) => scenario[column].rows.find((r) => r.key === rowKey);

    return (
        <View style={styles.funnelTable}>
            <View style={styles.funnelTableHeaderRow} wrap={false}>
                <Text style={styles.funnelTableHeaderCell}>Stage</Text>
                <Text style={styles.funnelTableHeaderCell}>Conservative</Text>
                <Text style={styles.funnelTableHeaderCell}>Moderate</Text>
                <Text style={styles.funnelTableHeaderCell}>Optimistic</Text>
            </View>
            <View style={styles.funnelTableRow} wrap={false}>
                <Text style={styles.funnelTableCell}>Population with MDD</Text>
                <Text style={styles.funnelTableCell}>{Number(startN).toLocaleString()}</Text>
                <Text style={styles.funnelTableCell}>{Number(startN).toLocaleString()}</Text>
                <Text style={styles.funnelTableCell}>{Number(startN).toLocaleString()}</Text>
            </View>
            {stageRows.map(({ label, rowKey }) => (
                <View key={rowKey} style={styles.funnelTableRow} wrap={false}>
                    <Text style={styles.funnelTableCell}>{label}</Text>
                    <Text style={styles.funnelTableCell}>{formatRate(findRow('conservative', rowKey)?.rate) ?? '—'}%</Text>
                    <Text style={styles.funnelTableCell}>{formatRate(findRow('moderate', rowKey)?.rate) ?? '—'}%</Text>
                    <Text style={styles.funnelTableCell}>{formatRate(findRow('optimistic', rowKey)?.rate) ?? '—'}%</Text>
                </View>
            ))}
            <View style={styles.funnelTableRow} wrap={false}>
                <Text style={[styles.funnelTableCell, { fontWeight: 'bold' }]}>= Effective demand (funnel)</Text>
                <Text style={[styles.funnelTableCell, { fontWeight: 'bold' }]}>{Number(scenario.conservative.effectiveDemand).toLocaleString()}</Text>
                <Text style={[styles.funnelTableCell, { fontWeight: 'bold' }]}>{Number(scenario.moderate.effectiveDemand).toLocaleString()}</Text>
                <Text style={[styles.funnelTableCell, { fontWeight: 'bold' }]}>{Number(scenario.optimistic.effectiveDemand).toLocaleString()}</Text>
            </View>
            <Text style={[styles.label, { marginTop: 4 }]}>
                80% confidence interval: {Number(scenario.conservative.effectiveDemand).toLocaleString()}–{Number(scenario.optimistic.effectiveDemand).toLocaleString()} clients/yr, from a 100,000-run simulation over each stage's Low-High range.
            </Text>
        </View>
    );
};

// PDF Document Component
const MyDocument = ({ formData, results, modelCreatedOn, calculatedAt, funnelState }) => {
    if (!formData) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <Text>Loading...</Text>
                </Page>
            </Document>
        );
    }

    const funnelDisplay = funnelState ? deriveFunnelDisplay(funnelState, cellValuesFromResults(results)) : null;
    const stageInputBounds = funnelState ? getStageInputBounds(funnelState) : null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section} wrap={false}>
                    <Text style={styles.header}>PATpath Model Report</Text>
                </View>

                {/* General Information */}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionTitle}>General Information</Text>
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoColumn}>
                                <Text style={styles.generalInfoLabel}>Organization:</Text>
                                <Text style={styles.generalInfoValue}>{formData.modelTitle || "N/A"}</Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={styles.generalInfoLabel}>Geographic Area:</Text>
                                <Text style={styles.generalInfoValue}>{formData.geographicArea || "N/A"}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.infoColumn}>
                                <Text style={styles.generalInfoLabel}>Scenario:</Text>
                                <Text style={styles.generalInfoValue}>{formData.motivation || "N/A"}</Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={styles.generalInfoLabel}>Additional Comments:</Text>
                                <Text style={styles.generalInfoValue}>{formData.additionalComments || "N/A"}</Text>
                            </View>
                        </View>
                        {(modelCreatedOn || calculatedAt) && (
                            <View style={styles.infoRow}>
                                <View style={styles.infoColumn}>
                                    <Text style={styles.generalInfoLabel}>Model Created On:</Text>
                                    <Text style={styles.generalInfoValue}>{modelCreatedOn || calculatedAt}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Prevalence Data */}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionTitle}>Prevalence</Text>
                    <View style={styles.inputGrid}>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Total MDD Population:</Text>
                            <Text style={styles.value}>{formData.MDD?.toLocaleString() || "N/A"}</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>TRD Percentage:</Text>
                            <Text style={styles.value}>{formData.TRD_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>TRD Population:</Text>
                            <Text style={styles.value}>{formData.TRD?.toLocaleString() || "N/A"}</Text>
                        </View>
                    </View>
                </View>

                {/* Exclusion Criteria */}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionTitle}>Exclusion Criteria Percentages</Text>
                    <View style={styles.inputGrid}>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Psychotic or Manic Disorder:</Text>
                            <Text style={styles.value}>{formData.manic_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Suicide Attempt (Past Year):</Text>
                            <Text style={styles.value}>{formData.suicide_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Diabetes (uncontrolled):</Text>
                            <Text style={styles.value}>{formData.diabetes_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Stroke:</Text>
                            <Text style={styles.value}>{formData.stroke_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Heart Attack (Last Year):</Text>
                            <Text style={styles.value}>{formData.heart_attack_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Blood Pressure (140+/90+):</Text>
                            <Text style={styles.value}>{formData.blood_pressure_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Epilepsy:</Text>
                            <Text style={styles.value}>{formData.epilepsy_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Personality Disorder:</Text>
                            <Text style={styles.value}>{formData.personality_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Hepatic Impairment:</Text>
                            <Text style={styles.value}>{formData.hepatic_P}%</Text>
                        </View>
                    </View>
                </View>

                {/* Double Counting Adjustments */}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionTitle}>Double Counting Adjustments</Text>
                    <View style={styles.inputGrid}>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Psychological Disorders:</Text>
                            <Text style={styles.value}>{formData.psycological_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Health Conditions:</Text>
                            <Text style={styles.value}>{formData.health_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Hepatic Impairments:</Text>
                            <Text style={styles.value}>{formData.comorbid_hepatic_P}%</Text>
                        </View>
                    </View>
                </View>

                {/* Results Section */}
                <View style={styles.section} wrap={false}>
                    <Text style={styles.sectionTitle}>Results</Text>
                    <Text style={styles.subtitle}>Trial Exclusion Criteria</Text>
                    <View style={styles.resultsGrid}>
                        <View style={styles.resultItem}>
                            <Text style={styles.label}>MDD Population:</Text>
                            <Text style={styles.value}>{parseInt(results.trial.MDD).toLocaleString()}</Text>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.label}>TRD Population:</Text>
                            <Text style={styles.value}>{parseInt(results.trial.TRD).toLocaleString()}</Text>
                        </View>
                    </View>

                    <Text style={styles.subtitle}>Real World Exclusion Criteria</Text>
                    <View style={styles.resultsGrid}>
                        <View style={styles.resultItem}>
                            <Text style={styles.label}>MDD Population:</Text>
                            <Text style={styles.value}>{parseInt(results.real.MDD).toLocaleString()}</Text>
                        </View>
                        <View style={styles.resultItem}>
                            <Text style={styles.label}>TRD Population:</Text>
                            <Text style={styles.value}>{parseInt(results.real.TRD).toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Stages 4-9 */}
                {funnelDisplay && (
                    <>
                        <View style={styles.section} wrap={false}>
                            <Text style={styles.sectionTitle}>Funnel Inputs</Text>
                            <View style={styles.inputGrid}>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Awareness / Interest context:</Text>
                                    <Text style={styles.value}>{labelFromList(AWARENESS_INTEREST_CONTEXTS, funnelState.contexts.awarenessInterest)}</Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Geographic Accessibility context:</Text>
                                    <Text style={styles.value}>{labelFromList(GEOGRAPHIC_ACCESS_CONTEXTS, funnelState.contexts.geographicAccess)}</Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Funnel input population:</Text>
                                    <Text style={styles.value}>{labelFromList(FUNNEL_INPUT_CELLS, funnelState.funnelInputSelection)}</Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Aware (%):</Text>
                                    <Text style={styles.value}>{formatRate(funnelState.stage4.value) ?? '—'}%</Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Interested | Aware (%):</Text>
                                    <Text style={styles.value}>{formatRate(funnelState.stage5.value) ?? '—'}%</Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Can afford (Individual/Group / blended %):</Text>
                                    <Text style={styles.value}>{stage6SummaryLabel(funnelState.stage6)} / {formatRate(getStage6Value(funnelState.stage6)) ?? '—'}%</Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Can access provider (%):</Text>
                                    <Text style={styles.value}>{formatRate(funnelState.stage7.value) ?? '—'}%</Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Facilitators (headcount) / FTE conversion factor:</Text>
                                    <Text style={styles.value}>
                                        {funnelState.stage8.facilitators ?? '—'} / {funnelState.stage8.conversionFactor ?? '—'}
                                    </Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Individual / group split, hours per client:</Text>
                                    <Text style={styles.value}>
                                        {funnelState.stage6.pctIndividual === '' || funnelState.stage6.pctIndividual == null ? '—' : `${funnelState.stage6.pctIndividual}%`} individual ({funnelState.stage8.hoursIndividual ?? '—'}h / {funnelState.stage8.hoursGroup ?? '—'}h)
                                    </Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Implied delivering workforce (FTE) / Clients per FTE per year:</Text>
                                    <Text style={styles.value}>
                                        {funnelDisplay.stage8Capacity?.fte != null ? funnelDisplay.stage8Capacity.fte.toFixed(1) : '—'} / {funnelDisplay.stage8Capacity?.clientsPerFTE != null ? funnelDisplay.stage8Capacity.clientsPerFTE.toFixed(1) : '—'}
                                    </Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Estimated annual capacity:</Text>
                                    <Text style={styles.value}>{Number(funnelDisplay.capacityN).toLocaleString()}/yr</Text>
                                </View>
                                <View style={styles.inputItem}>
                                    <Text style={styles.label}>Capacity cap applied:</Text>
                                    <Text style={styles.value}>{funnelState.stage8.capacityCapApplied ? 'Yes' : 'No'}</Text>
                                </View>
                                {funnelDisplay.stage8Capacity?.sitesFilled && (
                                    <>
                                        <View style={styles.inputItem}>
                                            <Text style={styles.label}>
                                                Site capacity check ({funnelDisplay.stage8Capacity.siteMode === 'siteBySite' ? 'site-by-site' : 'program-level'}):
                                            </Text>
                                            <Text style={styles.value}>
                                                {funnelDisplay.stage8Capacity.siteMode === 'siteBySite'
                                                    ? (funnelState.stage8.siteGroups || [])
                                                        .filter((g) => g.count !== '' && g.count != null && g.clientsPerSite !== '' && g.clientsPerSite != null)
                                                        .map((g) => `${g.count} × ${g.clientsPerSite}/yr`)
                                                        .join(', ')
                                                    : `${funnelState.stage8.sites} sites × ${funnelState.stage8.clientsPerSite}/yr avg`}
                                                {' '}= {Math.round(funnelDisplay.stage8Capacity.siteCapacity).toLocaleString()}/yr total
                                            </Text>
                                        </View>
                                        <View style={styles.inputItem}>
                                            <Text style={styles.label}>Binding constraint:</Text>
                                            <Text style={styles.value}>{funnelDisplay.stage8Capacity.bindingArm === 'sites' ? 'Site capacity' : 'Workforce (facilitator) capacity'}</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>

                        <View style={styles.section} wrap={false}>
                            <Text style={styles.sectionTitle}>Inputs Recap</Text>
                            <FunnelRecapTable rows={funnelDisplay.funnelRows} bounds={stageInputBounds} stage6SplitSummary={getStage6SplitSummary(funnelState.stage6)} />
                            <Text style={[styles.value, { fontWeight: 'bold' }]}>
                                Effective demand: {Number(funnelDisplay.displayedEffectiveDemand).toLocaleString()}/yr
                                {funnelState.stage8.capacityCapApplied ? ' (capacity cap applied)' : ''}
                            </Text>
                        </View>

                        <View style={styles.section} wrap={false}>
                            <Text style={styles.sectionTitle}>Monte Carlo Simulation Results (Conservative / Moderate / Optimistic)</Text>
                            <ScenarioExplorerPdfTable startN={funnelDisplay.funnelInputN} scenario={funnelDisplay.scenario} />
                        </View>

                        <View style={styles.section} wrap={false}>
                            <Text style={styles.sectionTitle}>Funnel Plot (Moderate column)</Text>
                            <FunnelBarChart rows={funnelDisplay.scenario.moderate.rows} />
                        </View>

                    </>
                )}
            </Page>
        </Document>
    );
};

export default MyDocument;
