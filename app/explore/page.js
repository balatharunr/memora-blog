'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import PostCard from '../../components/PostCard';
import Link from 'next/link';
import { useAllPosts } from '../../lib/hooks';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Simple direct Firebase query function for hashtags
async function searchPostsByTag(tag) {
  if (!tag) return [];
  
  try {
    // Make sure the tag is properly formatted (remove # if present)
    const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
    console.log(`Searching for posts with tag: ${cleanTag}`);
    
    const postsCollection = collection(db, 'posts');
    const postsQuery = query(
      postsCollection,
      where('hashtags', 'array-contains', cleanTag)
    );
    
    const snapshot = await getDocs(postsQuery);
    console.log(`Found ${snapshot.size} posts with tag ${cleanTag}`);
    
    const posts = [];
    snapshot.forEach(doc => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    return posts;
  } catch (error) {
    console.error('Error searching by tag:', error);
    return [];
  }
}

// Client component that uses searchParams
function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tagParam = searchParams.get('tag');
  
  // States - keep it simple
  const [activeTag, setActiveTag] = useState(tagParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  
  // Get all posts
  const { posts: allPosts, loading: allPostsLoading } = useAllPosts();
  
  // Get list of hashtags from all posts
  const [hashtags, setHashtags] = useState([]);
  
  // Handle tag parameter from URL with proper cleanup
  useEffect(() => {
    if (tagParam) {
      // Clean up the tag from URL params (remove # if present)
      const cleanTag = tagParam.startsWith('#') ? tagParam.substring(1) : tagParam;
      
      if (cleanTag !== activeTag) {
        console.log(`Setting active tag from URL: ${cleanTag}`);
        setActiveTag(cleanTag);
      }
    }
  }, [tagParam, activeTag]);
  
  // Extract hashtags from all posts
  useEffect(() => {
    if (allPosts?.length > 0) {
      const tagsMap = new Map();
      
      allPosts.forEach(post => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach(tag => {
            tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
          });
        }
      });
      
      // Sort by frequency
      const sortedTags = Array.from(tagsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])
        .slice(0, 10); // Only take top 10
        
      setHashtags(sortedTags);
      
      // If no active tag, set filtered posts to all posts
      if (activeTag === 'all') {
        setFilteredPosts(allPosts);
      }
    }
  }, [allPosts, activeTag]);
  
  // Effect to filter posts when active tag changes
  useEffect(() => {
    const filterPosts = async () => {
      // Skip if posts are still loading
      if (allPostsLoading) return;
      
      // Handle "all" tag (no filtering)
      if (activeTag === 'all') {
        setFilteredPosts(allPosts || []);
        setIsLoading(false);
        return;
      }
      
      // For any other tag, do a direct Firebase query
      try {
        setIsLoading(true);
        setFilteredPosts([]); // Clear posts while loading
        
        // Make sure the tag is properly formatted (remove # if present)
        const cleanTag = activeTag.startsWith('#') ? activeTag.substring(1) : activeTag;
        console.log(`Filtering posts for tag: ${cleanTag}`);
        
        const taggedPosts = await searchPostsByTag(cleanTag);
        
        // Give a small delay for smooth transition
        setTimeout(() => {
          setFilteredPosts(taggedPosts);
          setIsLoading(false);
        }, 300);
      } catch (error) {
        console.error('Error filtering posts:', error);
        setFilteredPosts([]);
        setIsLoading(false);
      }
    };
    
    filterPosts();
  }, [activeTag, allPosts, allPostsLoading]);
  
  // Handler for tag clicks with proper cleanup and routing
  const handleTagClick = (tag) => {
    if (isLoading) return; // Prevent clicking during loading
    
    // Make sure we always clean the tag properly (remove # if present)
    const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
    
    // Don't do anything if it's the same tag
    if (cleanTag === activeTag) return;
    
    // Update URL with proper encoding
    if (cleanTag !== 'all') {
      router.push(`/explore?tag=${encodeURIComponent(cleanTag)}`, { scroll: false });
    } else {
      router.push('/explore', { scroll: false });
    }
    
    // Reset search if there is any
    setSearchQuery('');
    
    // Update active tag
    setActiveTag(cleanTag);
    
    console.log(`Tag clicked: ${cleanTag}`);
  };
  
  // Simple search functionality
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Submit search form
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;
    
    // Show loading indicator
    setIsLoading(true);
    
    // Simple client-side filtering
    setTimeout(() => {
      const results = allPosts.filter(post => {
        const title = (post.title || '').toLowerCase();
        const content = (post.content || '').toLowerCase();
        
        return title.includes(query) || content.includes(query);
      });
      
      setFilteredPosts(results);
      setIsLoading(false);
      
      // Reset tag to "all" if needed
      if (activeTag !== 'all') {
        router.push('/explore', { scroll: false });
        setActiveTag('all');
      }
    }, 300);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6 w-full post-container">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Explore</h1>
        </div>
        
        {/* Simple search bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search posts, people, hashtags..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
        
        {/* Simple tag filters */}
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar space-x-2">
          <button
            onClick={() => handleTagClick('all')}
            disabled={isLoading || activeTag === 'all'}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              activeTag === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            All
          </button>
          
          {hashtags.map((tag) => {
            const displayTag = tag.startsWith('#') ? tag : `#${tag}`;
            const isActive = activeTag === tag || activeTag === tag.substring(1);
            return (
              <button
                key={tag}
                onClick={() => !isActive && handleTagClick(tag)}
                disabled={isLoading || isActive}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {displayTag}
              </button>
            );
          })}
        </div>
        
        {/* Simple loading spinner */}
        {(isLoading || allPostsLoading) ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          // Simple post grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="col-span-2 bg-gray-900 rounded-lg p-8 text-center">
                <p className="text-gray-400">No posts found matching your criteria.</p>
                {activeTag !== 'all' && (
                  <button
                    onClick={() => handleTagClick('all')}
                    className="mt-4 text-purple-400 hover:underline"
                  >
                    View all posts
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Main page component with Suspense boundary
export default function ExplorePage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Explore</h1>
          </div>
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
      </MainLayout>
    }>
      <ExploreContent />
    </Suspense>
  );
}
