'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Switch } from '@mantine/core';

interface Course {
  id: string;
  code: string;
  name: string;
}

export default function NewPost() {
  const supabase = createClient();
  const [content, setContent] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Fetch courses the user is taking or has taken
  useEffect(() => {
    const fetchUserCourses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('user_courses')
          .select('course:course_id (id, code, name)')
          .eq('user_id', user.id)
          .in('status', ['taking', 'taken']);

        if (error) {
          console.error('Error fetching user courses:', error);
        } else if (data) {
          // @ts-expect-error data is possibly null
          setCourses(data.map((item) => item.course));
        }
      }
    };

    fetchUserCourses();
  }, [supabase]);

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to post.');
      return;
    }

    if (!content || !selectedCourseId) {
      alert('Please fill in both the post content and course.');
      return;
    }

    const { error } = await supabase.from('posts').insert({
      user_id: isAnonymous ? null : user.id,
      course_id: selectedCourseId,
      content,
      is_anonymous: isAnonymous,
    });

    if (error) {
      console.error('Error creating post:', error);
      alert('Error creating post.');
    } else {
      setContent('');
      setSelectedCourseId('');
      setIsAnonymous(false);
      alert('Post created successfully!');
    }
  };

  return (
    <div className="bg-darkblue p-4 rounded-lg mb-4 w-full mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">Create a New Post</h2>
      <textarea
        className="w-full p-2 bg-black text-white border border-gray-600 rounded mb-2"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-white">Course:</label>
          <select
            className="w-full sm:w-auto p-2 bg-black text-white border border-gray-600 rounded"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="">Select a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <Switch
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.currentTarget.checked)}
            label="Anonymous"
            color="green"
          />
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
