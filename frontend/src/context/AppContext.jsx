import React, { createContext, useCallback, useContext, useReducer } from 'react';
import * as api from '../services/api';

const AppContext = createContext(null);

const initialState = {
  // ── Navigation ──────────────────────────────────────────────────────────
  level: 'global',         // 'global' | 'country' | 'city'
  query: '',
  selectedCountry: null,
  selectedCity: null,

  // ── Globe markers  [ { lat, lng, label, count, type, data } ] ───────────
  markers: [],

  // Country result cache so we can restore without a refetch
  countryMarkers: [],

  // City results cache keyed by country name
  cityMarkersCache: {},

  // ── Video sidebar ────────────────────────────────────────────────────────
  videos: [],
  sidebarOpen: false,
  activeVideo: null,

  // ── Comparison selection ─────────────────────────────────────────────────
  compareModeOn: false,
  comparisonSelected: [],   // [{ label, lat, lng }]  — max 4

  // ── Analysis (split-screen) mode ─────────────────────────────────────────
  analysisMode: false,
  analysisData: null,
  analysisLoading: false,
  analysisProgress: '',
  analysisError: null,
  analysisSelectedCountry: null,
  analysisActiveVideo: null,

  // ── App mode (feature selector) ──────────────────────────────────────────
  // 'explore' | 'timeline' | 'trending'
  appMode: 'explore',

  // ── Time Travel mode ─────────────────────────────────────────────────────
  selectedYear: 2020,
  timelineMarkers: [],
  timelineLoading: false,

  // ── Trending Live mode ───────────────────────────────────────────────────
  trendingData: [],          // array of TrendingResponseDTO
  trendingLoading: false,
  trendingLastRefresh: null, // epoch ms
  activeTrendingRegion: null, // currently selected region in trending panel

  // ── UI ──────────────────────────────────────────────────────────────────
  loading: false,
  loadingMessage: '',
  error: null,
};

function reducer(state, action) {
  switch (action.type) {

    // ── Existing actions (unchanged) ──────────────────────────────────────
    case 'SET_LOADING':
      return { ...state, loading: action.payload, loadingMessage: action.message || '', error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_MARKERS':
      return { ...state, markers: action.payload };
    case 'SET_COUNTRY_MARKERS':
      return { ...state, countryMarkers: action.payload, markers: action.payload };
    case 'SET_CITY_MARKERS': {
      const cache = { ...state.cityMarkersCache, [action.country]: action.payload };
      return { ...state, cityMarkersCache: cache, markers: action.payload };
    }
    case 'SET_LEVEL':
      return { ...state, level: action.payload };
    case 'SET_COUNTRY':
      return { ...state, selectedCountry: action.payload, level: 'country' };
    case 'SET_CITY':
      return { ...state, selectedCity: action.payload, level: 'city', sidebarOpen: true };
    case 'CLEAR_COUNTRY':
      return { ...state, selectedCountry: null, selectedCity: null };
    case 'SET_VIDEOS':
      return { ...state, videos: action.payload };
    case 'SET_ACTIVE_VIDEO':
      return { ...state, activeVideo: action.payload };
    case 'CLOSE_SIDEBAR':
      return { ...state, sidebarOpen: false, activeVideo: null };
    case 'RESET':
      return { ...initialState };

    // ── Comparison mode ───────────────────────────────────────────────────
    case 'TOGGLE_COMPARE_MODE':
      return { ...state, compareModeOn: !state.compareModeOn, comparisonSelected: [] };

    case 'TOGGLE_COUNTRY_SELECTION': {
      const { label, lat, lng } = action.payload;
      const alreadyIn = state.comparisonSelected.some(c => c.label === label);
      if (alreadyIn) {
        return {
          ...state,
          comparisonSelected: state.comparisonSelected.filter(c => c.label !== label),
        };
      }
      if (state.comparisonSelected.length >= 4) return state;
      return {
        ...state,
        comparisonSelected: [...state.comparisonSelected, { label, lat, lng }],
      };
    }

    case 'CLEAR_COMPARISON':
      return { ...state, comparisonSelected: [], compareModeOn: false };

    // ── Analysis mode ─────────────────────────────────────────────────────
    case 'ENTER_ANALYSIS_MODE':
      return {
        ...state,
        analysisMode: true,
        analysisLoading: true,
        analysisProgress: 'Starting analysis…',
        analysisError: null,
        analysisData: null,
      };

    case 'EXIT_ANALYSIS_MODE':
      return {
        ...state,
        analysisMode: false,
        analysisData: null,
        analysisLoading: false,
        analysisProgress: '',
        analysisError: null,
        comparisonSelected: [],
        compareModeOn: false,
        analysisSelectedCountry: null,
        analysisActiveVideo: null,
      };

    case 'SET_ANALYSIS_DATA':
      return {
        ...state,
        analysisData: action.payload,
        analysisLoading: false,
        analysisProgress: '',
        analysisSelectedCountry: action.payload?.countries?.[0]?.country || null,
      };

    case 'SET_ANALYSIS_LOADING':
      return { ...state, analysisLoading: action.payload, analysisProgress: action.message || '' };

    case 'SET_ANALYSIS_ERROR':
      return { ...state, analysisError: action.payload, analysisLoading: false };

    case 'SET_ANALYSIS_SELECTED_COUNTRY':
      return { ...state, analysisSelectedCountry: action.payload };

    case 'SET_ANALYSIS_ACTIVE_VIDEO':
      return { ...state, analysisActiveVideo: action.payload };

    // ── App mode ──────────────────────────────────────────────────────────
    case 'SET_APP_MODE':
      return {
        ...state,
        appMode: action.payload,
        // Clear mode-specific ephemeral state on switch
        activeTrendingRegion: null,
        // Keep timeline/trending data so switching back is instant
      };

    // ── Time Travel ───────────────────────────────────────────────────────
    case 'SET_YEAR':
      return { ...state, selectedYear: action.payload };

    case 'SET_TIMELINE_MARKERS':
      return { ...state, timelineMarkers: action.payload, timelineLoading: false };

    case 'SET_TIMELINE_LOADING':
      return { ...state, timelineLoading: action.payload };

    // ── Trending Live ─────────────────────────────────────────────────────
    case 'SET_TRENDING_DATA':
      return {
        ...state,
        trendingData: action.payload,
        trendingLoading: false,
        trendingLastRefresh: Date.now(),
      };

    case 'SET_TRENDING_LOADING':
      return { ...state, trendingLoading: action.payload };

    case 'SET_ACTIVE_TRENDING_REGION':
      return { ...state, activeTrendingRegion: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Existing async operations (unchanged) ─────────────────────────────

  const search = useCallback(async query => {
    dispatch({ type: 'SET_LOADING', payload: true, message: 'Searching YouTube for geotagged videos…' });
    dispatch({ type: 'SET_QUERY', payload: query });
    dispatch({ type: 'CLOSE_SIDEBAR' });
    dispatch({ type: 'CLEAR_COMPARISON' });
    if (state.analysisMode) dispatch({ type: 'EXIT_ANALYSIS_MODE' });

    try {
      const countries = await api.search(query);
      const markers = countries.map(c => ({
        lat: c.latitude,
        lng: c.longitude,
        label: c.country,
        count: c.videoCount,
        type: 'country',
        data: c,
      }));
      dispatch({ type: 'SET_COUNTRY_MARKERS', payload: markers });
      dispatch({ type: 'SET_LEVEL', payload: 'global' });
      dispatch({ type: 'SET_LOADING', payload: false });

      if (countries.length === 0) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            'No geotagged videos found for this query. YouTube geolocation metadata is rare — try "street food", "travel vlog", or "walking tour".',
        });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [state.analysisMode]);

  const selectCountry = useCallback(async (country, query) => {
    dispatch({ type: 'SET_LOADING', payload: true, message: `Loading cities in ${country}…` });
    dispatch({ type: 'SET_COUNTRY', payload: country });

    if (state.cityMarkersCache[country]) {
      dispatch({ type: 'SET_CITY_MARKERS', payload: state.cityMarkersCache[country], country });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const cities = await api.getCities(country, query);
      const markers = cities.map(c => ({
        lat: c.latitude,
        lng: c.longitude,
        label: c.city,
        count: c.videoCount,
        type: 'city',
        data: c,
      }));
      dispatch({ type: 'SET_CITY_MARKERS', payload: markers, country });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [state.cityMarkersCache]);

  const selectCity = useCallback(async (city, query) => {
    dispatch({ type: 'SET_LOADING', payload: true, message: `Loading videos in ${city}…` });
    dispatch({ type: 'SET_CITY', payload: city });

    try {
      const videos = await api.getVideos(city, query);
      dispatch({ type: 'SET_VIDEOS', payload: videos });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const goBack = useCallback(() => {
    if (state.level === 'city') {
      dispatch({ type: 'SET_LEVEL', payload: 'country' });
      dispatch({ type: 'CLOSE_SIDEBAR' });
      const cached = state.cityMarkersCache[state.selectedCountry];
      if (cached) dispatch({ type: 'SET_MARKERS', payload: cached });
    } else if (state.level === 'country') {
      dispatch({ type: 'SET_LEVEL', payload: 'global' });
      dispatch({ type: 'CLEAR_COUNTRY' });
      dispatch({ type: 'SET_MARKERS', payload: state.countryMarkers });
    }
  }, [state]);

  const openVideo    = useCallback(video => dispatch({ type: 'SET_ACTIVE_VIDEO', payload: video }), []);
  const closeVideo   = useCallback(()    => dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null }), []);
  const closeSidebar = useCallback(()    => dispatch({ type: 'CLOSE_SIDEBAR' }), []);
  const clearError   = useCallback(()    => dispatch({ type: 'CLEAR_ERROR' }), []);

  // ── Comparison operations ─────────────────────────────────────────────

  const toggleCompareMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_COMPARE_MODE' });
  }, []);

  const toggleCountrySelection = useCallback((label, lat, lng) => {
    dispatch({ type: 'TOGGLE_COUNTRY_SELECTION', payload: { label, lat, lng } });
  }, []);

  const clearComparison = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPARISON' });
  }, []);

  const exitAnalysisMode = useCallback(() => {
    dispatch({ type: 'EXIT_ANALYSIS_MODE' });
  }, []);

  const setAnalysisSelectedCountry = useCallback(country => {
    dispatch({ type: 'SET_ANALYSIS_SELECTED_COUNTRY', payload: country });
  }, []);

  const setAnalysisActiveVideo = useCallback(video => {
    dispatch({ type: 'SET_ANALYSIS_ACTIVE_VIDEO', payload: video });
  }, []);

  const runComparison = useCallback(async () => {
    dispatch({ type: 'ENTER_ANALYSIS_MODE' });
    const countries = state.comparisonSelected.map(c => c.label);

    const steps = [
      'Fetching video transcripts…',
      'Extracting metadata…',
      'Comparing countries…',
      'Generating dashboard…',
    ];
    let stepIdx = 0;
    const progressInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        dispatch({ type: 'SET_ANALYSIS_LOADING', payload: true, message: steps[stepIdx++] });
      }
    }, 4000);

    try {
      const data = await api.analyze(state.query, countries);
      clearInterval(progressInterval);
      dispatch({ type: 'SET_ANALYSIS_DATA', payload: data });
    } catch (err) {
      clearInterval(progressInterval);
      dispatch({ type: 'SET_ANALYSIS_ERROR', payload: err.message });
    }
  }, [state.query, state.comparisonSelected]);

  // ── Time Travel operations ────────────────────────────────────────────

  const fetchTimeline = useCallback(async (query, year) => {
    if (!query) return;
    dispatch({ type: 'SET_TIMELINE_LOADING', payload: true });
    try {
      const data = await api.getTimeline(query, year);
      const markers = data.map(d => ({
        lat: d.latitude,
        lng: d.longitude,
        label: d.country,
        count: d.videoCount,
        type: 'country',
        data: d,
        isTimeline: true,
      }));
      dispatch({ type: 'SET_TIMELINE_MARKERS', payload: markers });
    } catch (err) {
      dispatch({ type: 'SET_TIMELINE_LOADING', payload: false });
    }
  }, []);

  const setYear = useCallback(async year => {
    dispatch({ type: 'SET_YEAR', payload: year });
    if (state.appMode === 'timeline' && state.query) {
      await fetchTimeline(state.query, year);
    }
  }, [state.appMode, state.query, fetchTimeline]);

  // ── Trending Live operations ──────────────────────────────────────────

  const fetchTrending = useCallback(async () => {
    dispatch({ type: 'SET_TRENDING_LOADING', payload: true });
    try {
      const data = await api.getTrending();
      dispatch({ type: 'SET_TRENDING_DATA', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_TRENDING_LOADING', payload: false });
    }
  }, []);

  const setActiveTrendingRegion = useCallback(region => {
    dispatch({ type: 'SET_ACTIVE_TRENDING_REGION', payload: region });
  }, []);

  const setAppMode = useCallback(async mode => {
    dispatch({ type: 'SET_APP_MODE', payload: mode });
    if (mode === 'trending') {
      await fetchTrending();
    } else if (mode === 'timeline' && state.query) {
      await fetchTimeline(state.query, state.selectedYear);
    }
  }, [state.query, state.selectedYear, fetchTrending, fetchTimeline]);

  return (
    <AppContext.Provider
      value={{
        state,
        // Existing
        search, selectCountry, selectCity, goBack,
        openVideo, closeVideo, closeSidebar, clearError,
        // Comparison
        toggleCompareMode, toggleCountrySelection, clearComparison,
        runComparison, exitAnalysisMode,
        setAnalysisSelectedCountry, setAnalysisActiveVideo,
        // Time Travel
        setAppMode, setYear, fetchTimeline,
        // Trending
        fetchTrending, setActiveTrendingRegion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
