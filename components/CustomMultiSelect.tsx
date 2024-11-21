'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'
import { Checkbox } from '@mantine/core';

interface Option {
  value: string;
  label: string;
}

interface CustomMultiSelectProps {
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function CustomMultiSelect({
  selectedValues,
  setSelectedValues,
}: CustomMultiSelectProps) {
  const supabase = createClient();
  const [options, setOptions] = useState<Option[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch courses based on search input
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, name')
        .ilike('name', `%${searchValue}%`)
        .order('name')
        .limit(100);

      if (error) {
        console.error('Error fetching courses:', error);
      } else if (data) {
        setOptions(
          data.map((course) => ({
            value: course.id,
            label: `${course.code} - ${course.name}`,
          }))
        );
      }
      setLoading(false);
    };

    fetchCourses();
  }, [searchValue, supabase]);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  return (
    <div className="w-full bg-black text-white p-4 border border-gray-600 rounded">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
          placeholder="Search courses..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      {/* Fixed-Height Options Window */}
      <div className="h-64 overflow-y-auto border border-gray-600 rounded">
        {loading ? (
          <div className="p-2 text-gray-400">Loading...</div>
        ) : options.length > 0 ? (
          options.map((option) => (
            <div
              key={option.value}
              className={`p-2 cursor-pointer hover:bg-gray-700 ${
                selectedValues.includes(option.value) ? 'bg-gray-800' : ''
              }`}
              onClick={() => toggleOption(option.value)}
            >
             <input
                type="checkbox"
                className="mr-2"
                checked={selectedValues.includes(option.value)}
                readOnly
              />
              {option.label} 

            
              </div>
          ))
        ) : (
          <div className="p-2 text-gray-400">No courses found</div>
        )}
      </div>

      {/* Selected Courses */}
      {selectedValues.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-green-400">Selected Courses:</p>
          <ul className="mt-2">
            {selectedValues.map((value) => {
              const option = options.find((o) => o.value === value);
              return (
                <li key={value} className="text-sm text-white">
                  {option ? option.label : value}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
