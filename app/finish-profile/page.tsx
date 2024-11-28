// FinishProfilePage.tsx
// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import StepOne from './StepOne';
import StepTwo from './StepTwo'; // Merged StepTwo and StepThree into StepTwo
import StepThree from './StepThree'; // Now the AI disclaimer step
import ProgressBar from './ProgressBar';

export default function FinishProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [interestedCourses, setInterestedCourses] = useState<string[]>([]);
  const [takenCourses, setTakenCourses] = useState<string[]>([]); // Merged current and past courses

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Handle user not found
      return;
    }

    const userId = user.id;

    // Prepare data for insertion
    const allCourses = [
      ...interestedCourses.map((courseId) => ({
        user_id: userId,
        course_id: courseId,
        status: 'interested',
      })),
      ...takenCourses.map((courseId) => ({
        user_id: userId,
        course_id: courseId,
        status: 'taken', // Using 'taken' for both taken and taking
      })),
    ];

    // Insert data into user_courses table
    const { error } = await supabase.from('user_courses').upsert(allCourses);

    if (error) {
      console.error('Error inserting courses:', error);
      // Handle error (e.g., show a notification)
    } else {
      // Successfully inserted courses
      // Redirect is handled in StepThree
    }
  };

  return (
    <div className="min-h-screen bg-darkblue flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-extrabold text-white mb-6">
        Let&apos;s finish your profile!
      </h1>
      <ProgressBar step={currentStep} totalSteps={3} />
      {currentStep === 1 && (
        <StepOne
          nextStep={nextStep}
          interestedCourses={interestedCourses}
          setInterestedCourses={setInterestedCourses}
        />
      )}
      {currentStep === 2 && (
        <StepTwo
          nextStep={nextStep}
          prevStep={prevStep}
          takenCourses={takenCourses}
          setTakenCourses={setTakenCourses}
        />
      )}
      {currentStep === 3 && (
        <StepThree prevStep={prevStep} handleSubmit={handleSubmit} />
      )}
    </div>
  );
}
