"use client";

import { getAnalytics, isSupported } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase-config";

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);

let firebaseBootPromise: Promise<void> | null = null;

export function bootFirebaseClient() {
  if (!isFirebaseConfigured()) return Promise.resolve();
  firebaseBootPromise ??= Promise.all([startFirebaseAuth(), startFirebaseAnalytics()]).then(() => undefined);
  return firebaseBootPromise;
}

async function startFirebaseAuth() {
  try {
    await setPersistence(firebaseAuth, browserLocalPersistence);
    if (!firebaseAuth.currentUser) {
      await signInAnonymously(firebaseAuth);
    }
  } catch {
    // Keep the website usable if anonymous auth is not enabled yet in Firebase Console.
  }
}

async function startFirebaseAnalytics() {
  try {
    if (await isSupported()) {
      getAnalytics(firebaseApp);
    }
  } catch {
    // Analytics is optional and should never block page rendering.
  }
}
