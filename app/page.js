'use client';

import { useState, useCallback } from 'react';
import MainLayout from '../components/MainLayout';
import PostCard from '../components/PostCard';
import { useSession, signIn } from 'next-auth/react';
import { useAllPosts } from '../lib/hooks';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();
  const { posts, loading, error } = useAllPosts();
  
  const refreshPosts = useCallback(() => {
    // The posts will refresh automatically on the next render
    // This is just to trigger a re-render
    window.location.reload();
  }, []);
  
  const handleDeletePost = (postId) => {
    refreshPosts();
  };
  
  const handleEditPost = (updatedPost) => {
    refreshPosts();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Home</h1>
          {!session && (
            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Sign in with Google
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded-md">
            Error loading posts: {error.message}
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              refreshPosts={refreshPosts}
            />
          ))
        ) : (
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No posts yet!</p>
            {session ? (
              <p>Be the first to create a post.</p>
            ) : (
              <p>
                <Link href="/auth/signin" className="text-purple-400 hover:underline">Sign in</Link> to start posting.
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
