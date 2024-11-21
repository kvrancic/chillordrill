'use client';

import React from 'react';
import { Button } from '@mantine/core';
import CustomMultiSelect from '@/components/CustomMultiSelect';

interface StepTwoProps {
  nextStep: () => void;
  prevStep: () => void;
  currentCourses: string[];
  setCurrentCourses: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StepTwo({ nextStep, prevStep, currentCourses, setCurrentCourses }: StepTwoProps) {
  return (
    <div className="w-full max-w-md">
      <p className="text-white mb-4">
        **Stay Ahead!** Let us know which courses youre currently taking so we can provide timely resources and connect you with peers in the same classes.
      </p>
      <CustomMultiSelect
        selectedValues={currentCourses}
        setSelectedValues={setCurrentCourses}
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
