'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ClassRoutineTab = () => {
    const [className, setClassName] = useState('');
    const [group, setGroup] = useState('');
    const showGroupSelector = className === '9' || className === '10';

    const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার"];
    const periods = ["১ম", "২য়", "৩য়", "৪র্থ", "৫ম", "৬ষ্ঠ"];

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                 <div className="space-y-2 flex-1">
                    <Label htmlFor="class">শ্রেণি</Label>
                    <Select value={className} onValueChange={setClassName}>
                        <SelectTrigger id="class"><SelectValue placeholder="শ্রেণি নির্বাচন করুন" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="6">৬ষ্ঠ</SelectItem>
                            <SelectItem value="7">৭ম</SelectItem>
                            <SelectItem value="8">৮ম</SelectItem>
                            <SelectItem value="9">৯ম</SelectItem>
                            <SelectItem value="10">১০ম</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 {showGroupSelector && (
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="group">গ্রুপ</Label>
                        <Select value={group} onValueChange={setGroup}>
                            <SelectTrigger id="group"><SelectValue placeholder="গ্রুপ নির্বাচন করুন" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="science">বিজ্ঞান</SelectItem>
                                <SelectItem value="arts">মানবিক</SelectItem>
                                <SelectItem value="commerce">ব্যবসায় শিক্ষা</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="flex items-end">
                     <Button>রুটিন দেখুন</Button>
                </div>
            </div>

            {/* Placeholder for routine table */}
            <Card>
                <CardHeader>
                    <CardTitle>ক্লাস রুটিন</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="overflow-x-auto">
                        <Table className="border">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="border-r">বার</TableHead>
                                    {periods.map(p => <TableHead key={p} className="border-r text-center">{p} পিরিয়ড</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {days.map(day => (
                                    <TableRow key={day}>
                                        <TableCell className="font-semibold border-r">{day}</TableCell>
                                        {periods.map(p => <TableCell key={p} className="border-r text-center">বিষয়</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                   </div>
                   <div className="text-center text-muted-foreground p-8">
                       রুটিন পরিচালনা করার ফিচার শীঘ্রই আসছে।
                   </div>
                </CardContent>
            </Card>
        </div>
    );
};

const ExamRoutineTab = () => {
    const [examName, setExamName] = useState('');

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                    <Label htmlFor="exam-name">পরীক্ষা</Label>
                    <Select value={examName} onValueChange={setExamName}>
                        <SelectTrigger id="exam-name"><SelectValue placeholder="পরীক্ষা নির্বাচন করুন" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="half-yearly">অর্ধ-বার্ষিক পরীক্ষা</SelectItem>
                            <SelectItem value="annual">বার্ষিক পরীক্ষা</SelectItem>
                            <SelectItem value="pre-test">প্রাক-নির্বাচনী পরীক্ষা</SelectItem>
                            <SelectItem value="test">নির্বাচনী পরীক্ষা</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="flex items-end">
                     <Button>রুটিন দেখুন</Button>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>পরীক্ষার রুটিন</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        পরীক্ষার রুটিন পরিচালনা করার ফিচার শীঘ্রই আসছে।
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


export default function RoutinesPage() {
    const { selectedYear } = useAcademicYear();

    return (
        <div className="flex min-h-screen w-full flex-col bg-fuchsia-50">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>রুটিন</CardTitle>
                        <p className="text-sm text-muted-foreground">শিক্ষাবর্ষ: {selectedYear.toLocaleString('bn-BD')}</p>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="class-routine">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="class-routine">ক্লাস রুটিন</TabsTrigger>
                                <TabsTrigger value="exam-routine">পরীক্ষার রুটিন</TabsTrigger>
                            </TabsList>
                            <TabsContent value="class-routine" className="mt-4">
                                <ClassRoutineTab />
                            </TabsContent>
                            <TabsContent value="exam-routine" className="mt-4">
                                <ExamRoutineTab />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
