import React, { useEffect } from 'react';
import { BackHandler, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import GlobeView from './GlobeView';
import SearchBar from './SearchBar';
import VideoSidebar from './VideoSidebar';
import Breadcrumb from './Breadcrumb';
import Loader from './Loader';
import ErrorState from './ErrorState';
import CountrySelector from './comparison/CountrySelector';
import CompareButton from './comparison/CompareButton';
import AnalysisLayout from './analysis/AnalysisLayout';

const { width } = Dimensions.get('window');

export default function HomePage() {
  const {
    state,
    dispatch,
    search,
    toggleCompareMode,
    clearComparison,
    closeSidebar,
    exitAnalysisMode,
    goBack,
    clearError,
  } = useApp();
  const {
    query, loading, error, markers, sidebarOpen, level,
    compareModeOn, comparisonSelected,
    analysisMode,
  } = state;

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (analysisMode) {
        exitAnalysisMode();
        return true;
      }

      if (error) {
        clearError();
        return true;
      }

      if (sidebarOpen) {
        closeSidebar();
        return true;
      }

      if (compareModeOn) {
        clearComparison();
        return true;
      }

      if (level === 'city' || level === 'country') {
        goBack();
        return true;
      }

      if (query) {
        dispatch({ type: 'RESET' });
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [
    analysisMode,
    clearComparison,
    clearError,
    closeSidebar,
    compareModeOn,
    dispatch,
    error,
    exitAnalysisMode,
    goBack,
    level,
    query,
    search,
    sidebarOpen,
  ]);

  /* ── Analysis mode — full split-screen takeover ──────────────────── */
  if (analysisMode) {
    return <AnalysisLayout />;
  }

  const showCompareUI = query && !loading && markers.length > 0 && level === 'global';

  return (
    <View style={styles.container}>

      {/* ── Globe (full-page background) ─────────────────────── */}
      <GlobeView />

      {/* ── Top navigation bar ───────────────────────────────── */}
      <View style={styles.header}>
        {/* Logo */}
        <TouchableOpacity
          onPress={() => dispatch({ type: 'RESET' })}
          style={styles.logo}
          activeOpacity={0.82}
        >
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>▶</Text>
          </View>
          <Text style={styles.logoText}>
            Geo<Text style={styles.logoTextRed}>Tube</Text>
          </Text>
        </TouchableOpacity>

        {/* Search bar — centre */}
        <View style={styles.searchContainer}>
          <SearchBar />
        </View>

        {/* Right cluster: result count + compare toggle */}
        <View style={styles.headerRight}>
          {markers.length > 0 && (
            <View style={styles.resultCount}>
              <Text style={styles.resultCountText}>{markers.length}</Text>
              <Text style={styles.resultCountLabel}>
                {' '}
                {level === 'global' ? 'countries' : level === 'country' ? 'cities' : 'locations'}
              </Text>
            </View>
          )}

          {/* Compare mode toggle — only at global level after a search */}
          {showCompareUI && (
            <TouchableOpacity
              onPress={toggleCompareMode}
              style={[
                styles.compareButton,
                compareModeOn ? styles.compareButtonActive : styles.compareButtonInactive
              ]}
            >
              <Text style={styles.compareButtonIcon}>📊</Text>
              <Text style={styles.compareButtonText}>
                {compareModeOn ? 'Exit Compare' : 'Compare'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      {query && !compareModeOn && (
        <View style={styles.breadcrumb}>
          <Breadcrumb />
        </View>
      )}

      {/* ── Compare mode hint ─────────────────────────────────── */}
      {showCompareUI && compareModeOn && (
        <View style={styles.compareHint}>
          <Text style={styles.compareHintText}>
            Click country markers to select for comparison (max 4)
          </Text>
        </View>
      )}

      {/* ── Hero intro (shown before first search) ────────────── */}
      {!query && !loading && (
        <View style={styles.hero}>
          <View style={styles.heroScrim} />
          <Text style={styles.heroTitle}>
            Explore the World{"'"}s{'\n'}
            <Text style={styles.heroTitleRed}>
              YouTube Stories
            </Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Search any topic and discover geotagged videos on an interactive 3D globe.
          </Text>
          <View style={styles.heroTags}>
            {['street food', 'travel vlog', 'walking tour', 'nature', 'festivals'].map(tag => (
              <TouchableOpacity
                key={tag}
                onPress={() => search(tag)}
                style={styles.heroTag}
              >
                <Text style={styles.heroTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── Level label overlay ───────────────────────────────── */}
      {query && !loading && markers.length > 0 && !compareModeOn && (
        <View style={styles.levelLabel}>
          <Text style={styles.levelLabelText}>
            {level === 'global' && 'Click a country to zoom in'}
            {level === 'country' && 'Click a city to see videos'}
            {level === 'city' && 'Viewing videos in ' + state.selectedCity}
          </Text>
        </View>
      )}

      {/* ── Comparison selection chips + connect button ───────── */}
      {showCompareUI && compareModeOn && <CountrySelector />}
      {showCompareUI && compareModeOn && comparisonSelected.length >= 2 && <CompareButton />}

      {/* ── Video sidebar ─────────────────────────────────────── */}
      {sidebarOpen && !compareModeOn && <VideoSidebar />}

      {/* ── Overlays ─────────────────────────────────────────── */}
      {loading && <Loader message={state.loadingMessage} />}
      {error   && <ErrorState message={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 22,
    paddingTop: 48,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoTextRed: {
    color: '#dc2626',
  },
  searchContainer: {
    width: '100%',
  },
  headerRight: {
    position: 'absolute',
    top: 48,
    right: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  resultCount: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resultCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultCountLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  compareButton: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compareButtonActive: {
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 255, 0.6)',
    backgroundColor: 'rgba(0, 208, 255, 0.1)',
  },
  compareButtonInactive: {
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  compareButtonIcon: {
    fontSize: 12,
  },
  compareButtonText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  breadcrumb: {
    position: 'absolute',
    top: 150,
    left: 24,
    zIndex: 20,
  },
  compareHint: {
    position: 'absolute',
    top: 150,
    left: 24,
    right: 24,
    zIndex: 20,
    backgroundColor: 'rgba(0, 208, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 255, 0.3)',
    alignItems: 'center',
  },
  compareHintText: {
    color: '#00d0ff',
    fontSize: 12,
  },
  hero: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 18,
  },
  heroScrim: {
    position: 'absolute',
    width: '92%',
    maxWidth: 390,
    height: 245,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 39,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroTitleRed: {
    color: '#dc2626',
  },
  heroSubtitle: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 330,
    lineHeight: 21,
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    maxWidth: 360,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroTagText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  levelLabel: {
    position: 'absolute',
    bottom: 24,
    left: width / 2 - 120,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  levelLabelText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
});
