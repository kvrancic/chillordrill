'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'

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
  const [searchValue, setSearchValue] = useState('');
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
        // @ts-expect-error - data is possibly null
          setCourses(data.map((item) => item.course));
        }
      }
    };

    fetchUserCourses();
  }, [supabase]);

  // Handle post submission
  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Handle not logged in
      return;
    }

    if (!content || !selectedCourseId) {
      // Handle missing content or course
      alert('Please enter content and select a course.');
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
      // Clear the form
      setContent('');
      setSelectedCourseId('');
      setIsAnonymous(false);
      alert('Post created successfully!');
    }
  };

  return (
    <div className="bg-darkblue p-4 rounded mb-4">
      <h2 className="text-xl font-bold text-white mb-2">Create a New Post</h2>
      <textarea
        className="w-full p-2 bg-black text-white border border-gray-600 rounded mb-2"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      <div className="flex items-center mb-2">
        <label className="text-white mr-2">Course:</label>
        <select
          className="p-2 bg-black text-white border border-gray-600 rounded"
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
      <div className="flex items-center mb-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="anonymous" className="text-white">
          Post anonymously
        </label>
      </div>
      <button
        onClick={handleSubmit}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Post
      </button>
    </div>
  );
}
