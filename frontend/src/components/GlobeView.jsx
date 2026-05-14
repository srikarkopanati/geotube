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
  const {
    state,
    selectCountry, selectCity,
    toggleCountrySelection, setAnalysisSelectedCountry,
    setActiveTrendingRegion,
  } = useApp();

  const {
    level, markers, query, compareModeOn, comparisonSelected, analysisSelectedCountry,
    appMode, timelineMarkers, trendingData, activeTrendingRegion,
  } = state;

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

  useEffect(() => {
    if (containerWidth) setSize(s => ({ ...s, width: containerWidth }));
  }, [containerWidth]);

  /* ── Derive the active marker set based on mode ──────────────────── */
  const activeMarkers = useMemo(() => {
    if (appMode === 'timeline') return timelineMarkers;
    if (appMode === 'trending') {
      return trendingData.map(r => ({
        lat:   r.latitude,
        lng:   r.longitude,
        label: r.region,
        count: r.videoCount,
        type:  'trending',
        data:  r,
      }));
    }
    return markers; // explore / analysis
  }, [appMode, markers, timelineMarkers, trendingData]);

  /* ── Auto-rotate when idle ───────────────────────────────────────── */
  useEffect(() => {
    if (!globeRef.current || query || appMode === 'trending') return;
    let frameId;
    const animate = () => {
      if (globeRef.current) {
        const pov = globeRef.current.pointOfView();
        globeRef.current.pointOfView({ lat: pov.lat, lng: pov.lng + 0.008, altitude: pov.altitude });
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [query, appMode]);

  /* ── Zoom to marker cluster on level change (explore only) ──────── */
  useEffect(() => {
    if (!globeRef.current || activeMarkers.length === 0) return;
    if (appMode !== 'explore') return;
    if (level === 'global') {
      globeRef.current.pointOfView({ altitude: ALTITUDE.global }, 1200);
      return;
    }
    const avgLat = activeMarkers.reduce((s, m) => s + m.lat, 0) / activeMarkers.length;
    const avgLng = activeMarkers.reduce((s, m) => s + m.lng, 0) / activeMarkers.length;
    const alt    = level === 'country' ? ALTITUDE.country : ALTITUDE.city;
    globeRef.current.pointOfView({ lat: avgLat, lng: avgLng, altitude: alt }, 1200);
  }, [level, activeMarkers, appMode]);

  /* ── Zoom to fit trending markers when trending data loads ───────── */
  useEffect(() => {
    if (appMode !== 'trending' || !globeRef.current || trendingData.length === 0) return;
    globeRef.current.pointOfView({ altitude: ALTITUDE.global }, 1200);
  }, [appMode, trendingData]);

  /* ── Zoom to fit timeline markers when they load ─────────────────── */
  useEffect(() => {
    if (appMode !== 'timeline' || !globeRef.current || timelineMarkers.length === 0) return;
    globeRef.current.pointOfView({ altitude: ALTITUDE.global }, 1200);
  }, [appMode, timelineMarkers]);

  /* ── Marker click ────────────────────────────────────────────────── */
  const handlePointClick = useCallback(point => {
    if (!point) return;

    // Analysis globe: click selects country for video picker
    if (analysisGlobe) {
      setAnalysisSelectedCountry(point.label);
      globeRef.current?.pointOfView({ lat: point.lat, lng: point.lng, altitude: ALTITUDE.country }, 800);
      return;
    }

    // Trending mode: open region in the TrendingPanel
    if (appMode === 'trending') {
      setActiveTrendingRegion(point.data);
      globeRef.current?.pointOfView({ lat: point.lat, lng: point.lng, altitude: ALTITUDE.country }, 800);
      return;
    }

    // Timeline mode: zoom and drill into country via normal explore flow
    if (appMode === 'timeline') {
      globeRef.current?.pointOfView({ lat: point.lat, lng: point.lng, altitude: ALTITUDE.country }, 800);
      selectCountry(point.label, state.query);
      return;
    }

    // Compare mode: toggle selection
    if (compareModeOn && level === 'global') {
      toggleCountrySelection(point.label, point.lat, point.lng);
      return;
    }

    // Normal explore drill-down
    const alt = point.type === 'country' ? ALTITUDE.country : ALTITUDE.city;
    globeRef.current?.pointOfView({ lat: point.lat, lng: point.lng, altitude: alt }, 800);
    if (point.type === 'country') selectCountry(point.label, state.query);
    else if (point.type === 'city') selectCity(point.label, state.query);
  }, [
    state.query, level, compareModeOn, appMode, analysisGlobe,
    selectCountry, selectCity, toggleCountrySelection,
    setAnalysisSelectedCountry, setActiveTrendingRegion,
  ]);

  /* ── Marker helpers ──────────────────────────────────────────────── */
  const isSelected = useCallback(d =>
    comparisonSelected.some(s => s.label === d.label), [comparisonSelected]);

  const isAnalysisActive = useCallback(d =>
    d.label === analysisSelectedCountry, [analysisSelectedCountry]);

  const isTrendingActive = useCallback(d =>
    d.label === activeTrendingRegion?.region, [activeTrendingRegion]);

  const pointColor = useCallback(d => {
    if (appMode === 'trending') {
      return isTrendingActive(d) ? '#fb923c' : '#f97316';   // orange palette for trending
    }
    if (appMode === 'timeline') return '#00e5ff';           // cyan for timeline
    if (analysisGlobe && isAnalysisActive(d)) return '#facc15';
    if (isSelected(d)) return '#00d2ff';
    return d.type === 'country' ? '#ff2d55' : '#ff6b35';
  }, [appMode, isSelected, isAnalysisActive, isTrendingActive, analysisGlobe]);

  const pointRadius = useCallback(d => {
    if (appMode === 'trending') {
      // Trending markers are larger and scale with video count
      return 0.9 + Math.min(d.count / 5, 3) * 0.3 + (isTrendingActive(d) ? 0.4 : 0);
    }
    const base = d.type === 'country' ? 0.7 : 0.45;
    const sel  = isSelected(d) || isAnalysisActive(d) ? 0.3 : 0;
    return base + Math.min(d.count / 8, 2.5) * 0.25 + sel;
  }, [appMode, isSelected, isAnalysisActive, isTrendingActive]);

  const pointLabel = useCallback(d => {
    if (appMode === 'trending') {
      return `
        <div style="
          background:rgba(5,8,16,.95);
          border:1px solid rgba(251,146,60,.6);
          border-radius:10px;
          padding:10px 14px;
          font-family:Inter,sans-serif;
          color:#fff;
          box-shadow:0 0 24px rgba(251,146,60,.35);
          min-width:140px;
          pointer-events:none;
        ">
          <div style="font-size:14px;font-weight:600;margin-bottom:4px;">${d.label}</div>
          <div style="font-size:12px;color:#fb923c;font-weight:500;">${d.count} trending</div>
          <div style="font-size:10px;color:#555;margin-top:5px;">Click to see videos →</div>
        </div>
      `;
    }

    if (appMode === 'timeline') {
      return `
        <div style="
          background:rgba(5,8,16,.95);
          border:1px solid rgba(0,229,255,.5);
          border-radius:10px;
          padding:10px 14px;
          font-family:Inter,sans-serif;
          color:#fff;
          box-shadow:0 0 24px rgba(0,229,255,.3);
          min-width:130px;
          pointer-events:none;
        ">
          <div style="font-size:14px;font-weight:600;margin-bottom:3px;">${d.label}</div>
          <div style="font-size:12px;color:#00e5ff;font-weight:500;">${d.count} video${d.count !== 1 ? 's' : ''}</div>
          <div style="font-size:10px;color:#555;margin-top:5px;">Click to explore →</div>
        </div>
      `;
    }

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
  }, [appMode, isSelected, compareModeOn]);

  /* ── Pulse rings ─────────────────────────────────────────────────── */
  const ringsData = useMemo(() => activeMarkers.map(m => ({
    lat: m.lat,
    lng: m.lng,
    maxR: pointRadius(m) * (appMode === 'trending' ? 4.5 : 3.5),
    propagationSpeed: appMode === 'trending' ? 3.0 : isSelected(m) ? 2.5 : 1.8,
    repeatPeriod:     appMode === 'trending' ? 500  : isSelected(m) ? 600  : 900,
  })), [activeMarkers, pointRadius, isSelected, appMode]);

  /* ── Comparison arcs (explore / analysis only) ───────────────────── */
  const arcsData = useMemo(() => {
    if (appMode !== 'explore' && !analysisGlobe) return [];
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
  }, [appMode, comparisonSelected, state.comparisonSelected, analysisGlobe]);

  const ringColor = useCallback(d => {
    if (appMode === 'trending') return 'rgba(251,146,60,0.55)';
    if (appMode === 'timeline') return 'rgba(0,229,255,0.45)';
    const src = analysisGlobe ? state.comparisonSelected : comparisonSelected;
    const isSel = src.some(s => s.lat === d.lat && s.lng === d.lng);
    return isSel ? 'rgba(0,210,255,0.6)' : 'rgba(255,45,85,0.45)';
  }, [appMode, analysisGlobe, state.comparisonSelected, comparisonSelected]);

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
        pointsData={activeMarkers}
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
        ringColor={ringColor}
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
