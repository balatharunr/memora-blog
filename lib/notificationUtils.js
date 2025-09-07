// Firebase notification operations
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Collection references
const notificationsCollection = collection(db, 'notifications');

// Create a notification
export const createNotification = async (data) => {
  try {
    const notificationData = {
      userId: data.userId, // user receiving the notification
      fromUserId: data.fromUserId, // user triggering the notification
      fromUserName: data.fromUserName,
      fromUserAvatar: data.fromUserAvatar,
      type: data.type, // 'like', 'comment', 'follow'
      postId: data.postId, // optional, for post-related notifications
      content: data.content || '',
      read: false,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(notificationsCollection, notificationData);
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId, limitCount = 50) => {
  try {
    const notificationsQuery = query(
      notificationsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Set up a real-time listener for notifications
export const subscribeToUserNotifications = (userId, callback) => {
  try {
    // Create a query that works both with and without the index
    let notificationsQuery;
    
    try {
      // Try using the query that requires an index
      notificationsQuery = query(
        notificationsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      return onSnapshot(notificationsQuery, (querySnapshot) => {
        const notifications = [];
        querySnapshot.forEach((doc) => {
          notifications.push({ id: doc.id, ...doc.data() });
        });
        
        // No need to sort as the query already returns sorted data
        callback(notifications);
      }, 
      // Error handler that falls back to client-side sorting if index not ready
      (error) => {
        console.log('Index not ready, falling back to client-side sorting:', error.message);
        setupWithoutIndex();
      });
    } catch (setupError) {
      // If setting up the indexed query fails, fall back to non-indexed approach
      console.log('Error setting up indexed query, using fallback:', setupError.message);
      return setupWithoutIndex();
    }
    
    // Helper function for the fallback approach
    function setupWithoutIndex() {
      const fallbackQuery = query(
        notificationsCollection,
        where('userId', '==', userId),
        limit(100) // Get more items since we'll sort client-side
      );
      
      return onSnapshot(fallbackQuery, (querySnapshot) => {
        const notifications = [];
        querySnapshot.forEach((doc) => {
          notifications.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort in memory
        notifications.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA; // Descending order (newest first)
        });
        
        // Apply limit after sorting
        callback(notifications.slice(0, 50));
      });
    }
  } catch (error) {
    console.error('Error setting up notifications subscription:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(notificationsCollection, notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all user notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsQuery = query(
      notificationsCollection,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    const batch = db.batch();
    querySnapshot.forEach((docSnapshot) => {
      batch.update(docSnapshot.ref, { read: true });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(notificationsCollection, notificationId);
    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Delete all notifications for a user
export const deleteAllNotifications = async (userId) => {
  try {
    const notificationsQuery = query(
      notificationsCollection,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    const batch = db.batch();
    querySnapshot.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};
