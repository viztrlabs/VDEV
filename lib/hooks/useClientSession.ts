'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';

export interface ClientSessionData {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'CLIENT';
  clientId?: string;
  accessCode?: string;
  assignedDirector?: string;
  clientFirm?: string;
}

export function useClientSession() {
  const { data, status } = useSession();
  const { user, setUser } = useAppStore();

  useEffect(() => {
    if (status === 'authenticated' && data?.user) {
      const u = data.user as any;
      const sessionUser: ClientSessionData = {
        id: u.id || u.email || '',
        name: u.name || '',
        email: u.email || '',
        role: u.role || 'CLIENT',
        clientId: u.clientId,
        accessCode: u.accessCode,
        assignedDirector: u.assignedDirector,
        clientFirm: u.clientFirm,
      };
      const isSameUser =
        user &&
        user.email === sessionUser.email &&
        user.role === sessionUser.role &&
        user.clientId === sessionUser.clientId;
      if (!isSameUser) {
        setUser(sessionUser);
      }
    } else if (status === 'unauthenticated' && user) {
      setUser(null);
    }
  }, [data, status, user, setUser]);

  return {
    session: data,
    user: data?.user ? (data.user as ClientSessionData) : null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    role: (data?.user as any)?.role as ClientSessionData['role'] | undefined,
    clientId: (data?.user as any)?.clientId as string | undefined,
    accessCode: (data?.user as any)?.accessCode as string | undefined,
  };
}
