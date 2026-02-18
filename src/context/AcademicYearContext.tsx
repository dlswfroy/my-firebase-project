'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { getStudents } from '@/lib/student-data';

type AcademicYearContextType = {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
};

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export function AcademicYearProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
      if(isClient) {
        const allStudents = getStudents();
        const years = [...new Set(allStudents.map(s => s.academicYear))];
        const currentYear = new Date().getFullYear().toString();
        if (!years.includes(currentYear)) {
            years.push(currentYear);
        }
        years.sort((a, b) => parseInt(b) - parseInt(a));
        setAvailableYears(years);
        if (!years.includes(selectedYear)) {
            setSelectedYear(currentYear);
        }
      }
  }, [isClient, selectedYear]);

  const value = useMemo(() => ({
    selectedYear,
    setSelectedYear,
    availableYears,
  }), [selectedYear, availableYears]);

  return (
    <AcademicYearContext.Provider value={value}>
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (context === undefined) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
}
