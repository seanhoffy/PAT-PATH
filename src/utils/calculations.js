import { CALCULATION_CONSTANTS } from '../constants/calculations';

/**
 * Calculate trial results (24% of MDD and TRD)
 */
export const calculateTrialResults = (MDD, TRD) => {
    return {
        MDD: MDD * CALCULATION_CONSTANTS.TRIAL_PERCENTAGE,
        TRD: TRD * CALCULATION_CONSTANTS.TRIAL_PERCENTAGE,
    };
};

/**
 * Calculate real world exclusion percentage
 */
export const calculateRealExclusionPercentage = (formData) => {
    return Math.round(
        formData.manic_P +
        formData.suicide_P +
        formData.diabetes_P +
        formData.stroke_P +
        formData.heart_attack_P +
        formData.blood_pressure_P +
        formData.epilepsy_P +
        formData.personality_P +
        formData.hepatic_P
    );
};

/**
 * Calculate comorbid exclusion percentage
 */
export const calculateComorbidExclusionPercentage = (formData) => {
    return Math.round(
        formData.psycological_P +
        formData.health_P +
        formData.epilepsy_P +
        formData.personality_P +
        formData.comorbid_hepatic_P
    );
};

/**
 * Calculate real world results (after exclusion criteria)
 */
export const calculateRealWorldResults = (MDD, TRD, exclusionPercentage) => {
    const percentage = exclusionPercentage / CALCULATION_CONSTANTS.PERCENTAGE_DIVISOR;
    return {
        MDD: MDD * (1 - percentage),
        TRD: TRD * (1 - percentage),
    };
};

/**
 * Calculate all results from form data
 */
export const calculateAllResults = (formData) => {
    // Trial results
    const trialResults = calculateTrialResults(formData.MDD, formData.TRD);

    // Real world exclusion percentages
    const real_P = calculateRealExclusionPercentage(formData);
    const comorbid_p = calculateComorbidExclusionPercentage(formData);

    // Real world results
    const realResults = calculateRealWorldResults(formData.MDD, formData.TRD, real_P);
    const comorbidResults = calculateRealWorldResults(formData.MDD, formData.TRD, comorbid_p);

    return {
        trial: {
            MDD: trialResults.MDD.toFixed(0),
            TRD: trialResults.TRD.toFixed(0),
        },
        real: {
            MDD: realResults.MDD.toFixed(0),
            TRD: realResults.TRD.toFixed(0),
        },
        comorbid: {
            MDD: comorbidResults.MDD.toFixed(0),
            TRD: comorbidResults.TRD.toFixed(0),
        },
    };
};

/**
 * Format results for model storage
 */
export const formatResultsForModel = (results) => {
    return [
        results.trial.MDD,
        results.trial.TRD,
        results.real.MDD,
        results.real.TRD,
        results.comorbid.MDD,
        results.comorbid.TRD,
    ];
};

/**
 * Scroll to the top of the results section (the 2x2 grid) with smooth
 * behavior. Named scrollToBottom historically because the results section
 * used to be the end of the page; the Stages 4-9 funnel now extends well
 * below it, so scrolling to actual document bottom would skip past results.
 */
export const scrollToBottom = () => {
    setTimeout(() => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, CALCULATION_CONSTANTS.SCROLL_DELAY_MS);
};

