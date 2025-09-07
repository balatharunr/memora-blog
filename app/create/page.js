'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import CreatePostForm from '../../components/CreatePostForm';

export default function CreatePage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handlePostCreation = async (postData) => {
    // This function now receives the actual Firebase post data
    // from the CreatePostForm component after successful creation
    setIsSubmitting(true);
    
    try {
      // The post has already been saved to Firebase by the CreatePostForm component
      // We just need to handle the success state and redirect
      setSuccess(true);
      
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error handling post creation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!session && !isLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Create Post</h1>
          <p className="text-gray-400 mb-4">You need to be signed in to create a post.</p>
          <a href="/auth/signin" className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700">
            Sign In
          </a>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Create Post</h1>
        
        {success ? (
          <div className="bg-green-900/30 border border-green-500 text-green-100 px-4 py-3 rounded-md">
            <p>Your post was created successfully!</p>
            <p className="text-sm mt-2">Redirecting you to the home page...</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-6">
            <CreatePostForm onSuccess={handlePostCreation} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
