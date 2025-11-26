# 🚀 Quick Start Guide - Fix Firebase Permissions

## Step-by-Step Instructions (5 minutes)

### Step 1: Get Firebase Service Account Key 🔑

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **memora-blog**
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key** button
6. Click **Generate Key** to download JSON file
7. Save this file securely (it contains sensitive credentials)

### Step 2: Add Credentials to .env.local 📝

1. Open the downloaded JSON file in a text editor
2. Open your `.env.local` file
3. Add these 3 lines at the bottom:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=memora-blog
FIREBASE_CLIENT_EMAIL=<copy from JSON: client_email>
FIREBASE_PRIVATE_KEY="<copy from JSON: private_key>"
```

**Example:**
```bash
FIREBASE_PROJECT_ID=memora-blog
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc12@memora-blog.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAA...\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important:** Keep the quotes and `\n` characters as-is!

### Step 3: Test Your Setup (Optional but Recommended) ✅

Run this command to verify your credentials are correct:

```bash
node test-firebase-admin.js
```

You should see:
```
✅ FIREBASE_PROJECT_ID: memora-blog
✅ FIREBASE_CLIENT_EMAIL: firebase-adminsdk-...
✅ FIREBASE_PRIVATE_KEY is present
✅ Firebase Admin SDK initialized successfully
✅ Custom token created successfully
✅ All tests passed!
```

If you see any ❌ errors, check your `.env.local` file formatting.

### Step 4: Update Firestore Security Rules 🔒

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **Firestore Database** from sidebar
3. Click on **Rules** tab
4. Replace ALL existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update, delete: if isOwner(userId);
    }
    
    match /posts/{postId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                      (resource.data.authorId == request.auth.uid ||
                       request.resource.data.diff(resource.data).affectedKeys()
                        .hasOnly(['likes', 'commentCount', 'updatedAt']));
      allow delete: if isAuthenticated() && resource.data.authorId == request.auth.uid;
    }
    
    match /comments/{commentId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /likes/{likeId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /followers/{followId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.followerId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.followerId == request.auth.uid;
    }
    
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

5. Click **Publish** button

### Step 5: Restart Your App 🔄

Stop your dev server (Ctrl+C) and start it again:

```bash
npm run dev
```

### Step 6: Test It! 🎉

1. Go to http://localhost:3000
2. Sign in with Google
3. Open browser console (F12)
4. Look for message: **"Firebase authenticated with custom token"**
5. Try creating a post
6. Try liking/commenting
7. Error should be gone! ✅

## Troubleshooting 🔧

### Still getting errors?

**Problem:** "Failed to get custom token"
- **Solution:** Check that all 3 Firebase Admin env variables are in `.env.local`
- Run `node test-firebase-admin.js` to verify

**Problem:** "Missing or insufficient permissions" still appears
- **Solution:** Make sure you published the Firestore rules (Step 4)
- Wait 1-2 minutes for rules to propagate

**Problem:** "Firebase authenticated anonymously"
- **Solution:** Your custom token isn't working. Check server logs in terminal for errors.

**Problem:** Private key format error
- **Solution:** Make sure the key is in quotes and includes `\n` characters:
  ```bash
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  ```

### Check Your Setup

Run the test script:
```bash
node test-firebase-admin.js
```

All checks should show ✅

## What Changed?

Your app now:
1. ✅ Authenticates with Firebase using custom tokens
2. ✅ Links NextAuth sessions to Firebase Auth
3. ✅ Has proper Firestore security rules
4. ✅ Can read/write data without permission errors

## Files Modified

- `lib/firebase.js` - Added Firebase Auth
- `components/AuthProvider.jsx` - Added authentication sync
- `app/api/auth/firebase-token/route.js` - New API for custom tokens
- `.env.local` - Added Firebase Admin credentials (you need to do this)

## Security Notes 🔐

- ⚠️ **Never commit `.env.local`** to git (it's in .gitignore)
- ⚠️ **Never share your service account JSON** publicly
- ⚠️ Keep Firebase Admin credentials secure
- ✅ These credentials are only used server-side (safe in Next.js API routes)

## Need More Help?

See detailed documentation in:
- `FIREBASE_SETUP.md` - Complete setup guide
- `PERMISSIONS_FIX_SUMMARY.md` - Technical explanation

---

**Ready?** Start with Step 1! 🚀
