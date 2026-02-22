'use client';
import { ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

// Singleton instances to prevent re-initialization
let app: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let auth: Auth | undefined;

// Initialize Firebase on the client-side only
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  firestore = getFirestore(app);
  auth = getAuth(app);
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const instances = useMemo(() => {
    if (!app || !firestore || !auth) {
        return null;
    }
    return { app, firestore, auth };
  }, []);

  if (!instances) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      app={instances.app}
      firestore={instances.firestore}
      auth={instances.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
