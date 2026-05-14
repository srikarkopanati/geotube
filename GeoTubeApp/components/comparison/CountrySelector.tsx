import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

export default function CountrySelector() {
  const { state, toggleCountrySelection } = useApp();
  const { comparisonSelected } = state;

  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        {comparisonSelected.map(country => (
          <TouchableOpacity
            key={country.label}
            onPress={() => toggleCountrySelection(country.label, country.lat, country.lng)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{country.label}</Text>
            <Text style={styles.chipRemove}>×</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    maxWidth: width - 32,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 208, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 255, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: '#00d0ff',
    fontSize: 14,
    fontWeight: '500',
  },
  chipRemove: {
    color: '#00d0ff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
