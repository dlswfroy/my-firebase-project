'use client';

import Image from 'next/image';
import { Student } from '@/lib/student-data';
import { SchoolInfo } from '@/lib/school-info';

interface AdmitCardProps {
    student: Student;
    schoolInfo: SchoolInfo;
    examName: string;
}

const toBengaliNumber = (str: string | number) => {
    if (!str && str !== 0) return '';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(str).replace(/[0-9]/g, (w) => bengaliDigits[parseInt(w, 10)]);
};

const classNamesMap: { [key: string]: string } = {
    '6': 'ষষ্ঠ', '7': 'সপ্তম', '8': 'অষ্টম', '9': 'নবম', '10': 'দশম',
};

export const AdmitCard = ({ student, schoolInfo, examName }: AdmitCardProps) => {
    return (
        <div className="admit-card font-kalpurush flex flex-col justify-between p-4 border-2 border-black rounded-lg w-full h-[130mm] text-black bg-white">
            <header className="text-center border-b-2 border-black pb-2">
                 <div className="flex justify-between items-center">
                    <div className="w-16 h-16 flex items-center justify-center">
                        {schoolInfo.logoUrl && <Image src={schoolInfo.logoUrl} alt="School Logo" width={64} height={64} className="object-contain" />}
                    </div>
                    <div className="text-center text-green-800">
                        <h1 className="text-2xl font-bold">{schoolInfo.name}</h1>
                        <p className="text-xs">{schoolInfo.address}</p>
                    </div>
                    <div className="w-16 h-16"></div>
                </div>
                <div className="mt-2 inline-block px-4 py-1 border-2 border-black rounded-full font-semibold text-lg">
                    প্রবেশ পত্র
                </div>
            </header>

            <main className="flex-grow my-4">
                <div className="grid grid-cols-[1fr,2fr] gap-x-6 gap-y-1 text-sm">
                    <div className="font-semibold">পরীক্ষার নাম</div>
                    <div>: {examName}</div>

                    <div className="font-semibold">শিক্ষার্থীর নাম</div>
                    <div>: {student.studentNameBn}</div>

                    <div className="font-semibold">পিতার নাম</div>
                    <div>: {student.fatherNameBn}</div>
                    
                    <div className="font-semibold">শ্রেণি</div>
                    <div>: {classNamesMap[student.className] || student.className}</div>
                    
                    <div className="font-semibold">রোল</div>
                    <div>: {toBengaliNumber(student.roll)}</div>

                    <div className="font-semibold">আইডি</div>
                    <div>: {student.generatedId ? toBengaliNumber(student.generatedId) : '-'}</div>

                </div>
            </main>
            
            <aside className="absolute right-6 top-24">
                {student.photoUrl && <Image src={student.photoUrl} alt="Student Photo" width={80} height={100} className="border-2 border-black object-cover" />}
            </aside>
            
            <footer className="mt-auto flex justify-between items-end">
                <div className="text-xs">
                    <p>পরীক্ষার নিয়মাবলী:</p>
                    <ul className="list-decimal list-inside text-gray-700">
                        <li>পরীক্ষা শুরুর ৩০ মিনিট পূর্বে আসনে বসতে হবে।</li>
                        <li>কোনো প্রকার অবৈধ কাগজপত্র বা ইলেকট্রনিক ডিভাইস আনা যাবে না।</li>
                    </ul>
                </div>
                <div className="text-center">
                    <div className="w-48 border-t-2 border-dotted border-black pt-2">
                        <p className="font-semibold">প্রধান শিক্ষকের স্বাক্ষর</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
