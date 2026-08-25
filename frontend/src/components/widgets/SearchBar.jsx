import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, Loader2, CheckCircle2 } from 'lucide-react';
import useSearchUsers from '../../hooks/useSearchUsers';
import { getAvatarUrl } from '../../utils/constants';

const SearchBar = ({
  placeholder = 'Search Cwitter',
  onSelectUser,
  className = '',
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const searchContainerRef = useRef(null);

  const { searchResults, searchLoading, searchError, searchUsers, clearSearch } = useSearchUsers();

  // Debounced API search (500ms) with debounce loading indicator state
  useEffect(() => {
    if (!query.trim()) {
      setIsDebouncing(false);
      clearSearch();
      return;
    }

    setIsDebouncing(true);

    const timer = setTimeout(async () => {
      try {
        await searchUsers(query);
      } finally {
        setIsDebouncing(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, searchUsers, clearSearch]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = (userId) => {
    setIsFocused(false);
    setQuery('');
    clearSearch();

    if (onSelectUser) {
      onSelectUser(userId);
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const isLoading = searchLoading || isDebouncing;

  return (
    <div ref={searchContainerRef} className={`relative z-40 ${className}`}>
      {/* Search Input Container */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#202327] text-white placeholder-gray-500 rounded-full pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] border border-transparent transition-all"
        />
        
        {/* Loading Spinner or Clear Button */}
        {isLoading ? (
          <Loader2 className="absolute right-3.5 top-3.5 w-4 h-4 text-[#1d9bf0] animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsDebouncing(false);
              clearSearch();
            }}
            className="absolute right-3.5 top-3.5 p-0.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Floating Live Search Results Dropdown */}
      {isFocused && query.trim().length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#16181c] border border-[#2f3336] rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-[#2f3336] max-h-96 overflow-y-auto animate-fade-in">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-xs flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#1d9bf0]" />
              <span>Searching for "{query}"...</span>
            </div>
          ) : searchError ? (
            <div className="p-4 text-center text-red-400 text-xs">
              {searchError}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user._id)}
                className="p-3.5 hover:bg-[#181818] transition-colors flex items-center space-x-3 cursor-pointer"
              >
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover bg-black border border-[#2f3336] shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center space-x-1 truncate">
                    <span className="font-bold text-white text-sm hover:underline truncate">
                      {user.fullName}
                    </span>
                    {user.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] shrink-0" title="Verified Account" />
                    )}
                  </div>
                  <span className="text-gray-500 text-xs truncate">@{user.username}</span>
                  {user.description && (
                    <span className="text-gray-400 text-xs truncate mt-0.5">{user.description}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-xs">
              No users found for "<span className="text-white font-semibold">{query}</span>"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
