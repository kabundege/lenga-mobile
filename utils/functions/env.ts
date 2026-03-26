/**
 * App config from EXPO_PUBLIC_* env vars. Do not commit secrets.
 */

const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  return typeof value === 'string' ? value : '';
};

export const API_URL = getEnvVar('EXPO_PUBLIC_API_URL', 'http://192.168.1.68:1337');

export type Env = {
  API_URL: string;
};

export function getEnv(): Env {
  return { API_URL };
}

export function getImageUrl(url: string | undefined): string {
  if (!url) return '';
  return `${API_URL}${url}`;
}