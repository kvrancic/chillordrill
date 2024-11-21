'use client';

import React from 'react';

interface ProgressBarProps {
  step: number;
}

export default function ProgressBar({ step }: ProgressBarProps) {
  const steps = [1, 2, 3];
  return (
    <div className="flex items-center mb-6">
      {steps.map((s, index) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= s ? 'bg-green-500' : 'bg-gray-500'
            } text-white`}
          >
            {s}
          </div>
          {index < steps.length - 1 && <div className="w-8 h-1 bg-gray-500 mx-2"></div>}
        </div>
      ))}
    </div>
  );
}
