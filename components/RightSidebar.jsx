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
              const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
              const displayTag = `#${cleanTag}`;
              return (
                <Link 
                  href={`/explore?tag=${encodeURIComponent(cleanTag)}`} 
                  key={tag}
                  className="px-3 py-1 bg-gray-800 hover:bg-purple-900 rounded-full text-sm transition-colors"
                  prefetch={true} // Ensure data is pre-fetched for smoother transitions
                  scroll={false} // Prevent scroll jumping
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
      {/* Social Media
            <p className="text-gray-400 text-sm">No hashtags found.</p>
          )}
        </div>
      </div>
      
      {/* Social Media Links */}
      <div className="text-xs text-gray-500">
        <div className="flex justify-center items-center gap-6 mb-3">
          <a 
            href="https://www.linkedin.com/in/balatharunr/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-80 transition-opacity text-gray-400 hover:text-gray-300"
            title="LinkedIn"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
              </svg>
            </div>
          </a>
          <a 
            href="https://github.com/balatharunr" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-80 transition-opacity text-gray-400 hover:text-gray-300"
            title="GitHub"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path>
              </svg>
            </div>
          </a>
        </div>
        <p className="text-center">©2025 memora blogs</p>
      </div>
    </div>
  );
};

export default RightSidebar;
