import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "jensenwoodworking-mass.firebaseapp.com",
  projectId: "jensenwoodworking-mass",
  storageBucket: "jensenwoodworking-mass.firebasestorage.app",
  messagingSenderId: "625142149100",
  appId: "1:625142149100:web:c25ff165f9ee7c24db5ac9",
  measurementId: "G-50N2XJ423S",
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Initialize Storage
export const storage: FirebaseStorage = getStorage(app);

// Initialize Auth
export const auth: Auth = getAuth(app);

// Initialize Analytics (only in browser)
export const analytics: Analytics | null = 
  typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

