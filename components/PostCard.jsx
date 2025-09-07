'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaRegHeart, FaComment, FaEllipsisH } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { checkLiked, toggleLike, addComment } from '../lib/firebaseUtils';
import { usePostActions } from '../lib/hooks';

const PostCard = ({ post, onDelete, onEdit, refreshPosts }) => {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const { deletePost } = usePostActions();

  const isAuthor = session?.user?.id === post.authorId;
  
  // Check if user has liked this post
  useEffect(() => {
    const checkIfLiked = async () => {
      if (session?.user?.id) {
        try {
          const hasLiked = await checkLiked(post.id, session.user.id);
          setLiked(hasLiked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };
    
    checkIfLiked();
  }, [post.id, session]);
  
  const toggleLikeHandler = async () => {
    if (!session?.user?.id) {
      // Redirect to sign in if not logged in
      window.location.href = '/auth/signin';
      return;
    }

    try {
      setLoading(true);
      const result = await toggleLike(post.id, session.user.id);
      setLiked(result.liked);
      setLikes(prev => prev + (result.liked ? 1 : -1));
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !session?.user) return;
    
    try {
      setLoading(true);
      const newComment = await addComment(
        post.id,
        session.user.id,
        session.user.name,
        session.user.image,
        commentText
      );
      
      // Format the timestamp for UI display
      const commentWithFormattedDate = {
        ...newComment,
        createdAt: new Date() // The server timestamp won't be available immediately
      };
      
      setComments(prev => [...prev, commentWithFormattedDate]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setLoading(true);
        await deletePost(post.id);
        setShowMenu(false);
        // Notify parent component to refresh posts
        refreshPosts && refreshPosts();
        onDelete && onDelete(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden mb-4 border border-gray-800">
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.authorId}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden relative">
              {post.authorImage ? (
                <Image 
                  src={post.authorImage} 
                  alt={post.authorName || 'User'} 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white">
                  {post.authorName ? post.authorName[0] : '?'}
                </div>
              )}
            </div>
          </Link>
          
          <div>
            <Link href={`/profile/${post.authorId}`} className="font-medium hover:underline">
              {post.authorName || 'Anonymous'}
            </Link>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          <span className="mr-2">
            {post.readableDate || 
              (post.createdAt && post.createdAt.seconds ? 
                formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true }) :
                'Recently')}
          </span>
          
          {isAuthor && (
            <div className="relative inline-block">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2">
                <FaEllipsisH />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        onEdit && onEdit(post);
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      Edit Post
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Post content */}
      <div className="px-4 pb-3">
        {post.title && <h3 className="font-bold text-lg mb-2">{post.title}</h3>}
        <p className="mb-4 whitespace-pre-line">{post.content}</p>
        
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {post.hashtags.map(tag => (
              <Link 
                key={tag} 
                href={`/explore?tag=${tag}`} 
                className="text-purple-400 text-sm hover:underline"
                prefetch={true} // Ensure data is pre-fetched for smoother transitions
                scroll={false} // Prevent scroll jumping
              >
                <span className="transition-all duration-300 hover:text-purple-300">#{tag}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Post image */}
      {post.image && (
        <div className="relative w-full h-96">
          <Image 
            src={post.image} 
            alt={post.title || "Post image"} 
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Post actions */}
      <div className="px-4 py-3 flex items-center gap-6 border-t border-gray-800">
        <button 
          onClick={toggleLikeHandler}
          className={`flex items-center gap-2 text-sm ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          disabled={loading}
        >
          {liked ? (
            <FaHeart className="text-red-500" size={20} />
          ) : (
            <FaRegHeart size={20} />
          )}
          <span>{likes}</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm"
        >
          <FaComment size={20} />
          <span>{post.commentCount || comments.length || 0}</span>
        </button>
      </div>
      
      {/* Comments section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="mb-4 max-h-60 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="mb-3">
                  <div className="flex items-start gap-2">
                    <div className="font-medium">{comment.userName || comment.author?.name || 'User'}</div>
                    <div className="text-gray-300">{comment.content}</div>
                  </div>
                  <div className="text-xs text-gray-400 ml-4 mt-1">
                    {comment.createdAt && comment.createdAt.seconds ? 
                      formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true }) : 
                      'Just now'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm">No comments yet. Be the first to comment!</div>
            )}
          </div>
          
          {session ? (
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50"
              >
                Post
              </button>
            </form>
          ) : (
            <div className="text-center text-sm text-gray-400 py-2">
              <Link href="/auth/signin" className="text-purple-400 hover:underline">Sign in</Link> to add a comment
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
