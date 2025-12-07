
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirebaseConfig } from './config';

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let storage: FirebaseStorage | undefined;

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
    storage = getStorage(firebaseApp);
  }
  return { firebaseApp, auth, firestore, storage };
}

export { 
    initializeFirebase, 
    useAuth, 
    useFirebaseApp, 
    useFirestore, 
    useStorage,
    useUser 
};

export { FirebaseAuthProvider, FirebaseProvider } from './provider';

import { useAuth, useFirebaseApp, useFirestore, useStorage } from './provider';
import { useUser } from './auth/use-user';
