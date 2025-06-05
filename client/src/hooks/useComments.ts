import { useState, useCallback } from 'react';
import Comment from '@/interfaces/comment';
import { updateCachedReport } from './useSingleReport';

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

// Client-side in-memory cache
const commentsCache = new Map<string, { data: Comment[], timestamp: number }>();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function useComments({ reportId, initialComments = [] }: UseCommentsProps): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshComments = useCallback(async (skipCache = false) => {
    // Check client-side cache first
    if (!skipCache) {
      const cachedEntry = commentsCache.get(reportId);
      const now = Date.now();
      
      if (cachedEntry && (now - cachedEntry.timestamp < CACHE_EXPIRY_MS)) {
        console.log(`[useComments] Using client-side cached comments for report: ${reportId}`);
        setComments(cachedEntry.data);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add skipCache parameter if needed
      const url = skipCache 
        ? `/api/reports/${reportId}/comments?skipCache=true`
        : `/api/reports/${reportId}/comments`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch comments: ${response.status}`);
      }

      // Check if response was served from cache
      const cacheStatus = response.headers.get('X-Cache');
      console.log(`[useComments] Server cache status: ${cacheStatus || 'Not available'}`);

      const { comments: fetchedComments } = await response.json();
      setComments(fetchedComments || []);
      
      // Update client-side cache
      commentsCache.set(reportId, {
        data: fetchedComments || [],
        timestamp: Date.now()
      });
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
      
      // Update client-side cache
      const cachedEntry = commentsCache.get(reportId);
      if (cachedEntry) {
        commentsCache.set(reportId, {
          data: [newComment, ...cachedEntry.data],
          timestamp: Date.now()
        });
      }
      
      // Update the report in the report cache to include this new comment
      updateCachedReport(reportId, (report) => {
        if (report.comments) {
          return {
            ...report,
            comments: [newComment, ...report.comments]
          };
        }
        return {
          ...report,
          comments: [newComment]
        };
      });
      
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

  // Clean up expired cache entries
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const cacheCleanupTime = now - CACHE_EXPIRY_MS;
    
    for (const [key, entry] of commentsCache.entries()) {
      if (entry.timestamp < cacheCleanupTime) {
        commentsCache.delete(key);
      }
    }
  }, []);

  return {
    comments,
    isLoading,
    isSubmitting,
    error,
    addComment,
    refreshComments,
  };
}
