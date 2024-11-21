'use client';

import React from 'react';
import { Button } from '@mantine/core';
import CustomMultiSelect from '@/components/CustomMultiSelect';
import { useRouter } from 'next/navigation';

interface StepThreeProps {
  prevStep: () => void;
  pastCourses: string[];
  setPastCourses: React.Dispatch<React.SetStateAction<string[]>>;
  handleSubmit: () => Promise<void>;
}

export default function StepThree({ prevStep, pastCourses, setPastCourses, handleSubmit }: StepThreeProps) {
  const router = useRouter();

  const onSubmit = async () => {
    await handleSubmit();
    router.push('/home');
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-white mb-4">
        **Share Your Expertise!** By selecting courses youve completed, you can help others by sharing insights and answering questions in areas youre familiar with.
      </p>
      <CustomMultiSelect
        selectedValues={pastCourses}
        setSelectedValues={setPastCourses}
        placeholder="Select courses you've taken..."
      />
      <div className="flex justify-between mt-4">
        <Button variant="outline" color="red" onClick={prevStep}>
          Back
        </Button>
        <Button color="green" onClick={onSubmit}>
          Finish
        </Button>
      </div>
    </div>
  );
}
