import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = (): boolean => {
  return (
    typeof firebaseConfig.apiKey === "string" &&
    firebaseConfig.apiKey.length > 10 &&
    !firebaseConfig.apiKey.includes("your-firebase") &&
    typeof firebaseConfig.projectId === "string" &&
    firebaseConfig.projectId.length > 0 &&
    !firebaseConfig.projectId.includes("your-project")
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

if (typeof window !== "undefined" || process.env.NODE_ENV !== "test") {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      firestore = getFirestore(app);
    } catch (err) {
      console.warn("Failed to initialize Firebase app:", err);
    }
  }
}

export { app, auth, firestore, firebaseConfig };
