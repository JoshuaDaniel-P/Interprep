import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { logger } from "./logger";

const serverFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "preppilot-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "preppilot-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "preppilot-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

const SERVER_APP_NAME = "[SERVER_DEFAULT]";

/**
 * Singleton getter for the Server-side Firebase App.
 * Ensures only ONE default server app is created, eliminating
 * "app already exists" or duplicate instance errors across Next.js API routes.
 */
export function getServerFirebaseApp(): FirebaseApp {
  const existingApps = getApps();
  const found = existingApps.find((app) => app.name === SERVER_APP_NAME || app.name === "[DEFAULT]");
  if (found) {
    return found;
  }

  try {
    return initializeApp(serverFirebaseConfig, SERVER_APP_NAME);
  } catch (err: any) {
    if (err?.code === "app/duplicate-app") {
      return getApp(SERVER_APP_NAME);
    }
    logger.error("Failed to initialize server Firebase app", "serverFirebase", err);
    throw err;
  }
}

/**
 * Singleton getter for Server-side Firebase Auth
 */
export function getServerAuth(): Auth {
  const app = getServerFirebaseApp();
  return getAuth(app);
}

/**
 * Singleton getter for Server-side Firestore
 */
export function getServerDb(): Firestore {
  const app = getServerFirebaseApp();
  return getFirestore(app);
}

/**
 * Safely execute an operation within an isolated temporary Firebase App
 * (useful for creating users via client SDK on the server without polluting sessions).
 * Automatically handles creation and guaranteed cleanup/teardown.
 */
export async function withIsolatedServerAuth<T>(
  callback: (auth: Auth) => Promise<T>
): Promise<T> {
  const tempAppName = `isolated-auth-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let tempApp: FirebaseApp | null = null;

  try {
    tempApp = initializeApp(serverFirebaseConfig, tempAppName);
    const auth = getAuth(tempApp);
    return await callback(auth);
  } finally {
    if (tempApp) {
      try {
        await deleteApp(tempApp);
      } catch (cleanupErr) {
        logger.warn("Isolated Firebase app cleanup warning", "serverFirebase", { tempAppName }, cleanupErr);
      }
    }
  }
}
