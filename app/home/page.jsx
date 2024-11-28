'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import NewPost from '@/components/NewPost';
import QuestionFeed from '@/components/QuestionFeed';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 md:hidden">
            <Sidebar closeSidebar={closeSidebar} />
          </div>
        )}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4">
              {/* Navbar */}
          <Navbar onSidebarToggle={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />
          <NewPost />
          <QuestionFeed />
        </div>
      </div>
    </div>
  );
}
