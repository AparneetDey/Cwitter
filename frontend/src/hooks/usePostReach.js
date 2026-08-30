import { useEffect, useRef } from 'react';
import { usePost } from '../context/PostContext';

/**
 * Custom Hook to track when a post appears on the user's screen (viewport)
 * and silently trigger the backend reach API (/api/v1/tweetReaches/:postId).
 *
 * @param {string} postId - ID of the tweet
 * @returns {React.RefObject} containerRef - Attach this ref to the post card wrapper element
 */
export const usePostReach = (postId) => {
  const containerRef = useRef(null);
  const { recordReach } = usePost();

  useEffect(() => {
    if (!postId || !recordReach) return;

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          recordReach(postId);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.4, // Trigger when 40% of post is visible on user's screen
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [postId, recordReach]);

  return containerRef;
};

export default usePostReach;
