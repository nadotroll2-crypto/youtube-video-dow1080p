import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// We'll try to import the config, but fallback if it's not present yet
let firebaseConfig = {};

try {
  // @ts-ignore
  import config from '../../firebase-applet-config.json';
  firebaseConfig = config;
} catch (e) {
  console.warn("Firebase config not found. Please run set_up_firebase and accept the terms.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// @ts-ignore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default app;
