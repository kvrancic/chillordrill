// @ts-nocheck

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'
import { AiOutlineUp, AiOutlineDown } from 'react-icons/ai';
import { Switch } from '@mantine/core';

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
        .select('*, profiles(full_name, username)')
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
        commentator: comment.is_anonymous ? 'Anonymous' : comment.profiles.username ? comment.profiles.username : "Unknown",
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
        console.error('Error removing vote from comment:', deleteError);
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
    } else if (currentVote === null || currentVote === undefined) {
      // Insert vote
        const { error: insertError } = await supabase.from('votes').insert([
            { user_id: user.id, comment_id: commentId, vote_type: voteType },
        ]);

        if (insertError) {
            console.error('Error inserting vote for comment:', insertError);
        } else {
            setUserVotes((prev) => ({ ...prev, [commentId]: voteType }));
            setComments((prev) =>
                prev.map((comment) => {
                    if (comment.id === commentId) {
                        return { ...comment, score: comment.score + (voteType === 'upvote' ? 1 : -1) };
                    }
                    return comment;
                })
            );
        }

    } else {
      // Update vote
      const { error: updateError } = await supabase.from('votes')
        .update({ vote_type: voteType })
        .eq('user_id', user.id)
        .eq('comment_id', commentId);


      if (updateError) {
        console.error('Error updating vote for comment:', updateError);
      } else {
        setUserVotes((prev) => ({ ...prev, [commentId]: voteType }));
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    score: comment.score + (voteType === 'upvote' ? 2 : -2),
                };
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
      .select('*, profiles(full_name, username)');

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
        <div className='flex flex-end gap-6'>
        <Switch
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.currentTarget.checked)}
                label="anonymous"
                color="green"
            />
        <button
          onClick={handleCommentSubmit}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
        >
          Submit
        </button>
        </div>
      </div>
      {/* Comments List */}
      {comments.map((comment) => (
          <div key={comment.id} className="bg-darkblue p-2 rounded mb-2">
            <div className="flex items-center mb-2">
                <p className="text-sm text-gray-400 italic">
                  Comment by
                </p>
                <p className="ml-1 text-sm text-gray-400">
                  {comment.commentator}
                </p>
            </div>
              <div className="flex items-center mb-1 float-right">
                <button
                    onClick={() => handleVote(comment.id, 'upvote')}
                    className={`mr-2 ${
                        userVotes[comment.id] === 'upvote'
                            ? 'text-green-500 border border-green-500'
                            : 'text-gray-400'
                    }`}
                >
                  <AiOutlineUp size={10}/>
                </button>
                <p className="text-sm mr-2">{comment.score || 0}</p>
                <button
                    onClick={() => handleVote(comment.id, 'downvote')}
                    className={`mr-2 ${
                        userVotes[comment.id] === 'downvote'
                            ? 'text-red-500 border border-red-500'
                            : 'text-gray-400'
                    }`}
                >
                  <AiOutlineDown size={10}/>
                </button>
              </div>
              <p>{comment.content}</p>
            </div>
            ))}
          </div>
      );
      }
