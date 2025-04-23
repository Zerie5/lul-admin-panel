import axios from 'axios';

// Create a configured axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Generic GET request with authentication
const get = async <T>(endpoint: string, params = {}): Promise<T> => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    console.log(`Making GET request to: ${url}`);
    
    const response = await axios.get<T>(url, { params });
    return response.data;
  } catch (error) {
    console.error(`Error in GET request to ${endpoint}:`, error);
    throw error;
  }
};

// Generic POST request with authentication
const post = async <T>(endpoint: string, data = {}, config = {}): Promise<T> => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    console.log(`Making POST request to: ${url}`);
    
    const response = await axios.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`Error in POST request to ${endpoint}:`, error);
    throw error;
  }
};

// Generic PUT request with authentication
const put = async <T>(endpoint: string, data = {}, config = {}): Promise<T> => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    console.log(`Making PUT request to: ${url}`);
    
    const response = await axios.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`Error in PUT request to ${endpoint}:`, error);
    throw error;
  }
};

// Generic DELETE request with authentication
const del = async <T>(endpoint: string, config = {}): Promise<T> => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    console.log(`Making DELETE request to: ${url}`);
    
    const response = await axios.delete<T>(url, config);
    return response.data;
  } catch (error) {
    console.error(`Error in DELETE request to ${endpoint}:`, error);
    throw error;
  }
};

// Export the HTTP service
const apiService = {
  get,
  post,
  put,
  delete: del
};

export default apiService; 