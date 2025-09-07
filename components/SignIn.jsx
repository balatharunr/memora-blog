'use client';

import { signIn, useSession } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // If user is already signed in, redirect to home page
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="max-w-md w-full p-8 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
        <div className="text-center mb-8">
          <div className="flex justify-center items-start">
            <h1 className="text-5xl memora-font text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">MEMORA</h1>
            <span className="blog-font" style={{ display: 'inline-block' }}>Blogs</span>
          </div>
          <p className="mt-3 text-gray-300">Share your moments, connect with the world</p>
        </div>
        
        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 w-full py-4 px-4 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition shadow-md hover:shadow-lg"
            disabled={status === 'loading'}
          >
            <FaGoogle className="text-red-500" size={20} />
            <span className="font-medium">Sign in with Google</span>
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">Or continue as guest</span>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-sm hover:shadow-md"
          >
            Browse as Guest
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
