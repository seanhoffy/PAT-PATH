import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAZrHT2FhNDw8y3OhsHcUOJ-qjl9YD9nz8",
    authDomain: "psil-at-app.firebaseapp.com",
    projectId: "psil-at-app",
    storageBucket: "psil-at-app.firebasestorage.app",
    messagingSenderId: "9255080245",
    appId: "1:9255080245:web:e4e6a46d3c7de6dc987c7c",
    measurementId: "G-BZDFGS7464"
};

const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const requestPasswordReset = async (email) => {
    if (!email) throw new Error('Missing email.');
    return sendPasswordResetEmail(auth, email);
};