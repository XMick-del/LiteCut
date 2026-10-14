export type TrackType = 'video' | 'audio' | 'text' | 'effect' | 'sticker';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';

export type PreviewQuality = 'full' | 'half' | 'quarter';

export type FilterType = 'none' | 'teal-orange' | 'cyber' | 'moody' | 'vintage' | 'noir' | 'vibrant' | 'glow';

export interface Keyframe {
  time: number; // in seconds relative to clip start
  scale?: number;
  x?: number;
  y?: number;
  opacity?: number;
}

export interface ClipItem {
  id: string;
  trackId: string;
  type: TrackType;
  name: string;
  start: number; // timeline start time in seconds
  duration: number; // duration on timeline in seconds
  sourceStart: number; // trim offset from original media in seconds
  sourceDuration: number; // original media duration
  src?: string; // image/video URL or audio identifier
  thumbnail?: string; // thumbnail preview

  // Video / Image Visual Transform
  scale: number; // 50 to 300%
  x: number; // pixel offset X
  y: number; // pixel offset Y
  rotation: number; // -180 to 180 degrees
  opacity: number; // 0 to 100%
  blendMode: 'normal' | 'screen' | 'multiply' | 'overlay';
  filter: FilterType;

  // Chroma Key (Green Screen)
  chromaKey: boolean;
  chromaColor: string; // hex
  chromaSimilarity: number; // 0 to 100

  // Audio Properties
  volume: number; // 0 to 200%
  muted: boolean;
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  speed: number; // 0.25x to 4x

  // Text Properties (for text clips)
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  textStyle?: 'standard' | 'glowing' | 'bold-yellow' | 'cyber' | 'minimal';

  // Keyframes
  keyframes?: Keyframe[];
}

export interface TrackItem {
  id: string;
  type: TrackType;
  name: string;
  muted: boolean;
  locked: boolean;
  hidden: boolean;
  clips: ClipItem[];
}

export interface ProjectSettings {
  name: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  fps: number;
}

export interface ProjectData {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: ProjectSettings;
  tracks: TrackItem[];
  duration: number; // max duration of timeline in seconds
  inPoint?: number | null; // precision cutting / loop in marker in seconds
  outPoint?: number | null; // precision cutting / loop out marker in seconds
}

export interface LowSpecSettings {
  proxyMode: boolean; // lowers live preview resolution
  previewQuality: PreviewQuality; // full (1x), half (0.5x), quarter (0.25x)
  skipFiltersOnPlay: boolean; // skips GPU filter passes during playback
  throttleFps: boolean; // limits canvas requestAnimationFrame to 30fps on low-end dual-core CPU
  hardwareAccel: boolean;
}
