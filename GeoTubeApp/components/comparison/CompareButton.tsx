import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useApp } from '../../context/AppContext';

export default function CompareButton() {
  const { runComparison } = useApp();

  return (
    <TouchableOpacity onPress={runComparison} style={styles.button}>
      <Text style={styles.buttonText}>Compare Countries</Text>
      <Text style={styles.buttonIcon}>📊</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: [{ translateX: -75 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00d0ff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#00d0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    fontSize: 16,
  },
});