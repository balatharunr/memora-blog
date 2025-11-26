'use client';

import { SessionProvider, useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createOrUpdateUser } from '../lib/firebaseUtils';
import { auth, signInWithCustomToken } from '../lib/firebase';

// This component synchronizes the authenticated user with Firebase
function AuthSync() {
  const { data: session, update } = useSession();
  const [lastSync, setLastSync] = useState(null);
  const [firebaseAuthInitialized, setFirebaseAuthInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize Firebase Auth
    const initializeFirebaseAuth = async () => {
      try {
        if (session?.user?.id) {
          // User is authenticated via NextAuth
          // Try to get a custom token from the API and sign in to Firebase
          try {
            const response = await fetch('/api/auth/firebase-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: session.user.id })
            });
            
            if (response.ok) {
              const { token } = await response.json();
              await signInWithCustomToken(auth, token);
              console.log('Firebase authenticated with custom token');
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.warn('Custom token not available:', errorData.error || 'Unknown error');
              // Continue without Firebase auth - Firestore rules should allow public reads
            }
          } catch (tokenError) {
            console.warn('Custom token request failed:', tokenError.message);
            // Continue without Firebase auth - operations may be limited
          }
        }
        // For unauthenticated users, we don't sign in to Firebase at all
        // Firestore rules should allow public reads for posts, comments, etc.
        setFirebaseAuthInitialized(true);
      } catch (error) {
        console.error('Error initializing Firebase auth:', error);
        setFirebaseAuthInitialized(true); // Set to true anyway to prevent infinite loop
      }
    };
    
    if (!firebaseAuthInitialized) {
      initializeFirebaseAuth();
    }
  }, [session?.user?.id, firebaseAuthInitialized]);
  
  useEffect(() => {
    // When user signs in, save their data to Firebase
    if (session?.user && firebaseAuthInitialized && (!lastSync || lastSync !== session.user.name)) {
      createOrUpdateUser(session.user)
        .then(() => {
          console.log('User synchronized with Firebase');
          setLastSync(session.user.name);
        })
        .catch(error => console.error('Error syncing user with Firebase:', error));
    }
  }, [session, lastSync, firebaseAuthInitialized]);
  
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
  }, [session?.user]);
  
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
