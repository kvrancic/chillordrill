'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { FiX } from 'react-icons/fi';

interface Course {
  id: string;
  code: string;
  name: string;
}

interface SidebarProps {
  closeSidebar: () => void;
}

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const supabase = createClient();
  const [interestedCourses, setInterestedCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [searchValue, setSearchValue] = useState('');

  // Fetch interested courses
  useEffect(() => {
    const fetchInterestedCourses = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }

        if (!user) {
          console.error('No user is logged in.');
          return;
        }

        const { data, error } = await supabase
          .from('user_courses')
          .select('course_id, courses (id, code, name)')
          .eq('user_id', user.id)
          .eq('status', 'interested');

        if (error) {
          console.error('Error fetching interested courses:', error);
        } else if (data) {
          const courses = data.map((item) => item.courses);
          // @ts-expect-error courses is an array of objects
          setInterestedCourses(courses);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchInterestedCourses();
  }, [supabase]);

  // Fetch all courses (with search)
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, code, name')
          .ilike('name', `%${searchValue}%`)
          .order('name')
          .limit(100);

        if (error) {
          console.error('Error fetching courses:', error);
        } else if (data) {
          setAllCourses(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchAllCourses();
  }, [searchValue, supabase]);

  return (
    <div className="fixed inset-0 z-50 md:static md:z-auto md:w-64 bg-gray-900 h-full pt-10">
      {/* Close Button for Mobile */}
      <div className="md:hidden p-4 flex justify-end">
        <button
          onClick={closeSidebar}
          className="text-gray-500 focus:outline-none"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="bg-darkblue text-white w-full p-4 flex-shrink-0 h-full overflow-y-auto">
        {/* Interested Courses */}
        <div className="mb-6 min-h-1/2">
          <h2 className="text-xl font-bold mb-2">Course Watchlist</h2>
          <div className="space-y-2 max-h-[36vh] overflow-y-auto">
            {interestedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/course/${course.code}`}
                className="block hover:underline"
                onClick={closeSidebar}
              >
                {course.code} - {course.name}
              </Link>
            ))}
          </div>
        </div>

        {/* All Courses */}
        <div className="h-1/2">
          <h2 className="text-xl font-bold mb-2">All Courses</h2>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full p-2 mb-2 bg-black text-white border border-gray-600 rounded"
          />
          <div className="space-y-2 max-h-[36vh] overflow-y-auto">
            {allCourses.map((course) => (
              <Link
                key={course.id}
                href={`/${course.code}`}
                className="block hover:underline"
                onClick={closeSidebar}
              >
                {course.code} - {course.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
