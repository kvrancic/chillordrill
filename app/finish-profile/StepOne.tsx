'use client';

import React from 'react';
import { Button } from '@mantine/core';
import CustomMultiSelect from '@/components/CustomMultiSelect';

interface StepOneProps {
  nextStep: () => void;
  interestedCourses: string[];
  setInterestedCourses: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function StepOne({ nextStep, interestedCourses, setInterestedCourses }: StepOneProps) {
  return (
    <div className="w-full max-w-md">
      <p className="text-white mb-4">
        **Discover New Opportunities!** By selecting courses youre interested in, well tailor your experience to help you explore and learn more about topics that excite you.
      </p>
      <CustomMultiSelect
        selectedValues={interestedCourses}
        setSelectedValues={setInterestedCourses}
        placeholder="Select courses you're interested in..."
      />
      <div className="flex justify-end mt-4">
        <Button color="green" onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
}
