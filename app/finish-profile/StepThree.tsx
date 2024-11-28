// StepThree.tsx
'use client';

import React, { useState } from 'react';
import { Button, Checkbox } from '@mantine/core';
import { useRouter } from 'next/navigation';

interface StepThreeProps {
  prevStep: () => void;
  handleSubmit: () => Promise<void>;
}

export default function StepThree({ prevStep, handleSubmit }: StepThreeProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const onSubmit = async () => {
    if (!agreed) {
      alert('You must agree to the terms to continue.');
      return;
    }
    await handleSubmit();
    router.push('/home');
  };

  return (
    <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">AI Disclaimer</h2>
      <p className="text-white mb-4">
        Please read and accept the following disclaimer to continue:
      </p>
      <div className="bg-gray-700 p-4 rounded mb-4 max-h-64 overflow-y-auto">
        <p className="text-white text-sm">
          <div className='font-extrabold'> Disclaimer: </div>
          
          This platform utilizes AI technology to provide
          personalized content and recommendations. By proceeding, you
          acknowledge and agree that:
        </p>
        <ul className="list-disc list-inside text-white text-sm mt-2">
          <li>
            AI-generated content may not always be accurate or appropriate; use
            your discretion.
          </li>
          <li>
            Your data may be processed by AI algorithms to enhance your
            experience.
          </li>
          <li>
            You consent to the collection and use of your data as described in
            our Privacy Policy.
          </li>
        </ul>
      </div>
      <Checkbox
        label="I have read and agree to the terms and conditions."
        checked={agreed}
        onChange={(event) => setAgreed(event.currentTarget.checked)}
        className="text-white"
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
