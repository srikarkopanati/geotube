import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useApp } from '../context/AppContext';

const ALTITUDE = { global: 2.5, country: 1.5, city: 1.0 };

type GlobeProps = {
  containerWidth?: number;
  analysisGlobe?: boolean;
};

export default function GlobeView({ containerWidth, analysisGlobe = false }: GlobeProps) {
  const webViewRef = useRef<WebView>(null);
  const {
    state,
    selectCountry,
    selectCity,
    toggleCountrySelection,
    setAnalysisSelectedCountry,
  } = useApp();
  const { level, markers, compareModeOn, comparisonSelected, analysisSelectedCountry } = state;

  const postToGlobe = useCallback((payload: Record<string, unknown>) => {
    webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(payload)} }));
      true;
    `);
  }, []);

  const handleMessage = useCallback((event: any) => {
    let data;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (data.type !== 'POINT_CLICK') return;

    const point = data.point;
    if (!point) return;

    if (analysisGlobe) {
      setAnalysisSelectedCountry(point.label);
      postToGlobe({
        type: 'ZOOM_TO',
        lat: point.lat,
        lng: point.lng,
        altitude: ALTITUDE.country,
      });
      return;
    }

    if (compareModeOn && level === 'global') {
      toggleCountrySelection(point.label, point.lat, point.lng);
      return;
    }

    postToGlobe({
      type: 'ZOOM_TO',
      lat: point.lat,
      lng: point.lng,
      altitude: point.type === 'country' ? ALTITUDE.country : ALTITUDE.city,
    });

    if (point.type === 'country') selectCountry(point.label, state.query);
    if (point.type === 'city') selectCity(point.label, state.query);
  }, [
    analysisGlobe,
    compareModeOn,
    level,
    postToGlobe,
    selectCity,
    selectCountry,
    setAnalysisSelectedCountry,
    state.query,
    toggleCountrySelection,
  ]);

  useEffect(() => {
    postToGlobe({ type: 'UPDATE_MARKERS', markers });
  }, [markers, postToGlobe]);

  useEffect(() => {
    postToGlobe({ type: 'UPDATE_LEVEL', level });
  }, [level, postToGlobe]);

  useEffect(() => {
    postToGlobe({ type: 'UPDATE_COMPARE_MODE', compareModeOn });
  }, [compareModeOn, postToGlobe]);

  useEffect(() => {
    postToGlobe({ type: 'UPDATE_COMPARISON_SELECTED', comparisonSelected });
  }, [comparisonSelected, postToGlobe]);

  useEffect(() => {
    postToGlobe({ type: 'UPDATE_ANALYSIS_SELECTED_COUNTRY', analysisSelectedCountry });
  }, [analysisSelectedCountry, postToGlobe]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <style>
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            overflow: hidden;
            background: #05070d;
            touch-action: none;
          }
          canvas {
            display: block;
            width: 100vw;
            height: 100vh;
            background:
              radial-gradient(circle at 50% 42%, rgba(14,165,233,0.12), transparent 38%),
              #05070d;
          }
        </style>
      </head>
      <body>
        <canvas id="globe"></canvas>
        <script>
          const canvas = document.getElementById('globe');
          const ctx = canvas.getContext('2d');
          const dpr = window.devicePixelRatio || 1;
          let markers = ${JSON.stringify(markers)};
          let level = ${JSON.stringify(level)};
          let compareModeOn = ${JSON.stringify(compareModeOn)};
          let comparisonSelected = ${JSON.stringify(comparisonSelected)};
          let analysisSelectedCountry = ${JSON.stringify(analysisSelectedCountry)};
          let centerLat = 8;
          let centerLng = 20;
          let targetLat = centerLat;
          let targetLng = centerLng;
          let targetScale = 1;
          let scale = 1;
          let dragging = false;
          let lastX = 0;
          let lastY = 0;
          let markerHits = [];
          let lastTap = 0;

          const land = [
            [[-168,72],[-140,58],[-125,44],[-105,28],[-82,24],[-62,46],[-78,66],[-120,74]],
            [[-82,12],[-76,-8],[-70,-32],[-58,-54],[-42,-30],[-48,-6],[-62,10]],
            [[-18,36],[10,70],[46,62],[70,38],[42,8],[24,-34],[-8,-34],[-18,10]],
            [[40,34],[78,56],[135,52],[156,26],[116,6],[74,8],[50,20]],
            [[112,-10],[154,-22],[146,-42],[118,-36]],
            [[-48,70],[-22,76],[-18,60],[-42,58]]
          ];
          const stars = Array.from({ length: 170 }, (_, i) => ({
            x: (Math.sin(i * 91.7) * 0.5 + 0.5),
            y: (Math.sin(i * 37.3) * 0.5 + 0.5),
            r: 0.35 + ((i * 17) % 9) / 10,
            a: 0.28 + ((i * 23) % 7) / 10
          }));
          const earthImage = new Image();
          earthImage.crossOrigin = 'anonymous';
          earthImage.src = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

          const skyImage = new Image();
          skyImage.crossOrigin = 'anonymous';
          skyImage.src = 'https://unpkg.com/three-globe/example/img/night-sky.png';

          function resize() {
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }

          function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
          }

          function selected(marker) {
            return comparisonSelected.some(item => item.label === marker.label);
          }

          function imageReady(image) {
            return image && image.complete && image.naturalWidth > 0;
          }

          function drawCover(image, x, y, w, h) {
            const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
            const sw = w / scale;
            const sh = h / scale;
            const sx = (image.naturalWidth - sw) / 2;
            const sy = (image.naturalHeight - sh) / 2;
            ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
          }

          function normalizeLng(lng) {
            let out = lng;
            while (out > 180) out -= 360;
            while (out < -180) out += 360;
            return out;
          }

          function project(lat, lng, radius, cx, cy) {
            const latRad = lat * Math.PI / 180;
            const lngRad = normalizeLng(lng - centerLng) * Math.PI / 180;
            const centerLatRad = centerLat * Math.PI / 180;
            const cosc = Math.sin(centerLatRad) * Math.sin(latRad) +
              Math.cos(centerLatRad) * Math.cos(latRad) * Math.cos(lngRad);

            if (cosc <= -0.12) return null;

            return {
              x: cx + radius * Math.cos(latRad) * Math.sin(lngRad),
              y: cy - radius * (
                Math.cos(centerLatRad) * Math.sin(latRad) -
                Math.sin(centerLatRad) * Math.cos(latRad) * Math.cos(lngRad)
              ),
              visible: cosc > 0,
              depth: cosc
            };
          }

          function pathRegion(points, radius, cx, cy) {
            let started = false;
            points.forEach(([lng, lat]) => {
              const p = project(lat, lng, radius, cx, cy);
              if (!p || !p.visible) {
                started = false;
                return;
              }
              if (!started) {
                ctx.moveTo(p.x, p.y);
                started = true;
              } else {
                ctx.lineTo(p.x, p.y);
              }
            });
          }

          function drawStars(w, h) {
            if (imageReady(skyImage)) {
              drawCover(skyImage, 0, 0, w, h);
            } else {
              ctx.fillStyle = '#02040a';
              ctx.fillRect(0, 0, w, h);
            }
            const halo = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.58);
            halo.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
            halo.addColorStop(0.45, 'rgba(14, 165, 233, 0.06)');
            halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = halo;
            ctx.fillRect(0, 0, w, h);

            stars.forEach((star, index) => {
              const twinkle = 0.55 + Math.sin(performance.now() / 900 + index) * 0.18;
              ctx.beginPath();
              ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(226, 232, 240,' + Math.min(0.9, star.a * twinkle) + ')';
              ctx.fill();
            });
          }

          function drawGlobe(cx, cy, radius) {
            const glow = ctx.createRadialGradient(cx - radius * 0.42, cy - radius * 0.45, radius * 0.08, cx, cy, radius);
            glow.addColorStop(0, '#4fa7ff');
            glow.addColorStop(0.2, '#1d4ed8');
            glow.addColorStop(0.56, '#082b63');
            glow.addColorStop(1, '#020617');

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
            ctx.clip();

            if (imageReady(earthImage)) {
              const textureW = radius * 4.08;
              const textureH = radius * 2.08;
              const offsetX = (normalizeLng(centerLng) / 360) * textureW;
              const offsetY = clamp(centerLat / 90, -0.72, 0.72) * radius * 0.52;
              const y = cy - textureH / 2 + offsetY;
              let x = cx - textureW / 2 - offsetX;
              while (x > cx - radius) x -= textureW;
              while (x + textureW < cx + radius) x += textureW;
              for (let i = -1; i <= 1; i++) {
                ctx.drawImage(earthImage, x + textureW * i, y, textureW, textureH);
              }
            }

            for (let i = 0; i < 42; i++) {
              const y = cy - radius + (i / 41) * radius * 2;
              const bandWidth = Math.sqrt(Math.max(0, radius * radius - Math.pow(y - cy, 2))) * 2;
              ctx.beginPath();
              ctx.moveTo(cx - bandWidth / 2, y);
              ctx.bezierCurveTo(cx - bandWidth * 0.18, y - 8, cx + bandWidth * 0.15, y + 7, cx + bandWidth / 2, y);
              ctx.strokeStyle = i % 3 === 0 ? 'rgba(147,197,253,0.08)' : 'rgba(255,255,255,0.025)';
              ctx.lineWidth = 1;
              ctx.stroke();
            }

            ctx.strokeStyle = 'rgba(125, 211, 252, 0.13)';
            ctx.lineWidth = 1;
            for (let lat = -60; lat <= 60; lat += 20) {
              ctx.beginPath();
              for (let lng = -180; lng <= 180; lng += 4) {
                const p = project(lat, lng, radius, cx, cy);
                if (!p || !p.visible) continue;
                if (lng === -180) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
              }
              ctx.stroke();
            }

            for (let lng = -150; lng <= 180; lng += 30) {
              ctx.beginPath();
              let started = false;
              for (let lat = -80; lat <= 80; lat += 4) {
                const p = project(lat, lng, radius, cx, cy);
                if (!p || !p.visible) {
                  started = false;
                  continue;
                }
                if (!started) {
                  ctx.moveTo(p.x, p.y);
                  started = true;
                } else {
                  ctx.lineTo(p.x, p.y);
                }
              }
              ctx.stroke();
            }

            if (!imageReady(earthImage)) {
              ctx.beginPath();
              land.forEach(region => pathRegion(region, radius, cx, cy));
              const landGradient = ctx.createLinearGradient(cx - radius * 0.6, cy - radius * 0.5, cx + radius * 0.5, cy + radius * 0.5);
              landGradient.addColorStop(0, 'rgba(187, 151, 86, 0.78)');
              landGradient.addColorStop(0.42, 'rgba(57, 129, 67, 0.72)');
              landGradient.addColorStop(1, 'rgba(22, 101, 52, 0.68)');
              ctx.fillStyle = landGradient;
              ctx.strokeStyle = 'rgba(190, 242, 100, 0.22)';
              ctx.lineWidth = 1;
              ctx.fill();
              ctx.stroke();
            }

            const shadow = ctx.createRadialGradient(cx - radius * 0.55, cy - radius * 0.52, radius * 0.1, cx + radius * 0.1, cy + radius * 0.08, radius * 1.08);
            shadow.addColorStop(0, 'rgba(255,255,255,0.16)');
            shadow.addColorStop(0.42, 'rgba(255,255,255,0.02)');
            shadow.addColorStop(0.76, 'rgba(2,6,23,0.28)');
            shadow.addColorStop(1, 'rgba(0,0,0,0.62)');
            ctx.fillStyle = shadow;
            ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

            ctx.restore();

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(147, 197, 253, 0.62)';
            ctx.lineWidth = 1.3;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
            ctx.lineWidth = 7;
            ctx.stroke();
          }

          function drawMarkers(cx, cy, radius, time) {
            markerHits = [];
            markers.forEach((marker, index) => {
              const p = project(marker.lat, marker.lng, radius, cx, cy);
              if (!p || !p.visible) return;

              const isSelected = selected(marker);
              const isAnalysisActive = marker.label === analysisSelectedCountry;
              const color = isAnalysisActive ? '#facc15' : isSelected ? '#00d2ff' : marker.type === 'country' ? '#ff2d55' : '#ff7a35';
              const size = 5 + Math.min(Number(marker.count || 1), 12) * 0.45 + (isSelected || isAnalysisActive ? 2 : 0);
              const pulse = 12 + Math.sin(time / 420 + index) * 4;

              ctx.beginPath();
              ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
              ctx.strokeStyle = color + '66';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
              ctx.fillStyle = color;
              ctx.shadowColor = color;
              ctx.shadowBlur = 16;
              ctx.fill();
              ctx.shadowBlur = 0;

              markerHits.push({ x: p.x, y: p.y, radius: Math.max(22, size + 12), marker });
            });
          }

          function draw() {
            centerLat += (targetLat - centerLat) * 0.08;
            centerLng += normalizeLng(targetLng - centerLng) * 0.08;
            scale += (targetScale - scale) * 0.08;

            const w = window.innerWidth;
            const h = window.innerHeight;
            ctx.clearRect(0, 0, w, h);
            drawStars(w, h);

            const baseRadius = Math.min(w, h) * 0.42;
            const radius = baseRadius * scale;
            const cx = w / 2;
            const cy = h * 0.54;

            drawGlobe(cx, cy, radius);
            drawMarkers(cx, cy, radius, performance.now());

            requestAnimationFrame(draw);
          }

          function handlePayload(data) {
            if (!data || typeof data !== 'object') return;
            if (data.type === 'UPDATE_MARKERS') markers = data.markers || [];
            if (data.type === 'UPDATE_LEVEL') level = data.level || 'global';
            if (data.type === 'UPDATE_COMPARE_MODE') compareModeOn = !!data.compareModeOn;
            if (data.type === 'UPDATE_COMPARISON_SELECTED') comparisonSelected = data.comparisonSelected || [];
            if (data.type === 'UPDATE_ANALYSIS_SELECTED_COUNTRY') analysisSelectedCountry = data.analysisSelectedCountry;
            if (data.type === 'ZOOM_TO') {
              targetLat = Number(data.lat) || 0;
              targetLng = Number(data.lng) || 0;
              targetScale = data.altitude <= 1 ? 1.8 : data.altitude <= 1.5 ? 1.45 : 1;
            }
          }

          function messageHandler(event) {
            let data = event.data;
            if (typeof data === 'string') {
              try { data = JSON.parse(data); } catch {}
            }
            handlePayload(data);
          }

          function sendPoint(point) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'POINT_CLICK',
              point
            }));
          }

          canvas.addEventListener('pointerdown', event => {
            dragging = true;
            lastX = event.clientX;
            lastY = event.clientY;
          });

          canvas.addEventListener('pointermove', event => {
            if (!dragging) return;
            const dx = event.clientX - lastX;
            const dy = event.clientY - lastY;
            targetLng = normalizeLng(targetLng - dx * 0.45);
            targetLat = clamp(targetLat + dy * 0.35, -70, 70);
            lastX = event.clientX;
            lastY = event.clientY;
          });

          canvas.addEventListener('pointerup', event => {
            const moved = Math.abs(event.clientX - lastX) + Math.abs(event.clientY - lastY);
            dragging = false;
            const now = Date.now();
            if (now - lastTap < 120 || moved > 8) {
              lastTap = now;
              return;
            }
            lastTap = now;

            const hit = markerHits
              .map(item => ({
                item,
                distance: Math.hypot(event.clientX - item.x, event.clientY - item.y)
              }))
              .filter(hit => hit.distance <= hit.item.radius)
              .sort((a, b) => a.distance - b.distance)[0];

            if (hit) sendPoint(hit.item.marker);
          });

          window.addEventListener('resize', resize);
          window.addEventListener('message', messageHandler);
          document.addEventListener('message', messageHandler);
          resize();
          requestAnimationFrame(draw);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        scrollEnabled={false}
        overScrollMode="never"
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
