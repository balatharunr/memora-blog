// Firebase analytics operations
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Collection references
const postsCollection = collection(db, 'posts');
const likesCollection = collection(db, 'likes');
const commentsCollection = collection(db, 'comments');
const viewsCollection = collection(db, 'views');

// Record a post view
export const recordPostView = async (postId, userId = null) => {
  try {
    // Only record unique views per session if not logged in
    // or per user if logged in
    const viewId = userId || `session-${Date.now()}`;
    
    // Add to views collection
    await addDoc(viewsCollection, {
      postId,
      userId: userId || null,
      viewedAt: serverTimestamp()
    });
    
    // Update post view count
    const postRef = doc(postsCollection, postId);
    await updateDoc(postRef, {
      views: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error('Error recording view:', error);
    return false;
  }
};

// Get post analytics
export const getPostAnalytics = async (postId) => {
  try {
    // Get post data
    const postRef = doc(postsCollection, postId);
    const postSnapshot = await getDoc(postRef);
    
    if (!postSnapshot.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postSnapshot.data();
    
    // Get like details using the created index
    const likesQuery = query(
      likesCollection,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    
    const likesSnapshot = await getDocs(likesQuery);
    const likes = [];
    likesSnapshot.forEach((doc) => {
      likes.push({ id: doc.id, ...doc.data() });
    });
    
    // No need to sort likes in memory as they are already sorted by the query
    
    // Get comments for this post
    let comments = [];
    
    try {
      // Try using the index first (once it's built)
      const commentsQuery = query(
        commentsCollection,
        where('postId', '==', postId),
        orderBy('createdAt', 'desc')
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      
      commentsSnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });
      
      // No need to sort comments as they're already sorted by the query
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
      
      // Sort comments by createdAt in memory
      comments.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA; // Descending order (newest first)
      });
    }
    
    // Get view counts for the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const viewsQuery = query(
      viewsCollection,
      where('postId', '==', postId),
      where('viewedAt', '>=', Timestamp.fromDate(oneWeekAgo))
    );
    
    const viewsSnapshot = await getDocs(viewsQuery);
    
    // Group views by day
    const dailyViews = {};
    viewsSnapshot.forEach((doc) => {
      const viewData = doc.data();
      if (viewData.viewedAt) {
        const date = viewData.viewedAt.toDate().toISOString().split('T')[0];
        dailyViews[date] = (dailyViews[date] || 0) + 1;
      }
    });
    
    return {
      id: postId,
      title: postData.title,
      content: postData.content,
      image: postData.image,
      authorId: postData.authorId,
      authorName: postData.authorName,
      createdAt: postData.createdAt,
      likesCount: likes.length,
      commentsCount: comments.length,
      viewsCount: postData.views || viewsSnapshot.size,
      recentLikes: likes.slice(0, 10),
      recentComments: comments.slice(0, 10),
      dailyViews
    };
  } catch (error) {
    console.error('Error getting post analytics:', error);
    throw error;
  }
};

// Get analytics for all user posts
export const getUserPostsAnalytics = async (userId) => {
  try {
    // Get user posts - Option 1: If you've created the index
    // const postsQuery = query(
    //   postsCollection,
    //   where('authorId', '==', userId),
    //   orderBy('createdAt', 'desc')
    // );
    
    // Option 2: Without requiring an index
    const postsQuery = query(
      postsCollection,
      where('authorId', '==', userId)
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    
    const postsData = [];
    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;
    let topPost = null;
    let maxLikes = -1;
    let maxComments = -1;
    
    postsSnapshot.forEach((doc) => {
      const post = { id: doc.id, ...doc.data() };
      postsData.push(post);
      
      const likes = post.likes || 0;
      const comments = post.commentCount || 0;
      const views = post.views || 0;
      
      totalLikes += likes;
      totalComments += comments;
      totalViews += views;
      
      // Track post with most likes
      if (likes > maxLikes) {
        maxLikes = likes;
        topPost = post;
      }
      
      // If likes are equal, compare comments
      if (likes === maxLikes && (comments > maxComments)) {
        maxComments = comments;
        topPost = post;
      }
    });
    
    // Sort posts by createdAt since we removed orderBy from the query
    postsData.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA; // Descending order (newest first)
    });
    
    // Get activity over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const postIds = postsData.map(post => post.id);
    
    // Get recent interactions (likes, comments, views)
    let interactionsByDay = {};
    
    // Get likes over time
    if (postIds.length > 0) {
      const likesQuery = query(
        likesCollection,
        where('postId', 'in', postIds),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      );
      
      const likesSnapshot = await getDocs(likesQuery);
      
      likesSnapshot.forEach((doc) => {
        const likeData = doc.data();
        if (likeData.createdAt) {
          const date = likeData.createdAt.toDate().toISOString().split('T')[0];
          interactionsByDay[date] = interactionsByDay[date] || { likes: 0, comments: 0, views: 0 };
          interactionsByDay[date].likes += 1;
        }
      });
    
      // Get comments over time
      const commentsQuery = query(
        commentsCollection,
        where('postId', 'in', postIds),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      
      commentsSnapshot.forEach((doc) => {
        const commentData = doc.data();
        if (commentData.createdAt) {
          const date = commentData.createdAt.toDate().toISOString().split('T')[0];
          interactionsByDay[date] = interactionsByDay[date] || { likes: 0, comments: 0, views: 0 };
          interactionsByDay[date].comments += 1;
        }
      });
    }
    
    return {
      totalPosts: postsData.length,
      totalLikes,
      totalComments,
      totalViews,
      mostPopularPost: topPost,
      recentPosts: postsData.slice(0, 5),
      interactionsByDay
    };
  } catch (error) {
    console.error('Error getting user posts analytics:', error);
    throw error;
  }
};
