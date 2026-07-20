import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fetch user model from Firestore
 */
export const fetchUserModel = async (userId) => {
    if (!userId) return null;
    
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().model || [];
        }
        return null;
    } catch (error) {
        console.error('Error fetching model:', error);
        return null;
    }
};

/**
 * Update user model in Firestore
 */
export const updateUserModel = async (userId, model) => {
    if (!userId || !model) return;
    
    try {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, { model });
        console.log('Model updated in Firestore:', model);
    } catch (error) {
        console.error('Error updating model:', error);
    }
};

/**
 * Fetch saved models for a user
 */
export const fetchSavedModels = async (userId) => {
    if (!userId) return [];

    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().savedModels || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching saved models:', error);
        return [];
    }
};

/**
 * Normalize a value for comparison (convert strings to numbers where appropriate, handle null/undefined)
 */
const normalizeValue = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    // Try to convert string numbers to actual numbers for comparison
    if (typeof value === 'string' && !isNaN(value) && !isNaN(parseFloat(value))) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? value : parsed;
    }
    // Handle numbers - convert to fixed precision for comparison (avoid floating point issues)
    if (typeof value === 'number') {
        // For integers, return as-is; for floats, round to 6 decimal places
        return Number.isInteger(value) ? value : Math.round(value * 1000000) / 1000000;
    }
    return value;
};

/**
 * Normalize an object for comparison by normalizing all values and sorting keys
 */
const normalizeObject = (obj) => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return normalizeValue(obj);
    if (Array.isArray(obj)) return obj.map(normalizeObject);
    
    const normalized = {};
    // Sort keys for consistent comparison
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        normalized[key] = normalizeObject(obj[key]);
    }
    return normalized;
};

/**
 * Check if a model is a duplicate of an existing saved model
 * Compares inputs and outputs, excluding metadata (title, geographicArea, motivation, additionalComments)
 */
export const isModelDuplicate = async (userId, currentFormData, currentResults, currentFunnel) => {
    if (!userId || !currentFormData || !currentResults) return false;

    try {
        const savedModels = await fetchSavedModels(userId);
        if (savedModels.length === 0) return false;

        // Fields to exclude from comparison (metadata fields)
        const metadataFields = ['modelTitle', 'geographicArea', 'motivation', 'additionalComments'];

        // Extract comparable input fields (exclude metadata)
        const currentInputs = { ...currentFormData };
        metadataFields.forEach(field => delete currentInputs[field]);

        // Extract outputs to compare (exclude actual field)
        const currentOutputs = { ...currentResults };
        delete currentOutputs.actual;

        // Normalize current data for comparison
        const normalizedCurrentInputs = normalizeObject(currentInputs);
        const normalizedCurrentOutputs = normalizeObject(currentOutputs);
        const normalizedCurrentFunnel = normalizeObject(currentFunnel || null);

        // Compare each saved model
        for (const savedModel of savedModels) {
            const savedInputs = savedModel.inputs || {};
            const savedOutputs = savedModel.outputs || {};

            // Extract comparable input fields from saved model
            const comparableSavedInputs = { ...savedInputs };
            metadataFields.forEach(field => delete comparableSavedInputs[field]);

            // Extract outputs to compare (exclude actual field)
            const comparableSavedOutputs = { ...savedOutputs };
            delete comparableSavedOutputs.actual;

            // Normalize saved data for comparison
            const normalizedSavedInputs = normalizeObject(comparableSavedInputs);
            const normalizedSavedOutputs = normalizeObject(comparableSavedOutputs);
            const normalizedSavedFunnel = normalizeObject(savedModel.funnel || null);

            // Compare inputs (deep comparison with normalized data)
            const inputsMatch = JSON.stringify(normalizedCurrentInputs) === JSON.stringify(normalizedSavedInputs);

            if (!inputsMatch) continue;

            // Compare outputs (deep comparison of trial, real, and comorbid)
            const outputsMatch = JSON.stringify(normalizedCurrentOutputs) === JSON.stringify(normalizedSavedOutputs);
            if (!outputsMatch) continue;

            // Compare Stages 4-9 funnel state
            const funnelMatch = JSON.stringify(normalizedCurrentFunnel) === JSON.stringify(normalizedSavedFunnel);

            if (funnelMatch) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Error checking for duplicate model:', error);
        return false;
    }
};

/**
 * Add a saved model for a user (max 10)
 */
export const addSavedModel = async (userId, modelPayload) => {
    if (!userId || !modelPayload) return { success: false, message: 'Missing data.' };

    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return { success: false, message: 'User not found.' };
        }

        const data = docSnap.data();
        const savedModels = data.savedModels || [];

        if (savedModels.length >= 10) {
            return { success: false, message: 'Limit reached: you can store up to 10 models.' };
        }

        // Check for duplicates
        const isDuplicate = await isModelDuplicate(userId, modelPayload.inputs, modelPayload.outputs, modelPayload.funnel);
        if (isDuplicate) {
            return { success: false, isDuplicate: true, message: 'This model was already saved.' };
        }

        const newEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: Date.now(),
            ...modelPayload,
        };

        const updated = [newEntry, ...savedModels];
        await updateDoc(docRef, { savedModels: updated });
        return { success: true, data: newEntry, isDuplicate: false };
    } catch (error) {
        console.error('Error adding saved model:', error);
        return { success: false, message: 'Failed to save model.' };
    }
};

/**
 * Delete a saved model by id
 */
export const deleteSavedModel = async (userId, modelId) => {
    if (!userId || !modelId) return { success: false, message: 'Missing data.' };

    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return { success: false, message: 'User not found.' };
        }

        const savedModels = docSnap.data().savedModels || [];
        const updated = savedModels.filter((m) => m.id !== modelId);

        await updateDoc(docRef, { savedModels: updated });
        return { success: true };
    } catch (error) {
        console.error('Error deleting saved model:', error);
        return { success: false, message: 'Failed to delete model.' };
    }
};

/**
 * Update a saved model by id
 */
export const updateSavedModel = async (userId, modelId, updatedModel) => {
    if (!userId || !modelId || !updatedModel) {
        return { success: false, message: 'Missing data.' };
    }

    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return { success: false, message: 'User not found.' };
        }

        const savedModels = docSnap.data().savedModels || [];
        const modelIndex = savedModels.findIndex((m) => m.id === modelId);

        if (modelIndex === -1) {
            return { success: false, message: 'Model not found.' };
        }

        // Preserve id and createdAt, update everything else
        const updated = [...savedModels];
        updated[modelIndex] = {
            ...updatedModel,
            id: modelId,
            createdAt: savedModels[modelIndex].createdAt, // Preserve original creation date
        };

        await updateDoc(docRef, { savedModels: updated });
        return { success: true };
    } catch (error) {
        console.error('Error updating saved model:', error);
        return { success: false, message: 'Failed to update model.' };
    }
};

/**
 * Fetch user profile fields
 */
export const fetchUserProfile = async (userId) => {
    if (!userId) return null;

    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        const data = docSnap.data();
        return {
            name: data.name || '',
            user_type: data.user_type || '',
            employer: data.employer || '',
            affiliation: data.affiliation || '',
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

/**
 * Fetch persisted form/results state for a user
 */
export const fetchUserFormState = async (userId) => {
    const empty = { currentForm: null, currentResults: null, currentActualPercents: null, currentModelCreatedOn: null, currentFunnelState: null, currentEditingModelId: null };
    if (!userId) return empty;

    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return empty;
        const data = docSnap.data();
        return {
            currentForm: data.currentForm ?? null,
            currentResults: data.currentResults ?? null,
            currentActualPercents: data.currentActualPercents ?? null,
            currentModelCreatedOn: data.currentModelCreatedOn ?? null,
            currentFunnelState: data.currentFunnelState ?? null,
            currentEditingModelId: data.currentEditingModelId ?? null,
        };
    } catch (error) {
        console.error('Error fetching user form state:', error);
        return empty;
    }
};

/**
 * Save persisted form/results state for a user
 */
export const saveUserFormState = async (userId, currentForm, currentResults, currentActualPercents, currentModelCreatedOn, currentFunnelState, currentEditingModelId) => {
    if (!userId) return;
    try {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, {
            currentForm: currentForm ?? null,
            currentResults: currentResults ?? null,
            currentActualPercents: currentActualPercents ?? null,
            currentModelCreatedOn: currentModelCreatedOn ?? null,
            currentFunnelState: currentFunnelState ?? null,
            currentEditingModelId: currentEditingModelId ?? null,
        });
    } catch (error) {
        console.error('Error saving user form state:', error);
    }
};

/**
 * Clear persisted form/results state for a user
 */
export const clearUserFormState = async (userId) => {
    if (!userId) return;
    try {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, {
            currentForm: null,
            currentResults: null,
            currentActualPercents: null,
            currentFunnelState: null,
            currentEditingModelId: null,
        });
    } catch (error) {
        console.error('Error clearing user form state:', error);
    }
};

