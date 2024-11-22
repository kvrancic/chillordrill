//@ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Sidebar from '@/components/Sidebar';
import ChatTab from '@/components/ChatTab';
import DiscussionTab from '@/components/DiscussionTab';
import { Tab } from '@headlessui/react';

export default function CoursePage() {
  const supabase = createClient();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const fetchCourseWithSummaries = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          summaries (id, text, created_at)
        `)
        .eq('code', courseId)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
      } else {
        setCourse(data);
        setSummaries(data.summaries || []);
      }
    };

    fetchCourseWithSummaries();
  }, [courseId, supabase]);

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Course Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold">{course.name}</h1>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            {showInfo ? 'Hide Info' : 'Show Info'}
          </button>
          {showInfo && (
            <div className="mt-2 bg-darkblue p-4 rounded">
              <p>
                <strong>Code:</strong> {course.code}
              </p>
              <p>
                <strong>ECTS:</strong> {course.ects}
              </p>
              <p>
                <strong>Professor:</strong> {course.professor || 'N/A'}
              </p>
              <p>
                <strong>Description:</strong> {course.description || 'No description available.'}
              </p>
              {course.link && (
                <p>
                  <strong>Link:</strong>{' '}
                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {course.link}
                  </a>
                </p>
              )}
              {summaries.length > 0 && (
                <div className="mt-4 bg-gray-800 p-4 rounded">
                  <h2 className="text-xl font-bold mb-2">Summaries</h2>
                  {summaries.map((summary) => (
                    <div key={summary.id} className="mb-2">
                      <p>{summary.text}</p>
                      <p className="text-sm text-gray-400">
                        Created at: {new Date(summary.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tab.Group>
          <Tab.List className="flex space-x-1 bg-darkblue p-1 rounded">
            <Tab
              className={({ selected }) =>
                selected
                  ? 'bg-blue-500 text-white px-4 py-2 rounded'
                  : 'text-white px-4 py-2 hover:bg-gray-700 rounded'
              }
            >
              Chat
            </Tab>
            <Tab
              className={({ selected }) =>
                selected
                  ? 'bg-blue-500 text-white px-4 py-2 rounded'
                  : 'text-white px-4 py-2 hover:bg-gray-700 rounded'
              }
            >
              Discussion
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            <Tab.Panel>
              <ChatTab course={course} />
            </Tab.Panel>
            <Tab.Panel>
              <DiscussionTab course={course} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
