'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirebase } from './';

type FirebaseContextValue = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
    const { firebaseApp, auth, firestore } = initializeFirebase();

    return (
        <FirebaseContext.Provider value={{ firebaseApp: firebaseApp || null, auth: auth || null, firestore: firestore || null }}>
        {children}
        </FirebaseContext.Provider>
    );
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
    const [auth, setAuth] = useState<Auth | null>(null);
    const [firestore, setFirestore] = useState<Firestore | null>(null);

    useEffect(() => {
        const { firebaseApp, auth, firestore } = initializeFirebase();
        setFirebaseApp(firebaseApp || null);
        setAuth(auth || null);
        setFirestore(firestore || null);
    }, []);

  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}


export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext)?.firebaseApp;
export const useAuth = () => useContext(FirebaseContext)?.auth;
export const useFirestore = () => useContext(FirebaseContext)?.firestore;
