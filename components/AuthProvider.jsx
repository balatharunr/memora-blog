'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { createOrUpdateUser } from '../lib/firebaseUtils';

// This component synchronizes the authenticated user with Firebase
function AuthSync() {
  const { data: session } = useSession();
  
  useEffect(() => {
    // When user signs in, save their data to Firebase
    if (session?.user) {
      createOrUpdateUser(session.user)
        .then(() => console.log('User synchronized with Firebase'))
        .catch(error => console.error('Error syncing user with Firebase:', error));
    }
  }, [session]);
  
  return null; // This component doesn't render anything
}

export function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <AuthSync />
      {children}
    </SessionProvider>
  );
}
