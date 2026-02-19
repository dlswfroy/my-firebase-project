'use client';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  Firestore,
  DocumentData,
  WithFieldValue,
  getDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type MonthlyFee = {
  month: string;
  collectionDate?: Date;
  tuitionCurrent?: number;
  tuitionAdvance?: number;
  tuitionDue?: number;
  tuitionFine?: number;
  examFeeHalfYearly?: number;
  examFeeAnnual?: number;
  examFeePreNirbachoni?: number;
  examFeeNirbachoni?: number;
  sessionFee?: number;
  admissionFee?: number;
  scoutFee?: number;
  developmentFee?: number;
  libraryFee?: number;
  tiffinFee?: number;
};

export type FeeCollection = {
  id: string; // studentId_academicYear
  studentId: string;
  academicYear: string;
  monthlyFees: { [month: string]: MonthlyFee };
  // Firestore specific fields
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type NewFeeCollectionData = Omit<FeeCollection, 'id' | 'createdAt' | 'updatedAt'>;

const FEE_COLLECTION_PATH = 'feeCollections';

export const getFeeCollectionForStudent = async (db: Firestore, studentId: string, academicYear: string): Promise<FeeCollection | undefined> => {
  const docId = `${studentId}_${academicYear}`;
  const docRef = doc(db, FEE_COLLECTION_PATH, docId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      // Convert Timestamps back to Dates
      for (const month in data.monthlyFees) {
        if (data.monthlyFees[month].collectionDate) {
          data.monthlyFees[month].collectionDate = data.monthlyFees[month].collectionDate.toDate();
        }
      }
      return { id: docSnap.id, ...data } as FeeCollection;
    }
    return undefined;
  } catch (e) {
    console.error("Error getting fee collection:", e);
    return undefined;
  }
};

export const saveFeeCollection = async (db: Firestore, feeData: NewFeeCollectionData) => {
  const docId = `${feeData.studentId}_${feeData.academicYear}`;
  const docRef = doc(db, FEE_COLLECTION_PATH, docId);

  // Create a new monthlyFees object for Firestore to avoid mutating component state
  const monthlyFeesForFirestore: { [month: string]: any } = {};
  for (const month in feeData.monthlyFees) {
    // Make a copy of the month's data
    const monthData = { ...feeData.monthlyFees[month] };

    // Convert Date to Timestamp if it exists
    if (monthData.collectionDate) {
      monthData.collectionDate = Timestamp.fromDate(monthData.collectionDate as Date);
    }
    
    // Clean undefined/null/NaN values from the copy
    Object.keys(monthData).forEach((key) => {
      const value = (monthData as any)[key];
      if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) {
        delete (monthData as any)[key];
      }
    });

    if (Object.keys(monthData).length > 1 || (Object.keys(monthData).length === 1 && monthData.month)) {
        monthlyFeesForFirestore[month] = monthData;
    }
  }

  const dataToSave: WithFieldValue<DocumentData> = {
    studentId: feeData.studentId,
    academicYear: feeData.academicYear,
    monthlyFees: monthlyFeesForFirestore,
    updatedAt: serverTimestamp(),
  };

  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Document exists, update it
      return updateDoc(docRef, dataToSave).catch(async (serverError) => {
        console.error("Error updating fee collection:", serverError);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });
    } else {
      // Document does not exist, create it
      dataToSave.createdAt = serverTimestamp();
      return setDoc(docRef, dataToSave).catch(async (serverError) => {
        console.error("Error creating fee collection:", serverError);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });
    }
  } catch (error) {
    console.error("Error checking document existence:", error);
    throw error;
  }
};
