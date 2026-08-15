// Default User Profile Avatar & Cover Image Constants

export const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2371767b'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-1.05-4.82-2.6.04-1.6 3.22-2.48 4.82-2.48 1.59 0 4.77.88 4.82 2.48C15.8 18.95 14.03 20 12 20z'/></svg>";

export const DEFAULT_COVER = "";

// Helper to return valid avatar URL or default fallback avatar
export const getAvatarUrl = (url) => {
  if (url && typeof url === 'string' && url.trim() !== '') {
    return url;
  }
  return DEFAULT_AVATAR;
};
