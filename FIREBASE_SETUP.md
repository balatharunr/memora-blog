# Firebase Setup Guide for Memora Blog

## Firebase Permissions Error - Solution

The "Missing or insufficient permissions" error occurs when Firebase Firestore security rules are not properly configured or when the client is not authenticated with Firebase.

## Required Setup

### 1. Firebase Security Rules

Go to your Firebase Console → Firestore Database → Rules and update them to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is the owner
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can read user profiles
      allow read: if true;
      // Users can create their own profile
      allow create: if isAuthenticated() && request.auth.uid == userId;
      // Users can only update their own profile
      allow update: if isOwner(userId);
      // Users can only delete their own profile
      allow delete: if isOwner(userId);
    }
    
    // Posts collection
    match /posts/{postId} {
      // Anyone can read posts
      allow read: if true;
      // Authenticated users can create posts
      allow create: if isAuthenticated();
      // Only post author can update their posts
      allow update: if isAuthenticated() && 
                      (resource.data.authorId == request.auth.uid ||
                       // Allow incrementing likes/comments for any authenticated user
                       (request.resource.data.diff(resource.data).affectedKeys()
                        .hasOnly(['likes', 'commentCount', 'updatedAt'])));
      // Only post author can delete their posts
      allow delete: if isAuthenticated() && resource.data.authorId == request.auth.uid;
    }
    
    // Comments collection
    match /comments/{commentId} {
      // Anyone can read comments
      allow read: if true;
      // Authenticated users can create comments
      allow create: if isAuthenticated();
      // Only comment author can update/delete their comments
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Likes collection
    match /likes/{likeId} {
      // Anyone can read likes
      allow read: if true;
      // Authenticated users can create likes
      allow create: if isAuthenticated();
      // Only the user who created the like can delete it
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Followers collection
    match /followers/{followId} {
      // Anyone can read follow relationships
      allow read: if true;
      // Authenticated users can create follow relationships
      allow create: if isAuthenticated() && request.resource.data.followerId == request.auth.uid;
      // Only the follower can delete the relationship
      allow delete: if isAuthenticated() && resource.data.followerId == request.auth.uid;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      // Users can only read their own notifications
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      // System can create notifications (or authenticated users)
      allow create: if isAuthenticated();
      // Users can update/delete their own notifications
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 2. Required Environment Variables

Add these to your `.env.local` file:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret

# Firebase Client SDK (Already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (NEW - Required for custom tokens)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Alternative: Single JSON service account (if you prefer)
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Get Firebase Admin Credentials

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract these values to your `.env.local`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n` characters)

**OR** you can use the entire JSON as a single environment variable:
```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"memora-blog",...}'
```

### 4. Test the Setup

After configuring the above:

1. Restart your dev server: `npm run dev`
2. Sign in with Google
3. Check the browser console for "Firebase authenticated with custom token"
4. Try creating a post or performing other operations

## How It Works

1. **NextAuth** handles Google OAuth authentication
2. **Custom Token API** (`/api/auth/firebase-token`) creates a Firebase custom token using the Admin SDK
3. **AuthProvider** automatically signs the user into Firebase using the custom token
4. **Firestore Security Rules** now recognize the authenticated user and allow operations

## Troubleshooting

### Still getting "Missing or insufficient permissions"?

1. **Check Firebase Rules**: Make sure you published the rules in Firebase Console
2. **Check Console Logs**: Look for "Firebase authenticated with custom token" message
3. **Verify Environment Variables**: Ensure all Firebase Admin credentials are correct
4. **Check for Errors**: Look at server-side logs (terminal) for Firebase Admin errors

### "Failed to get custom token" error?

This means the Firebase Admin SDK is not properly configured:
- Verify `FIREBASE_PRIVATE_KEY` has proper formatting with `\n` characters
- Ensure `FIREBASE_CLIENT_EMAIL` is from a service account
- Check that the service account has "Firebase Authentication Admin" role

### Anonymous authentication fallback?

If you see "Firebase authenticated anonymously", it means custom tokens aren't working. The app will still function but with limited permissions. Fix the Firebase Admin credentials to resolve this.

## Deployment Notes

For production (Vercel, etc.):
- Add all environment variables to your hosting platform
- Ensure `NEXTAUTH_URL` points to your production domain
- Update Firebase OAuth authorized domains in Firebase Console
- Update Google OAuth authorized redirect URIs in Google Console
