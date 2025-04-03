// Cache utility functions
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour in milliseconds

export const cacheUtils = {
  // Save data to cache with timestamp
  setCache: (key, data) => {
    const cacheData = {
      data,
      timestamp: Date.now(),
      lastUpdated: Date.now(), // Track when data was last fetched from Firestore
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  },

  // Get data from cache if it exists and hasn't expired
  getCache: (key) => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp, lastUpdated } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  },

  // Get last updated timestamp from cache
  getLastUpdated: (key) => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { lastUpdated } = JSON.parse(cached);
    return lastUpdated;
  },

  // Clear specific cache entry
  clearCache: (key) => {
    localStorage.removeItem(key);
  },

  // Clear all cache entries
  clearAllCache: () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("recipe_cache_")) {
        localStorage.removeItem(key);
      }
    });
  },

  // Update specific cache entry
  updateCache: (key, updateFn) => {
    const cached = cacheUtils.getCache(key);
    if (cached) {
      const updatedData = updateFn(cached);
      cacheUtils.setCache(key, updatedData);
    }
  },
};
