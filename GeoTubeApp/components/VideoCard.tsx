import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

interface VideoCardProps {
  video: any;
  isActive: boolean;
}

export default function VideoCard({ video, isActive }: VideoCardProps) {
  const { openVideo } = useApp();

  const handlePress = () => {
    openVideo(video);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.container, isActive && styles.active]}>
      <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.channel} numberOfLines={1}>
          {video.channelTitle}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.views}>{video.viewCount?.toLocaleString()} views</Text>
          <Text style={styles.duration}>{video.duration}</Text>
        </View>
      </View>
      {isActive && (
        <View style={styles.activeIndicator}>
          <Text style={styles.activeText}>▶</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  active: {
    borderColor: '#00d0ff',
    backgroundColor: 'rgba(0, 208, 255, 0.1)',
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  channel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  views: {
    color: '#6b7280',
    fontSize: 11,
  },
  duration: {
    color: '#6b7280',
    fontSize: 11,
  },
  activeIndicator: {
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
  activeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});