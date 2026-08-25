import { useState, useCallback } from 'react';
import { fetchSearchUsers } from '../utils/userApi.util';

/**
 * Custom hook providing search users fetching functionality and loading/error states.
 * Ready for UI integration.
 */
export const useSearchUsers = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const searchUsers = useCallback(async (query, page = 1, limit = 30) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      return [];
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const results = await fetchSearchUsers(query, page, limit);
      setSearchResults(results);
      return results;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to search users';
      setSearchError(errorMessage);
      setSearchResults([]);
      return [];
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    setSearchLoading(false);
  }, []);

  return {
    searchResults,
    searchLoading,
    searchError,
    searchUsers,
    clearSearch,
  };
};

export default useSearchUsers;
