
'use client';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  Firestore,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface StudentResult {
  studentId: string;
  written?: number;
  mcq?: number;
  practical?: number;
}

export interface ClassResult {
  id?: string;
  academicYear: string;
  className: string;
  group?: string;
  subject: string;
  fullMarks: number;
  results: StudentResult[];
}

const resultsCollection = 'results';

export const getDocumentId = (result: Omit<ClassResult, 'results' | 'fullMarks' | 'id'>): string => {
    // Sanitize subject name for Firestore document ID. Allow letters and numbers from any language.
    const sanitizedSubject = result.subject.replace(/[^\p{L}\p{N}]+/gu, '-');
    return `${result.academicYear}_${result.className}_${result.group || 'none'}_${sanitizedSubject}`;
}

export const saveClassResults = async (db: Firestore, newResult: ClassResult) => {
  const docId = getDocumentId(newResult);
  const docRef = doc(db, resultsCollection, docId);
  
  const dataToSave: { [key: string]: any } = { ...newResult };
  delete dataToSave.id;

  // Clean up top-level undefined properties and nested ones in the results array
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key];
    }
  });

  if (dataToSave.results && Array.isArray(dataToSave.results)) {
    dataToSave.results = dataToSave.results.map((studentResult: StudentResult) => {
      const cleanedResult: { [key: string]: any } = {};
      Object.keys(studentResult).forEach((keyStr) => {
        const key = keyStr as keyof StudentResult;
        if (studentResult[key] !== undefined && studentResult[key] !== null) {
          cleanedResult[key] = studentResult[key];
        }
      });
      return cleanedResult;
    });
  }

  return setDoc(docRef, dataToSave, { merge: true })
    .catch(async (serverError) => {
      console.error("Error saving results:", serverError);
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
};

export const getResultsForClass = async (
  db: Firestore,
  academicYear: string,
  className: string,
  subject: string,
  group?: string
): Promise<ClassResult | undefined> => {
    const docId = getDocumentId({ academicYear, className, subject, group });
    const docRef = doc(db, resultsCollection, docId);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as ClassResult;
            if (data.subject === 'ধর্ম শিক্ষা') {
                return { ...data, subject: 'ধর্ম ও নৈতিক শিক্ষা' };
            }
            return data;
        }
        return undefined;
    } catch(e) {
        console.error("Error getting results by ID:", e);
        return undefined;
    }
};

export const getAllResults = async (db: Firestore, academicYear: string): Promise<ClassResult[]> => {
    const q = query(collection(db, resultsCollection), where("academicYear", "==", academicYear));
    try {
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassResult));
        return results.map(res => {
            if (res.subject === 'ধর্ম শিক্ষা') {
                return { ...res, subject: 'ধর্ম ও নৈতিক শিক্ষা' };
            }
            return res;
        });
    } catch (e) {
        console.error("Error getting all results:", e);
        return [];
    }
};

export const deleteClassResult = async (db: Firestore, id: string): Promise<void> => {
    const docRef = doc(db, resultsCollection, id);
    return deleteDoc(docRef)
    .catch(async (serverError) => {
        console.error("Error deleting result:", serverError);
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
