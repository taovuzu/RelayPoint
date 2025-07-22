const isJsonString = (str) => {
  if (typeof str !== 'string' || !str) {
    return false;
  }
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const localStorageHealthCheck = async () => {
  const keys = Object.keys(localStorage);

  for (const key of keys) {
    try {
      const value = window.localStorage.getItem(key);
      if (!isJsonString(value)) {
        window.localStorage.removeItem(key);
        continue;
      }
      if (key.length === 0) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error processing localStorage key "${key}":`, error);
    }
  }
};

export const storePersist = {
  set: (key, state) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Failed to save to localStorage with key "${key}":`, error);
    }
  },

  get: (key) => {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      window.localStorage.removeItem(key);
      return null;
    }
  },

  remove: (key) => {
    window.localStorage.removeItem(key);
  },

  getAll: () => {
    return window.localStorage;
  },

  clear: () => {
    window.localStorage.clear();
  }
};

export default storePersist;