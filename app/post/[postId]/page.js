'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MainLayout from '../../../components/MainLayout';
import PostCard from '../../../components/PostCard';
import CreatePostForm from '../../../components/CreatePostForm';
import { usePost, usePostActions } from '../../../lib/hooks';
import { isAdmin } from '../../../lib/adminUtils';

// Client component that uses the useParams hook
function PostContent() {
  const { postId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { deletePost } = usePostActions();
  
  const [isEditing, setIsEditing] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const userIsAdmin = isAdmin(session);
  
  // Use the usePost hook to fetch the post data
  const { 
    post, 
    loading: isLoading, 
    error,
    liked,
    handleLike,
    handleComment
  } = usePost(postId);
  
  const handleDelete = async () => {
    const confirmMessage = userIsAdmin && session?.user?.id !== post?.authorId 
      ? 'Are you sure you want to delete this post as an admin?' 
      : 'Are you sure you want to delete this post?';
      
    if (window.confirm(confirmMessage)) {
      try {
        await deletePost(postId);
        router.push('/');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };
  
  const handleUpdatePost = (updatedPost) => {
    setIsEditing(false);
    router.refresh(); // Refresh the page to show the updated post
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!post) {
    return (
      <MainLayout>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-400">The post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="mt-4 inline-block text-purple-400 hover:underline">
            Go back to home
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  const isAuthor = session?.user?.id === post?.authorId;
  
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Post actions for author or admin */}
        {(isAuthor || userIsAdmin) && !isEditing && (
          <div className="flex justify-end gap-3">
            {/* Only show edit button for the author */}
            {isAuthor && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700"
              >
                Edit Post
              </button>
            )}
            {/* Show delete button for both author and admin */}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-900/50 text-red-100 rounded-md hover:bg-red-900/80"
            >
              {userIsAdmin && !isAuthor ? "Delete Post (Admin)" : "Delete Post"}
            </button>
          </div>
        )}
        
        {/* Edit form or post display */}
        {isEditing ? (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Edit Post</h2>
            <CreatePostForm initialData={post} onSuccess={handleUpdatePost} />
            <div className="mt-4 text-right">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <PostCard 
            post={post} 
            onDelete={(isAuthor || userIsAdmin) ? handleDelete : undefined} 
            onEdit={isAuthor ? () => setIsEditing(true) : undefined}
          />
        )}
        
        {/* 
          Related posts feature temporarily disabled as we'd need additional
          Firebase queries to implement this properly 
        */}
      </div>
    </MainLayout>
  );
}

// Main page component with Suspense boundary
export default function PostPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </MainLayout>
    }>
      <PostContent />
    </Suspense>
  );
}
