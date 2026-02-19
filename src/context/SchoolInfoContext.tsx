'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { getSchoolInfo, saveSchoolInfo, SchoolInfo, defaultSchoolInfo } from '@/lib/school-info';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

type SchoolInfoContextType = {
  schoolInfo: SchoolInfo;
  updateSchoolInfo: (newInfo: Partial<SchoolInfo>) => Promise<void>;
  isLoading: boolean;
};

const SchoolInfoContext = createContext<SchoolInfoContextType | undefined>(undefined);

export function SchoolInfoProvider({ children }: { children: ReactNode }) {
  const db = useFirestore();
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(defaultSchoolInfo);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
        setIsLoading(false);
        return;
    };

    const docRef = doc(db, 'school', 'info');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            setSchoolInfo({ ...defaultSchoolInfo, ...docSnap.data() } as SchoolInfo);
        } else {
            // If the document doesn't exist, we can create it with default values
            saveSchoolInfo(db, defaultSchoolInfo).catch(console.error);
            setSchoolInfo(defaultSchoolInfo);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching school info:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const updateSchoolInfo = useCallback(async (newInfo: Partial<SchoolInfo>) => {
    if (!db) return Promise.reject("Firestore not initialized");
    const updatedInfo = { ...schoolInfo, ...newInfo };
    return saveSchoolInfo(db, updatedInfo);
    // The onSnapshot listener will update the state automatically
  }, [db, schoolInfo]);

  const value = useMemo(() => ({
    schoolInfo,
    updateSchoolInfo,
    isLoading
  }), [schoolInfo, updateSchoolInfo, isLoading]);

  return (
    <SchoolInfoContext.Provider value={value}>
      {children}
    </SchoolInfoContext.Provider>
  );
}

export function useSchoolInfo() {
  const context = useContext(SchoolInfoContext);
  if (context === undefined) {
    throw new Error('useSchoolInfo must be used within a SchoolInfoProvider');
  }
  return context;
}
