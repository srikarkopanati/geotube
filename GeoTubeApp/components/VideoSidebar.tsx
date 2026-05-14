import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import YouTubePlayer from './YouTubePlayer';
import { getVideoThumbnail } from './videoHelpers';

const { width } = Dimensions.get('window');

export default function VideoSidebar() {
  const { state, closeSidebar, closeVideo, openVideo } = useApp();
  const { videos, activeVideo, selectedCity, selectedCountry } = state;

  const renderVideo = ({ item }: { item: any }) => {
    const isActive = activeVideo?.videoId === item.videoId;
    const thumbnail = getVideoThumbnail(item);

    return (
      <TouchableOpacity
        onPress={() => openVideo(item)}
        style={[styles.videoCard, isActive && styles.activeVideoCard]}
        activeOpacity={0.86}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailFallback]}>
            <Text style={styles.thumbnailFallbackText}>No thumbnail</Text>
          </View>
        )}

        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>PLAYING</Text>
          </View>
        )}

        <View style={styles.videoInfo}>
          <Text style={[styles.videoTitle, isActive && styles.activeVideoTitle]} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            {!!selectedCountry && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {selectedCountry}
              </Text>
            )}
            <Text style={styles.title} numberOfLines={1}>
              Videos{selectedCity ? ` in ${selectedCity}` : ''}{' '}
              <Text style={styles.titleCount}>({videos.length})</Text>
            </Text>
          </View>

          <TouchableOpacity onPress={closeSidebar} style={styles.closeButton} activeOpacity={0.8}>
            <Text style={styles.closeText}>x</Text>
          </TouchableOpacity>
        </View>

        {activeVideo && (
          <View style={styles.player}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerTitle} numberOfLines={1}>
                {activeVideo.title}
              </Text>
              <TouchableOpacity onPress={closeVideo} style={styles.playerCloseButton}>
                <Text style={styles.playerCloseText}>x</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.playerContent}>
              <YouTubePlayer videoId={activeVideo.videoId} title={activeVideo.title} />
            </View>
          </View>
        )}

        <FlatList
          data={videos}
          renderItem={renderVideo}
          keyExtractor={(item, index) => `${item.videoId || item.title || 'video'}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  sheet: {
    width: '100%',
    maxHeight: 255,
    backgroundColor: 'rgba(5,8,16,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: 16,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 54,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  titleCount: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 10,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 2,
    gap: 12,
  },
  player: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#000',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  playerTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  playerContent: {
    height: 190,
  },
  playerCloseButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCloseText: {
    color: 'white',
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '700',
  },
  videoCard: {
    width: Math.min(width * 0.42, 178),
    height: 132,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  activeVideoCard: {
    borderWidth: 2,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  thumbnail: {
    width: '100%',
    height: 86,
    backgroundColor: '#111827',
  },
  thumbnailFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailFallbackText: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
  },
  videoInfo: {
    minHeight: 46,
    paddingHorizontal: 10,
    paddingVertical: 7,
    justifyContent: 'flex-start',
  },
  videoTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  activeVideoTitle: {
    color: '#f87171',
  },
  activeBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    borderRadius: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '900',
  },
});
