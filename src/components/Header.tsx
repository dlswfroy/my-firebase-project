'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Header() {
  const profilePhoto = PlaceHolderImages.find(p => p.id === 'profile-photo');
  const schoolLogo = PlaceHolderImages.find(p => p.id === 'school-logo');

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-[#00B2EE] px-4 text-white shadow-sm sm:px-6 md:px-8">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 rounded-lg bg-white hover:bg-gray-100">
              <Menu className="h-6 w-6 text-gray-500" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                A list of links to navigate the application.
              </SheetDescription>
            </SheetHeader>
            <nav className="grid gap-4 py-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold text-foreground"
              >
                {schoolLogo && (
                   <Image src={schoolLogo.imageUrl} alt="School Logo" width={32} height={32} className="rounded-full" />
                )}
                <span className="">বীরগঞ্জ পৌর উচ্চ বিদ্যালয়</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                ড্যাসবোর্ড
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                নতুন শিক্ষাথী যোগ
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                ডিজিটাল হাজিরা
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                শিক্ষক ও কর্মচারী
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                ফলাফল
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                সেটিং
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2">
        {schoolLogo && (
          <Image src={schoolLogo.imageUrl} alt="School Logo" width={40} height={40} className="rounded-full" data-ai-hint={schoolLogo.imageHint}/>
        )}
        <h1 className="text-xl font-bold whitespace-nowrap drop-shadow-md">
          বীরগঞ্জ পৌর উচ্চ বিদ্যালয়
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          {profilePhoto && (
            <AvatarImage
              src={profilePhoto.imageUrl}
              alt="School Representative"
              data-ai-hint={profilePhoto.imageHint}
            />
          )}
          <AvatarFallback>SR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
