// @ts-nocheck

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'
import { AiOutlineUp, AiOutlineDown, AiOutlineComment } from 'react-icons/ai';
import CommentSection from './CommentSection';

export default function PostCard({ post }) {
  const supabase = createClient();
  const [userVote, setUserVote] = useState(null);
  const [score, setScore] = useState(0);
  const [postCreator, setPostCreator] = useState("Unknown");
  const [showComments, setShowComments] = useState(false);

  // Fetch total score and user vote
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch total score
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('post_id', post.id);

      if (votesError) {
        console.error('Error fetching votes:', votesError);
      } else {
        const totalScore = votesData.reduce((acc, vote) => {
          return acc + (vote.vote_type === 'upvote' ? 1 : -1);
        }, 0);
        setScore(totalScore);
      }

      // Set post creator
      if (!post.is_anonymous && post.profiles.username) {
        setPostCreator(post.profiles.username);
      }

      // Fetch user vote
      if (user) {
        const { data: userVoteData, error: userVoteError } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('user_id', user.id)
          .eq('post_id', post.id)
          .maybeSingle();

        if (userVoteError) {
          console.error('Error fetching user vote:', userVoteError);
        } else if (userVoteData) {
          setUserVote(userVoteData.vote_type);
        } else {
          setUserVote(null);
        }
      }
    };

    fetchData();
  }, [post.id, supabase]);

  const handleVote = async (voteType) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to vote.');
      return;
    }

    if (userVote === voteType) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', post.id);

      if (deleteError) {
        console.error('Error removing vote:', deleteError);
      } else {
        setUserVote(null);
        setScore((prev) => prev + (voteType === 'upvote' ? -1 : 1));
      }
    } else {
      // Upsert vote
      const { error: upsertError } = await supabase.from('votes').upsert({
        user_id: user.id,
        post_id: post.id,
        vote_type: voteType,
      });

      if (upsertError) {
        console.error('Error voting:', upsertError);
      } else {
        if (userVote === null) {
          setScore((prev) => prev + (voteType === 'upvote' ? 1 : -1));
        } else {
          setScore((prev) => prev + (voteType === 'upvote' ? 2 : -2));
        }
        setUserVote(voteType);
      }
    }
  };

  return (
    <div className="bg-darkblue p-4 rounded mb-4 ">
      {/* Post Header */}
      <div className="flex items-center mb-2">
        <div className="flex items-center">
          <button
            onClick={() => handleVote('upvote')}
            className={`mr-2 ${
              userVote === 'upvote'
                ? 'text-green-500 border border-green-500'
                : 'text-gray-400'
            }`}
          >
            <AiOutlineUp size={20} />
          </button>
          <button
            onClick={() => handleVote('downvote')}
            className={`${
              userVote === 'downvote'
                ? 'text-red-500 border border-red-500'
                : 'text-gray-400'
            }`}
          >
            <AiOutlineDown size={20} />
          </button>
        </div>
        <p className="ml-2">{score}</p>
        <p className="ml-4 text-sm text-gray-400">
          Posted by{' '}
          {post.is_anonymous
            ? 'Anonymous'
            : postCreator}
        </p>
      </div>
      {/* Post Content */}
      <p className="mb-2">{post.content}</p>
      {/* Comments Toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center text-blue-500 hover:underline"
      >
        <AiOutlineComment className="mr-1" />
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>
      {/* Comments Section */}
      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}
