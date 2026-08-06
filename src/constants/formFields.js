// String field names that should be treated as text inputs
export const STRING_FIELD_NAMES = ['modelTitle', 'geographicArea', 'motivation', 'additionalComments'];

// Exclusion criteria field definitions
export const EXCLUSION_CRITERIA_FIELDS = [
    ['manic_P', 'Psychotic or Manic Disorder'],
    ['suicide_P', 'Suicide Attempt in the Past Year'],
    ['diabetes_P', 'Diabetes (uncontrolled)'],
    ['stroke_P', 'Stroke'],
    ['heart_attack_P', 'Heart Attack in the Last Year'],
    ['blood_pressure_P', 'Treatment-Resistant Blood Pressure'],
    ['epilepsy_P', 'Epilepsy'],
    ['personality_P', 'Personality Disorder'],
    ['hepatic_P', 'Hepatic Impairment'],
];

// Double counting adjustment fields
export const DOUBLE_COUNTING_FIELDS = [
    ['psycological_P', 'Psychological Disorders (Mania, Suicide)'],
    ['health_P', 'Health Conditions (Diabetes, Stroke, Heart Attack, BP+)'],
    ['comorbid_hepatic_P', 'Hepatic Impairments'],
];

