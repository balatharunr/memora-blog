import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
function initAdmin() {
  if (getApps().length === 0) {
    // Check if we have service account credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        initializeApp({
          credential: cert(serviceAccount)
        });
      } catch (error) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
        // Fallback to environment variables
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
          })
        });
      }
    } else {
      // Use individual environment variables
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
    }
  }
  return getAuth();
}

export async function POST(request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Initialize Firebase Admin
    const auth = initAdmin();
    
    // Create a custom token for the user
    const customToken = await auth.createCustomToken(session.user.id);
    
    return Response.json({ token: customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    return Response.json(
      { error: 'Failed to create custom token', details: error.message },
      { status: 500 }
    );
  }
}
