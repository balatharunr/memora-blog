'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MainLayout from '../../components/MainLayout';
import Link from 'next/link';
import { FaChartLine, FaHeart, FaComment, FaEye, FaShare, FaFileAlt } from 'react-icons/fa';
import { useDashboardAnalytics, useTrendingPosts } from '../../lib/hooks';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  
  // Get user analytics data
  const { 
    analytics, 
    loading: analyticsLoading, 
    error: analyticsError 
  } = useDashboardAnalytics();
  
  // Get trending posts for sidebar
  const { 
    trendingPosts, 
    loading: trendingLoading 
  } = useTrendingPosts(5);
  
  const isPageLoading = isLoading || analyticsLoading;
  
  if (!session && !isLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-400 mb-4">You need to be signed in to view your dashboard.</p>
          <a href="/auth/signin" className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700">
            Sign In
          </a>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/create" className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700">
            Create Post
          </Link>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isPageLoading ? (
            <div className="col-span-4 flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Posts</p>
                    <h3 className="text-2xl font-bold">{analytics?.totalPosts || 0}</h3>
                  </div>
                  <div className="p-3 bg-purple-600/20 text-purple-400 rounded-full">
                    <FaFileAlt size={20} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Likes</p>
                    <h3 className="text-2xl font-bold">{analytics?.totalLikes || 0}</h3>
                  </div>
                  <div className="p-3 bg-red-600/20 text-red-400 rounded-full">
                    <FaHeart size={20} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Comments</p>
                    <h3 className="text-2xl font-bold">{analytics?.totalComments || 0}</h3>
                  </div>
                  <div className="p-3 bg-blue-600/20 text-blue-400 rounded-full">
                    <FaComment size={20} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Views</p>
                    <h3 className="text-2xl font-bold">{(analytics?.totalViews || 0).toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-green-600/20 text-green-400 rounded-full">
                    <FaEye size={20} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Performance section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isPageLoading ? (
            <div className="col-span-2 flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Most popular post */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-bold text-lg mb-4">Most Popular Post</h3>
                {analytics?.mostPopularPost ? (
                  <div className="space-y-3">
                    <Link href={`/post/${analytics.mostPopularPost.id}`} className="block hover:opacity-80">
                      {analytics.mostPopularPost.image && (
                        <div className="aspect-video relative rounded-md overflow-hidden mb-3">
                          <img 
                            src={analytics.mostPopularPost.image} 
                            alt={analytics.mostPopularPost.title} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <h4 className="font-medium text-lg">{analytics.mostPopularPost.title}</h4>
                      <p className="text-gray-400 line-clamp-2">{analytics.mostPopularPost.content}</p>
                    </Link>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FaHeart className="text-red-500" />
                        <span>{analytics.mostPopularPost.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaComment className="text-gray-400" />
                        <span>{analytics.mostPopularPost.commentCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaEye className="text-green-400" />
                        <span>{analytics.mostPopularPost.views || 0}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No posts yet.</div>
                )}
              </div>
              
              {/* Engagement stats */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-bold text-lg mb-4">Engagement Stats</h3>
                {analytics && Object.keys(analytics.interactionsByDay || {}).length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm text-gray-400 mb-2">Recent Activity</h4>
                      <div className="grid grid-cols-7 gap-1 h-16">
                        {Object.entries(analytics.interactionsByDay || {}).slice(-7).map(([date, stats]) => {
                          const total = stats.likes + stats.comments + stats.views;
                          const height = total > 0 ? (total / 10) * 100 : 5; // Scale height based on activity
                          
                          return (
                            <div key={date} className="flex flex-col items-center">
                              <div className="flex-1 w-full flex items-end">
                                <div 
                                  className="w-full bg-purple-500/50 rounded-t"
                                  style={{ height: `${Math.min(100, Math.max(5, height))}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(date).toLocaleDateString(undefined, { day: 'numeric' })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Engagement Rate:</span>
                        <span className="font-medium">{
                          analytics.totalPosts > 0 
                            ? `${Math.round((analytics.totalLikes + analytics.totalComments) / analytics.totalPosts)} per post`
                            : 'N/A'
                        }</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Avg. Views:</span>
                        <span className="font-medium">{
                          analytics.totalPosts > 0 
                            ? `${Math.round(analytics.totalViews / analytics.totalPosts)} per post`
                            : 'N/A'
                        }</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No engagement data yet.</div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Recent posts and activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent posts */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Recent Posts</h3>
              <Link href={`/profile/${session?.user?.id || ''}`} className="text-sm text-purple-400 hover:underline">View all</Link>
            </div>
            
            {isPageLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : analytics?.recentPosts?.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentPosts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="flex gap-4 hover:bg-gray-800 p-3 rounded-md">
                    {post.image ? (
                      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-800 rounded-md flex-shrink-0 flex items-center justify-center text-gray-600">
                        <FaFileAlt size={24} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{post.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{post.content}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <FaHeart />
                          <span>{post.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaComment />
                          <span>{post.commentCount || 0}</span>
                        </div>
                        <div>{post.createdAt?.toDate ? 
                          new Date(post.createdAt.toDate()).toLocaleDateString() : 'Recent'}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No posts yet.</div>
            )}
          </div>
          
          {/* Trending topics */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="font-bold text-lg mb-4">Trending Now</h3>
            {trendingLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : trendingPosts && trendingPosts.length > 0 ? (
              <div className="space-y-4">
                {trendingPosts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="flex gap-3 group">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={post.image || 'https://via.placeholder.com/150'} 
                        alt={post.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm line-clamp-1 group-hover:text-purple-400">{post.title}</h4>
                      <p className="text-xs text-gray-400">{post.content?.substring(0, 50)}...</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No trending posts yet.</div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
