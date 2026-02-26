/**
 * Axios instance for Lenga backend (Strapi).
 * baseURL from utils/functions/env. Attach JWT from store when available.
 */

import { store } from '@/store';
import { API_URL } from '@/utils/functions/env';
import axios, { AxiosInstance } from 'axios';

function createApi(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    const authToken = store.getState().auth.jwt;
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });

  return instance;
}

const api = createApi();
export default api;
