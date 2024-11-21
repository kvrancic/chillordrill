'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import NewPost from '@/components/NewPost';
import QuestionFeed from '@/components/QuestionFeed';

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* New Post Component */}
        <NewPost />

        {/* Question Feed */}
        <QuestionFeed />
      </div>
    </div>
  );
}
