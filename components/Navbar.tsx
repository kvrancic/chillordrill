'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FiMenu } from 'react-icons/fi';

interface NavbarProps {
  onSidebarToggle: () => void;
}

export default function Navbar({ onSidebarToggle }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
    } else {
      router.push('/login');
    }
  };

  // Determine if we're on a course page
  const isCoursePage = pathname !== '/home' && pathname !== '/login';

  return (
    <nav className="w-full bg-darkblue text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center">
          {/* Sidebar Toggle Button for Mobile */}
          <button
            onClick={onSidebarToggle}
            className="md:hidden mr-2 text-white focus:outline-none"
          >
            <FiMenu size={24} />
          </button>

          {/* Back to Feed Button */}
          {isCoursePage && (
            <button
              onClick={() => router.push('/home')}
              className="hidden md:block text-white hover:text-blue-400 transition-colors"
            >
              ◀ BACK TO FEED
            </button>
          )}
        </div>

        {/* Logo */}
        <div className="flex-1 flex items-center mr-24 justify-center">
          <img src="/logo.png" alt="Logo" className="h-[80px] w-[300px]" />
        </div>

        {/* Right Side */}
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
