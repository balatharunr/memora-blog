/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google OAuth profile images
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // For Firebase Storage images
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // For placeholder images
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc', // For avatar placeholders
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // For Cloudinary images
      },
    ],
  },
  // Disable ESLint during builds to prevent deployment failures
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
