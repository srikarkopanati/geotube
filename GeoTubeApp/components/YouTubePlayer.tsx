import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

type YouTubePlayerProps = {
  videoId?: string;
  title?: string;
};

export default function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  if (!videoId) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>Video unavailable</Text>
        <Text style={styles.fallbackText}>Missing YouTube video id</Text>
      </View>
    );
  }

  return (
    <WebView
      key={videoId}
      source={{
        uri: buildWatchUrl(videoId),
        headers: {
          Referer: 'https://m.youtube.com/',
        },
      }}
      style={styles.webview}
      javaScriptEnabled
      domStorageEnabled
      allowsFullscreenVideo
      mediaPlaybackRequiresUserAction={false}
      mixedContentMode="always"
      originWhitelist={['*']}
      allowsInlineMediaPlayback
      thirdPartyCookiesEnabled
      sharedCookiesEnabled
      userAgent="Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      injectedJavaScript={hidePageChromeScript}
    />
  );
}

function buildWatchUrl(videoId: string) {
  const params = new URLSearchParams({
    v: videoId,
    app: 'm',
    persist_app: '1',
    autoplay: '1',
    playsinline: '1',
  });

  return `https://m.youtube.com/watch?${params.toString()}`;
}

const hidePageChromeScript = `
  (function () {
    const style = document.createElement('style');
    style.innerHTML = [
      'body { background: #000 !important; }',
      'ytm-mobile-topbar-renderer,',
      'ytm-pivot-bar-renderer,',
      'ytm-watch-below-the-player-renderer,',
      'ytm-engagement-panel,',
      'ytm-item-section-renderer,',
      'ytm-comment-section-renderer { display: none !important; }',
      '.player-container, .html5-video-player, video { max-height: 100vh !important; }'
    ].join('\\n');
    document.head.appendChild(style);
  })();
  true;
`;

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  fallback: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  fallbackTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  fallbackText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
