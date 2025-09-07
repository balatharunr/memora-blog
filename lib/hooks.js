'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  createPost, 
  updatePost, 
  deletePost, 
  getPost, 
  getAllPosts, 
  getUserPosts, 
  toggleLike, 
  checkLiked, 
  addComment, 
  getTrendingPosts,
  searchPosts
} from './firebaseUtils';
import {
  getUserNotifications,
  subscribeToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from './notificationUtils';
import {
  recordPostView,
  getPostAnalytics,
  getUserPostsAnalytics
} from './analyticsUtils';

// Hook to get all posts
export function useAllPosts(limitCount = 50) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const data = await getAllPosts(limitCount);
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPosts();
  }, [limitCount]);

  return { posts, loading, error };
}

// Hook to get a single post
export function usePost(postId) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      if (!postId) return;
      
      try {
        setLoading(true);
        const postData = await getPost(postId);
        setPost(postData);
        
        // Check if user has liked this post
        if (session?.user?.id && postData) {
          const hasLiked = await checkLiked(postId, session.user.id);
          setLiked(hasLiked);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPost();
  }, [postId, session]);

  // Function to handle liking/unliking the post
  const handleLike = async () => {
    if (!session?.user?.id || !postId) return;
    
    try {
      const result = await toggleLike(postId, session.user.id);
      setLiked(result.liked);
      
      // Update post likes count locally
      setPost(prev => ({
        ...prev,
        likes: prev.likes + (result.liked ? 1 : -1)
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Function to handle adding a comment
  const handleComment = async (content) => {
    if (!session?.user?.id || !postId || !content) return;
    
    try {
      const newComment = await addComment(
        postId, 
        session.user.id, 
        session.user.name, 
        session.user.image, 
        content
      );
      
      // Update comments locally
      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
        commentCount: (prev.commentCount || 0) + 1
      }));
      
      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  return { 
    post, 
    loading, 
    error, 
    liked, 
    handleLike, 
    handleComment 
  };
}

// Hook to get user's posts
export function useUserPosts(userId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserPosts() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const data = await getUserPosts(userId);
        setPosts(data);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserPosts();
  }, [userId]);

  return { posts, loading, error };
}

// Hook to create, update or delete a post
export function usePostActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  // Create a new post
  const createNewPost = async (postData) => {
    if (!session?.user) {
      throw new Error('You must be logged in to create a post');
    }
    
    try {
      setLoading(true);
      
      const authorData = {
        id: session.user.id,
        name: session.user.name,
        avatar: session.user.image
      };
      
      const newPost = await createPost({
        ...postData,
        author: authorData
      });
      
      return newPost;
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing post
  const updateExistingPost = async (postId, postData) => {
    if (!session?.user) {
      throw new Error('You must be logged in to update a post');
    }
    
    try {
      setLoading(true);
      
      const updatedPost = await updatePost(postId, {
        ...postData,
        authorId: session.user.id
      });
      
      return updatedPost;
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a post
  const deleteExistingPost = async (postId) => {
    if (!session?.user) {
      throw new Error('You must be logged in to delete a post');
    }
    
    try {
      setLoading(true);
      await deletePost(postId);
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    createPost: createNewPost, 
    updatePost: updateExistingPost, 
    deletePost: deleteExistingPost,
    loading, 
    error 
  };
}

// Hook for trending posts
export function useTrendingPosts(limit = 5) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true);
        const data = await getTrendingPosts(limit);
        setPosts(data);
      } catch (err) {
        console.error('Error fetching trending posts:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTrending();
  }, [limit]);

  return { trendingPosts: posts, loading, error };
}

// Hook for searching posts
export function useSearchPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (query, searchByTag = false) => {
    if (!query) {
      setPosts([]);
      return;
    }
    
    try {
      setLoading(true);
      const results = await searchPosts(query, searchByTag);
      setPosts(results);
    } catch (err) {
      console.error('Error searching posts:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { posts, loading, error, search };
}

// Hook for user notifications with real-time updates
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  
  useEffect(() => {
    if (!session?.user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Set up real-time listener
    const unsubscribe = subscribeToUserNotifications(
      session.user.id,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setLoading(false);
      }
    );
    
    // Clean up listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [session]);
  
  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!session?.user?.id) return;
    
    try {
      await markNotificationAsRead(notificationId);
      // The real-time listener will update the notifications
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!session?.user?.id) return;
    
    try {
      await markAllNotificationsAsRead(session.user.id);
      // The real-time listener will update the notifications
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err);
    }
  };
  
  // Delete a notification
  const removeNotification = async (notificationId) => {
    if (!session?.user?.id) return;
    
    try {
      await deleteNotification(notificationId);
      // The real-time listener will update the notifications
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err);
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!session?.user?.id) return;
    
    try {
      await deleteAllNotifications(session.user.id);
      // The real-time listener will update the notifications
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      setError(err);
    }
  };
  
  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };
}

// Hook for post analytics
export function usePostAnalytics(postId) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }
    
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const data = await getPostAnalytics(postId);
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching post analytics:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalytics();
  }, [postId]);
  
  // Record a view for this post
  const recordView = async (userId = null) => {
    if (!postId) return;
    
    try {
      await recordPostView(postId, userId);
    } catch (err) {
      console.error('Error recording post view:', err);
    }
  };
  
  return { analytics, loading, error, recordView };
}

// Hook for user dashboard analytics
export function useDashboardAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  
  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    
    async function fetchUserAnalytics() {
      try {
        setLoading(true);
        const data = await getUserPostsAnalytics(session.user.id);
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserAnalytics();
  }, [session]);
  
  return { analytics, loading, error };
}
