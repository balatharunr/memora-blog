import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        // Set the user ID from the token
        session.user.id = token.sub;
        
        try {
          // Fetch the latest user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', token.sub));
          if (userDoc.exists()) {
            // Update session with the most recent user data from Firestore
            const userData = userDoc.data();
            session.user.name = userData.name || session.user.name;
            // Only update other fields if they exist in Firestore
            if (userData.bio) session.user.bio = userData.bio;
            if (userData.location) session.user.location = userData.location;
            // Keep the original email and image from OAuth
          }
        } catch (error) {
          console.error('Error fetching updated user data for session:', error);
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
