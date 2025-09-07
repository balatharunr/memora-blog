'use client';

import LeftNav from './LeftNav';
import RightSidebar from './RightSidebar';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTrendingPosts, useAllPosts } from '../lib/hooks';

const MainLayout = ({ children }) => {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  
  // Get trending posts from Firebase
  const { trendingPosts, loading: trendingLoading } = useTrendingPosts(5);
  
  // Get top hashtags
  const { posts: allPosts } = useAllPosts();
  
  // Extract hashtags from posts
  const topHashtags = (() => {
    if (!allPosts || allPosts.length === 0) return [];
    
    const tagsCount = {};
    
    allPosts.forEach(post => {
      if (post.hashtags && Array.isArray(post.hashtags)) {
        post.hashtags.forEach(tag => {
          tagsCount[tag] = (tagsCount[tag] || 0) + 1;
        });
      }
    });
    
    return Object.keys(tagsCount)
      .sort((a, b) => tagsCount[b] - tagsCount[a])
      .slice(0, 10);
  })();

  return (
    <div className="flex min-h-screen">
      {/* Left sidebar - desktop only */}
      <div className="hidden lg:block w-64 flex-shrink-0 fixed top-0 h-screen z-10 bg-black border-r border-gray-800">
        <LeftNav />
      </div>
      
      {/* Mobile header - only visible on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 flex justify-center items-center py-3 px-4 bg-black border-b border-gray-800 z-20">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl memora-font text-purple-500">MEMORA</h1>
          <span className="blog-font mobile-blog-font">Blogs</span>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <div className="max-w-6xl mx-auto py-8 pb-20 lg:pb-8 mt-14 lg:mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-3 sm:px-4">
            <div className="lg:col-span-3">
              {children}
            </div>
            
            {/* Right sidebar - only on desktop */}
            <div className="hidden lg:block">
              <RightSidebar 
                trending={trendingPosts?.map(post => ({
                  id: post.id,
                  title: post.title || 'Untitled Post',
                  excerpt: post.content?.substring(0, 60) + '...',
                  preview: post.image || 'https://picsum.photos/400/300' // Fallback image
                }))} 
                hashtags={topHashtags}
                isLoading={trendingLoading} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center p-2 bg-black border-t border-gray-800 z-20">
        <Link href="/" className="p-3">
          <span className="sr-only">Home</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </Link>
        <Link href="/explore" className="p-3">
          <span className="sr-only">Explore</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </Link>
        <Link href="/create" className="p-3">
          <span className="sr-only">Create</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </Link>
        <Link href="/notifications" className="p-3">
          <span className="sr-only">Notifications</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </Link>
        <Link href={session ? `/profile/${session.user.id}` : '/auth/signin'} className="p-3">
          <span className="sr-only">Profile</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default MainLayout;
