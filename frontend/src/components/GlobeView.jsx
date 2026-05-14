import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { useApp } from '../context/AppContext';

const ALTITUDE = { global: 2.5, country: 1.5, city: 1.0 };

/**
 * Props:
 *   containerWidth  — optional override width (pixels). Used in split-screen analysis mode.
 *   analysisGlobe   — when true, clicking a marker selects the country for VideoPicker
 *                     rather than drilling down the normal navigation flow.
 */
export default function GlobeView({ containerWidth, analysisGlobe = false }) {
  const globeRef = useRef();
  const { state, selectCountry, selectCity, toggleCountrySelection, setAnalysisSelectedCountry } = useApp();
  const { level, markers, query, compareModeOn, comparisonSelected, analysisSelectedCountry } = state;

  const [size, setSize] = useState({
    width:  containerWidth || window.innerWidth,
    height: window.innerHeight,
  });

  /* ── Responsive resize ───────────────────────────────────────────── */
  useEffect(() => {
    const onResize = () =>
      setSize({ width: containerWidth || window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [containerWidth]);

  // Update size immediately when containerWidth prop changes
  useEffect(() => {
    if (containerWidth) setSize(s => ({ ...s, width: containerWidth }));
  }, [containerWidth]);

  /* ── Auto-rotate when idle ───────────────────────────────────────── */
  useEffect(() => {
    if (!globeRef.current || query) return;
    let frameId;
    const animate = () => {
      if (globeRef.current) {
        const pov = globeRef.current.pointOfView();
        globeRef.current.pointOfView({ lat: pov.lat, lng: pov.lng + 0.03, altitude: pov.altitude });
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [query]);

  /* ── Zoom to marker cluster on level change ──────────────────────── */
  useEffect(() => {
    if (!globeRef.current || markers.length === 0) return;
    if (level === 'global') {
      globeRef.current.pointOfView({ altitude: ALTITUDE.global }, 1200);
      return;
    }
    const avgLat = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
    const avgLng = markers.reduce((s, m) => s + m.lng, 0) / markers.length;
    const alt    = level === 'country' ? ALTITUDE.country : ALTITUDE.city;
    globeRef.current.pointOfView({ lat: avgLat, lng: avgLng, altitude: alt }, 1200);
  }, [level, markers]);

  /* ── Marker click ────────────────────────────────────────────────── */
  const handlePointClick = useCallback(point => {
    if (!point) return;

    // In analysis mode: clicking selects country for the video picker
    if (analysisGlobe) {
      setAnalysisSelectedCountry(point.label);
      globeRef.current?.pointOfView({ lat: point.lat, lng: point.lng, altitude: ALTITUDE.country }, 800);
      return;
    }

    // In compare mode at global level: toggle selection instead of drill-down
    if (compareModeOn && level === 'global') {
      toggleCountrySelection(point.label, point.lat, point.lng);
      return;
    }

    // Normal drill-down
    const alt = point.type === 'country' ? ALTITUDE.country : ALTITUDE.city;
    globeRef.current?.pointOfView({ lat: point.lat, lng: point.lng, altitude: alt }, 800);
    if (point.type === 'country') selectCountry(point.label, state.query);
    else if (point.type === 'city') selectCity(point.label, state.query);
  }, [state.query, level, compareModeOn, analysisGlobe,
      selectCountry, selectCity, toggleCountrySelection, setAnalysisSelectedCountry]);

  /* ── Marker helpers ──────────────────────────────────────────────── */
  const isSelected = useCallback(d =>
    comparisonSelected.some(s => s.label === d.label), [comparisonSelected]);

  const isAnalysisActive = useCallback(d =>
    d.label === analysisSelectedCountry, [analysisSelectedCountry]);

  const pointColor = useCallback(d => {
    if (analysisGlobe && isAnalysisActive(d)) return '#facc15';  // yellow = active in analysis
    if (isSelected(d)) return '#00d2ff';                          // blue = selected for compare
    return d.type === 'country' ? '#ff2d55' : '#ff6b35';
  }, [isSelected, isAnalysisActive, analysisGlobe]);

  const pointRadius = useCallback(d => {
    const base = d.type === 'country' ? 0.7 : 0.45;
    const sel  = isSelected(d) || isAnalysisActive(d) ? 0.3 : 0;
    return base + Math.min(d.count / 8, 2.5) * 0.25 + sel;
  }, [isSelected, isAnalysisActive]);

  const pointLabel = useCallback(d => {
    const sel = isSelected(d);
    return `
      <div style="
        background:rgba(5,8,16,.92);
        border:1px solid ${sel ? 'rgba(0,210,255,.7)' : 'rgba(255,45,85,.5)'};
        border-radius:10px;
        padding:10px 14px;
        font-family:Inter,sans-serif;
        color:#fff;
        box-shadow:0 0 24px ${sel ? 'rgba(0,210,255,.4)' : 'rgba(255,45,85,.35)'};
        min-width:120px;
        pointer-events:none;
      ">
        <div style="font-size:14px;font-weight:600;margin-bottom:3px;">${d.label}${sel ? ' ✓' : ''}</div>
        <div style="font-size:12px;color:${sel ? '#00d2ff' : '#ff2d55'};font-weight:500;">${d.count} video${d.count !== 1 ? 's' : ''}</div>
        <div style="font-size:10px;color:#555;margin-top:5px;">
          ${compareModeOn ? (sel ? 'Click to deselect' : 'Click to select') : 'Click to explore →'}
        </div>
      </div>
    `;
  }, [isSelected, compareModeOn]);

  /* ── Pulse rings ─────────────────────────────────────────────────── */
  const ringsData = useMemo(() => markers.map(m => ({
    lat: m.lat,
    lng: m.lng,
    maxR: pointRadius(m) * 3.5,
    propagationSpeed: isSelected(m) ? 2.5 : 1.8,
    repeatPeriod: isSelected(m) ? 600 : 900,
  })), [markers, pointRadius, isSelected]);

  /* ── Comparison arcs ─────────────────────────────────────────────── */
  const arcsData = useMemo(() => {
    const src = analysisGlobe
      ? (state.comparisonSelected.length >= 2 ? state.comparisonSelected : [])
      : comparisonSelected;

    if (src.length < 2) return [];
    const pairs = [];
    for (let i = 0; i < src.length; i++) {
      for (let j = i + 1; j < src.length; j++) {
        pairs.push({
          startLat: src[i].lat,
          startLng: src[i].lng,
          endLat:   src[j].lat,
          endLng:   src[j].lng,
        });
      }
    }
    return pairs;
  }, [comparisonSelected, state.comparisonSelected, analysisGlobe]);

  return (
    <div className="globe-wrap">
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}

        /* Textures */
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

        /* Atmosphere */
        atmosphereColor="rgba(100,180,255,0.35)"
        atmosphereAltitude={0.22}

        /* Markers */
        pointsData={markers}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.012}
        pointColor={pointColor}
        pointRadius={pointRadius}
        pointLabel={pointLabel}
        onPointClick={handlePointClick}
        pointsMerge={false}
        pointResolution={8}

        /* Rings */
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor={d => {
          const src = analysisGlobe ? state.comparisonSelected : comparisonSelected;
          const isSel = src.some(s => s.lat === d.lat && s.lng === d.lng);
          return isSel ? 'rgba(0,210,255,0.6)' : 'rgba(255,45,85,0.45)';
        }}
        ringAltitude={0.003}

        /* Comparison arcs */
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={() => ['rgba(0,210,255,0.6)', 'rgba(0,210,255,0.6)']}
        arcAltitudeAutoScale={0.4}
        arcStroke={0.8}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}

        enablePointerInteraction
      />
    </div>
  );
}
