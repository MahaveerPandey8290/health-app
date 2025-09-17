import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration, loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Add a check to ensure the config is loaded
if (!firebaseConfig.apiKey) {
    throw new Error("Firebase configuration is missing. Please check your .env file.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database services
const db = getFirestore(app);
const rtdb = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, rtdb, auth, analytics };
