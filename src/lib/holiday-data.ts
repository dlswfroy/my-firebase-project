'use client';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  Firestore,
  where,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface Holiday {
  id: string; // Firestore doc ID
  date: string; // YYYY-MM-DD
  description: string;
}

export type NewHolidayData = Omit<Holiday, 'id'>;

const HOLIDAYS_COLLECTION_PATH = 'holidays';

export const getHolidays = async (db: Firestore): Promise<Holiday[]> => {
  const holidaysQuery = query(
    collection(db, HOLIDAYS_COLLECTION_PATH),
    orderBy('date')
  );
  try {
    const querySnapshot = await getDocs(holidaysQuery);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Holiday)
    );
  } catch (e) {
    console.error('Error getting holidays:', e);
    return [];
  }
};

export const addHoliday = async (db: Firestore, holidayData: NewHolidayData) => {
  const holidaysCollection = collection(db, HOLIDAYS_COLLECTION_PATH);
  // Check for duplicates before adding
  const q = query(holidaysCollection, where('date', '==', holidayData.date));
  const existing = await getDocs(q);
  if (!existing.empty) {
    console.log('Holiday for this date already exists.');
    return null; // Or throw an error
  }

  return addDoc(holidaysCollection, holidayData).catch(async (serverError) => {
    console.error('Error adding holiday:', serverError);
    const permissionError = new FirestorePermissionError({
      path: HOLIDAYS_COLLECTION_PATH,
      operation: 'create',
      requestResourceData: holidayData,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
};

export const deleteHoliday = async (db: Firestore, id: string): Promise<void> => {
  const docRef = doc(db, HOLIDAYS_COLLECTION_PATH, id);
  return deleteDoc(docRef).catch(async (serverError) => {
    console.error('Error deleting holiday:', serverError);
    const permissionError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw permissionError;
  });
};

export const isHoliday = async (
  db: Firestore,
  date: string
): Promise<Holiday | undefined> => {
  const holidaysCollection = collection(db, HOLIDAYS_COLLECTION_PATH);
  const q = query(holidaysCollection, where('date', '==', date));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Holiday;
  }
  return undefined;
};
