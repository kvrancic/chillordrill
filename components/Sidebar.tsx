'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link';
import { FiMenu } from 'react-icons/fi';

interface Course {
  id: string;
  code: string;
  name: string;
}

export default function Sidebar() {
  const supabase = createClient();
  const [interestedCourses, setInterestedCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        console.log('Logged-in user ID:', user?.id);

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
          console.log('Fetched interested courses:', data);

          // Extract the `courses` field properly
          const courses = data.map((item) => item.courses);
          // @ts-expect-error - data is possibly null
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
    <div className='bg-gray-900 h-full pt-10'>
      {/* Mobile Toggle Button */}
      <div className="md:hidden p-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-500 focus:outline-none"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-darkblue text-white w-64 p-4 flex-shrink-0 md:block ${
          isMobileMenuOpen ? 'block' : 'hidden'
        }`}
      >
        {/* Interested Courses */}
        <div className="mb-6 min-h-1/2">
          <h2 className="text-xl font-bold mb-2">Course Watchlist</h2>
          <div className="space-y-2 max-h-[36vh] overflow-y-auto">
            {interestedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/${course.code}`}
                className="block hover:underline"
              >
                {course.code} - {course.name}
              </Link>
            ))}
          </div>
        </div>

        {/* All Courses */}
        <div className='h-1/2'>
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
