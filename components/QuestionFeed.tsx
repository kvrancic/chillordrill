'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import QuestionCard from './QuestionCard';
import { Question } from './QuestionCard';

export default function QuestionFeed() {
  const supabase = createClient();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hiddenQuestionIds, setHiddenQuestionIds] = useState<string[]>([]);
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);
  const [loadCount, setLoadCount] = useState(10);

  useEffect(() => {
    const hidden = localStorage.getItem('hiddenQuestions');
    if (hidden) {
      setHiddenQuestionIds(JSON.parse(hidden));
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userCourses } = await supabase
          .from('user_courses')
          .select('course_id')
          .eq('user_id', user.id)
          .in('status', ['taking', 'taken']);

        // @ts-expect-error data is possibly null
        const courseIds = userCourses.map((uc) => uc.course_id);

        const { data: questionsData } = await supabase
          .from('ai_questions')
          .select('*, courses(code, name)')
          .in('course_id', courseIds)
          .eq('is_active', true);
        
        
        // @ts-expect-error data is possibly null
        const visible = questionsData.filter(
          (q) => !hiddenQuestionIds.includes(q.id)
        );
        visible.forEach((q) => {
          q.course_code = q.courses.code;
          q.course_name = q.courses.name;
        });
        setQuestions(visible);
        setVisibleQuestions(visible.slice(0, loadCount));
      }
    };

    fetchQuestions();
  }, [supabase, hiddenQuestionIds, loadCount]);

  const hideQuestion = (id: string) => {
    const updatedHidden = [...hiddenQuestionIds, id];
    setHiddenQuestionIds(updatedHidden);
    localStorage.setItem('hiddenQuestions', JSON.stringify(updatedHidden));
    setVisibleQuestions(visibleQuestions.filter((q) => q.id !== id));
  };

  const loadMore = () => {
    const newCount = loadCount + 10;
    setLoadCount(newCount);
    setVisibleQuestions(questions.slice(0, newCount));
  };

  return (
    <div className="w-full mx-auto">
      {visibleQuestions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          hideQuestion={hideQuestion}
        />
      ))}
      {visibleQuestions.length < questions.length && (
        <button
          onClick={loadMore}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 w-full"
        >
          Load More
        </button>
      )}
    </div>
  );
}
