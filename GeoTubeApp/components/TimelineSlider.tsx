import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

const MIN_YEAR = 2008;
const MAX_YEAR = 2024;
const MILESTONES = [2008, 2012, 2016, 2020, 2024];

export default function TimelineSlider() {
  const { state, setYear, fetchTimeline } = useApp();
  const { selectedYear, query, timelineLoading, timelineMarkers } = state;
  const [localYear, setLocalYear] = useState(selectedYear);

  useEffect(() => {
    setLocalYear(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    if (query && timelineMarkers.length === 0 && !timelineLoading) {
      fetchTimeline(query, selectedYear);
    }
  }, [fetchTimeline, query, selectedYear, timelineLoading, timelineMarkers.length]);

  const commitYear = (nextYear: number) => {
    const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, nextYear));
    setLocalYear(clamped);
    setYear(clamped);
  };

  const progress = ((localYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Time Travel</Text>
            <Text style={styles.status}>
              {!query
                ? 'Search first to explore by year'
                : timelineLoading
                  ? 'Loading timeline...'
                  : `${timelineMarkers.length} countr${timelineMarkers.length === 1 ? 'y' : 'ies'}`}
            </Text>
          </View>
          <Text style={styles.year}>{localYear}</Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
          {MILESTONES.map(year => (
            <TouchableOpacity
              key={year}
              onPress={() => commitYear(year)}
              style={[styles.milestone, { left: `${((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%` }]}
            >
              <View style={[styles.dot, year <= localYear && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={() => commitYear(localYear - 1)} style={styles.stepper}>
            <Text style={styles.stepperText}>-</Text>
          </TouchableOpacity>
          <View style={styles.yearLabels}>
            <Text style={styles.yearLabel}>{MIN_YEAR}</Text>
            <Text style={styles.yearLabel}>{MAX_YEAR}</Text>
          </View>
          <TouchableOpacity onPress={() => commitYear(localYear + 1)} style={styles.stepper}>
            <Text style={styles.stepperText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 25,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(5,8,20,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrow: {
    color: '#67e8f9',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  status: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 3,
  },
  year: {
    color: '#67e8f9',
    fontSize: 28,
    fontWeight: '900',
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#22d3ee',
  },
  milestone: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 24,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  dotActive: {
    backgroundColor: '#67e8f9',
  },
  controls: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(34,211,238,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: '#67e8f9',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  yearLabels: {
    flex: 1,
    marginHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yearLabel: {
    color: '#6b7280',
    fontSize: 10,
  },
});
