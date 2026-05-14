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

const { width } = Dimensions.get('window');

export default function VideoSidebar() {
  const { state, closeSidebar, openVideo } = useApp();
  const { videos, activeVideo } = state;

  const renderVideo = ({ item }: { item: any }) => {
    const isActive = activeVideo?.videoId === item.videoId;

    return (
      <TouchableOpacity
        onPress={() => openVideo(item)}
        style={[styles.videoCard, isActive && styles.activeVideoCard]}
      >
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.videoChannel} numberOfLines={1}>
            {item.channelTitle}
          </Text>
          <View style={styles.videoMeta}>
            <Text style={styles.videoMetaText} numberOfLines={1}>
              {item.viewCount?.toLocaleString?.() || item.viewCount || 0} views
            </Text>
            {!!item.duration && <Text style={styles.videoMetaText}>{item.duration}</Text>}
          </View>
        </View>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>▶</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Videos</Text>
            <Text style={styles.subtitle}>
              {videos.length} result{videos.length === 1 ? '' : 's'}
            </Text>
          </View>
          <TouchableOpacity onPress={closeSidebar} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        {activeVideo && (
          <View style={styles.player}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerTitle} numberOfLines={1}>
                {activeVideo.title}
              </Text>
            </View>
            <View style={styles.playerContent}>
              <YouTubePlayer videoId={activeVideo.videoId} title={activeVideo.title} />
            </View>
          </View>
        )}

        <FlatList
          data={videos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.videoId}
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
    maxHeight: 430,
    backgroundColor: 'rgba(5,8,16,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 24,
    lineHeight: 27,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 4,
    gap: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  playerTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  playerContent: {
    height: 180,
  },
  videoCard: {
    width: Math.min(width * 0.68, 260),
    height: 132,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  activeVideoCard: {
    borderColor: '#00d0ff',
    backgroundColor: 'rgba(0, 208, 255, 0.1)',
  },
  thumbnail: {
    width: '100%',
    height: 74,
    backgroundColor: '#111827',
  },
  videoInfo: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  videoTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  videoChannel: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 3,
  },
  videoMeta: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  videoMetaText: {
    color: '#6b7280',
    fontSize: 10,
  },
  activeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00d0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
  },
});
