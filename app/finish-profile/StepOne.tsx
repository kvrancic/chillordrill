// StepOne.tsx
'use client';

import React from 'react';
import { Button } from '@mantine/core';
import CustomMultiSelect from '@/components/CustomMultiSelect';

interface StepOneProps {
  nextStep: () => void;
  interestedCourses: string[];
  setInterestedCourses: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StepOne({
  nextStep,
  interestedCourses,
  setInterestedCourses,
}: StepOneProps) {
  return (
    <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
      <p className="text-white mb-4 text-lg font-medium">
        <strong>Discover New Opportunities!</strong> By selecting courses you&apos;re
        interested in, we&apos;ll tailor your experience to help you explore and
        learn more about topics that excite you.
      </p>
      <CustomMultiSelect
        selectedValues={interestedCourses}
        setSelectedValues={setInterestedCourses}
      />
      <div className="flex justify-end mt-4">
        <Button color="green" onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
}
