
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Student, studentFromDoc } from '@/lib/student-data';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Users, User, Clock, Trash2, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logMessage, getMessageLogs, MessageLog } from '@/lib/messaging-data';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function MessagingPage() {
    const db = useFirestore();
    const { selectedYear } = useAcademicYear();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    const [messageContent, setMessageContent] = useState('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

    const classNamesMap: { [key: string]: string } = { '6': '৬ষ্ঠ', '7': '৭ম', '8': '৮ম', '9': '৯ম', '10': '১০ম' };

    useEffect(() => {
        setIsClient(true);
        if (db) {
            fetchLogs();
            fetchStudents();
        }
    }, [db, selectedYear]);

    const fetchLogs = async () => {
        if (!db) return;
        setIsLoadingLogs(true);
        const logs = await getMessageLogs(db);
        setMessageLogs(logs);
        setIsLoadingLogs(false);
    };

    const fetchStudents = async () => {
        if (!db) return;
        const q = query(collection(db, 'students'), where('academicYear', '==', selectedYear));
        const snap = await getDocs(q);
        setAllStudents(snap.docs.map(studentFromDoc));
    };

    const studentsInClass = useMemo(() => {
        return allStudents.filter(s => s.className === selectedClass).sort((a,b) => a.roll - b.roll);
    }, [allStudents, selectedClass]);

    const handleToggleStudent = (id: string) => {
        const next = new Set(selectedStudentIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedStudentIds(next);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(new Set(studentsInClass.map(s => s.id)));
        } else {
            setSelectedStudentIds(new Set());
        }
    };

    const handleSendMessage = async (type: 'all' | 'class' | 'individual' | 'absent', recipientsCount: number) => {
        if (!db || !user) return;
        if (!messageContent.trim()) {
            toast({ variant: 'destructive', title: 'মেসেজ লিখুন' });
            return;
        }

        setIsLoading(true);
        try {
            await logMessage(db, {
                recipientsCount,
                type,
                className: selectedClass || undefined,
                content: messageContent,
                senderUid: user.uid,
                senderName: user.displayName || user.email || 'Admin'
            });

            toast({ title: 'মেসেজ পাঠানো সফল হয়েছে', description: `মোট ${recipientsCount.toLocaleString('bn-BD')} জনকে মেসেজ পাঠানো হয়েছে (সিমুলেটেড)।` });
            setMessageContent('');
            setSelectedStudentIds(new Set());
            fetchLogs();
        } catch (e) {
            // Error handled by Firebase listener
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAbsentStudents = async () => {
        if (!db || !selectedClass) {
            toast({ variant: 'destructive', title: 'শ্রেণি নির্বাচন করুন' });
            return;
        }
        setIsLoading(true);
        try {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const q = query(
                collection(db, 'attendance'),
                where('date', '==', todayStr),
                where('className', '==', selectedClass),
                where('academicYear', '==', selectedYear)
            );
            const snap = await getDocs(q);
            if (snap.empty) {
                toast({ variant: 'destructive', title: 'আজকের হাজিরা এখনও নেওয়া হয়নি।' });
                setIsLoading(false);
                return;
            }
            const attData = snap.docs[0].data();
            const absentIds = attData.attendance.filter((a: any) => a.status === 'absent').map((a: any) => a.studentId);
            setSelectedStudentIds(new Set(absentIds));
            
            if (absentIds.length === 0) {
                toast({ title: 'সবাই উপস্থিত আছে!' });
            } else {
                toast({ title: `${absentIds.length.toLocaleString('bn-BD')} জন অনুপস্থিত পাওয়া গেছে।` });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'তথ্য আনা সম্ভব হয়নি' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isClient) return null;

    return (
        <div className="flex min-h-screen w-full flex-col bg-lime-50">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-6 w-6" /> মেসেজ পাঠান
                            </CardTitle>
                            <CardDescription>একসাথে বা আলাদাভাবে শিক্ষার্থীদের মেসেজ পাঠান</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="bulk" onValueChange={() => { setSelectedStudentIds(new Set()); setMessageContent(''); }}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="bulk">সকলকে</TabsTrigger>
                                    <TabsTrigger value="class">শ্রেণিভিত্তিক</TabsTrigger>
                                    <TabsTrigger value="individual">একক</TabsTrigger>
                                    <TabsTrigger value="absent">অনুপস্থিত</TabsTrigger>
                                </TabsList>

                                <div className="mt-6 space-y-6">
                                    {/* Content for Bulk/All */}
                                    <TabsContent value="bulk" className="space-y-4">
                                        <div className="p-4 bg-lime-100 border border-lime-200 rounded-lg flex items-center gap-4">
                                            <Users className="h-10 w-10 text-lime-700" />
                                            <div>
                                                <p className="font-bold text-lime-900">সকল শিক্ষার্থী</p>
                                                <p className="text-sm text-lime-700">মোট {allStudents.length.toLocaleString('bn-BD')} জন শিক্ষার্থীর কাছে মেসেজ যাবে।</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>মেসেজ বডি</Label>
                                            <Textarea 
                                                placeholder="আপনার বার্তা এখানে লিখুন..." 
                                                className="min-h-[150px]"
                                                value={messageContent}
                                                onChange={e => setMessageContent(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            className="w-full" 
                                            disabled={isLoading || allStudents.length === 0}
                                            onClick={() => handleSendMessage('all', allStudents.length)}
                                        >
                                            <Send className="mr-2 h-4 w-4" /> সকল শিক্ষার্থীকে মেসেজ পাঠান
                                        </Button>
                                    </TabsContent>

                                    {/* Content for Class-wise */}
                                    <TabsContent value="class" className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>শ্রেণি নির্বাচন করুন</Label>
                                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                    <SelectTrigger><SelectValue placeholder="শ্রেণি" /></SelectTrigger>
                                                    <SelectContent>
                                                        {['6', '7', '8', '9', '10'].map(c => (
                                                            <SelectItem key={c} value={c}>{classNamesMap[c]} শ্রেণি</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {selectedClass && (
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                                <p className="font-bold text-blue-900">{classNamesMap[selectedClass]} শ্রেণি</p>
                                                <p className="text-sm text-blue-700">মোট {studentsInClass.length.toLocaleString('bn-BD')} জন শিক্ষার্থী।</p>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>মেসেজ বডি</Label>
                                            <Textarea 
                                                placeholder="আপনার বার্তা এখানে লিখুন..." 
                                                className="min-h-[150px]"
                                                value={messageContent}
                                                onChange={e => setMessageContent(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            className="w-full" 
                                            disabled={isLoading || !selectedClass || studentsInClass.length === 0}
                                            onClick={() => handleSendMessage('class', studentsInClass.length)}
                                        >
                                            <Send className="mr-2 h-4 w-4" /> শ্রেণির সকল শিক্ষার্থীকে মেসেজ পাঠান
                                        </Button>
                                    </TabsContent>

                                    {/* Content for Individual */}
                                    <TabsContent value="individual" className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>শ্রেণি</Label>
                                                <Select value={selectedClass} onValueChange={c => { setSelectedClass(c); setSelectedStudentIds(new Set()); }}>
                                                    <SelectTrigger><SelectValue placeholder="শ্রেণি নির্বাচন" /></SelectTrigger>
                                                    <SelectContent>
                                                        {['6', '7', '8', '9', '10'].map(c => (
                                                            <SelectItem key={c} value={c}>{classNamesMap[c]} শ্রেণি</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {selectedClass && (
                                            <div className="border rounded-md max-h-[300px] overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-12">
                                                                <Checkbox 
                                                                    checked={selectedStudentIds.size === studentsInClass.length && studentsInClass.length > 0}
                                                                    onCheckedChange={handleSelectAll}
                                                                />
                                                            </TableHead>
                                                            <TableHead>রোল</TableHead>
                                                            <TableHead>নাম</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {studentsInClass.map(s => (
                                                            <TableRow key={s.id}>
                                                                <TableCell>
                                                                    <Checkbox 
                                                                        checked={selectedStudentIds.has(s.id)}
                                                                        onCheckedChange={() => handleToggleStudent(s.id)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{s.roll.toLocaleString('bn-BD')}</TableCell>
                                                                <TableCell>{s.studentNameBn}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>মেসেজ বডি</Label>
                                            <Textarea 
                                                placeholder="আপনার বার্তা এখানে লিখুন..." 
                                                value={messageContent}
                                                onChange={e => setMessageContent(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            className="w-full" 
                                            disabled={isLoading || selectedStudentIds.size === 0}
                                            onClick={() => handleSendMessage('individual', selectedStudentIds.size)}
                                        >
                                            <Send className="mr-2 h-4 w-4" /> {selectedStudentIds.size.toLocaleString('bn-BD')} জন শিক্ষার্থীকে মেসেজ পাঠান
                                        </Button>
                                    </TabsContent>

                                    {/* Content for Absent */}
                                    <TabsContent value="absent" className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                            <div className="space-y-2">
                                                <Label>শ্রেণি</Label>
                                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                    <SelectTrigger><SelectValue placeholder="শ্রেণি" /></SelectTrigger>
                                                    <SelectContent>
                                                        {['6', '7', '8', '9', '10'].map(c => (
                                                            <SelectItem key={c} value={c}>{classNamesMap[c]} শ্রেণি</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button variant="outline" onClick={fetchAbsentStudents} disabled={!selectedClass || isLoading}>
                                                অনুপস্থিত তালিকা খুঁজুন
                                            </Button>
                                        </div>
                                        {selectedStudentIds.size > 0 && (
                                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                                <p className="font-bold text-red-900">অনুপস্থিত শিক্ষার্থী</p>
                                                <p className="text-sm text-red-700">আজকের অনুপস্থিত শিক্ষার্থীর সংখ্যা: {selectedStudentIds.size.toLocaleString('bn-BD')} জন।</p>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>মেসেজ বডি</Label>
                                            <Textarea 
                                                placeholder="অভিভাবক মহোদয়, আপনার সন্তান আজ স্কুলে অনুপস্থিত..." 
                                                value={messageContent}
                                                onChange={e => setMessageContent(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            className="w-full" 
                                            variant="destructive"
                                            disabled={isLoading || selectedStudentIds.size === 0}
                                            onClick={() => handleSendMessage('absent', selectedStudentIds.size)}
                                        >
                                            <Send className="mr-2 h-4 w-4" /> অনুপস্থিত অভিভাবকগণকে মেসেজ পাঠান
                                        </Button>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* History Column */}
                    <Card className="md:col-span-1 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <History className="h-5 w-5" /> মেসেজ হিস্ট্রি
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[600px] overflow-y-auto">
                                {isLoadingLogs ? (
                                    <div className="p-4 space-y-4">
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                    </div>
                                ) : messageLogs.length === 0 ? (
                                    <p className="p-8 text-center text-sm text-muted-foreground">কোনো মেসেজ হিস্ট্রি নেই।</p>
                                ) : (
                                    <div className="divide-y">
                                        {messageLogs.map(log => (
                                            <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <Badge variant="outline" className="text-[10px] uppercase">
                                                        {log.type === 'all' ? 'সকল' : log.type === 'class' ? 'শ্রেণি' : log.type === 'individual' ? 'একক' : 'অনুপস্থিত'}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {format(log.sentAt, 'PPp', { locale: bn })}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium line-clamp-2 mb-1">{log.content}</p>
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>প্রাপক: {log.recipientsCount.toLocaleString('bn-BD')} জন</span>
                                                    <span>প্রেরক: {log.senderName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
