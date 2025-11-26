'use client';

// List of admin emails
const ADMIN_EMAILS = ['balatharunrbt@gmail.com'];

/**
 * Checks if a user is an admin based on their email
 * @param {Object} session - NextAuth session object
 * @returns {Boolean} - Whether the user is an admin
 */
export const isAdmin = (session) => {
  if (!session?.user?.email) return false;
  return ADMIN_EMAILS.includes(session.user.email);
};
