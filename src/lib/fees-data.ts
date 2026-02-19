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

export interface MonthlyFee {
  month: string;
  collectionDate?: Date;
  tuitionCurrent?: number;
  tuitionAdvance?: number;
  tuitionDue?: number;
  tuitionFine?: number;
  examFeeHalfYearly?: number;
  examFeeAnnual?: number;
  examFeePre নির্বাচনী?: number;
  examFee নির্বাচনী?: number;
  sessionFee?: number;
  admissionFee?: number;
  scoutFee?: number;
  developmentFee?: number;
  libraryFee?: number;
  tiffinFee?: number;
}

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
  
  const dataToSave: WithFieldValue<DocumentData> = {
    ...feeData,
    updatedAt: serverTimestamp(),
  };

  // Convert Dates to Timestamps
  for (const month in dataToSave.monthlyFees) {
    if (dataToSave.monthlyFees[month].collectionDate) {
        dataToSave.monthlyFees[month].collectionDate = Timestamp.fromDate(dataToSave.monthlyFees[month].collectionDate);
    }
  }

  // Clean undefined values
  Object.keys(dataToSave.monthlyFees).forEach(month => {
    Object.keys(dataToSave.monthlyFees[month]).forEach(key => {
        if (dataToSave.monthlyFees[month][key] === undefined || dataToSave.monthlyFees[month][key] === null || (typeof dataToSave.monthlyFees[month][key] === 'number' && isNaN(dataToSave.monthlyFees[month][key]))) {
            delete dataToSave.monthlyFees[month][key];
        }
    });
  });

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
