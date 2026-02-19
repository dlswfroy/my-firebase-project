'use client';

import Image from 'next/image';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Student } from '@/lib/student-data';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query, where, orderBy, FirestoreError } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AccountsPage() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedYear } = useAcademicYear();
  const db = useFirestore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!db) return;
    setIsLoading(true);

    const studentsQuery = query(
      collection(db, "students"), 
      orderBy("roll")
    );

    const unsubscribe = onSnapshot(studentsQuery, (querySnapshot) => {
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dob: doc.data().dob?.toDate(),
      })) as Student[];
      setAllStudents(studentsData);
      setIsLoading(false);
    }, async (error: FirestoreError) => {
      const permissionError = new FirestorePermissionError({
        path: 'students',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const studentsForYear = useMemo(() => {
    return allStudents.filter(student => student.academicYear === selectedYear);
  }, [allStudents, selectedYear]);

  const classes = ['6', '7', '8', '9', '10'];
  const classNamesMap: { [key: string]: string } = {
    '6': '৬ষ্ঠ', '7': '৭ম', '8': '৮ম', '9': '৯ম', '10': '১০ম',
  };

  const getStudentsByClass = (className: string): Student[] => {
    return studentsForYear.filter((student) => student.className === className);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
             <CardTitle>হিসাব শাখা - বেতন আদায়</CardTitle>
             <CardDescription>শ্রেণি নির্বাচন করে শিক্ষার্থীর বেতন ও অন্যান্য ফি আদায় করুন। শিক্ষাবর্ষ: {selectedYear.toLocaleString('bn-BD')}</CardDescription>
          </CardHeader>
          <CardContent>
             {isClient ? (
                <Tabs defaultValue="6">
                  <TabsList className="grid w-full grid-cols-5">
                    {classes.map((className) => (
                      <TabsTrigger key={className} value={className}>
                        {classNamesMap[className]} শ্রেণি
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {classes.map((className) => (
                    <TabsContent key={className} value={className}>
                      <Card>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>রোল</TableHead>
                                  <TableHead>শিক্ষার্থীর নাম</TableHead>
                                  <TableHead>পিতার নাম</TableHead>
                                  <TableHead className="text-right">কার্যক্রম</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {isLoading ? (
                                   <TableRow>
                                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                          লোড হচ্ছে...
                                      </TableCell>
                                   </TableRow>
                                ) : getStudentsByClass(className).length === 0 ? (
                                   <TableRow>
                                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                          এই শ্রেণিতে কোনো শিক্ষার্থী নেই।
                                      </TableCell>
                                   </TableRow>
                                ) : (
                                  getStudentsByClass(className).map((student) => (
                                  <TableRow key={student.id}>
                                    <TableCell>{student.roll.toLocaleString('bn-BD')}</TableCell>
                                    <TableCell className="whitespace-nowrap">{student.studentNameBn}</TableCell>
                                    <TableCell className="whitespace-nowrap">{student.fatherNameBn}</TableCell>
                                    <TableCell className="text-right">
                                      <Link href={`/collect-fee/${student.id}`}>
                                        <Button>বেতন আদায় করুন</Button>
                                      </Link>
                                    </TableCell>
                                  </TableRow>
                                 ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
             ) : (
                <div>
                  <div className="grid w-full grid-cols-5 h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-center"><Skeleton className="h-8 w-[80%]" /></div>
                    ))}
                  </div>
                  <div className="border rounded-md">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>রোল</TableHead>
                            <TableHead>শিক্ষার্থীর নাম</TableHead>
                            <TableHead>পিতার নাম</TableHead>
                            <TableHead className="text-right">কার্যক্রম</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                              <TableCell className="text-right">
                                <Skeleton className="h-10 w-32" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
             )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
