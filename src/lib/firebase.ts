import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration with placeholder values
const firebaseConfig = {
  "projectId": "featherfind-mf7x1",
  "appId": "1:1037568735635:web:74688b9d8e5abd50011066",
  "storageBucket": "featherfind-mf7x1.firebasestorage.app",
  "apiKey": "AIzaSyARzWAauCc_ggCMhj1PdEQ-fX4tOdDp_98",
  "authDomain": "featherfind-mf7x1.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1037568735635"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
