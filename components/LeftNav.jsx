'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  FaHome, 
  FaCompass, 
  FaBell, 
  FaPlusSquare, 
  FaUser,
  FaEllipsisH
} from 'react-icons/fa';

const LeftNav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path) => {
    return pathname === path ? 'font-bold bg-gray-900 text-white' : 'hover:bg-gray-900';
  };

  const navItems = [
    { path: '/', icon: <FaHome size={20} />, label: 'Home' },
    { path: '/explore', icon: <FaCompass size={20} />, label: 'Explore' },
    { path: '/notifications', icon: <FaBell size={20} />, label: 'Notifications' },
    { path: '/create', icon: <FaPlusSquare size={20} />, label: 'Create' },
    { path: session ? `/profile/${session.user.id}` : '/auth/signin', icon: <FaUser size={20} />, label: 'Profile' },
    { path: '/dashboard', icon: <FaCompass size={20} />, label: 'Dashboard' },
  ];

  return (
    <div className="h-screen sticky top-0 p-4">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-500">MEMORA</h1>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className={`flex items-center gap-4 p-3 rounded-md transition ${isActive(item.path)}`}>
                <div>{item.icon}</div>
                <span className="text-lg">{item.label}</span>
              </Link>
            </li>
          ))}
          
          {session && (
            <li className="mt-6">
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-4 p-3 rounded-md hover:bg-gray-900 transition w-full text-left"
              >
                <div><FaEllipsisH size={20} /></div>
                <span className="text-lg">Logout</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default LeftNav;
