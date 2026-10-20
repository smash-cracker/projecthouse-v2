/** Pull the 11-character video id out of any common YouTube URL shape. */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /^.*((youtu\.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*)/
  );
  return match && match[7].length === 11 ? match[7] : null;
}
