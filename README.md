# Memora Blog

A modern blog and social media platform built with Next.js, Firebase, and Cloudinary. Memora Blog allows users to share posts, interact through comments and likes, and discover content through hashtags.

> 🔧 **Getting "Missing or insufficient permissions" error?** See [QUICK_START.md](QUICK_START.md) for the 5-minute fix!

## Features

- User authentication with Next-Auth
- Create, edit, and delete posts
- Support for hashtags and content discovery
- Real-time comments and likes
- User profiles with customizable information
- Responsive design for mobile and desktop
- Image upload support via Cloudinary
- Firebase Firestore database for data storage

## Technologies Used

- **Frontend**: Next.js 15, React, TailwindCSS
- **Authentication**: NextAuth.js with Google provider
- **Database**: Firebase Firestore
- **Storage**: Cloudinary for images
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Firebase account
- Cloudinary account
- Google OAuth credentials for authentication

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/memora-blog.git
cd memora-blog
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```bash
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id

# Firebase Admin SDK (REQUIRED - see QUICK_START.md for setup)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

> ⚠️ **IMPORTANT:** To avoid "Missing or insufficient permissions" errors, you MUST set up Firebase Admin credentials. See **[QUICK_START.md](QUICK_START.md)** for step-by-step instructions.

### Firebase Setup

**📖 See [QUICK_START.md](QUICK_START.md) for complete setup instructions**

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Set up Authentication with Google provider
4. **Generate Service Account credentials** (Project Settings → Service Accounts → Generate New Private Key)
5. **Update Firestore Security Rules** - Copy rules from [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
6. Collections will be created automatically when you use the app:
   - `users`
   - `posts`
   - `comments`
   - `likes`
   - `notifications`
   - `followers`

> 💡 **Tip:** Run `node test-firebase-admin.js` to verify your Firebase Admin credentials are correct.

### Cloudinary Setup

1. Create a Cloudinary account at [https://cloudinary.com/](https://cloudinary.com/)
2. Create an unsigned upload preset (for client-side uploads)
3. Copy your cloud name and upload preset to the `.env.local` file

## Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Deployment

### Deploying to Vercel

The easiest way to deploy the Memora Blog application is using [Vercel](https://vercel.com/), the platform created by the creators of Next.js.

1. Create an account on Vercel
2. Install the Vercel CLI:
```bash
npm i -g vercel
```

3. Run the following command from your project directory:
```bash
vercel
```

4. Add your environment variables in the Vercel project settings.

### Alternative Deployment Options

You can also deploy to other platforms that support Next.js applications:

- **Netlify**: Follow the [Netlify deployment guide for Next.js](https://docs.netlify.com/frameworks/next-js/overview/)
- **AWS Amplify**: Follow the [AWS Amplify deployment guide](https://docs.amplify.aws/guides/hosting/nextjs/q/platform/js/)

## Project Structure

```
blogapp/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── create/           # Post creation page
│   ├── dashboard/        # User dashboard
│   ├── explore/          # Content discovery page
│   ├── messages/         # Messaging functionality
│   ├── notifications/    # Notifications page
│   ├── post/             # Individual post view
│   ├── profile/          # User profile page
│   ├── layout.js         # Root layout
│   └── page.js           # Home page
├── components/           # React components
├── lib/                  # Utility functions
│   ├── analyticsUtils.js # Analytics helpers
│   ├── cloudinary.js     # Cloudinary integration
│   ├── firebase.js       # Firebase configuration
│   ├── firebaseUtils.js  # Firebase helper functions
│   └── hooks.js          # Custom React hooks
├── public/               # Static assets
└── README.md             # Project documentation
```

## Screenshots
1. Signin page
<img width="600" alt="Screenshot 2025-09-10 095241" src="https://github.com/user-attachments/assets/00d5f120-6ffb-4349-a012-42b853164bc7" />

2. Home page
<img width="600" height="" alt="Screenshot 2025-09-10 095013" src="https://github.com/user-attachments/assets/1ce88dbc-1d05-47f9-9f79-bf2d8cd321b1" />

3. Post creation page
<img width="600" alt="Screenshot 2025-09-10 095138" src="https://github.com/user-attachments/assets/15db6e4d-1fc5-4826-822d-5fc092b8c3e4" />
   
4. Profile page
<img width="600" alt="Screenshot 2025-09-10 095148" src="https://github.com/user-attachments/assets/025c9210-55e8-408a-9675-5e8622ae8ca0" />

5. Explore page
<img width="600" alt="Screenshot 2025-09-10 095030" src="https://github.com/user-attachments/assets/cd69cff4-615d-4087-b00b-408912805b1a" />

6. Dashboard page
<img width="600" alt="Screenshot 2025-09-10 095203" src="https://github.com/user-attachments/assets/3637b5ef-eec5-474e-a6d7-f7136c5eba65" />

7. Mobile view
<img width="250" alt="image" src="https://github.com/user-attachments/assets/4e731ed2-c343-4d19-8c12-ff0f68b99b33" />

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
