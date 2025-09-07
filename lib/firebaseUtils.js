// Firebase CRUD operations for posts
import { 
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { createNotification } from './notificationUtils';

// Collection references
const postsCollection = collection(db, 'posts');
const likesCollection = collection(db, 'likes');
const commentsCollection = collection(db, 'comments');
const usersCollection = collection(db, 'users');
const followersCollection = collection(db, 'followers');

// Create or update user in Firestore from session
export const createOrUpdateUser = async (user) => {
  if (!user?.id) return null;
  
  const userRef = doc(usersCollection, user.id);
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    updatedAt: serverTimestamp()
  };
  
  await setDoc(userRef, userData, { merge: true });
  return userData;
};

// Update user profile fields
export const updateUserProfile = async (userId, profileData) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(usersCollection, userId);
    
    // Get current user data first
    const userSnapshot = await getDoc(userRef);
    if (!userSnapshot.exists()) {
      throw new Error('User not found');
    }
    
    // Update only the provided fields
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    
    // Return the updated user data
    const updatedSnapshot = await getDoc(userRef);
    return updatedSnapshot.exists() ? { id: userId, ...updatedSnapshot.data() } : null;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Upload image to Firebase Storage - No longer used, kept for reference
export const uploadImage = async (file, path) => {
  console.warn('Firebase Storage upload is being called but we are using Cloudinary now');
  return null;
};

// Create a new post
export const createPost = async (postData) => {
  try {
    // Image is now handled by Cloudinary before this function is called
    let imageUrl = postData.image;
    
    const newPost = {
      title: postData.title || '',
      content: postData.content,
      image: imageUrl || null,
      authorId: postData.author.id,
      authorName: postData.author.name,
      authorImage: postData.author.avatar,
      hashtags: postData.hashtags || [],
      likes: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(postsCollection, newPost);
    return { id: docRef.id, ...newPost };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get a single post by ID
export const getPost = async (postId) => {
  try {
    const postRef = doc(postsCollection, postId);
    const postSnapshot = await getDoc(postRef);
    
    if (!postSnapshot.exists()) {
      return null;
    }
    
    // Get comments for this post
    let comments = [];
    
    try {
      // Try using the index (once it's built)
      const commentsQuery = query(
        commentsCollection,
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      
      commentsSnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      
      // No need to sort as they're already sorted by the query
    } catch (indexError) {
      // Fallback if index is not ready yet
      console.log('Index not ready yet, using client-side sorting');
      
      const commentsQuery = query(
        commentsCollection,
        where('postId', '==', postId)
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      
      commentsSnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort comments by createdAt in ascending order (oldest first)
      comments.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateA - dateB; // Ascending order (oldest first)
      });
    }
    
    return {
      id: postSnapshot.id,
      ...postSnapshot.data(),
      comments
    };
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

// Get all posts
export const getAllPosts = async (limitCount = 50) => {
  try {
    const postsQuery = query(
      postsCollection,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(postsQuery);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Get posts by user ID
export const getUserPosts = async (userId) => {
  try {
    const postsQuery = query(
      postsCollection,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(postsQuery);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
};

// Update a post
export const updatePost = async (postId, postData) => {
  try {
    const postRef = doc(postsCollection, postId);
    const postSnapshot = await getDoc(postRef);
    
    if (!postSnapshot.exists()) {
      throw new Error('Post not found');
    }
    
    // Image is now handled by Cloudinary before this function is called
    let imageUrl = postData.image;
    
    const updatedPost = {
      title: postData.title || '',
      content: postData.content,
      hashtags: postData.hashtags || [],
      updatedAt: serverTimestamp()
    };
    
    // Only update image if a new one was provided
    if (imageUrl !== undefined) {
      updatedPost.image = imageUrl;
    }
    
    await updateDoc(postRef, updatedPost);
    return { id: postId, ...updatedPost };
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    // Get post data first
    const postRef = doc(postsCollection, postId);
    const postSnapshot = await getDoc(postRef);
    
    if (!postSnapshot.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postSnapshot.data();
    
    // Note: We're not deleting Cloudinary images here
    // For a production app, you might want to implement a cleanup function
    // that calls the Cloudinary API to delete unused images
    
    // Delete post document
    await deleteDoc(postRef);
    
    // Delete associated comments
    const commentsQuery = query(
      commentsCollection,
      where('postId', '==', postId)
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    
    commentsSnapshot.forEach(async (commentDoc) => {
      await deleteDoc(doc(commentsCollection, commentDoc.id));
    });
    
    // Delete associated likes
    const likesQuery = query(
      likesCollection,
      where('postId', '==', postId)
    );
    
    const likesSnapshot = await getDocs(likesQuery);
    
    likesSnapshot.forEach(async (likeDoc) => {
      await deleteDoc(doc(likesCollection, likeDoc.id));
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId, userId, userName, userImage, content) => {
  try {
    const comment = {
      postId,
      userId,
      userName,
      userImage: userImage || null,
      content,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(commentsCollection, comment);
    
    // Update comment count on post
    const postRef = doc(postsCollection, postId);
    const postSnapshot = await getDoc(postRef);
    
    if (postSnapshot.exists()) {
      const postData = postSnapshot.data();
      
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      // Create notification for post author if they're not the commenter
      if (postData.authorId !== userId) {
        await createNotification({
          userId: postData.authorId,
          fromUserId: userId,
          fromUserName: userName,
          fromUserAvatar: userImage,
          type: 'comment',
          postId,
          content: `commented: "${content.length > 30 ? content.substring(0, 30) + '...' : content}"`
        });
      }
    }
    
    return { id: docRef.id, ...comment };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Like or unlike a post
export const toggleLike = async (postId, userId) => {
  try {
    const likeQuery = query(
      likesCollection,
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    
    const likeSnapshot = await getDocs(likeQuery);
    const postRef = doc(postsCollection, postId);
    const postSnapshot = await getDoc(postRef);
    
    if (likeSnapshot.empty) {
      // Add like
      await addDoc(likesCollection, {
        postId,
        userId,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(postRef, {
        likes: increment(1)
      });
      
      // Create a notification for the post author (if not self-liked)
      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        
        if (postData.authorId !== userId) {
          // Get user data for the notification
          const usersCollection = collection(db, 'users');
          const userRef = doc(usersCollection, userId);
          const userSnapshot = await getDoc(userRef);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            
            await createNotification({
              userId: postData.authorId,
              fromUserId: userId,
              fromUserName: userData.name,
              fromUserAvatar: userData.image,
              type: 'like',
              postId,
              content: 'liked your post'
            });
          }
        }
      }
      
      return { liked: true };
    } else {
      // Remove like
      likeSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      await updateDoc(postRef, {
        likes: increment(-1)
      });
      
      return { liked: false };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Check if a user has liked a post
export const checkLiked = async (postId, userId) => {
  try {
    const likeQuery = query(
      likesCollection,
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    
    const likeSnapshot = await getDocs(likeQuery);
    return !likeSnapshot.empty;
  } catch (error) {
    console.error('Error checking like status:', error);
    throw error;
  }
};

// Search posts
export const searchPosts = async (searchQuery, searchByTag = false) => {
  try {
    let posts = [];
    
    if (searchByTag) {
      // Clean search query to ensure proper hashtag matching
      const cleanTag = searchQuery.trim();
      console.log(`Searching for hashtag: '${cleanTag}'`);
      
      try {
        // Simple query without timing out to avoid complexity
        const postsQuery = query(
          postsCollection,
          where('hashtags', 'array-contains', cleanTag)
        );
        
        console.log('Executing hashtag query...');
        const querySnapshot = await getDocs(postsQuery);
        console.log(`Found ${querySnapshot.size} posts with hashtag: ${cleanTag}`);
        
        querySnapshot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort in memory
        posts.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA; // Descending order (newest first)
        });
      } catch (error) {
        console.error('Error in tag search:', error);
        return []; // Return empty array on error
      }
    } else {
      // For a full text search
      try {
        const postsQuery = query(
          postsCollection,
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(postsQuery);
        const searchTermLower = searchQuery.toLowerCase();
        
        // Simplified approach - process all at once for smaller datasets
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const title = (data.title || '').toLowerCase();
          const content = (data.content || '').toLowerCase();
          
          if (title.includes(searchTermLower) || content.includes(searchTermLower)) {
            posts.push({ id: doc.id, ...data });
          }
        });
      } catch (error) {
        console.error('Error in text search:', error);
        return []; // Return empty array on error
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Error searching posts:', error);
    return []; // Return empty array on any error
  }
};

// Get trending posts by likes
export const getTrendingPosts = async (limitCount = 5) => {
  try {
    const postsQuery = query(
      postsCollection,
      orderBy('likes', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(postsQuery);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    return posts;
  } catch (error) {
    console.error('Error getting trending posts:', error);
    throw error;
  }
};

// Follow a user
export const followUser = async (followerId, followingId) => {
  if (!followerId || !followingId || followerId === followingId) return null;
  
  try {
    // Check if already following
    const followQuery = query(
      followersCollection,
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    
    const followSnapshot = await getDocs(followQuery);
    
    if (followSnapshot.empty) {
      // Create new follow relationship
      const followDoc = {
        followerId, // The user who is following
        followingId, // The user being followed
        createdAt: serverTimestamp()
      };
      
      await addDoc(followersCollection, followDoc);
      
      // Increment following count for follower
      const followerRef = doc(usersCollection, followerId);
      const followerSnapshot = await getDoc(followerRef);
      
      if (followerSnapshot.exists()) {
        await updateDoc(followerRef, {
          followingCount: increment(1)
        });
      } else {
        // Create the user document if it doesn't exist
        await setDoc(followerRef, {
          id: followerId,
          followingCount: 1,
          followersCount: 0
        }, { merge: true });
      }
      
      // Increment followers count for the one being followed
      const followingRef = doc(usersCollection, followingId);
      const followingSnapshot = await getDoc(followingRef);
      
      if (followingSnapshot.exists()) {
        await updateDoc(followingRef, {
          followersCount: increment(1)
        });
      } else {
        // Create the user document if it doesn't exist
        await setDoc(followingRef, {
          id: followingId,
          followersCount: 1,
          followingCount: 0
        }, { merge: true });
      }
      
      // Create a notification for the user being followed
      try {
        // Get follower details for notification
        const followerData = followerSnapshot.exists() 
          ? followerSnapshot.data() 
          : { name: 'A user', image: null };
          
        await createNotification({
          userId: followingId,
          fromUserId: followerId,
          fromUserName: followerData.name,
          fromUserAvatar: followerData.image,
          type: 'follow',
          content: 'started following you'
        });
      } catch (notifError) {
        console.error('Error creating follow notification:', notifError);
        // Continue execution even if notification fails
      }
      
      return { success: true, isFollowing: true };
    }
    
    return { success: false, isFollowing: true, message: 'Already following' };
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (followerId, followingId) => {
  if (!followerId || !followingId) return null;
  
  try {
    // Find the follow relationship
    const followQuery = query(
      followersCollection,
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    
    const followSnapshot = await getDocs(followQuery);
    
    if (!followSnapshot.empty) {
      // Delete each matching document (should only be one)
      followSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      
      // Decrement following count for follower
      const followerRef = doc(usersCollection, followerId);
      await updateDoc(followerRef, {
        followingCount: increment(-1)
      });
      
      // Decrement followers count for the one being unfollowed
      const followingRef = doc(usersCollection, followingId);
      await updateDoc(followingRef, {
        followersCount: increment(-1)
      });
      
      return { success: true, isFollowing: false };
    }
    
    return { success: false, isFollowing: false, message: 'Not following' };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

// Check if a user is following another user
export const checkIsFollowing = async (followerId, followingId) => {
  if (!followerId || !followingId) return false;
  
  try {
    const followQuery = query(
      followersCollection,
      where('followerId', '==', followerId),
      where('followingId', '==', followingId)
    );
    
    const followSnapshot = await getDocs(followQuery);
    return !followSnapshot.empty;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

// Get user stats (followers count, following count)
export const getUserStats = async (userId) => {
  if (!userId) return { followersCount: 0, followingCount: 0 };
  
  try {
    const userRef = doc(usersCollection, userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return {
        followersCount: userData.followersCount || 0,
        followingCount: userData.followingCount || 0
      };
    }
    
    return { followersCount: 0, followingCount: 0 };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { followersCount: 0, followingCount: 0 };
  }
};
