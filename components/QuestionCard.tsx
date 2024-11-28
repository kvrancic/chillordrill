'use client';

import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { createClient } from '@/utils/supabase/client'
import {Switch} from "@mantine/core";

export interface Question {
  id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  question_text: string;
  created_at: string;
}

interface QuestionCardProps {
  question: Question;
  hideQuestion: (id: string) => void;
}

export default function QuestionCard({ question, hideQuestion }: QuestionCardProps) {
  const supabase = createClient();
  const [answerContent, setAnswerContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const handleAnswerSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isAnonymous) {
      // Handle not logged in
      alert('You must be logged in to answer (unless posting anonymously).');
      return;
    }

    if (!answerContent) {
      alert('Please enter your answer.');
      return;
    }

    const { error } = await supabase.from('posts').insert({
      // @ts-expect-error - data is possibly null
      user_id: isAnonymous ? null : user.id,
      course_id: question.course_id,
      ai_question_id: question.id,
      content: answerContent,
      is_anonymous: isAnonymous,
    });

    if (error) {
      console.error('Error submitting answer:', error);
      alert('Error submitting answer.');
    } else {
      // Clear the form
      setAnswerContent('');
      setIsAnonymous(false);
      setShowAnswerForm(false);
      alert('Answer submitted successfully!');
    }
  };

  return (
    <div className="bg-darkblue p-4 rounded mb-4 relative">
      <button
        onClick={() => hideQuestion(question.id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
      >
        <AiOutlineClose size={20} />
      </button>
      <h3 className="text-gray-400 font-semibold">{question.course_code} - {question.course_name}</h3>
      <p className="text-white mb-2">{question.question_text}</p>
      {!showAnswerForm ? (
        <button
          onClick={() => setShowAnswerForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
        >
          Answer
        </button>
      ) : (
        <div className="mt-2">
          <textarea
            className="w-full p-2 bg-black text-white border border-gray-600 rounded mb-2"
            placeholder="Your answer..."
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
          ></textarea>
            <button
              onClick={handleAnswerSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded mr-2 mb-2"
            >
              Submit
            </button>
            <button
              onClick={() => setShowAnswerForm(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
            >
              Cancel
            </button>
            <Switch
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                label="Answer anonymously"
                id={`anonymous-${question.id}`}
                color="green"
                className="float-right"
            />
        </div>
      )}
    </div>
  );
}
