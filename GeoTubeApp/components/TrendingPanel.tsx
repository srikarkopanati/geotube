import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import YouTubePlayer from './YouTubePlayer';
import { getVideoThumbnail } from './videoHelpers';

const REFRESH_MS = 15 * 60 * 1000;

function timeAgo(ts: number | null) {
  if (!ts) return 'never';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function TrendingPanel() {
  const { state, fetchTrending, setActiveTrendingRegion, setAppMode } = useApp();
  const { trendingData, trendingLoading, trendingLastRefresh, activeTrendingRegion } = state;
  const [activeVideo, setActiveVideo] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(fetchTrending, REFRESH_MS);
    return () => clearInterval(timer);
  }, [fetchTrending]);

  useEffect(() => {
    setActiveVideo(null);
  }, [activeTrendingRegion]);

  const videos = activeTrendingRegion?.topVideos || [];

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.liveRow}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
          <Text style={styles.refreshText}>{timeAgo(trendingLastRefresh)}</Text>
        </View>

        <View style={styles.actions}>
          {activeTrendingRegion ? (
            <TouchableOpacity onPress={() => setActiveTrendingRegion(null)} style={styles.iconButton}>
              <Text style={styles.iconText}>‹</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={fetchTrending} style={styles.iconButton}>
              <Text style={styles.iconText}>{trendingLoading ? '...' : '↻'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setAppMode('explore')} style={styles.iconButton}>
            <Text style={styles.iconText}>x</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>
        {activeTrendingRegion ? activeTrendingRegion.region : 'Trending Worldwide'}
      </Text>
      <Text style={styles.subtitle}>
        {activeTrendingRegion
          ? `${videos.length} trending video${videos.length === 1 ? '' : 's'}`
          : `${trendingData.length} regions tracked`}
      </Text>

      {activeTrendingRegion && activeVideo && (
        <View style={styles.player}>
          <View style={styles.playerContent}>
            <YouTubePlayer videoId={activeVideo.videoId} title={activeVideo.title} />
          </View>
          <View style={styles.nowPlaying}>
            <Text style={styles.nowPlayingText} numberOfLines={1}>{activeVideo.title}</Text>
            <TouchableOpacity onPress={() => setActiveVideo(null)}>
              <Text style={styles.nowPlayingClose}>x</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTrendingRegion ? (
        <FlatList
          data={videos}
          keyExtractor={(item, index) => `${item.videoId || item.title || 'video'}-${index}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const thumbnail = getVideoThumbnail(item);
            const isPlaying = activeVideo?.videoId === item.videoId;
            return (
              <TouchableOpacity
                onPress={() => setActiveVideo(item)}
                style={[styles.videoCard, isPlaying && styles.videoCardActive]}
                activeOpacity={0.86}
              >
                {thumbnail && <Image source={{ uri: thumbnail }} style={styles.videoThumb} />}
                <Text style={[styles.videoTitle, isPlaying && styles.videoTitleActive]} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No videos available for this region.</Text>}
        />
      ) : (
        <FlatList
          data={trendingData}
          keyExtractor={(item, index) => `${item.region || 'region'}-${index}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const thumbnail = getVideoThumbnail(item.topVideos?.[0] || {});
            return (
              <TouchableOpacity
                onPress={() => setActiveTrendingRegion(item)}
                style={styles.regionCard}
                activeOpacity={0.86}
              >
                {thumbnail ? (
                  <Image source={{ uri: thumbnail }} style={styles.regionThumb} />
                ) : (
                  <View style={[styles.regionThumb, styles.thumbFallback]} />
                )}
                <View style={styles.regionInfo}>
                  <Text style={styles.regionTitle}>{item.region}</Text>
                  <Text style={styles.regionMeta}>{item.videoCount} trending now</Text>
                </View>
                <Text style={styles.regionArrow}>›</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {trendingLoading ? 'Loading trending data...' : 'No trending data.'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '86%',
    zIndex: 35,
    paddingTop: 42,
    backgroundColor: 'rgba(20,10,5,0.97)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(251,146,60,0.18)',
  },
  header: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(251,146,60,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.26)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fb923c',
  },
  liveText: {
    color: '#fb923c',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  refreshText: {
    color: '#6b7280',
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    paddingHorizontal: 18,
    marginTop: 16,
  },
  subtitle: {
    color: '#fb923c',
    fontSize: 12,
    paddingHorizontal: 18,
    marginTop: 3,
    marginBottom: 12,
  },
  player: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(251,146,60,0.15)',
    backgroundColor: '#000',
  },
  playerContent: {
    height: 190,
  },
  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(251,146,60,0.08)',
  },
  nowPlayingText: {
    flex: 1,
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  nowPlayingClose: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '800',
  },
  list: {
    padding: 14,
    gap: 10,
  },
  regionCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  regionThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  thumbFallback: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  regionInfo: {
    flex: 1,
  },
  regionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  },
  regionMeta: {
    color: '#fb923c',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
  },
  regionArrow: {
    color: '#fb923c',
    fontSize: 24,
    fontWeight: '600',
  },
  videoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  videoCardActive: {
    borderColor: 'rgba(251,146,60,0.6)',
    backgroundColor: 'rgba(251,146,60,0.08)',
  },
  videoThumb: {
    width: '100%',
    height: 150,
    backgroundColor: '#111827',
  },
  videoTitle: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    padding: 10,
  },
  videoTitleActive: {
    color: '#fed7aa',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 42,
  },
});
