import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { usePost } from '../../context/PostContext';
import PostList from '../post/PostList';
import api from '../../utils/axiosApi.util';

const ForYouFeed = () => {
  const { feedRefreshKey } = usePost();
  const { showToast } = useOutletContext() || {};
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch "For You" Feed page by page
  const fetchFeed = useCallback(async (pageToFetch = 1) => {
    if (pageToFetch === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await api.get(`/tweets/feed/for-you?page=${pageToFetch}&limit=15`);
      const data = res?.data?.data;
      const docs = data?.tweets || [];
      const hasNext = Boolean(data?.hasNextPage);

      if (pageToFetch === 1) {
        setPosts(docs);
      } else {
        setPosts((prev) => [...prev, ...docs]);
      }

      setHasNextPage(hasNext);
      setPage(pageToFetch);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || 'Failed to load For You feed');
      if (pageToFetch === 1) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [showToast]);

  // Re-fetch feed whenever feedRefreshKey changes (resets to page 1)
  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed, feedRefreshKey]);

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore) {
      fetchFeed(page + 1);
    }
  };

  return (
    <PostList
      posts={posts}
      setPosts={setPosts}
      loading={loading}
      loadingMore={loadingMore}
      hasNextPage={hasNextPage}
      onLoadMore={handleLoadMore}
      emptyMessage="No posts in your feed yet. Be the first to share a post!"
    />
  );
};

export default ForYouFeed;
