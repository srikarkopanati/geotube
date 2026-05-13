import React, { createContext, useCallback, useContext, useReducer } from 'react';
import * as api from '../services/api';

const AppContext = createContext(null);

const initialState = {
  // Navigation
  level: 'global',         // 'global' | 'country' | 'city'
  query: '',
  selectedCountry: null,
  selectedCity: null,

  // Globe markers  [ { lat, lng, label, count, type, data } ]
  markers: [],

  // Country result cache so we can restore without a refetch
  countryMarkers: [],

  // City results cache keyed by country name
  cityMarkersCache: {},

  // Video sidebar
  videos: [],
  sidebarOpen: false,
  activeVideo: null,

  // UI
  loading: false,
  loadingMessage: '',
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
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
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const search = useCallback(async query => {
    dispatch({ type: 'SET_LOADING', payload: true, message: 'Searching YouTube for geotagged videos…' });
    dispatch({ type: 'SET_QUERY', payload: query });
    dispatch({ type: 'CLOSE_SIDEBAR' });

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
  }, []);

  const selectCountry = useCallback(async (country, query) => {
    dispatch({ type: 'SET_LOADING', payload: true, message: `Loading cities in ${country}…` });
    dispatch({ type: 'SET_COUNTRY', payload: country });

    // Serve from cache when available
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
      // Restore cached city markers
      const cached = state.cityMarkersCache[state.selectedCountry];
      if (cached) dispatch({ type: 'SET_MARKERS', payload: cached });
    } else if (state.level === 'country') {
      dispatch({ type: 'SET_LEVEL', payload: 'global' });
      dispatch({ type: 'CLEAR_COUNTRY' });
      dispatch({ type: 'SET_MARKERS', payload: state.countryMarkers });
    }
  }, [state]);

  const openVideo  = useCallback(video => dispatch({ type: 'SET_ACTIVE_VIDEO', payload: video }), []);
  const closeVideo = useCallback(()    => dispatch({ type: 'SET_ACTIVE_VIDEO', payload: null }), []);
  const closeSidebar = useCallback(()  => dispatch({ type: 'CLOSE_SIDEBAR' }), []);
  const clearError   = useCallback(()  => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <AppContext.Provider
      value={{ state, search, selectCountry, selectCity, goBack, openVideo, closeVideo, closeSidebar, clearError }}
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
