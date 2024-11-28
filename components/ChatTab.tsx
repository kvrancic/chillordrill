'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client'
import axios from 'axios';
import { Skeleton } from '@mantine/core';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

//@ts-expect-error - data is possibly null 
export default function ChatTab({ course }) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
        //@ts-expect-error - data is possibly null 
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('chatbot_interactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', course.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching chat history:', error);
        } else if (data) {
          const chatMessages = data.flatMap((interaction) => [
            {
              id: interaction.id + '-user',
              role: 'user',
              content: interaction.question,
            },
            {
              id: interaction.id + '-assistant',
              role: 'assistant',
              content: interaction.answer,
            },
          ]);
          //@ts-expect-error - data is possibly null 
          setMessages(chatMessages);
        }
      }
    };

    fetchChatHistory();
  }, [course.id, supabase]);

  //@ts-expect-error - data is possibly null 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Send request to backend API
      const response = await axios.post('https://chillordrill.onrender.com/ai_interaction', {
        question: newMessage.content,
        course_code: course.code,
      });

      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: response.data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save interaction to Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from('chatbot_interactions').insert({
        user_id: user ? user.id : null,
        course_id: course.id,
        question: newMessage.content,
        answer: assistantMessage.content,
      });
    } catch (error) {
      console.error('Error communicating with chatbot:', error);
      alert('Error communicating with chatbot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full px-8 py-4 bg-gray-900 overflow-auto rounded-lg max-h-[62vh]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } mb-2`}
          >
            <div
              className={`max-w-xs p-2 rounded ${
                message.role === 'user' ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-2">
            <div className="max-w-xs p-2 rounded bg-gray-700">
              <Skeleton height={8} mt={6} radius="xl" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          className="flex-1 p-2 bg-black text-white border border-gray-600 rounded-l"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-r"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
