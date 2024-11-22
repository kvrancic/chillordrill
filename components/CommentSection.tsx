// @ts-nocheck

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'
import { AiOutlineUp, AiOutlineDown } from 'react-icons/ai';

export default function CommentSection({ postId }) {
  const supabase = createClient();
  const [comments, setComments] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Fetch comments and their scores
  useEffect(() => {
    const fetchComments = async () => {
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*, profiles(full_name)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        return;
      }

      // Fetch votes for comments
      const commentIds = commentsData.map((comment) => comment.id);

      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('comment_id, vote_type')
        .in('comment_id', commentIds);

      if (votesError) {
        console.error('Error fetching votes:', votesError);
        return;
      }

      // Calculate scores for each comment
      const commentScores = {};
      votesData.forEach((vote) => {
        if (!commentScores[vote.comment_id]) {
          commentScores[vote.comment_id] = 0;
        }
        commentScores[vote.comment_id] +=
          vote.vote_type === 'upvote' ? 1 : -1;
      });

      // Attach scores to comments
      const commentsWithScores = commentsData.map((comment) => ({
        ...comment,
        score: commentScores[comment.id] || 0,
      }));

      setComments(commentsWithScores);
    };

    fetchComments();
  }, [postId, supabase]);

  // Fetch user votes
  useEffect(() => {
    const fetchUserVotes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userVotesData, error: userVotesError } = await supabase
          .from('votes')
          .select('comment_id, vote_type')
          .eq('user_id', user.id)
          .not('comment_id', 'is', null);

        if (userVotesError) {
          console.error('Error fetching user votes:', userVotesError);
        } else {
          const votes = {};
          userVotesData.forEach((vote) => {
            votes[vote.comment_id] = vote.vote_type;
          });
          setUserVotes(votes);
        }
      }
    };

    fetchUserVotes();
  }, [supabase, comments]);

  const handleVote = async (commentId, voteType) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to vote.');
      return;
    }

    const currentVote = userVotes[commentId];

    if (currentVote === voteType) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('comment_id', commentId);

      if (deleteError) {
        console.error('Error removing vote:', deleteError);
      } else {
        setUserVotes((prev) => ({ ...prev, [commentId]: null }));
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  score: comment.score + (voteType === 'upvote' ? -1 : 1),
                }
              : comment
          )
        );
      }
    } else {
      // Upsert vote
      const { error: upsertError } = await supabase.from('votes').upsert({
        user_id: user.id,
        comment_id: commentId,
        vote_type: voteType,
      });

      if (upsertError) {
        console.error('Error voting:', upsertError);
      } else {
        setUserVotes((prev) => ({ ...prev, [commentId]: voteType }));
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === commentId) {
              let delta = 0;
              if (currentVote === null || currentVote === undefined) {
                delta = voteType === 'upvote' ? 1 : -1;
              } else if (currentVote === 'upvote' && voteType === 'downvote') {
                delta = -2;
              } else if (currentVote === 'downvote' && voteType === 'upvote') {
                delta = 2;
              }
              return { ...comment, score: comment.score + delta };
            }
            return comment;
          })
        );
      }
    }
  };

  const handleCommentSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isAnonymous) {
      alert('You must be logged in to comment (unless posting anonymously).');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter your comment.');
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: isAnonymous ? null : user.id,
        post_id: postId,
        content: newComment,
        is_anonymous: isAnonymous,
      })
      .select('*, profiles(full_name)');

    if (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment.');
    } else if (data && data.length > 0) {
      // Initialize score to 0
      const newCommentData = { ...data[0], score: 0 };
      setComments((prev) => [newCommentData, ...prev]);
      setNewComment('');
      setIsAnonymous(false);
    } else {
      alert('Failed to submit comment.');
    }
  };

  return (
    <div className="mt-4 ml-4">
      {/* New Comment */}
      <div className="mb-4">
        <textarea
          className="w-full p-2 bg-black text-white border border-gray-600 rounded mb-2"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id={`anonymous-comment`}
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor={`anonymous-comment`} className="text-white">
            Comment anonymously
          </label>
        </div>
        <button
          onClick={handleCommentSubmit}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
        >
          Submit
        </button>
      </div>
      {/* Comments List */}
      {comments.map((comment) => (
        <div key={comment.id} className="bg-darkblue p-2 rounded mb-2">
          <div className="flex items-center mb-1">
            <button
              onClick={() => handleVote(comment.id, 'upvote')}
              className={`mr-2 ${
                userVotes[comment.id] === 'upvote'
                  ? 'text-green-500 border border-green-500'
                  : 'text-gray-400'
              }`}
            >
              <AiOutlineUp size={16} />
            </button>
            <button
              onClick={() => handleVote(comment.id, 'downvote')}
              className={`mr-2 ${
                userVotes[comment.id] === 'downvote'
                  ? 'text-red-500 border border-red-500'
                  : 'text-gray-400'
              }`}
            >
              <AiOutlineDown size={16} />
            </button>
            <p className="text-sm">{comment.score || 0}</p>
            <p className="ml-4 text-sm text-gray-400">
              Comment by{' '}
              {comment.is_anonymous
                ? 'Anonymous'
                : comment.profiles?.full_name || 'Unknown'}
            </p>
          </div>
          <p>{comment.content}</p>
        </div>
      ))}
    </div>
  );
}
