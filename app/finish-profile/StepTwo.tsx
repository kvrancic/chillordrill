// StepTwo.tsx
'use client';

import React from 'react';
import { Button } from '@mantine/core';
import CustomMultiSelect from '@/components/CustomMultiSelect';

interface StepTwoProps {
  nextStep: () => void;
  prevStep: () => void;
  takenCourses: string[];
  setTakenCourses: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StepTwo({
  nextStep,
  prevStep,
  takenCourses,
  setTakenCourses,
}: StepTwoProps) {
  return (
    <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
      <p className="text-white mb-4 text-lg font-medium">
        <strong>Share Your Expertise!</strong> Let us know which courses you&apos;ve
        completed or are currently taking, so we can connect you with peers and
        tailor your experience.
      </p>
      <CustomMultiSelect
        selectedValues={takenCourses}
        setSelectedValues={setTakenCourses}
      />
      <div className="flex justify-between mt-4">
        <Button variant="outline" color="red" onClick={prevStep}>
          Back
        </Button>
        <Button color="green" onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
}
