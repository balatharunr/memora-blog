'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MainLayout from '../../../components/MainLayout';
import PostCard from '../../../components/PostCard';
import Image from 'next/image';
import Link from 'next/link';
import { useUserPosts } from '../../../lib/hooks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { 
  updateUserProfile, 
  followUser, 
  unfollowUser, 
  checkIsFollowing, 
  getUserStats 
} from '../../../lib/firebaseUtils';

// Client component that uses the useParams hook
function ProfileContent() {
  const { userId } = useParams();
  const { data: session } = useSession();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: '', bio: '', location: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Use the custom hook to get the user's posts
  const { posts: userPosts, loading: postsLoading } = useUserPosts(userId);

  // Fetch user data from Firestore
  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true);
      
      try {
        let profileUser;
        
        if (session?.user?.id === userId) {
          // It's the current user's profile
          // First try to get user data from Firestore to get any custom fields
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            profileUser = userDoc.data();
          } else {
            // Fallback to session data if not in Firestore
            profileUser = {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              bio: 'This is your profile. You can edit your bio and more.',
              location: 'Your Location'
            };
          }
          
          setIsOwnProfile(true);
        } else {
          // Try to get the user from Firestore
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            profileUser = userDoc.data();
          } else {
            // User not found in database, create basic info
            profileUser = {
              id: userId,
              name: 'Unknown User',
              image: null
            };
          }
          
          setIsOwnProfile(false);
          // Check follow status if user is logged in
          if (session?.user?.id) {
            const followStatus = await checkIsFollowing(session.user.id, userId);
            setIsFollowing(followStatus);
          } else {
            setIsFollowing(false);
          }
        }
        
        setUser(profileUser);
        
        // Set initial form data for the edit profile form
        setProfileFormData({
          name: profileUser.name || '',
          bio: profileUser.bio || '',
          location: profileUser.location || ''
        });
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (userId) {
      fetchUserData();
    }
  }, [userId, session]);
  
  // Update stats when posts are loaded and fetch follower stats
  useEffect(() => {
    async function fetchStats() {
      if (userPosts) {
        try {
          // Get follower and following counts from Firebase
          const userStats = await getUserStats(userId);
          
          setStats(prev => ({
            ...prev,
            posts: userPosts.length,
            followers: userStats.followersCount,
            following: userStats.followingCount
          }));
        } catch (error) {
          console.error('Error fetching user stats:', error);
          setStats(prev => ({
            ...prev,
            posts: userPosts.length
          }));
        }
      }
    }
    
    fetchStats();
  }, [userPosts, userId]);
  
  const toggleFollow = async () => {
    if (!session?.user?.id) {
      // Redirect to sign in if not logged in
      window.location.href = '/auth/signin';
      return;
    }
    
    try {
      if (isFollowing) {
        // Unfollow user
        const result = await unfollowUser(session.user.id, userId);
        if (result.success) {
          setIsFollowing(false);
          // Update local stats for immediate feedback
          setStats(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
        }
      } else {
        // Follow user
        const result = await followUser(session.user.id, userId);
        if (result.success) {
          setIsFollowing(true);
          // Update local stats for immediate feedback
          setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        }
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // Show error message to user (optional)
      alert('Failed to update follow status. Please try again.');
    }
  };
  
  // Refresh the posts when one is deleted or updated
  const refreshPosts = useCallback(() => {
    // This will trigger a refresh of the page
    window.location.reload();
  }, []);
  
  const handleDeletePost = () => {
    refreshPosts();
  };
  
  const handleEditPost = () => {
    refreshPosts();
  };
  
  // Handle opening the edit profile modal
  const handleEditProfileClick = () => {
    setProfileFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });
    setShowEditModal(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    
    try {
      setIsUpdating(true);
      
      // Update the user profile in Firestore
      const updatedUser = await updateUserProfile(session.user.id, {
        name: profileFormData.name,
        bio: profileFormData.bio,
        location: profileFormData.location
      });
      
      // Update local state
      setUser(prev => ({
        ...prev,
        name: updatedUser.name,
        bio: updatedUser.bio,
        location: updatedUser.location
      }));
      
      // Close the modal
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (isLoading || postsLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  // Check if the user is not authenticated
  if (!session && !isLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p className="text-gray-400 mb-4">You need to be signed in to view profiles.</p>
          <Link href="/auth/signin" className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700">
            Sign In
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  // Check if user data doesn\'t exist
  if (!user) {
    return (
      <MainLayout>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-400">The user you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Profile header */}
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden relative">
              {user.image ? (
                <Image 
                  src={user.image} 
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white text-4xl">
                  {user.name ? user.name[0] : '?'}
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                
                {isOwnProfile ? (
                  <button 
                    onClick={handleEditProfileClick}
                    className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    onClick={toggleFollow}
                    className={`px-6 py-2 rounded-md ${
                      isFollowing 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } transition-colors`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              
              <div className="flex justify-center md:justify-start gap-6 mb-4 text-sm">
                <div>
                  <span className="font-bold">{stats.posts}</span> posts
                </div>
                <div>
                  <span className="font-bold">{stats.followers}</span> followers
                </div>
                <div>
                  <span className="font-bold">{stats.following}</span> following
                </div>
              </div>
              
              {user.bio && <p className="mb-2">{user.bio}</p>}
              {user.location && (
                <div className="text-sm text-gray-400">
                  <span className="mr-1">📍</span> {user.location}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'posts' 
                  ? 'border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Posts
            </button>
            <button 
              onClick={() => setActiveTab('likes')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'likes' 
                  ? 'border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Likes
            </button>
            {isOwnProfile && (
              <button 
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'saved' 
                    ? 'border-b-2 border-purple-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Saved
              </button>
            )}
          </div>
        </div>
        
        {/* Content based on active tab */}
        <div>
          {activeTab === 'posts' && (
            <>
              {userPosts.length > 0 ? (
                <div className="space-y-6">
                  {userPosts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onDelete={isOwnProfile ? handleDeletePost : undefined} 
                      onEdit={isOwnProfile ? handleEditPost : undefined}
                      refreshPosts={refreshPosts}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg p-8 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4a.5.5 0 01-.5-.5v-7l4 4 4-4 4 4v3.5a.5.5 0 01-.5.5zm0-10a.5.5 0 00-.5.5v2.5l-4-4-4 4-4-4V5.5a.5.5 0 01.5-.5h12z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-400">No posts yet</p>
                  {isOwnProfile && (
                    <Link href="/create" className="mt-4 inline-block text-purple-400 hover:underline">
                      Create your first post
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'likes' && (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-400">No liked posts yet</p>
            </div>
          )}
          
          {activeTab === 'saved' && (
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <p className="text-gray-400">No saved posts yet</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              disabled={isUpdating}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileFormData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileFormData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tell others about yourself"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={profileFormData.location}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your location"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="mr-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

// Main page component with Suspense boundary
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </MainLayout>
    }>
      <ProfileContent />
    </Suspense>
  );
}
