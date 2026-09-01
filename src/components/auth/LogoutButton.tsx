'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // 1. Sign out of Firebase client-side
      await signOut(auth);

      // 2. Delete the server-side session cookie (also revokes Firebase tokens)
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // 3. Always redirect to login — even on partial failure
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-500 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-50"
    >
      <LogOut className="h-4 w-4 flex-shrink-0" />
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
