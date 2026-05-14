export function getVideoThumbnail(video: any) {
  return (
    video?.thumbnailUrl ||
    video?.thumbnail ||
    video?.thumbnail_url ||
    video?.thumbnailUrlHigh ||
    video?.thumbnails?.high?.url ||
    video?.thumbnails?.medium?.url ||
    video?.thumbnails?.default?.url ||
    (video?.videoId ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` : undefined)
  );
}
