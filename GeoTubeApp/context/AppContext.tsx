import React, { createContext, useCallback, useContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

interface CountryData {
  country: string;
  latitude: number;
  longitude: number;
  videoCount: number;
  videos: any[];
  summary?: any;
}

interface AnalysisData {
  query: string;
  domain: string;
  countries: CountryData[];
  comparison?: any;
  vizData?: any;
}

interface AppState {
  // ── Navigation ──────────────────────────────────────────────────────────
  level: 'global' | 'country' | 'city';
  query: string;
  selectedCountry: any;
  selectedCity: any;

  // ── Globe markers  [ { lat, lng, label, count, type, data } ] ───────────
  markers: any[];

  // Country result cache so we can restore without a refetch
  countryMarkers: any[];

  // City results cache keyed by country name
  cityMarkersCache: { [key: string]: any[] };

  // ── Video sidebar ────────────────────────────────────────────────────────
  videos: any[];
  sidebarOpen: boolean;
  activeVideo: any;

  // ── Comparison selection ─────────────────────────────────────────────────
  // Active when user wants to pick countries for comparison
  compareModeOn: boolean;
  comparisonSelected: any[];   // [{ label, lat, lng }]  — max 4

  // ── Analysis (split-screen) mode ─────────────────────────────────────────
  analysisMode: boolean;
  analysisData: AnalysisData | null;
  analysisLoading: boolean;
  analysisProgress: string;
  analysisError: string | null;
  // Which country the user clicked on in the globe while in analysis mode
  analysisSelectedCountry: any;
  // Which video is playing in the analysis left-panel
  analysisActiveVideo: any;

  // ── UI ──────────────────────────────────────────────────────────────────
  loading: boolean;
  loadingMessage: string;
  error: string | null;
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<any>;
  search: (query: string) => Promise<void>;
  selectCountry: (country: any, query?: string) => Promise<void>;
  selectCity: (city: any, query?: string) => Promise<void>;
  openVideo: (video: any) => void;
  closeVideo: () => void;
  closeSidebar: () => void;
  runComparison: () => Promise<void>;
  exitAnalysisMode: () => void;
  toggleCompareMode: () => void;
  toggleCountrySelection: (label: string, lat: number, lng: number) => void;
  clearComparison: () => void;
  setAnalysisActiveVideo: (video: any) => void;
  setAnalysisSelectedCountry: (country: any) => void;
  goBack: () => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: AppState = {
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
  // Active when user wants to pick countries for comparison
  compareModeOn: false,
  comparisonSelected: [],   // [{ label, lat, lng }]  — max 4

  // ── Analysis (split-screen) mode ─────────────────────────────────────────
  analysisMode: false,
  analysisData: null,
  analysisLoading: false,
  analysisProgress: '',
  analysisError: null,
  // Which country the user clicked on in the globe while in analysis mode
  analysisSelectedCountry: null,
  // Which video is playing in the analysis left-panel
  analysisActiveVideo: null,

  // ── UI ──────────────────────────────────────────────────────────────────
  loading: false,
  loadingMessage: '',
  error: null,
};

function reducer(state: AppState, action: any): AppState {
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
      return {
        ...state,
        compareModeOn: !state.compareModeOn,
        comparisonSelected: [],
      };

    case 'TOGGLE_COUNTRY_SELECTION': {
      const { label, lat, lng } = action.payload;
      const alreadyIn = state.comparisonSelected.some(c => c.label === label);
      if (alreadyIn) {
        return {
          ...state,
          comparisonSelected: state.comparisonSelected.filter(c => c.label !== label),
        };
      }
      if (state.comparisonSelected.length >= 4) return state; // max 4
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
        // Default to first country
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

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Existing async operations (unchanged) ─────────────────────────────

  const search = useCallback(async (query: string) => {
    dispatch({ type: 'SET_LOADING', payload: true, message: 'Searching YouTube for geotagged videos…' });
    dispatch({ type: 'SET_QUERY', payload: query });
    dispatch({ type: 'CLOSE_SIDEBAR' });
    // Reset comparison when running a new search
    dispatch({ type: 'CLEAR_COMPARISON' });
    if (state.analysisMode) dispatch({ type: 'EXIT_ANALYSIS_MODE' });

    try {
      const countries = await api.search(query);
      const markers = countries.map((c: any) => ({
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, [state.analysisMode]);

  const selectCountry = useCallback(async (country: any, query?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true, message: `Loading cities in ${country}…` });
    dispatch({ type: 'SET_COUNTRY', payload: country });

    if (state.cityMarkersCache[country]) {
      dispatch({ type: 'SET_CITY_MARKERS', payload: state.cityMarkersCache[country], country });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const cities = await api.getCities(country, query);
      const markers = cities.map((c: any) => ({
        lat: c.latitude,
        lng: c.longitude,
        label: c.city,
        count: c.videoCount,
        type: 'city',
        data: c,
      }));
      dispatch({ type: 'SET_CITY_MARKERS', payload: markers, country });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, [state.cityMarkersCache]);

  const selectCity = useCallback(async (city: any, query?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true, message: `Loading videos in ${city}…` });
    dispatch({ type: 'SET_CITY', payload: city });

    try {
      const videos = await api.getVideos(city, query);
      dispatch({ type: 'SET_VIDEOS', payload: videos });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'SET_ERROR', payload: message });
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

  const openVideo    = useCallback((video: any) => dispatch({ type: 'SET_ACTIVE_VIDEO', payload: video }), []);
  const closeVideo   = useCallback(() => dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null }), []);
  const closeSidebar = useCallback(() => dispatch({ type: 'CLOSE_SIDEBAR' }), []);
  const clearError   = useCallback(()    => dispatch({ type: 'CLEAR_ERROR' }), []);

  // ── New comparison operations ─────────────────────────────────────────

  const toggleCompareMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_COMPARE_MODE' });
  }, []);

  const toggleCountrySelection = useCallback((label: string, lat: number, lng: number) => {
    dispatch({ type: 'TOGGLE_COUNTRY_SELECTION', payload: { label, lat, lng } });
  }, []);

  const clearComparison = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPARISON' });
  }, []);

  const exitAnalysisMode = useCallback(() => {
    dispatch({ type: 'EXIT_ANALYSIS_MODE' });
  }, []);

  const setAnalysisSelectedCountry = useCallback((country: any) => {
    dispatch({ type: 'SET_ANALYSIS_SELECTED_COUNTRY', payload: country });
  }, []);

  const setAnalysisActiveVideo = useCallback((video: any) => {
    dispatch({ type: 'SET_ANALYSIS_ACTIVE_VIDEO', payload: video });
  }, []);

  const runComparison = useCallback(async () => {
    dispatch({ type: 'ENTER_ANALYSIS_MODE' });
    const countries = state.comparisonSelected.map(c => c.label);

    // Simulate progressive status messages while the backend processes
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
    } catch (err: unknown) {
      clearInterval(progressInterval);
      const message = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'SET_ANALYSIS_ERROR', payload: message });
    }
  }, [state.query, state.comparisonSelected]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        // Existing
        search,
        selectCountry,
        selectCity,
        goBack,
        openVideo,
        closeVideo,
        closeSidebar,
        clearError,
        // New comparison
        toggleCompareMode,
        toggleCountrySelection,
        clearComparison,
        runComparison,
        exitAnalysisMode,
        setAnalysisSelectedCountry,
        setAnalysisActiveVideo,
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