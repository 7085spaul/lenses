// API Configuration
const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction ? 'https://lenses-1.onrender.com' : '';

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
  console.log('API Call:', url);
  
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

