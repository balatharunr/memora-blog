'use client';

import Link from 'next/link';
import Image from 'next/image';

const RightSidebar = ({ trending = [], hashtags = [], isLoading = false }) => {
  return (
    <div className="sticky top-4 space-y-6">
      {/* Trending section */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <h3 className="font-bold text-xl mb-4">#trending</h3>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : trending && trending.length > 0 ? (
            trending.map((item) => (
              <Link href={`/post/${item.id}`} key={item.id} className="flex items-center gap-3 group">
                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <Image 
                    src={item.preview} 
                    alt={item.title || "Trending post"}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div>
                  <h4 className="font-medium line-clamp-1 group-hover:text-purple-400">{item.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-1">{item.excerpt}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No trending posts yet.</p>
          )}
        </div>
      </div>
      
      {/* Hashtags section */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <h3 className="font-bold text-xl mb-4">Discover</h3>
        
        <div className="flex flex-wrap gap-2">
          {hashtags && hashtags.length > 0 ? (
            hashtags.map((tag) => {
              // Make sure we don't duplicate the # symbol
              const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
              const displayTag = `#${cleanTag}`;
              
              return (
                <Link 
                  href={`/explore?tag=${encodeURIComponent(cleanTag)}`} 
                  key={tag}
                  className="px-3 py-1 bg-gray-800 hover:bg-purple-900 rounded-full text-sm transition-colors"
                >
                  {displayTag}
                </Link>
              );
            })
          ) : (
            <p className="text-gray-400 text-sm">No hashtags found.</p>
          )}
        </div>
      </div>
      
      {/* Footer links */}
      <div className="text-xs text-gray-500">
        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2">
          <Link href="/about" className="hover:underline">About</Link>
          <span>•</span>
          <Link href="/help" className="hover:underline">Help</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </div>
        <p>© 2025 Memora</p>
      </div>
    </div>
  );
};

export default RightSidebar;
