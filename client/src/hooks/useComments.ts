import { useState, useCallback } from 'react';
import Comment from '@/interfaces/comment';

interface UseCommentsProps {
  reportId: string;
  initialComments?: Comment[];
}

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  addComment: (content: string) => Promise<Comment | null>;
  refreshComments: () => Promise<void>;
}

export function useComments({ reportId, initialComments = [] }: UseCommentsProps): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/comments`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch comments: ${response.status}`);
      }

      const { comments: fetchedComments } = await response.json();
      setComments(fetchedComments || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
      setError(errorMessage);
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  const addComment = useCallback(async (content: string): Promise<Comment | null> => {
    if (!content.trim()) {
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create comment: ${response.status}`);
      }

      const { comment: newComment } = await response.json();
      
      // Add the new comment to the beginning of the list (most recent first)
      setComments(prevComments => [newComment, ...prevComments]);
      
      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create comment';
      setError(errorMessage);
      console.error('Error creating comment:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [reportId]);

  return {
    comments,
    isLoading,
    isSubmitting,
    error,
    addComment,
    refreshComments,
  };
}
