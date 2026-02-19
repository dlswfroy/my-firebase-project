'use client';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useAuth } from '@/firebase/provider';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      // Since our app requires a user (anonymous or otherwise), we are not
      // truly 'done' loading until the user object is populated.
      if (userState) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
