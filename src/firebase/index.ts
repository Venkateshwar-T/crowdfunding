import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFirebaseConfig } from './config';

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

function initializeFirebase() {
  if (typeof window !== 'undefined' && !firebaseApp) {
    if (getApps().length === 0) {
      const firebaseConfig = getFirebaseConfig();
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApps()[0];
    }
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}

export { 
    initializeFirebase, 
    useAuth, 
    useFirebaseApp, 
    useFirestore, 
    useUser 
};

export { FirebaseAuthProvider, FirebaseProvider } from './provider';

import { useAuth, useFirebaseApp, useFirestore } from './provider';
import { useUser } from './auth/use-user';
