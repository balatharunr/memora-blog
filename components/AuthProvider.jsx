'use client';

import { SessionProvider, useSession, signIn } from 'next-auth/react';
import { useEffect, useState, createContext, useContext } from 'react';
import { createOrUpdateUser } from '../lib/firebaseUtils';
import { auth, signInWithCustomToken } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Create a context to share Firebase auth state
const FirebaseAuthContext = createContext({
  firebaseReady: false,
  firebaseUser: null
});

export const useFirebaseAuth = () => useContext(FirebaseAuthContext);

// This component synchronizes the authenticated user with Firebase
function AuthSync({ setFirebaseReady, setFirebaseUser }) {
  const { data: session, status, update } = useSession();
  const [lastSync, setLastSync] = useState(null);
  const [authAttempted, setAuthAttempted] = useState(false);
  
  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase auth state changed:', user ? `User: ${user.uid}` : 'No user');
      setFirebaseUser(user);
      if (user) {
        setFirebaseReady(true);
      }
    });
    
    return () => unsubscribe();
  }, [setFirebaseReady, setFirebaseUser]);
  
  useEffect(() => {
    // Initialize Firebase Auth when session changes
    const initializeFirebaseAuth = async () => {
      // Wait for NextAuth session to be determined
      if (status === 'loading') {
        return;
      }
      
      try {
        if (session?.user?.id) {
          // User is authenticated via NextAuth
          // Check if already signed in to Firebase with the same user
          if (auth.currentUser?.uid === session.user.id) {
            console.log('Already authenticated with Firebase');
            setFirebaseReady(true);
            return;
          }
          
          // Try to get a custom token from the API and sign in to Firebase
          try {
            console.log('Fetching Firebase custom token...');
            const response = await fetch('/api/auth/firebase-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: session.user.id })
            });
            
            if (response.ok) {
              const { token } = await response.json();
              await signInWithCustomToken(auth, token);
              console.log('Firebase authenticated with custom token');
              setFirebaseReady(true);
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('Custom token not available:', errorData.error || 'Unknown error');
              // This is a critical error - user won't be able to write to Firestore
              setFirebaseReady(false);
            }
          } catch (tokenError) {
            console.error('Custom token request failed:', tokenError.message);
            // This is a critical error - user won't be able to write to Firestore
            setFirebaseReady(false);
          }
        } else {
          // No session - user is not logged in
          // For unauthenticated users, we still allow read operations
          setFirebaseReady(true);
        }
        setAuthAttempted(true);
      } catch (error) {
        console.error('Error initializing Firebase auth:', error);
        setAuthAttempted(true);
        setFirebaseReady(false);
      }
    };
    
    initializeFirebaseAuth();
  }, [session?.user?.id, status, setFirebaseReady]);
  
  useEffect(() => {
    // When user signs in, save their data to Firebase
    if (session?.user && authAttempted && (!lastSync || lastSync !== session.user.name)) {
      createOrUpdateUser(session.user)
        .then(() => {
          console.log('User synchronized with Firebase');
          setLastSync(session.user.name);
        })
        .catch(error => console.error('Error syncing user with Firebase:', error));
    }
  }, [session, lastSync, authAttempted]);
  
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
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  
  return (
    <SessionProvider refetchInterval={60}>
      <FirebaseAuthContext.Provider value={{ firebaseReady, firebaseUser }}>
        <AuthSync setFirebaseReady={setFirebaseReady} setFirebaseUser={setFirebaseUser} />
        {children}
      </FirebaseAuthContext.Provider>
    </SessionProvider>
  );
}
