import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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

export const search = async query => {
  const { data } = await client.post('/api/search', { query });
  return data;
};

export const getCities = async (country, query) => {
  const { data } = await client.get(`/api/country/${encodeURIComponent(country)}`, {
    params: { query },
  });
  return data;
};

export const getVideos = async (city, query) => {
  const { data } = await client.get(`/api/city/${encodeURIComponent(city)}`, {
    params: { query },
  });
  return data;
};
