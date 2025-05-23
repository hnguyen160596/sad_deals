import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComments, type Comment } from '../context/CommentContext';
import { useUser } from '../context/UserContext';
import { trackEvent } from './Analytics';

interface CommentSectionProps {
  postId: string;
  postType: 'deal' | 'tip';
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, postType }) => {
  const { getCommentsForPost, addComment, deleteComment, likeComment, isLoading } = useComments();
  const { isAuthenticated, user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comments = getCommentsForPost(postId);

  const handleNewComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    if (!isAuthenticated) {
      trackEvent('Comments', 'Login Redirect', 'New Comment');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment(postId, postType, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !replyTo) return;
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(postId, postType, replyContent, replyTo.id);
      setReplyContent('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) {
      trackEvent('Comments', 'Login Redirect', 'Like Comment');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    try {
      await likeComment(commentId, postId);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId, postId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Comment component for rendering individual comments
  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isAuthor = user && user.id === comment.userId;

    return (
      <div className={isReply ? 'ml-8 mt-3' : 'mb-6'}>
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg px-4 py-3 relative">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>

              <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className="flex items-center space-x-1 hover:text-blue-500"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>{comment.likes} {comment.likes === 1 ? 'Like' : 'Likes'}</span>
                </button>

                {!isReply && (
                  <button
                    onClick={() => setReplyTo({ id: comment.id, userName: comment.userName })}
                    className="flex items-center space-x-1 hover:text-blue-500"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>Reply</span>
                  </button>
                )}

                {isAuthor && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="flex items-center space-x-1 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}

        {/* Reply form */}
        {replyTo && replyTo.id === comment.id && (
          <div className="ml-8 mt-3">
            <form onSubmit={handleSubmitReply} className="relative">
              <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <label htmlFor={`reply-${comment.id}`} className="sr-only">Add your reply</label>
                <textarea
                  id={`reply-${comment.id}`}
                  name={`reply-${comment.id}`}
                  rows={2}
                  className="block w-full py-3 px-4 border-0 resize-none focus:ring-0 sm:text-sm"
                  placeholder={`Reply to ${replyTo.userName}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  required
                ></textarea>

                <div className="py-2 px-3 border-t border-gray-200 flex justify-between items-center">
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !replyContent.trim()}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                      {isSubmitting ? 'Posting...' : 'Post reply'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>

      {/* New comment form */}
      <div className="mb-6">
        <form onSubmit={handleNewComment}>
          <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <label htmlFor="new-comment" className="sr-only">Add your comment</label>
            <textarea
              id="new-comment"
              name="comment"
              rows={3}
              className="block w-full py-3 px-4 border-0 resize-none focus:ring-0 sm:text-sm"
              placeholder={isAuthenticated ? "Add a comment..." : "Log in to add a comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!isAuthenticated || isSubmitting}
            ></textarea>

            <div className="py-2 px-3 border-t border-gray-200 flex justify-between items-center">
              <div className="flex-shrink-0">
                {isAuthenticated ? (
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post comment'}
                  </button>
                ) : (
                  <Link
                    to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Sign in to comment
                  </Link>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Be respectful and follow our community guidelines
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Comments list */}
      {isLoading && comments.length === 0 ? (
        <div className="py-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Be the first to share your thoughts on this {postType}.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
