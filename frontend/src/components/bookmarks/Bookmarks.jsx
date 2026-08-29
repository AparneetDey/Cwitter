import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { Bookmark as BookmarkIcon, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PostList from '../post/PostList';
import PostSkeleton from '../post/PostSkeleton';
import api from '../../utils/axiosApi.util';

const Bookmarks = () => {
  const { user } = useAuth();
  const { showToast } = useOutletContext() || {};
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch Bookmarks from API with Pagination
  const getBookmarks = useCallback(async (pageToFetch = 1) => {
    if (pageToFetch === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await api.get(`/users/bookmarks?page=${pageToFetch}&limit=15`);
      const data = res.data?.data;
      const docs = data?.bookmarks || [];
      const hasNext = Boolean(data?.hasNextPage);

      const formattedDocs = docs.map((doc) => ({
        ...doc,
        id: doc._id || doc.id,
        isBookmarked: true,
      }));

      if (pageToFetch === 1) {
        setBookmarks(formattedDocs);
      } else {
        setBookmarks((prev) => [...prev, ...formattedDocs]);
      }

      setHasNextPage(hasNext);
      setPage(pageToFetch);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || 'Failed to fetch bookmarks');
      if (pageToFetch === 1) setBookmarks([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [showToast]);

  useEffect(() => {
    getBookmarks(1);
  }, [getBookmarks]);

  const handleBookmarkToggle = (postId) => {
    // Filter out unbookmarked item from active bookmarks list view
    setBookmarks((prev) => prev.filter((post) => String(post.id || post._id) !== String(postId)));
  };

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore) {
      getBookmarks(page + 1);
    }
  };

  return (
    <main className="w-full max-w-150 border-r border-[#2f3336] bg-black min-h-screen pb-16">
      
      {/* Sticky Header */}
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center justify-between px-4 py-2.5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Bookmarks</h2>
          <p className="text-gray-500 text-xs">@{user?.username}</p>
        </div>
        <button className="p-2 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors cursor-pointer">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Main Stream Content */}
      {loading ? (
        <PostSkeleton count={4} />
      ) : bookmarks.length > 0 ? (
        <PostList
          posts={bookmarks}
          setPosts={setBookmarks}
          loading={loading}
          loadingMore={loadingMore}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
          onBookmarkToggle={handleBookmarkToggle}
        />
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center max-w-sm mx-auto select-none">
          <div className="w-16 h-16 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center text-[#1d9bf0] mb-6 border border-[#1d9bf0]/20">
            <BookmarkIcon className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Save posts for later
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Don’t let the good ones fly away! Bookmark posts to easily find them again in the future.
          </p>
        </div>
      )}

    </main>
  );
};

export default Bookmarks;
