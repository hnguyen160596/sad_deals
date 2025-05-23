import type React from 'react';
import { createContext, useState, useContext, useEffect, type ReactNode } from 'react'
import { trackEvent } from '../components/Analytics';
import { useUser } from './UserContext';

// Define types for comments and context
export interface Comment {
  id: string;
  postId: string;
  postType: 'deal' | 'tip';
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
  parentId?: string;
}

interface CommentContextType {
  comments: Record<string, Comment[]>;
  isLoading: boolean;
  addComment: (postId: string, postType: 'deal' | 'tip', content: string, parentId?: string) => Promise<Comment>;
  deleteComment: (commentId: string, postId: string) => Promise<void>;
  likeComment: (commentId: string, postId: string) => Promise<void>;
  getCommentsForPost: (postId: string) => Comment[];
  getCommentCount: (postId: string) => number;
}

// Create the context with a default value
const CommentContext = createContext<CommentContextType>({
  comments: {},
  isLoading: false,
  addComment: async () => ({
    id: '',
    postId: '',
    postType: 'deal',
    userId: '',
    userName: '',
    content: '',
    createdAt: '',
    likes: 0
  }),
  deleteComment: async () => {},
  likeComment: async () => {},
  getCommentsForPost: () => [],
  getCommentCount: () => 0,
});

// Helper function for mock API delay
const mockAPIDelay = () => new Promise(resolve => setTimeout(resolve, 600));

// Sample comments data for demo
const sampleComments: Record<string, Comment[]> = {
  'deal-1': [
    {
      id: 'comment-1',
      postId: 'deal-1',
      postType: 'deal',
      userId: 'user-1',
      userName: 'Sarah Johnson',
      content: 'This is an amazing deal! I just bought two of these and the quality is excellent.',
      createdAt: '2025-05-10T12:00:00.000Z',
      likes: 5,
    },
    {
      id: 'comment-2',
      postId: 'deal-1',
      postType: 'deal',
      userId: 'user-2',
      userName: 'Mike Rogers',
      content: 'Thanks for sharing! Just ordered one.',
      createdAt: '2025-05-10T14:30:00.000Z',
      likes: 2,
      replies: [
        {
          id: 'comment-3',
          postId: 'deal-1',
          postType: 'deal',
          userId: 'user-3',
          userName: 'Jennifer Lee',
          content: 'How long did shipping take?',
          createdAt: '2025-05-11T09:15:00.000Z',
          likes: 0,
          parentId: 'comment-2',
        },
        {
          id: 'comment-4',
          postId: 'deal-1',
          postType: 'deal',
          userId: 'user-2',
          userName: 'Mike Rogers',
          content: 'It arrived in just 2 days with standard shipping!',
          createdAt: '2025-05-11T10:45:00.000Z',
          likes: 1,
          parentId: 'comment-2',
        },
      ],
    },
  ],
  'tip-1': [
    {
      id: 'comment-5',
      postId: 'tip-1',
      postType: 'tip',
      userId: 'user-4',
      userName: 'David Wilson',
      content: 'This tip saved me so much time and money. Highly recommended!',
      createdAt: '2025-05-09T16:20:00.000Z',
      likes: 7,
    },
  ],
};

// Create the provider component
export const CommentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<Record<string, Comment[]>>(sampleComments);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useUser();

  // Load comments from localStorage on mount
  useEffect(() => {
    const loadComments = () => {
      try {
        const savedComments = localStorage.getItem('comments');
        if (savedComments) {
          setComments(JSON.parse(savedComments));
        }
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    };

    loadComments();
  }, []);

  // Save comments to localStorage when they change
  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  // Add a new comment
  const addComment = async (postId: string, postType: 'deal' | 'tip', content: string, parentId?: string): Promise<Comment> => {
    if (!isAuthenticated || !user) {
      throw new Error('You must be logged in to comment');
    }

    setIsLoading(true);
    try {
      await mockAPIDelay();

      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        postId,
        postType,
        userId: user.id,
        userName: user.displayName || user.email.split('@')[0],
        userAvatar: user.photoURL,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        parentId,
      };

      setComments(prevComments => {
        const postComments = prevComments[postId] || [];

        // If it's a reply, add it to the parent comment's replies
        if (parentId) {
          return {
            ...prevComments,
            [postId]: postComments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment],
                };
              }
              return comment;
            }),
          };
        }

        // Otherwise, add it as a top-level comment
        return {
          ...prevComments,
          [postId]: [...postComments, newComment],
        };
      });

      trackEvent('Comments', 'Add Comment', postType);
      return newComment;
    } catch (error) {
      trackEvent('Comments', 'Add Comment Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: string, postId: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('You must be logged in to delete a comment');
    }

    setIsLoading(true);
    try {
      await mockAPIDelay();

      setComments(prevComments => {
        const postComments = prevComments[postId] || [];

        // Check if it's a top-level comment
        const isTopLevel = postComments.some(c => c.id === commentId);

        if (isTopLevel) {
          // Remove the top-level comment
          return {
            ...prevComments,
            [postId]: postComments.filter(c => c.id !== commentId),
          };
        } else {
          // It's a reply, find the parent and remove the reply
          return {
            ...prevComments,
            [postId]: postComments.map(comment => {
              if (comment.replies?.some(r => r.id === commentId)) {
                return {
                  ...comment,
                  replies: comment.replies.filter(r => r.id !== commentId),
                };
              }
              return comment;
            }),
          };
        }
      });

      trackEvent('Comments', 'Delete Comment');
    } catch (error) {
      trackEvent('Comments', 'Delete Comment Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Like a comment
  const likeComment = async (commentId: string, postId: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to like a comment');
    }

    setIsLoading(true);
    try {
      await mockAPIDelay();

      setComments(prevComments => {
        const postComments = prevComments[postId] || [];

        // Check if it's a top-level comment
        const topLevelComment = postComments.find(c => c.id === commentId);

        if (topLevelComment) {
          // Like the top-level comment
          return {
            ...prevComments,
            [postId]: postComments.map(c =>
              c.id === commentId ? { ...c, likes: c.likes + 1 } : c
            ),
          };
        } else {
          // It's a reply, find the parent and like the reply
          return {
            ...prevComments,
            [postId]: postComments.map(comment => {
              if (comment.replies?.some(r => r.id === commentId)) {
                return {
                  ...comment,
                  replies: comment.replies.map(r =>
                    r.id === commentId ? { ...r, likes: r.likes + 1 } : r
                  ),
                };
              }
              return comment;
            }),
          };
        }
      });

      trackEvent('Comments', 'Like Comment');
    } catch (error) {
      trackEvent('Comments', 'Like Comment Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all comments for a post
  const getCommentsForPost = (postId: string): Comment[] => {
    return comments[postId] || [];
  };

  // Get the total comment count for a post (including replies)
  const getCommentCount = (postId: string): number => {
    const postComments = comments[postId] || [];
    const topLevelCount = postComments.length;
    const repliesCount = postComments.reduce(
      (count, comment) => count + (comment.replies?.length || 0),
      0
    );
    return topLevelCount + repliesCount;
  };

  const contextValue: CommentContextType = {
    comments,
    isLoading,
    addComment,
    deleteComment,
    likeComment,
    getCommentsForPost,
    getCommentCount,
  };

  return (
    <CommentContext.Provider value={contextValue}>
      {children}
    </CommentContext.Provider>
  );
};

// Custom hook for using the comment context
export const useComments = () => useContext(CommentContext);

export default CommentContext;
