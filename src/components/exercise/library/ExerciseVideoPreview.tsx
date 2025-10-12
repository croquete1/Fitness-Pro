'use client';

import * as React from 'react';
import { Box } from '@mui/material';

interface Props {
  url: string;
  title?: string;
}

type Embed =
  | { type: 'video'; src: string }
  | { type: 'iframe'; src: string }
  | { type: 'image'; src: string };

export default function ExerciseVideoPreview({ url, title }: Props) {
  const embed = React.useMemo(() => buildEmbed(url), [url]);
  if (!embed) return null;

  const commonStyles = {
    width: '100%',
    height: '100%',
    display: 'block',
  } as const;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'common.black',
        aspectRatio: '16 / 9',
        '& > *': { border: 0 },
      }}
    >
      {embed.type === 'iframe' ? (
        <Box
          component="iframe"
          src={embed.src}
          title={title ?? 'Vídeo do exercício'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          sx={commonStyles}
        />
      ) : embed.type === 'image' ? (
        <Box
          component="img"
          src={embed.src}
          alt={title ?? 'Pré-visualização do vídeo do exercício'}
          sx={{ ...commonStyles, objectFit: 'cover' }}
        />
      ) : (
        <Box
          component="video"
          src={embed.src}
          title={title ?? 'Vídeo do exercício'}
          controls
          autoPlay
          muted
          loop
          playsInline
          sx={{ ...commonStyles, objectFit: 'cover' }}
        />
      )}
    </Box>
  );
}

function buildEmbed(raw: string): Embed | null {
  if (!raw) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  const provider = detectProvider(parsed);
  if (provider?.type === 'youtube') {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${provider.id}?rel=0&playsinline=1`,
    };
  }
  if (provider?.type === 'vimeo') {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${provider.id}?title=0&byline=0&portrait=0`,
    };
  }

  const extension = parsed.pathname.split('.').pop()?.toLowerCase();
  if (extension && IMAGE_EXTENSIONS.has(extension)) {
    return { type: 'image', src: raw };
  }
  if (extension && VIDEO_EXTENSIONS.has(extension)) {
    return { type: 'video', src: raw };
  }

  // Fallback to treat as a direct video stream.
  return { type: 'video', src: raw };
}

const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'ogg', 'ogv', 'mov', 'm4v', 'mkv']);
const IMAGE_EXTENSIONS = new Set(['gif', 'apng', 'png', 'jpg', 'jpeg', 'webp']);

type Provider =
  | { type: 'youtube'; id: string }
  | { type: 'vimeo'; id: string }
  | null;

function detectProvider(url: URL): Provider {
  const host = url.hostname.toLowerCase();
  if (host.includes('youtube.com') || host.includes('youtu.be')) {
    const id = extractYouTubeId(url);
    return id ? { type: 'youtube', id } : null;
  }
  if (host.includes('vimeo.com')) {
    const id = extractVimeoId(url);
    return id ? { type: 'vimeo', id } : null;
  }
  return null;
}

function extractYouTubeId(url: URL): string | null {
  if (url.hostname.toLowerCase().includes('youtu.be')) {
    const candidate = url.pathname.replace('/', '').trim();
    return candidate || null;
  }

  const params = url.searchParams.get('v');
  if (params) return params;

  const paths = url.pathname.split('/').filter(Boolean);
  if (paths[0] === 'embed' && paths[1]) return paths[1];
  if (paths[0] === 'shorts' && paths[1]) return paths[1];
  return null;
}

function extractVimeoId(url: URL): string | null {
  const paths = url.pathname.split('/').filter(Boolean);
  if (!paths.length) return null;
  const candidate = paths[paths.length - 1];
  return /^\d+$/.test(candidate) ? candidate : null;
}
