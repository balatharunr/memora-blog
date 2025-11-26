'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import MainLayout from '../../components/MainLayout';
import Image from 'next/image';
import Link from 'next/link';
import { useNotifications } from '../../lib/hooks';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotifications();
  
  const [filter, setFilter] = useState('all');
  
  const toggleReadStatus = (notificationId) => {
    markAsRead(notificationId);
  };
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === filter);
  
  const isPageLoading = isLoading || notificationsLoading;
  
  if (!session && !isLoading) {
    return (
      <MainLayout>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Notifications</h1>
          <p className="text-gray-400 mb-4">You need to be signed in to see your notifications.</p>
          <Link href="/auth/signin" className="bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700">
            Sign In
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => markAllAsRead()}
              className="text-sm text-gray-400 hover:text-white"
              disabled={isPageLoading}
            >
              Mark all as read
            </button>
            <button
              onClick={() => clearAllNotifications()}
              className="text-sm text-gray-400 hover:text-white"
              disabled={isPageLoading}
            >
              Clear all
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          
          <button
            onClick={() => setFilter('like')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              filter === 'like'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Likes
          </button>
          
          <button
            onClick={() => setFilter('comment')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              filter === 'comment'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Comments
          </button>
          
          <button
            onClick={() => setFilter('follow')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              filter === 'follow'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Follows
          </button>
        </div>
        
        {/* Notification list */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          {isPageLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 flex items-start border-b border-gray-800 last:border-b-0 ${
                  !notification.read ? 'bg-gray-800/50' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
                  <Image 
                    src={notification.fromUserAvatar || "https://via.placeholder.com/150"}
                    alt={notification.fromUserName || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="text-sm">
                      <Link href={`/profile/${notification.fromUserId || ''}`} className="font-medium hover:underline">
                        {notification.fromUserName}
                      </Link>
                      {' '}
                      <span className="text-gray-400">{notification.content}</span>
                      {notification.postId && (
                        <Link href={`/post/${notification.postId}`} className="text-purple-400 hover:underline">
                          {' '}View post
                        </Link>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleReadStatus(notification.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {notification.read ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    {notification.createdAt?.toDate ? 
                      formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true }) : 
                      'Just now'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
