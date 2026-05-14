import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

const MODES = [
  { id: 'explore', label: 'Explore', icon: '*', color: '#ef4444' },
  { id: 'timeline', label: 'Time', icon: 'o', color: '#22d3ee' },
  { id: 'trending', label: 'Live', icon: '^', color: '#fb923c' },
] as const;

export default function ModeSelector() {
  const { state, setAppMode } = useApp();

  return (
    <View style={styles.container}>
      {MODES.map(mode => {
        const active = state.appMode === mode.id;
        return (
          <TouchableOpacity
            key={mode.id}
            onPress={() => setAppMode(mode.id)}
            activeOpacity={0.82}
            style={[
              styles.button,
              active && {
                borderColor: mode.color,
                backgroundColor: `${mode.color}1f`,
              },
            ]}
          >
            <Text style={[styles.icon, active && { color: mode.color }]}>{mode.icon}</Text>
            <Text style={[styles.label, active && { color: mode.color }]} numberOfLines={1}>
              {mode.label}
            </Text>
            {mode.id === 'trending' && <View style={[styles.liveDot, active && styles.liveDotActive]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 5,
  },
  icon: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
  },
  label: {
    color: '#8b93a3',
    fontSize: 10,
    fontWeight: '800',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4b5563',
  },
  liveDotActive: {
    backgroundColor: '#fb923c',
  },
});
