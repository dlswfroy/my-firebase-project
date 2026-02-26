'use client';
import {
  collection,
  getDocs,
  query,
  where,
  Firestore,
  doc,
  writeBatch
} from 'firebase/firestore';

export interface Exam {
  id: string;
  name: string;
  academicYear: string;
  classes: string[];
}

export const EXAMS_COLLECTION = 'exams';

export const createInitialExams = async (db: Firestore, academicYear: string): Promise<Exam[]> => {
    const defaultExams = [
        { name: 'অর্ধ-বার্ষিক পরীক্ষা', classes: ['6', '7', '8', '9', '10'] },
        { name: 'বার্ষিক পরীক্ষা', classes: ['6', '7', '8', '9', '10'] },
        { name: 'প্রাক-নির্বাচনী পরীক্ষা', classes: ['10'] },
        { name: 'নির্বাচনী পরীক্ষা', classes: ['10'] },
    ];

    const batch = writeBatch(db);
    const examsWithIds: Exam[] = [];

    defaultExams.forEach(exam => {
        const docRef = doc(collection(db, EXAMS_COLLECTION));
        const examData = {
            ...exam,
            academicYear: academicYear
        };
        batch.set(docRef, examData);
        examsWithIds.push({ id: docRef.id, ...examData });
    });

    try {
        await batch.commit();
        return examsWithIds;
    } catch (e) {
        // Silently fail if not admin - this prevents the black error popup for teachers
        console.warn("Could not seed initial exams. This is normal if you are not an admin.");
        return defaultExams.map((e, idx) => ({ id: `temp-${idx}`, ...e, academicYear }));
    }
}

export const getExams = async (db: Firestore, academicYear: string): Promise<Exam[]> => {
    const q = query(collection(db, EXAMS_COLLECTION), where("academicYear", "==", academicYear));
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return await createInitialExams(db, academicYear);
        }
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
    } catch(e) {
        console.error("Error getting exams:", e);
        return [];
    }
}
