import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

export default function ErrorState({ message }: { message: string }) {
  const { clearError } = useApp();

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>⚠️</Text>
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={clearError} style={styles.button}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(10,10,10,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    alignItems: 'center',
    gap: 16,
    maxWidth: 300,
    padding: 24,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});