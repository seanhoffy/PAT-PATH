import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

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
});

// PDF Document Component
const MyDocument = ({ formData, results, actual, modelCreatedOn, calculatedAt }) => {
    if (!formData) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <Text>Loading...</Text>
                </Page>
            </Document>
        );
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.header}>PATpath Model Report</Text>
                </View>

                {/* General Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General Information</Text>
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoColumn}>
                                <Text style={styles.generalInfoLabel}>Model Title:</Text>
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
                <View style={styles.section}>
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
                <View style={styles.section}>
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
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Double Counting Adjustments</Text>
                    <View style={styles.inputGrid}>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Psychological Problems:</Text>
                            <Text style={styles.value}>{formData.psycological_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Health Conditions:</Text>
                            <Text style={styles.value}>{formData.health_P}%</Text>
                        </View>
                        <View style={styles.inputItem}>
                            <Text style={styles.label}>Lower Hepatic Impairment:</Text>
                            <Text style={styles.value}>{formData.comorbid_hepatic_P}%</Text>
                        </View>
                    </View>
                </View>

                {/* Results Section */}
                <View style={styles.section}>
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

                    {/* Actual demand estimates, if provided */}
                    {actual && (
                        <>
                            <Text style={styles.subtitle}>Calculated Demand Estimates</Text>
                            <View style={styles.resultsGrid}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.label}>MDD – Trial %:</Text>
                                    <Text style={styles.value}>
                                        {actual.percents?.trialMDD != null ? `${actual.percents.trialMDD}%` : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.resultItem}>
                                    <Text style={styles.label}>MDD – Real World %:</Text>
                                    <Text style={styles.value}>
                                        {actual.percents?.realMDD != null ? `${actual.percents.realMDD}%` : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.resultsGrid}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.label}>TRD – Trial %:</Text>
                                    <Text style={styles.value}>
                                        {actual.percents?.trialTRD != null ? `${actual.percents.trialTRD}%` : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.resultItem}>
                                    <Text style={styles.label}>TRD – Real World %:</Text>
                                    <Text style={styles.value}>
                                        {actual.percents?.realTRD != null ? `${actual.percents.realTRD}%` : 'N/A'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.resultsGrid}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.label}>Calculated MDD – Trial:</Text>
                                    <Text style={styles.value}>
                                        {actual.MDD?.trial != null
                                            ? actual.MDD.trial.toLocaleString()
                                            : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.resultItem}>
                                    <Text style={styles.label}>Calculated MDD – Real World:</Text>
                                    <Text style={styles.value}>
                                        {actual.MDD?.real != null
                                            ? actual.MDD.real.toLocaleString()
                                            : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.resultsGrid}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.label}>Calculated TRD – Trial:</Text>
                                    <Text style={styles.value}>
                                        {actual.TRD?.trial != null
                                            ? actual.TRD.trial.toLocaleString()
                                            : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.resultItem}>
                                    <Text style={styles.label}>Calculated TRD – Real World:</Text>
                                    <Text style={styles.value}>
                                        {actual.TRD?.real != null
                                            ? actual.TRD.real.toLocaleString()
                                            : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </Page>
        </Document>
    );
};

export default MyDocument;
