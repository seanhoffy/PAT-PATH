import { STRING_FIELD_NAMES, EXCLUSION_CRITERIA_FIELDS } from '../constants/formFields';

/**
 * Check if a field name is a string field
 */
export const isStringField = (fieldName) => {
    return STRING_FIELD_NAMES.includes(fieldName);
};

/**
 * Validate form data before submission
 */
export const validateFormData = (formData) => {
    // Validate required text fields
    if (!formData.modelTitle || formData.modelTitle.trim() === '') {
        return { isValid: false, message: 'Please fill out the required field: Organization.' };
    }
    if (!formData.geographicArea || formData.geographicArea.trim() === '') {
        return { isValid: false, message: 'Please fill out the required field: Geographic Area.' };
    }
    if (!formData.motivation || formData.motivation.trim() === '') {
        return { isValid: false, message: 'Please fill out the required field: Scenario.' };
    }

    // Validate required numerical fields (allow 0 as valid, but not null/undefined)
    if (formData.MDD === null || formData.MDD === undefined) {
        return { isValid: false, message: 'Please fill out the required field: Adults with MDD.' };
    }
    if (formData.TRD_P === null || formData.TRD_P === undefined) {
        return { isValid: false, message: 'Please fill out the required field: Percentage With TRD.' };
    }

    // Validate all exclusion criteria fields
    for (const [key, label] of EXCLUSION_CRITERIA_FIELDS) {
        if (formData[key] === null || formData[key] === undefined) {
            return { isValid: false, message: `Please fill out the required field: ${label}.` };
        }
    }

    return { isValid: true };
};

