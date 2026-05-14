import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

export default function Breadcrumb() {
  const { state, goBack, search } = useApp();
  const { query, level, selectedCountry, selectedCity } = state;

  const handleHomeClick = () => {
    search(query);
  };

  const handleCountryClick = () => {
    goBack();
  };

  return (
    <View style={styles.container}>
      {/* Home */}
      <TouchableOpacity onPress={handleHomeClick} style={styles.breadcrumbItem}>
        <Text style={styles.breadcrumbText}>{query}</Text>
      </TouchableOpacity>

      {/* Separator */}
      {(level === 'country' || level === 'city') && (
        <Text style={styles.separator}>›</Text>
      )}

      {/* Country */}
      {(level === 'country' || level === 'city') && (
        <TouchableOpacity
          onPress={level === 'city' ? handleCountryClick : undefined}
          style={[styles.breadcrumbItem, level === 'city' && styles.clickable]}
        >
          <Text style={[styles.breadcrumbText, level === 'city' && styles.clickableText]}>
            {selectedCountry}
          </Text>
        </TouchableOpacity>
      )}

      {/* Separator */}
      {level === 'city' && (
        <Text style={styles.separator}>›</Text>
      )}

      {/* City */}
      {level === 'city' && (
        <View style={styles.breadcrumbItem}>
          <Text style={styles.breadcrumbTextCurrent}>{selectedCity}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  breadcrumbItem: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  breadcrumbText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  breadcrumbTextCurrent: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  clickable: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  clickableText: {
    color: '#00d0ff',
  },
  separator: {
    color: '#6b7280',
    fontSize: 16,
    marginHorizontal: 8,
  },
});