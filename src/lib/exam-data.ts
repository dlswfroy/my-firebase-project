'use client';
import {
  collection,
  getDocs,
  query,
  where,
  Firestore
} from 'firebase/firestore';

export interface Exam {
  id: string;
  name: string;
  academicYear: string;
  classes: string[];
}

export const EXAMS_COLLECTION = 'exams';

export const getExams = async (db: Firestore, academicYear: string): Promise<Exam[]> => {
    const q = query(collection(db, EXAMS_COLLECTION), where("academicYear", "==", academicYear));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
    } catch(e) {
        console.error("Error getting exams:", e);
        return [];
    }
}
