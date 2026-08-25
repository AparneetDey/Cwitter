import api from './axiosApi.util';

/**
 * Fetch matching users by search query (username or fullName)
 * @param {string} searchQuery - Search query string
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 30)
 * @returns {Promise<Array>} Array of matching user objects
 */
export const fetchSearchUsers = async (searchQuery, page = 1, limit = 30) => {
  if (!searchQuery || !searchQuery.trim()) return [];

  try {
    const res = await api.get('/users/search', {
      params: {
        searchQuery: searchQuery.trim(),
        page,
        limit,
      },
    });
    return res.data?.data?.users || [];
  } catch (error) {
    console.error('Error fetching search users:', error);
    throw error;
  }
};
