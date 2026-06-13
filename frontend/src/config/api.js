// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
};

export const getApiUrl = () => API_BASE_URL;

