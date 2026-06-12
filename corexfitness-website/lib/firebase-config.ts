export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB1uL1h2VTHnh8PD2mRelWDk01QsaMuS4A",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:29883684235:web:508824fb5b216bf7778b8e",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "corexfitness.firebaseapp.com",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GBZP1PYB52",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "29883684235",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "corexfitness",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "corexfitness.firebasestorage.app"
};

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}
