import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useApp } from '../../context/AppContext';

export default function VideoPicker() {
  const { state, setAnalysisActiveVideo, setAnalysisSelectedCountry } = useApp();
  const { analysisData, analysisSelectedCountry, analysisActiveVideo } = state;

  const selectedCountryData = analysisData?.countries?.find(c => c.country === analysisSelectedCountry);

  const renderVideo = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setAnalysisActiveVideo(item)}
      style={[styles.videoItem, analysisActiveVideo?.videoId === item.videoId && styles.activeVideo]}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.videoChannel} numberOfLines={1}>
          {item.channelTitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!selectedCountryData?.videos?.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Videos in {analysisSelectedCountry}</Text>
        <Text style={styles.count}>({selectedCountryData.videos.length})</Text>
      </View>

      <FlatList
        data={selectedCountryData.videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.videoId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5,8,16,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  count: {
    color: '#9ca3af',
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 16,
  },
  videoItem: {
    width: 160,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeVideo: {
    borderColor: '#00d0ff',
    backgroundColor: 'rgba(0, 208, 255, 0.1)',
  },
  thumbnail: {
    width: '100%',
    height: 90,
  },
  videoInfo: {
    padding: 8,
  },
  videoTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 4,
  },
  videoChannel: {
    color: '#9ca3af',
    fontSize: 10,
  },
});