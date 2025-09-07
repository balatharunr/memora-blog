'use client';

import { SessionProvider, useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createOrUpdateUser } from '../lib/firebaseUtils';

// This component synchronizes the authenticated user with Firebase
function AuthSync() {
  const { data: session, update } = useSession();
  const [lastSync, setLastSync] = useState(null);
  
  useEffect(() => {
    // When user signs in, save their data to Firebase
    if (session?.user && (!lastSync || lastSync !== session.user.name)) {
      createOrUpdateUser(session.user)
        .then(() => {
          console.log('User synchronized with Firebase');
          setLastSync(session.user.name);
        })
        .catch(error => console.error('Error syncing user with Firebase:', error));
    }
  }, [session, lastSync]);
  
  // Function to update the session after profile changes
  const refreshSession = async () => {
    if (session?.user) {
      await update(); // This will trigger a refresh of the session data
    }
  };
  
  // Listen for storage events to detect profile updates across tabs
  useEffect(() => {
    const handleStorageChange = async (event) => {
      if (event.key === 'profileUpdated' && event.newValue) {
        await refreshSession();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return null; // This component doesn't render anything
}

export function AuthProvider({ children }) {
  return (
    <SessionProvider refetchInterval={60}>
      <AuthSync />
      {children}
    </SessionProvider>
  );
}
