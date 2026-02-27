'use client';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface SchoolInfo {
  id?: string;
  name: string;
  nameEn?: string;
  eiin: string;
  code: string;
  address: string;
  logoUrl: string;
}

// আপনার অ্যাপের আইকন পরিবর্তন করতে নিচের লিঙ্কটি পরিবর্তন করুন। 
// অবশ্যই সরাসরি ছবির লিঙ্ক (Direct Image Link) ব্যবহার করুন।
export const APP_ICON_URL = 'https://i.postimg.cc/zvsNP6qY/IMG-20260218-WA0002.jpg';

export const defaultSchoolInfo: SchoolInfo = {
    name: 'টপ গ্রেড টিউটোরিয়ালস',
    nameEn: 'Top Grade Tutorials',
    eiin: '000000',
    code: '0000',
    address: 'আপনার প্রতিষ্ঠানের ঠিকানা এখানে লিখুন',
    logoUrl: APP_ICON_URL
};

const SCHOOL_INFO_DOC_PATH = 'school/info';

export const getSchoolInfo = async (db: Firestore): Promise<SchoolInfo> => {
    const docRef = doc(db, SCHOOL_INFO_DOC_PATH);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...defaultSchoolInfo, ...docSnap.data() } as SchoolInfo;
        } else {
            return defaultSchoolInfo;
        }
    } catch (e) {
        console.error("Error getting school info:", e);
        return defaultSchoolInfo;
    }
};

export const saveSchoolInfo = async (db: Firestore, info: Partial<SchoolInfo>): Promise<void> => {
  const docRef = doc(db, SCHOOL_INFO_DOC_PATH);
  const dataToSave = { ...info };
  if ('id' in dataToSave) {
    delete dataToSave.id;
  }

  return setDoc(docRef, dataToSave, { merge: true })
    .catch(async (serverError) => {
      console.error("Error saving school info:", serverError);
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: dataToSave,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError;
    });
};
