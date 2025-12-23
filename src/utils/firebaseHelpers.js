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

        const newEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: Date.now(),
            ...modelPayload,
        };

        const updated = [newEntry, ...savedModels];
        await updateDoc(docRef, { savedModels: updated });
        return { success: true, data: newEntry };
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
    if (!userId) return { currentForm: null, currentResults: null, currentActualPercents: null };

    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return { currentForm: null, currentResults: null, currentActualPercents: null };
        const data = docSnap.data();
        return {
            currentForm: data.currentForm ?? null,
            currentResults: data.currentResults ?? null,
            currentActualPercents: data.currentActualPercents ?? null,
        };
    } catch (error) {
        console.error('Error fetching user form state:', error);
        return { currentForm: null, currentResults: null, currentActualPercents: null };
    }
};

/**
 * Save persisted form/results state for a user
 */
export const saveUserFormState = async (userId, currentForm, currentResults, currentActualPercents) => {
    if (!userId) return;
    try {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, {
            currentForm: currentForm ?? null,
            currentResults: currentResults ?? null,
            currentActualPercents: currentActualPercents ?? null,
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
        });
    } catch (error) {
        console.error('Error clearing user form state:', error);
    }
};

