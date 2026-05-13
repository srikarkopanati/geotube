import React, { useCallback, useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { useApp } from '../context/AppContext';

// Altitude levels for each navigation depth
const ALTITUDE = { global: 2.5, country: 1.5, city: 1.0 };

export default function GlobeView() {
  const globeRef = useRef();
  const { state, selectCountry, selectCity } = useApp();
  const { level, markers, query } = state;
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  /* ── Responsive resize ───────────────────────────────────── */
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Auto-rotate when idle using rAF ────────────────────── */
  useEffect(() => {
    if (!globeRef.current || query) return;

    let frameId;

    const animate = () => {
      // Slowly orbit the globe by updating pointOfView longitude
      if (globeRef.current) {
        const pov = globeRef.current.pointOfView();
        globeRef.current.pointOfView({ lat: pov.lat, lng: pov.lng + 0.08, altitude: pov.altitude });
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [query]);

  /* ── Zoom to marker cluster on level change ──────────────── */
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

  /* ── Marker click ────────────────────────────────────────── */
  const handlePointClick = useCallback(point => {
    if (!point) return;
    const alt = point.type === 'country' ? ALTITUDE.country : ALTITUDE.city;
    globeRef.current?.pointOfView({ lat: point.lat, lng: point.lng, altitude: alt }, 800);

    if (point.type === 'country') selectCountry(point.label, state.query);
    else if (point.type === 'city')   selectCity(point.label,   state.query);
  }, [state.query, selectCountry, selectCity]);

  /* ── Marker helpers ──────────────────────────────────────── */
  const pointColor = d => d.type === 'country' ? '#ff2d55' : '#ff6b35';
  const pointRadius = d => {
    const base = d.type === 'country' ? 0.7 : 0.45;
    return base + Math.min(d.count / 8, 2.5) * 0.25;
  };

  const pointLabel = d => `
    <div style="
      background:rgba(5,8,16,.92);
      border:1px solid rgba(255,45,85,.5);
      border-radius:10px;
      padding:10px 14px;
      font-family:Inter,sans-serif;
      color:#fff;
      box-shadow:0 0 24px rgba(255,45,85,.35);
      min-width:120px;
      pointer-events:none;
    ">
      <div style="font-size:14px;font-weight:600;margin-bottom:3px;">${d.label}</div>
      <div style="font-size:12px;color:#ff2d55;font-weight:500;">${d.count} video${d.count !== 1 ? 's' : ''}</div>
      <div style="font-size:10px;color:#555;margin-top:5px;">Click to explore →</div>
    </div>
  `;

  // Pulse rings drawn at each marker position
  const ringsData = markers.map(m => ({
    lat: m.lat,
    lng: m.lng,
    maxR: pointRadius(m) * 3.5,
    propagationSpeed: 1.8,
    repeatPeriod: 900,
  }));

  return (
    <div className="globe-wrap">
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}

        /* Textures */
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

        /* Atmosphere */
        atmosphereColor="rgba(60,120,255,0.28)"
        atmosphereAltitude={0.18}

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
        ringColor={() => 'rgba(255,45,85,0.45)'}
        ringAltitude={0.003}

        enablePointerInteraction
      />
    </div>
  );
}
