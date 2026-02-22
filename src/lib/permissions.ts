'use client';

// This is a placeholder for permissions management.
// In a real application, you would fetch these from a database.

export const availablePermissions = [
  { id: 'view:dashboard', label: 'ড্যাশবোর্ড দেখুন' },
  { id: 'manage:students', label: 'শিক্ষার্থী ম্যানেজ করুন' },
  { id: 'manage:staff', label: 'স্টাফ ম্যানেজ করুন' },
  { id: 'manage:attendance', label: 'হাজিরা ম্যানেজ করুন' },
  { id: 'manage:results', label: 'ফলাফল ম্যানেজ করুন' },
  { id: 'manage:accounts', label: 'হিসাব শাখা ম্যানেজ করুন' },
  { id: 'manage:documents', label: 'ডকুমেন্ট ম্যানেজ করুন' },
  { id: 'manage:routines', label: 'রুটিন ম্যানেজ করুন' },
  { id: 'manage:settings', label: 'সেটিংস ম্যানেজ করুন' },
];

export const defaultPermissions: { [key: string]: string[] } = {
  admin: availablePermissions.map(p => p.id),
  teacher: [
    'view:dashboard',
    'manage:attendance',
    'manage:results',
  ],
};
