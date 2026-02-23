/**
 * Axios instance for Lenga backend (Strapi).
 * baseURL from utils/functions/env. Attach JWT from store when available.
 */

import axios, { AxiosInstance } from 'axios';
import { API_URL } from '@/utils/functions/env';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

function createApi(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });

  return instance;
}

const api = createApi();
export default api;
