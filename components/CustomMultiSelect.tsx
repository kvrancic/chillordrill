'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Option {
  value: string;
  label: string;
}

interface CustomMultiSelectProps {
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder: string;
}

export default function CustomMultiSelect({
  selectedValues,
  setSelectedValues,
  placeholder,
}: CustomMultiSelectProps) {
  const supabase = createClientComponentClient();
  const [options, setOptions] = useState<Option[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="border border-gray-600 bg-black text-white p-2 rounded cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((value) => {
              const option = options.find((o) => o.value === value);
              return (
                <span key={value} className="bg-gray-800 px-2 py-1 rounded text-sm">
                  {option ? option.label : value}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-black border border-gray-600 rounded max-h-60 overflow-auto">
          <input
            type="text"
            className="w-full p-2 bg-black text-white border-b border-gray-600 focus:outline-none"
            placeholder="Search courses..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
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
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-400">No courses found</div>
          )}
        </div>
      )}
    </div>
  );
}
