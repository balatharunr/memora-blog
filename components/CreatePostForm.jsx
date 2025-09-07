'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FaImage, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { usePostActions } from '../lib/hooks';

const CreatePostForm = ({ onSuccess, initialData }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { createPost, updatePost, loading: firestoreLoading, error: firestoreError } = usePostActions();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [image, setImage] = useState(initialData?.image || null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [hashtags, setHashtags] = useState(initialData?.hashtags?.join(', ') || '');
  const [error, setError] = useState('');
  
  const isEditing = !!initialData;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }
      
      return data.url; // Return the Cloudinary image URL
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image: ' + error.message);
      return null;
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const processedHashtags = hashtags
        .split(',')
        .map(tag => tag.trim().replace(/^#/, ''))
        .filter(Boolean);
        
      const postData = {
        title,
        content,
        hashtags: processedHashtags
      };
      
      // Handle image upload to Cloudinary if it exists
      if (image) {
        // If image is a File object (from file input)
        if (image instanceof File) {
          // Upload to Cloudinary first
          const cloudinaryUrl = await uploadImageToCloudinary(image);
          if (cloudinaryUrl) {
            postData.image = cloudinaryUrl;
          } else {
            throw new Error('Image upload failed');
          }
        } 
        // If image is a URL string and hasn't changed from the initial data
        else if (typeof image === 'string') {
          postData.image = image;
        }
      }
      
      let result;
      
      if (isEditing) {
        result = await updatePost(initialData.id, postData);
      } else {
        result = await createPost(postData);
      }
      
      // Call the success callback with the result
      onSuccess(result);
      
      if (!isEditing) {
        // Clear form if creating new post
        setTitle('');
        setContent('');
        setImage(null);
        setImagePreview(null);
        setHashtags('');
      }
      
    } catch (err) {
      console.error('Error creating/updating post:', err);
      setError(err.message || 'Error creating post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || firestoreError) && (
        <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-2 rounded-md">
          {error || (firestoreError && firestoreError.message)}
        </div>
      )}
      
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500"
        />
      </div>
      
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={5}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500"
          required
        />
      </div>
      
      <div>
        <input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="Add hashtags separated by commas (e.g. travel, photography)"
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-purple-500"
        />
      </div>
      
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          <FaImage /> Add Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
      
      {imagePreview && (
        <div className="relative">
          <div className="relative w-full h-64 rounded-md overflow-hidden">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 bg-gray-900 text-white rounded-full p-2 hover:bg-red-600"
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || firestoreLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting || firestoreLoading ? 'Posting...' : isEditing ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </form>
  );
};

export default CreatePostForm;
