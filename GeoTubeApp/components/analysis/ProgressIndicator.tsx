import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useApp } from '../../context/AppContext';

export default function ProgressIndicator() {
  const { state } = useApp();
  const { analysisProgress } = state;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#00d0ff" />
        <Text style={styles.title}>Analyzing Videos</Text>
        <Text style={styles.message}>{analysisProgress}</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(5,8,16,0.97)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 20,
    maxWidth: 300,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00d0ff',
    borderRadius: 2,
    width: '60%', // Animated progress would be dynamic
  },
});