import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Loader({ message }: { message: string }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,10,10,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    alignItems: 'center',
    gap: 16,
  },
  message: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 300,
  },
});