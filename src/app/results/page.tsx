
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from "@/hooks/use-toast";
import { useAcademicYear } from '@/context/AcademicYearContext';
import { getStudents, Student } from '@/lib/student-data';
import { getSubjects, Subject as SubjectType } from '@/lib/subjects';
import { saveClassResults, getResultsForClass, StudentResult } from '@/lib/results-data';

type Marks = {
    written?: number;
    mcq?: number;
    practical?: number;
}

export default function ResultsPage() {
    const { toast } = useToast();
    const { selectedYear } = useAcademicYear();
    
    const [className, setClassName] = useState('');
    const [group, setGroup] = useState('');
    const [subject, setSubject] = useState('');
    const [fullMarks, setFullMarks] = useState<number | undefined>(100);
    
    const [availableSubjects, setAvailableSubjects] = useState<SubjectType[]>([]);
    const [selectedSubjectInfo, setSelectedSubjectInfo] = useState<SubjectType | null>(null);

    const [students, setStudents] = useState<Student[]>([]);
    const [marks, setMarks] = useState<Map<number, Marks>>(new Map());

    useEffect(() => {
        if (className) {
            const subjects = getSubjects(className, group);
            setAvailableSubjects(subjects);
            setSubject(''); // Reset subject when class/group changes
            setSelectedSubjectInfo(null);
        } else {
            setAvailableSubjects([]);
        }
    }, [className, group]);

    useEffect(() => {
        if (subject) {
            const subInfo = availableSubjects.find(s => s.name === subject);
            setSelectedSubjectInfo(subInfo || null);
        } else {
            setSelectedSubjectInfo(null);
        }
    }, [subject, availableSubjects]);
    
    const handleLoadStudents = () => {
        if (!className || !subject) {
            toast({
                variant: 'destructive',
                title: 'তথ্য নির্বাচন করুন',
                description: 'অনুগ্রহ করে শ্রেণি এবং বিষয় নির্বাচন করুন।',
            });
            return;
        }

        const allStudents = getStudents();
        const filteredStudents = allStudents.filter(s => 
            s.academicYear === selectedYear && 
            s.className === className &&
            (className < '9' || !group || s.group === group)
        );
        setStudents(filteredStudents);

        const existingResults = getResultsForClass(selectedYear, className, subject, group);
        const initialMarks = new Map<number, Marks>();

        if (existingResults) {
            setFullMarks(existingResults.fullMarks);
            existingResults.results.forEach(res => {
                initialMarks.set(res.studentId, {
                    written: res.written,
                    mcq: res.mcq,
                    practical: res.practical
                });
            });
        }
        
        filteredStudents.forEach(student => {
            if (!initialMarks.has(student.id)) {
                initialMarks.set(student.id, { written: undefined, mcq: undefined, practical: undefined });
            }
        });

        setMarks(initialMarks);
    };

    const handleMarkChange = (studentId: number, field: keyof Marks, value: string) => {
        const numValue = value === '' ? undefined : parseInt(value, 10);
        const newMarks = new Map(marks);
        const studentMarks = newMarks.get(studentId) || {};
        studentMarks[field] = isNaN(numValue!) ? undefined : numValue;
        newMarks.set(studentId, studentMarks);
        setMarks(newMarks);
    };

    const handleSaveResults = () => {
        if (students.length === 0) {
            toast({
                variant: 'destructive',
                title: 'কোনো শিক্ষার্থী নেই',
                description: 'নম্বর সেভ করার জন্য কোনো শিক্ষার্থী পাওয়া যায়নি।',
            });
            return;
        }

        const resultsData: StudentResult[] = Array.from(marks.entries()).map(([studentId, marks]) => ({
            studentId,
            ...marks
        }));

        saveClassResults({
            academicYear: selectedYear,
            className,
            group: group || undefined,
            subject,
            fullMarks: fullMarks || 100,
            results: resultsData
        });

        toast({
            title: 'ফলাফল সেভ হয়েছে',
            description: `${subject} বিষয়ের নম্বর সফলভাবে সেভ করা হয়েছে।`
        });
    };

    const showGroupSelector = className === '9' || className === '10';

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>ফলাফল ও নম্বর ব্যবস্থাপনা</CardTitle>
                        <CardDescription>শ্রেণি, বিষয় ও শাখা অনুযায়ী শিক্ষার্থীদের পরীক্ষার নম্বর ইনপুট করুন।</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end p-4 border rounded-lg">
                            {/* Class Selector */}
                            <div className="space-y-2">
                                <Label htmlFor="class">শ্রেণি</Label>
                                <Select value={className} onValueChange={setClassName}>
                                    <SelectTrigger id="class"><SelectValue placeholder="শ্রেণি নির্বাচন" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="6">৬ষ্ঠ</SelectItem>
                                        <SelectItem value="7">৭ম</SelectItem>
                                        <SelectItem value="8">৮ম</SelectItem>
                                        <SelectItem value="9">৯ম</SelectItem>
                                        <SelectItem value="10">১০ম</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Group Selector */}
                            {showGroupSelector && (
                                <div className="space-y-2">
                                    <Label htmlFor="group">শাখা/গ্রুপ</Label>
                                    <Select value={group} onValueChange={setGroup}>
                                        <SelectTrigger id="group"><SelectValue placeholder="শাখা নির্বাচন" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="science">বিজ্ঞান</SelectItem>
                                            <SelectItem value="arts">মানবিক</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            
                            {/* Subject Selector */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">বিষয়</Label>
                                <Select value={subject} onValueChange={setSubject} disabled={!className}>
                                    <SelectTrigger id="subject"><SelectValue placeholder="বিষয় নির্বাচন" /></SelectTrigger>
                                    <SelectContent>
                                        {availableSubjects.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Full Marks Input */}
                            <div className="space-y-2">
                                <Label htmlFor="full-marks">পূর্ণমান</Label>
                                <Input 
                                    id="full-marks" 
                                    type="number" 
                                    placeholder="পূর্ণমান"
                                    value={fullMarks || ''}
                                    onChange={(e) => setFullMarks(e.target.value === '' ? undefined : parseInt(e.target.value))} 
                                />
                            </div>
                            
                            <Button onClick={handleLoadStudents} className="w-full">শিক্ষার্থী লোড করুন</Button>
                        </div>
                        
                        {students.length > 0 && (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>রোল</TableHead>
                                            <TableHead>শিক্ষার্থীর নাম</TableHead>
                                            <TableHead>লিখিত</TableHead>
                                            <TableHead>বহুনির্বাচনী</TableHead>
                                            {selectedSubjectInfo?.practical && <TableHead>ব্যবহারিক</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow key={student.id}>
                                                <TableCell>{student.roll.toLocaleString('bn-BD')}</TableCell>
                                                <TableCell>{student.studentNameBn}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        placeholder="নম্বর"
                                                        value={marks.get(student.id)?.written || ''}
                                                        onChange={(e) => handleMarkChange(student.id, 'written', e.target.value)}
                                                        className="w-24"
                                                    />
                                                </TableCell>
                                                 <TableCell>
                                                    <Input
                                                        type="number"
                                                        placeholder="নম্বর"
                                                        value={marks.get(student.id)?.mcq || ''}
                                                        onChange={(e) => handleMarkChange(student.id, 'mcq', e.target.value)}
                                                        className="w-24"
                                                    />
                                                </TableCell>
                                                {selectedSubjectInfo?.practical && (
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            placeholder="নম্বর"
                                                            value={marks.get(student.id)?.practical || ''}
                                                            onChange={(e) => handleMarkChange(student.id, 'practical', e.target.value)}
                                                            className="w-24"
                                                        />
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex justify-end p-4 mt-4 border-t">
                                    <Button onClick={handleSaveResults}>ফলাফল সেভ করুন</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
