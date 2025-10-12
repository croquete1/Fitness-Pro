import { type ExerciseFormValues } from './schema';

export type ExerciseMediaInfo =
  | { kind: 'none' }
  | { kind: 'image' | 'video' | 'embed'; src: string };

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'apng'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'm4v', 'mov', 'ogg'];

function normaliseUrl(url?: string | null) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return '';
  return trimmed;
}

function extractExtension(url: string) {
  const clean = url.split('?')[0] ?? '';
  const parts = clean.split('.');
  if (parts.length < 2) return '';
  return parts.pop()?.toLowerCase() ?? '';
}

function toYouTubeEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      const paths = parsed.pathname.split('/').filter(Boolean);
      if (paths[0] === 'embed' && paths[1]) return `https://www.youtube.com/embed/${paths[1]}`;
    }
  } catch (error) {
    console.warn('Failed to parse YouTube URL', error);
  }
  return null;
}

function toVimeoEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch (error) {
    console.warn('Failed to parse Vimeo URL', error);
  }
  return null;
}

export function getExerciseMediaInfo(rawUrl?: string | null): ExerciseMediaInfo {
  const url = normaliseUrl(rawUrl);
  if (!url) return { kind: 'none' };

  const youTube = toYouTubeEmbed(url);
  if (youTube) return { kind: 'embed', src: youTube };

  const vimeo = toVimeoEmbed(url);
  if (vimeo) return { kind: 'embed', src: vimeo };

  const extension = extractExtension(url);
  if (extension) {
    if (VIDEO_EXTENSIONS.includes(extension)) {
      return { kind: 'video', src: url };
    }
    if (IMAGE_EXTENSIONS.includes(extension)) {
      return { kind: 'image', src: url };
    }
  }

  if (url.includes('loom.com/share/')) {
    return { kind: 'embed', src: url.replace('/share/', '/embed/') };
  }

  // default to embedding in an iframe to avoid forcing downloads
  return { kind: 'embed', src: url };
}

export function applyExerciseMedia(values: ExerciseFormValues, url: string | undefined | null) {
  return { ...values, video_url: normaliseUrl(url) || undefined };
}
