import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

function getFirebaseServices() {
    if (typeof window === 'undefined') {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        auth = getAuth(app);
        db = getFirestore(app);
    }
    return { app, auth, db };
}

export { getFirebaseServices };