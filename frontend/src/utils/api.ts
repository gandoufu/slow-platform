import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 10000,
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Unpack the data from the ApiResponse wrapper
    if (response.data && typeof response.data === 'object' && 'code' in response.data) {
      if (response.data.code === 200) {
        return response.data.data;
      } else {
        message.error(response.data.message || '操作失败');
        return Promise.reject(new Error(response.data.message));
      }
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Auto logout if 401 response returned from api
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      const errorMessage = error.response.data.message || error.response.data.detail || '发生错误';
      message.error(errorMessage);
    } else {
      message.error('网络错误');
    }
    return Promise.reject(error);
  }
);

export default api;
