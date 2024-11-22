'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'
import PostCard from './PostCard';

//@ts-expect-error - data is possibly null 
export default function DiscussionTab({ course }) {
  const supabase = createClient();
  const [posts, setPosts] = useState([]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(full_name)')
        .eq('course_id', course.id)
        .order('score', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        //@ts-expect-error - data is possibly null 
        setPosts(data);
      }
    };

    fetchPosts();
  }, [course.id, supabase]);

  return (
    <div>
      {posts.map((post) => (
        //@ts-expect-error - data is possibly null 
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
