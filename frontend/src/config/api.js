// API Configuration
const API_URL = import.meta.env.VITE_API_URL || '';

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = API_URL ? `${API_URL}${endpoint}` : endpoint;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
};

export default API_URL;
