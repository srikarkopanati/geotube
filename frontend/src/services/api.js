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

// ── Existing endpoints (unchanged) ────────────────────────────────────────

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

// ── Comparative Analysis endpoints (new) ──────────────────────────────────

/** POST /api/analyze — full comparative dashboard */
export const analyze = async (query, countries) => {
  const { data } = await client.post('/api/analyze', { query, countries }, {
    timeout: 120000, // analysis can take up to 2 min (transcript + AI extraction)
  });
  return data;
};

/** POST /api/analyze/chat — Ask AI about the comparison */
export const analyzeChat = async (query, countries, question, analysisContext) => {
  const { data } = await client.post('/api/analyze/chat', {
    query,
    countries,
    question,
    analysisContext: analysisContext || null,
  }, { timeout: 120000 }); // Ollama local inference can take 60–90s
  return data;
};

// ── Time Travel endpoints ─────────────────────────────────────────────────

/** GET /api/timeline?query=...&year=... — country hotspots for a specific year */
export const getTimeline = async (query, year) => {
  const { data } = await client.get('/api/timeline', { params: { query, year } });
  return data;
};

// ── Trending Live endpoints ───────────────────────────────────────────────

/** GET /api/trending — current trending hotspots for all monitored regions */
export const getTrending = async () => {
  const { data } = await client.get('/api/trending');
  return data;
};
