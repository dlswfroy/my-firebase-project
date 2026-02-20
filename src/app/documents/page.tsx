'use client';

import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>ডকুমেন্ট</CardTitle>
                <CardDescription>
                    এখানে প্রয়োজনীয় ডকুমেন্ট ও ফাইল জেনারেট করুন।
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>প্রত্যয়ন পত্র</CardTitle>
                            <CardDescription>শিক্ষার্থীদের জন্য প্রশংসাপত্র বা প্রত্যয়ন পত্র জেনারেট করুন।</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">
                               প্রত্যয়ন পত্র তৈরি করতে, শিক্ষার্থী তালিকা থেকে নির্দিষ্ট শিক্ষার্থীকে বেছে নিন এবং তার প্রোফাইল থেকে "প্রত্যয়ন পত্র" অপশনটি নির্বাচন করুন।
                           </p>
                        </CardContent>
                         <CardFooter>
                            <Link href="/student-list" className="w-full">
                                <Button className="w-full">
                                    শিক্ষার্থী তালিকা দেখুন
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
