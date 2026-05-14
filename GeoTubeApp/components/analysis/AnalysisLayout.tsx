import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../context/AppContext';
import GlobeView from '../GlobeView';
import YouTubePlayer from '../YouTubePlayer';
import AnalysisDashboard from './AnalysisDashboard';
import ProgressIndicator from './ProgressIndicator';
import VideoPicker from './VideoPicker';

const { width, height } = Dimensions.get('window');
const GLOBE_PANEL_HEIGHT = Math.floor(height * 0.54);

export default function AnalysisLayout() {
  const { state, exitAnalysisMode } = useApp();
  const {
    analysisLoading,
    analysisError,
    analysisData,
    analysisActiveVideo,
    query,
    comparisonSelected,
  } = state;

  return (
    <View style={styles.container}>
      <View style={styles.globePanel}>
        <View style={styles.globeContainer}>
          <GlobeView containerWidth={width} analysisGlobe />
        </View>

        <View style={styles.topBar}>
          <TouchableOpacity onPress={exitAnalysisMode} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
              Geo<Text style={styles.logoTextRed}>Tube</Text>
            </Text>
            <Text style={styles.separator}>·</Text>
            <Text style={styles.queryText} numberOfLines={1}>{'"'}{query}{'"'}</Text>
          </View>

          <View style={styles.modeBadge}>
            <Text style={styles.modeText}>Analysis</Text>
          </View>
        </View>

        {comparisonSelected.length > 0 && (
          <View style={styles.countryChips}>
            <View style={styles.chipsContainer}>
              {comparisonSelected.map(c => (
                <View key={c.label} style={styles.chip}>
                  <Text style={styles.chipText}>{c.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {analysisActiveVideo && (
          <View style={styles.videoPlayer}>
            <View style={styles.playerContainer}>
              <View style={styles.playerHeader}>
                <Text style={styles.playerTitle} numberOfLines={1}>
                  {analysisActiveVideo.title}
                </Text>
              </View>
              <View style={styles.playerContent}>
                <YouTubePlayer
                  videoId={analysisActiveVideo.videoId}
                  title={analysisActiveVideo.title}
                />
              </View>
            </View>
          </View>
        )}

        {analysisData && <VideoPicker />}

        {analysisData && !analysisActiveVideo && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>Select a video below to watch it here</Text>
          </View>
        )}
      </View>

      <View style={styles.dashboardPanel}>
        {analysisLoading || (!analysisData && !analysisError)
          ? <ProgressIndicator />
          : <AnalysisDashboard />
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  globePanel: {
    height: GLOBE_PANEL_HEIGHT,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  globeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 38,
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  logoContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logoTextRed: {
    color: '#dc2626',
  },
  separator: {
    color: '#9ca3af',
    fontSize: 14,
  },
  queryText: {
    color: '#9ca3af',
    fontSize: 13,
    flex: 1,
  },
  modeBadge: {
    backgroundColor: 'rgba(0, 208, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modeText: {
    color: '#00d0ff',
    fontSize: 11,
    fontWeight: '700',
  },
  countryChips: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 150,
    zIndex: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: 'rgba(0, 208, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 255, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    color: '#00d0ff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoPlayer: {
    position: 'absolute',
    left: 16,
    bottom: 148,
    zIndex: 10,
    width: Math.min(width - 32, 320),
  },
  playerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  playerHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  playerTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  playerContent: {
    height: 140,
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  placeholderText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  placeholderSubtext: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 154,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  hintText: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    color: '#9ca3af',
    fontSize: 12,
  },
  dashboardPanel: {
    flex: 1,
    minHeight: 0,
  },
});
