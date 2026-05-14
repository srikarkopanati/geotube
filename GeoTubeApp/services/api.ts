import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 8080;

function getBaseUrl() {
  const configuredUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl;

  if (typeof configuredUrl === 'string' && configuredUrl.length > 0) {
    return configuredUrl;
  }

  const expoHost =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (typeof expoHost === 'string' && expoHost.length > 0) {
    const host = expoHost.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:${API_PORT}`;
    }
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

const BASE_URL = getBaseUrl();

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // geocoding can be slow on first search
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  res => res,
  err => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Network error';
    return Promise.reject(new Error(message));
  }
);

// ── Existing endpoints (unchanged) ────────────────────────────────────────

export const search = async (query: string) => {
  const { data } = await client.post('/api/search', { query });
  return data;
};

export const getCities = async (country: string, query?: string) => {
  const { data } = await client.get(`/api/country/${encodeURIComponent(country)}`, {
    params: { query },
  });
  return data;
};

export const getVideos = async (city: string, query?: string) => {
  const { data } = await client.get(`/api/city/${encodeURIComponent(city)}`, {
    params: { query },
  });
  return data;
};

// ── Comparative Analysis endpoints (new) ──────────────────────────────────

/** POST /api/analyze — full comparative dashboard */
export const analyze = async (query: string, countries: string[]) => {
  const { data } = await client.post('/api/analyze', { query, countries }, {
    timeout: 120000, // analysis can take up to 2 min (transcript + AI extraction)
  });
  return data;
};

export const getTimeline = async (query: string, year: number) => {
  const { data } = await client.get('/api/timeline', { params: { query, year } });
  return data;
};

export const getTrending = async () => {
  const { data } = await client.get('/api/trending');
  return data;
};
