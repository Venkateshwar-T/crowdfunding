
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import { initializeFirebase } from './index';

type FirebaseContextValue = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
};

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  auth: null,
  firestore: null,
  storage: null,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
    const { firebaseApp, auth, firestore, storage } = initializeFirebase();

    return (
        <FirebaseContext.Provider value={{ firebaseApp: firebaseApp || null, auth: auth || null, firestore: firestore || null, storage: storage || null }}>
        {children}
        </FirebaseContext.Provider>
    );
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
    const [auth, setAuth] = useState<Auth | null>(null);
    const [firestore, setFirestore] = useState<Firestore | null>(null);
    const [storage, setStorage] = useState<FirebaseStorage | null>(null);

    useEffect(() => {
        const { firebaseApp, auth, firestore, storage } = initializeFirebase();
        setFirebaseApp(firebaseApp || null);
        setAuth(auth || null);
        setFirestore(firestore || null);
        setStorage(storage || null);
    }, []);

  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
}


export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext)?.firebaseApp;
export const useAuth = () => useContext(FirebaseContext)?.auth;
export const useFirestore = () => useContext(FirebaseContext)?.firestore;
export const useStorage = () => useContext(FirebaseContext)?.storage;
