'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MainLayout from '../../../components/MainLayout';
import CreatePostForm from '../../../components/CreatePostForm';
import { getPost } from '../../../lib/firebaseUtils';

// Client component that uses the useParams hook
function EditPostContent() {
  const { postId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const postData = await getPost(postId);
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [postId]);

  // Check if user is authorized to edit this post
  useEffect(() => {
    if (!loading && post && session) {
      if (post.authorId !== session.user.id) {
        // Redirect if user is not the author
        router.push(`/post/${postId}`);
      }
    }
  }, [loading, post, session, router, postId]);

  // Handle successful update
  const handleUpdatePost = (updatedPost) => {
    setSuccess(true);
    // Delay navigation to show success message
    setTimeout(() => {
      router.push(`/post/${postId}`);
    }, 1000);
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(`/post/${postId}`);
  };

  // Show loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </MainLayout>
    );
  }

  // Show not found state
  if (!post) {
    return (
      <MainLayout>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-400">The post you're trying to edit doesn't exist or has been removed.</p>
          <Link href="/" className="mt-4 inline-block text-purple-400 hover:underline">
            Go back to home
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Show unauthorized state
  if (post.authorId !== session?.user?.id) {
    return (
      <MainLayout>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p className="text-gray-400">You don't have permission to edit this post.</p>
          <Link href={`/post/${postId}`} className="mt-4 inline-block text-purple-400 hover:underline">
            Go back to post
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {success ? (
          <div className="bg-green-900/30 border border-green-500 text-green-100 px-4 py-3 rounded-md">
            <p>Your post was updated successfully!</p>
            <p className="text-sm mt-2">Redirecting you to the post...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Edit Post</h1>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="bg-gray-900 rounded-lg p-6">
              <CreatePostForm 
                initialData={post} 
                onSuccess={handleUpdatePost}
                onCancel={handleCancel}
              />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

// Main page component with Suspense boundary
export default function EditPostPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </MainLayout>
    }>
      <EditPostContent />
    </Suspense>
  );
}
