import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ProjectData, TrackItem, ClipItem, LowSpecSettings, AspectRatio, PreviewQuality, FilterType } from '../types/editor';
import { localDB } from '../utils/storage';
import { audioEngine } from '../utils/audioEngine';

// Sample assets generated
export const SAMPLE_ASSETS = [
  {
    id: 'sample-cyberpunk',
    name: 'Cyberpunk Neon 4K',
    src: '/src/assets/images/sample_cyberpunk_neon_1791902112840.jpg',
    duration: 5.0,
    type: 'video' as const,
  },
  {
    id: 'sample-nature',
    name: 'Pine Mountain Drone',
    src: '/src/assets/images/sample_nature_cinematic_1791902112750.jpg',
    duration: 5.0,
    type: 'video' as const,
  },
  {
    id: 'sample-tech',
    name: 'Abstract Tech Waves',
    src: '/src/assets/images/sample_tech_abstract_1791902112731.jpg',
    duration: 5.0,
    type: 'video' as const,
  },
];

const DEFAULT_TRACKS: TrackItem[] = [
  {
    id: 'track-v2',
    type: 'video',
    name: 'V2 (Overlay / PiP)',
    muted: false,
    locked: false,
    hidden: false,
    clips: [],
  },
  {
    id: 'track-v1',
    type: 'video',
    name: 'V1 (Main Video)',
    muted: false,
    locked: false,
    hidden: false,
    clips: [
      {
        id: 'clip-v1-1',
        trackId: 'track-v1',
        type: 'video',
        name: 'Cyberpunk Neon 4K',
        start: 0,
        duration: 4.5,
        sourceStart: 0,
        sourceDuration: 5.0,
        src: '/src/assets/images/sample_cyberpunk_neon_1791902112840.jpg',
        thumbnail: '/src/assets/images/sample_cyberpunk_neon_1791902112840.jpg',
        scale: 100,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 100,
        blendMode: 'normal',
        filter: 'cyber',
        chromaKey: false,
        chromaColor: '#00ff00',
        chromaSimilarity: 40,
        volume: 100,
        muted: false,
        fadeIn: 0.3,
        fadeOut: 0.3,
        speed: 1.0,
      },
      {
        id: 'clip-v1-2',
        trackId: 'track-v1',
        type: 'video',
        name: 'Pine Mountain Drone',
        start: 4.5,
        duration: 4.5,
        sourceStart: 0,
        sourceDuration: 5.0,
        src: '/src/assets/images/sample_nature_cinematic_1791902112750.jpg',
        thumbnail: '/src/assets/images/sample_nature_cinematic_1791902112750.jpg',
        scale: 100,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 100,
        blendMode: 'normal',
        filter: 'teal-orange',
        chromaKey: false,
        chromaColor: '#00ff00',
        chromaSimilarity: 40,
        volume: 100,
        muted: false,
        fadeIn: 0.2,
        fadeOut: 0.2,
        speed: 1.0,
      },
      {
        id: 'clip-v1-3',
        trackId: 'track-v1',
        type: 'video',
        name: 'Abstract Tech Waves',
        start: 9.0,
        duration: 4.0,
        sourceStart: 0,
        sourceDuration: 5.0,
        src: '/src/assets/images/sample_tech_abstract_1791902112731.jpg',
        thumbnail: '/src/assets/images/sample_tech_abstract_1791902112731.jpg',
        scale: 105,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 100,
        blendMode: 'normal',
        filter: 'glow',
        chromaKey: false,
        chromaColor: '#00ff00',
        chromaSimilarity: 40,
        volume: 100,
        muted: false,
        fadeIn: 0.3,
        fadeOut: 0.5,
        speed: 1.0,
      },
    ],
  },
  {
    id: 'track-t1',
    type: 'text',
    name: 'T1 (Titles & Captions)',
    muted: false,
    locked: false,
    hidden: false,
    clips: [
      {
        id: 'clip-t1-1',
        trackId: 'track-t1',
        type: 'text',
        name: 'CapCut Pro Title',
        start: 0.5,
        duration: 3.5,
        sourceStart: 0,
        sourceDuration: 3.5,
        scale: 100,
        x: 0,
        y: -120,
        rotation: 0,
        opacity: 100,
        blendMode: 'normal',
        filter: 'none',
        chromaKey: false,
        chromaColor: '#00ff00',
        chromaSimilarity: 40,
        volume: 100,
        muted: false,
        fadeIn: 0.2,
        fadeOut: 0.3,
        speed: 1.0,
        text: 'CAPCUT PRO PC',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 48,
        textColor: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.4)',
        strokeColor: '#00f2fe',
        strokeWidth: 2,
        textStyle: 'glowing',
      },
      {
        id: 'clip-t1-2',
        trackId: 'track-t1',
        type: 'text',
        name: 'Offline Subtitle',
        start: 4.8,
        duration: 3.8,
        sourceStart: 0,
        sourceDuration: 3.8,
        scale: 100,
        x: 0,
        y: 160,
        rotation: 0,
        opacity: 100,
        blendMode: 'normal',
        filter: 'none',
        chromaKey: false,
        chromaColor: '#00ff00',
        chromaSimilarity: 40,
        volume: 100,
        muted: false,
        fadeIn: 0.1,
        fadeOut: 0.2,
        speed: 1.0,
        text: '100% OFFLINE & LOW-END PC ENGINE',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 30,
        textColor: '#ffd200',
        backgroundColor: 'rgba(18,18,20,0.85)',
        strokeColor: '#121214',
        strokeWidth: 3,
        textStyle: 'bold-yellow',
      },
    ],
  },
  {
    id: 'track-fx1',
    type: 'effect',
    name: 'FX (Filters & Adjust)',
    muted: false,
    locked: false,
    hidden: false,
    clips: [],
  },
  {
    id: 'track-a1',
    type: 'audio',
    name: 'A1 (Background Music)',
    muted: false,
    locked: false,
    hidden: false,
    clips: [],
  },
  {
    id: 'track-a2',
    type: 'audio',
    name: 'A2 (Sound Effects / Hits)',
    muted: false,
    locked: false,
    hidden: false,
    clips: [
      {
        id: 'clip-a2-1',
        trackId: 'track-a2',
        type: 'audio',
        name: 'Cinematic Whoosh',
        start: 0,
        duration: 1.2,
        sourceStart: 0,
        sourceDuration: 1.2,
        scale: 100,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 100,
        blendMode: 'normal',
        filter: 'none',
        chromaKey: false,
        chromaColor: '#00ff00',
        chromaSimilarity: 40,
        volume: 100,
        muted: false,
        fadeIn: 0.1,
        fadeOut: 0.2,
        speed: 1.0,
      },
      {
        id: 'clip-a2-2',
        trackId: 'track-a2',
        type: 'audio',
        name: 'Bass Drop Impact',
        start: 4.5,
        duration: 1.8,
        sourceStart: 0,
        sourceDuration: 1.8,
        scale: 100,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 100,
        blendMode: 'normal',
        filter: 'none',
        chromaKey: false,
        chromaColor: '#00ff00',
        chromaSimilarity: 40,
        volume: 100,
        muted: false,
        fadeIn: 0.05,
        fadeOut: 0.5,
        speed: 1.0,
      },
    ],
  },
];

const INITIAL_PROJECT: ProjectData = {
  id: 'proj-default-01',
  name: 'Cyberpunk Montage_01',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings: {
    name: 'Cyberpunk Montage_01',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    fps: 30,
  },
  tracks: DEFAULT_TRACKS,
  duration: 15.0,
  inPoint: 1.0,
  outPoint: 8.5,
};

interface EditorContextType {
  project: ProjectData;
  currentTime: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  activeTool: 'select' | 'split' | 'delete';
  snappingEnabled: boolean;
  rippleEditEnabled: boolean;
  timelineZoom: number; // px per second
  lowSpecSettings: LowSpecSettings;
  canUndo: boolean;
  canRedo: boolean;
  selectedClip: ClipItem | null;
  
  // Actions
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setSelectedClipId: (id: string | null) => void;
  setActiveTool: (tool: 'select' | 'split' | 'delete') => void;
  toggleSnapping: () => void;
  toggleRippleEdit: () => void;
  setTimelineZoom: (zoom: number) => void;
  updateLowSpecSettings: (settings: Partial<LowSpecSettings>) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setProjectName: (name: string) => void;
  
  // Clip & Track CRUD
  addClipToTrack: (trackId: string, clipData: Partial<ClipItem>) => void;
  updateClip: (clipId: string, updates: Partial<ClipItem>) => void;
  removeClip: (clipId: string) => void;
  splitClipAtPlayhead: (clipId?: string) => void;
  duplicateClip: (clipId: string) => void;
  updateTrack: (trackId: string, updates: Partial<TrackItem>) => void;
  
  // In / Out Markers & Preview Looping
  inPoint: number | null;
  outPoint: number | null;
  isLooping: boolean;
  setInPoint: (time?: number) => void;
  setOutPoint: (time?: number) => void;
  clearInOutPoints: () => void;
  toggleLooping: () => void;
  jumpToInPoint: () => void;
  jumpToOutPoint: () => void;
  splitAtInOutPoints: () => void;
  deleteRangeInOut: (ripple?: boolean) => void;

  // Project operations
  undo: () => void;
  redo: () => void;
  saveProjectToDisk: () => void;
  exportProjectFile: () => void;
  importProjectFile: (file: File) => void;
  createNewProject: (name?: string) => void;
  loadProjectData: (proj: ProjectData) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<ProjectData>(INITIAL_PROJECT);
  const [currentTime, setCurrentTimeState] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-v1-1');
  const [activeTool, setActiveTool] = useState<'select' | 'split' | 'delete'>('select');
  const [snappingEnabled, setSnappingEnabled] = useState<boolean>(true);
  const [rippleEditEnabled, setRippleEditEnabled] = useState<boolean>(false);
  const [timelineZoom, setTimelineZoom] = useState<number>(45); // px per second
  const [isLooping, setIsLooping] = useState<boolean>(true); // preview looping active by default

  // Low-End PC Performance Defaults
  const [lowSpecSettings, setLowSpecSettings] = useState<LowSpecSettings>({
    proxyMode: true, // Enables proxy downscale during scrubbing
    previewQuality: 'half', // Default to 1/2 preview for smooth rendering
    skipFiltersOnPlay: false,
    throttleFps: false,
    hardwareAccel: true,
  });

  // Undo / Redo history
  const [history, setHistory] = useState<ProjectData[]>([]);
  const [future, setFuture] = useState<ProjectData[]>([]);

  // Sound trigger tracker during playback to prevent repeating the same audio hit multiple times per frame
  const playedAudioClipsRef = useRef<Set<string>>(new Set());

  // Auto-save to IndexedDB debounced
  const saveTimeoutRef = useRef<any>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      localDB.saveProject(project);
    }, 1500);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [project]);

  // Load last saved project from IndexedDB on startup
  useEffect(() => {
    localDB.loadLastProject().then((saved) => {
      if (saved && saved.tracks && saved.tracks.length > 0) {
        setProject(saved);
      }
    });
  }, []);

  const pushHistory = useCallback((currentProj: ProjectData) => {
    setHistory((prev) => [...prev.slice(-25), JSON.parse(JSON.stringify(currentProj))]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [JSON.parse(JSON.stringify(project)), ...prev]);
    setProject(previous);
  }, [history, project]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(project))]);
    setProject(next);
  }, [future, project]);

  // Safely clamp currentTime
  const setCurrentTime = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(project.duration + 5, time));
    setCurrentTimeState(clamped);
  }, [project.duration]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleSnapping = useCallback(() => {
    setSnappingEnabled((prev) => !prev);
  }, []);

  const toggleRippleEdit = useCallback(() => {
    setRippleEditEnabled((prev) => !prev);
  }, []);

  const updateLowSpecSettings = useCallback((updates: Partial<LowSpecSettings>) => {
    setLowSpecSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const setProjectName = useCallback((name: string) => {
    pushHistory(project);
    setProject((prev) => ({
      ...prev,
      name,
      settings: { ...prev.settings, name },
      updatedAt: Date.now(),
    }));
  }, [project, pushHistory]);

  const setAspectRatio = useCallback((aspectRatio: AspectRatio) => {
    pushHistory(project);
    let width = 1920;
    let height = 1080;
    if (aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === '4:3') {
      width = 1440;
      height = 1080;
    } else if (aspectRatio === '21:9') {
      width = 2560;
      height = 1080;
    }

    setProject((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        aspectRatio,
        width,
        height,
      },
      updatedAt: Date.now(),
    }));
  }, [project, pushHistory]);

  // Calculate total timeline duration based on clips
  const recalculateDuration = (tracks: TrackItem[]): number => {
    let maxTime = 10.0;
    for (const track of tracks) {
      for (const clip of track.clips) {
        const end = clip.start + clip.duration;
        if (end > maxTime) maxTime = end;
      }
    }
    return Math.max(10.0, Math.ceil(maxTime + 2.0));
  };

  // Add clip to specific track
  const addClipToTrack = useCallback((trackId: string, clipData: Partial<ClipItem>) => {
    pushHistory(project);
    setProject((prev) => {
      const newTracks = prev.tracks.map((track) => {
        if (track.id !== trackId) return track;
        const newClip: ClipItem = {
          id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          trackId,
          type: track.type,
          name: clipData.name || 'New Clip',
          start: clipData.start ?? currentTime,
          duration: clipData.duration || 4.0,
          sourceStart: 0,
          sourceDuration: clipData.duration || 4.0,
          src: clipData.src,
          thumbnail: clipData.thumbnail || clipData.src,
          scale: clipData.scale ?? 100,
          x: clipData.x ?? 0,
          y: clipData.y ?? 0,
          rotation: clipData.rotation ?? 0,
          opacity: clipData.opacity ?? 100,
          blendMode: clipData.blendMode ?? 'normal',
          filter: clipData.filter ?? 'none',
          chromaKey: clipData.chromaKey ?? false,
          chromaColor: clipData.chromaColor ?? '#00ff00',
          chromaSimilarity: clipData.chromaSimilarity ?? 40,
          volume: clipData.volume ?? 100,
          muted: false,
          fadeIn: clipData.fadeIn ?? 0.2,
          fadeOut: clipData.fadeOut ?? 0.2,
          speed: clipData.speed ?? 1.0,
          text: clipData.text,
          fontFamily: clipData.fontFamily ?? "'Plus Jakarta Sans', sans-serif",
          fontSize: clipData.fontSize ?? 40,
          textColor: clipData.textColor ?? '#ffffff',
          backgroundColor: clipData.backgroundColor ?? 'rgba(0,0,0,0.4)',
          strokeColor: clipData.strokeColor ?? '#00f2fe',
          strokeWidth: clipData.strokeWidth ?? 2,
          textStyle: clipData.textStyle ?? 'standard',
        };
        return {
          ...track,
          clips: [...track.clips, newClip],
        };
      });

      return {
        ...prev,
        tracks: newTracks,
        duration: recalculateDuration(newTracks),
        updatedAt: Date.now(),
      };
    });
  }, [currentTime, project, pushHistory]);

  // Update specific clip properties
  const updateClip = useCallback((clipId: string, updates: Partial<ClipItem>) => {
    setProject((prev) => {
      const newTracks = prev.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) => {
          if (clip.id === clipId) {
            return { ...clip, ...updates };
          }
          return clip;
        }),
      }));
      return {
        ...prev,
        tracks: newTracks,
        duration: recalculateDuration(newTracks),
        updatedAt: Date.now(),
      };
    });
  }, []);

  // Remove clip
  const removeClip = useCallback((clipId: string) => {
    pushHistory(project);
    setProject((prev) => {
      const newTracks = prev.tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.id !== clipId),
      }));
      return {
        ...prev,
        tracks: newTracks,
        duration: recalculateDuration(newTracks),
        updatedAt: Date.now(),
      };
    });
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  }, [project, pushHistory, selectedClipId]);

  // Split clip at playhead (CapCut Pro razor blade cut)
  const splitClipAtPlayhead = useCallback((targetClipId?: string) => {
    const idToSplit = targetClipId || selectedClipId;
    if (!idToSplit) return;

    let foundClip: ClipItem | null = null;
    let foundTrack: TrackItem | null = null;

    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.id === idToSplit) {
          foundClip = clip;
          foundTrack = track;
          break;
        }
      }
      if (foundClip) break;
    }

    if (!foundClip || !foundTrack) return;

    const cutPoint = currentTime;
    const clipStart = foundClip.start;
    const clipEnd = foundClip.start + foundClip.duration;

    // Check if playhead is strictly inside the clip
    if (cutPoint <= clipStart + 0.1 || cutPoint >= clipEnd - 0.1) {
      return;
    }

    pushHistory(project);

    const firstDuration = cutPoint - clipStart;
    const secondDuration = clipEnd - cutPoint;

    const firstClip: ClipItem = {
      ...foundClip,
      duration: firstDuration,
    };

    const secondClip: ClipItem = {
      ...foundClip,
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      start: cutPoint,
      duration: secondDuration,
      sourceStart: foundClip.sourceStart + firstDuration,
    };

    setProject((prev) => {
      const newTracks = prev.tracks.map((track) => {
        if (track.id !== foundTrack!.id) return track;
        return {
          ...track,
          clips: track.clips.flatMap((c) => (c.id === idToSplit ? [firstClip, secondClip] : [c])),
        };
      });

      return {
        ...prev,
        tracks: newTracks,
        updatedAt: Date.now(),
      };
    });

    setSelectedClipId(secondClip.id);
    audioEngine.playSoundEffect('pop', 0.8);
  }, [currentTime, project, pushHistory, selectedClipId]);

  // Duplicate clip
  const duplicateClip = useCallback((clipId: string) => {
    let targetClip: ClipItem | null = null;
    let targetTrack: TrackItem | null = null;

    for (const track of project.tracks) {
      for (const c of track.clips) {
        if (c.id === clipId) {
          targetClip = c;
          targetTrack = track;
          break;
        }
      }
      if (targetClip) break;
    }

    if (!targetClip || !targetTrack) return;

    pushHistory(project);

    const duplicated: ClipItem = {
      ...targetClip,
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      start: targetClip.start + targetClip.duration + 0.1,
      name: `${targetClip.name} (Copy)`,
    };

    setProject((prev) => {
      const newTracks = prev.tracks.map((t) => {
        if (t.id !== targetTrack!.id) return t;
        return {
          ...t,
          clips: [...t.clips, duplicated],
        };
      });
      return {
        ...prev,
        tracks: newTracks,
        duration: recalculateDuration(newTracks),
        updatedAt: Date.now(),
      };
    });

    setSelectedClipId(duplicated.id);
  }, [project, pushHistory]);

  const updateTrack = useCallback((trackId: string, updates: Partial<TrackItem>) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)),
    }));
  }, []);

  // In / Out Marker & Preview Looping Actions
  const setInPoint = useCallback((time?: number) => {
    const target = Number((time !== undefined ? time : currentTime).toFixed(2));
    pushHistory(project);
    setProject((prev) => {
      let newOut = prev.outPoint;
      if (newOut != null && target >= newOut) {
        newOut = Math.min(prev.duration, Number((target + 3.0).toFixed(2)));
      }
      return {
        ...prev,
        inPoint: target,
        outPoint: newOut,
        updatedAt: Date.now(),
      };
    });
    audioEngine.playSoundEffect('pop', 0.8);
  }, [currentTime, project, pushHistory]);

  const setOutPoint = useCallback((time?: number) => {
    const target = Number((time !== undefined ? time : currentTime).toFixed(2));
    pushHistory(project);
    setProject((prev) => {
      let newIn = prev.inPoint;
      if (newIn != null && target <= newIn) {
        newIn = Math.max(0, Number((target - 3.0).toFixed(2)));
      }
      return {
        ...prev,
        inPoint: newIn,
        outPoint: target,
        updatedAt: Date.now(),
      };
    });
    audioEngine.playSoundEffect('pop', 0.8);
  }, [currentTime, project, pushHistory]);

  const clearInOutPoints = useCallback(() => {
    pushHistory(project);
    setProject((prev) => ({
      ...prev,
      inPoint: null,
      outPoint: null,
      updatedAt: Date.now(),
    }));
    audioEngine.playSoundEffect('pop', 0.6);
  }, [project, pushHistory]);

  const toggleLooping = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const jumpToInPoint = useCallback(() => {
    if (project.inPoint != null) {
      setCurrentTime(project.inPoint);
    } else {
      setCurrentTime(0);
    }
  }, [project.inPoint, setCurrentTime]);

  const jumpToOutPoint = useCallback(() => {
    if (project.outPoint != null) {
      setCurrentTime(project.outPoint);
    } else {
      setCurrentTime(project.duration);
    }
  }, [project.duration, project.outPoint, setCurrentTime]);

  // Helper to slice all tracks at time t
  const sliceAllAtTime = (tracks: TrackItem[], time: number): TrackItem[] => {
    return tracks.map((track) => {
      const newClips: ClipItem[] = [];
      for (const clip of track.clips) {
        if (time > clip.start + 0.05 && time < clip.start + clip.duration - 0.05) {
          const firstDur = Number((time - clip.start).toFixed(2));
          const secondDur = Number((clip.duration - firstDur).toFixed(2));
          const firstClip: ClipItem = {
            ...clip,
            duration: firstDur,
          };
          const secondClip: ClipItem = {
            ...clip,
            id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            start: time,
            duration: secondDur,
            sourceStart: clip.sourceStart + firstDur,
          };
          newClips.push(firstClip, secondClip);
        } else {
          newClips.push(clip);
        }
      }
      return { ...track, clips: newClips };
    });
  };

  const splitAtInOutPoints = useCallback(() => {
    const pIn = project.inPoint;
    const pOut = project.outPoint;
    if (pIn == null && pOut == null) return;

    pushHistory(project);
    setProject((prev) => {
      let updatedTracks = prev.tracks;
      if (pIn != null) {
        updatedTracks = sliceAllAtTime(updatedTracks, pIn);
      }
      if (pOut != null) {
        updatedTracks = sliceAllAtTime(updatedTracks, pOut);
      }
      return {
        ...prev,
        tracks: updatedTracks,
        updatedAt: Date.now(),
      };
    });
    audioEngine.playSoundEffect('pop', 0.9);
  }, [project, pushHistory]);

  const deleteRangeInOut = useCallback((ripple: boolean = false) => {
    const pIn = project.inPoint;
    const pOut = project.outPoint;
    if (pIn == null || pOut == null || pIn >= pOut) return;

    pushHistory(project);
    setProject((prev) => {
      // 1. Slice at boundaries
      let updatedTracks = sliceAllAtTime(prev.tracks, pIn);
      updatedTracks = sliceAllAtTime(updatedTracks, pOut);

      // 2. Filter out clips lying inside [pIn, pOut]
      const gap = Number((pOut - pIn).toFixed(2));
      updatedTracks = updatedTracks.map((track) => {
        let remaining = track.clips.filter((c) => {
          const center = c.start + c.duration / 2;
          return center < pIn || center > pOut;
        });

        // 3. Ripple shift if requested
        if (ripple) {
          remaining = remaining.map((c) => {
            if (c.start >= pOut - 0.05) {
              return {
                ...c,
                start: Math.max(0, Number((c.start - gap).toFixed(2))),
              };
            }
            return c;
          });
        }
        return { ...track, clips: remaining };
      });

      const newDuration = ripple ? Math.max(10, Number((prev.duration - gap).toFixed(2))) : prev.duration;

      return {
        ...prev,
        tracks: updatedTracks,
        duration: newDuration,
        inPoint: null,
        outPoint: null,
        updatedAt: Date.now(),
      };
    });

    setCurrentTime(pIn);
    audioEngine.playSoundEffect('bass drop', 0.8);
  }, [project, pushHistory, setCurrentTime]);

  const saveProjectToDisk = useCallback(() => {
    localDB.saveProject(project);
  }, [project]);

  const exportProjectFile = useCallback(() => {
    localDB.exportProjectToFile(project);
  }, [project]);

  const importProjectFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data && data.tracks) {
          pushHistory(project);
          setProject(data);
          setSelectedClipId(null);
          setCurrentTime(0);
        }
      } catch {
        // invalid file
      }
    };
    reader.readAsText(file);
  }, [project, pushHistory, setCurrentTime]);

  const createNewProject = useCallback((name: string = 'Untitled Project') => {
    pushHistory(project);
    const newProj: ProjectData = {
      id: `proj-${Date.now()}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        name,
        aspectRatio: '16:9',
        width: 1920,
        height: 1080,
        fps: 30,
      },
      tracks: [
        { id: 'track-v2', type: 'video', name: 'V2 (Overlay / PiP)', muted: false, locked: false, hidden: false, clips: [] },
        { id: 'track-v1', type: 'video', name: 'V1 (Main Video)', muted: false, locked: false, hidden: false, clips: [] },
        { id: 'track-t1', type: 'text', name: 'T1 (Titles & Captions)', muted: false, locked: false, hidden: false, clips: [] },
        { id: 'track-fx1', type: 'effect', name: 'FX (Filters)', muted: false, locked: false, hidden: false, clips: [] },
        { id: 'track-a1', type: 'audio', name: 'A1 (Background Music)', muted: false, locked: false, hidden: false, clips: [] },
        { id: 'track-a2', type: 'audio', name: 'A2 (Sound FX)', muted: false, locked: false, hidden: false, clips: [] },
      ],
      duration: 15.0,
    };
    setProject(newProj);
    setCurrentTime(0);
    setSelectedClipId(null);
  }, [project, pushHistory, setCurrentTime]);

  const loadProjectData = useCallback((proj: ProjectData) => {
    pushHistory(project);
    setProject(proj);
    setCurrentTime(0);
    setSelectedClipId(null);
  }, [project, pushHistory, setCurrentTime]);

  // Selected clip helper
  const selectedClip = React.useMemo(() => {
    if (!selectedClipId) return null;
    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.id === selectedClipId) return clip;
      }
    }
    return null;
  }, [project.tracks, selectedClipId]);

  // Main playback loop (driven by requestAnimationFrame)
  useEffect(() => {
    if (!isPlaying) {
      playedAudioClipsRef.current.clear();
      return;
    }

    let animationId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentTimeState((prev) => {
        const nextTime = prev + delta;

        // In / Out marker loop boundaries
        const hasInOut = project.inPoint != null && project.outPoint != null && project.inPoint < project.outPoint;
        const loopStart = hasInOut ? project.inPoint! : (project.inPoint != null ? project.inPoint : 0);
        const loopEnd = hasInOut ? project.outPoint! : project.duration;

        if (isLooping) {
          if (nextTime >= loopEnd) {
            playedAudioClipsRef.current.clear();
            return loopStart;
          }
        } else {
          if (nextTime >= project.duration) {
            setIsPlaying(false);
            return 0;
          }
        }

        // Trigger sound effects for active audio clips
        for (const track of project.tracks) {
          if (track.type === 'audio' && !track.muted) {
            for (const clip of track.clips) {
              if (
                nextTime >= clip.start &&
                nextTime <= clip.start + 0.1 &&
                !playedAudioClipsRef.current.has(clip.id)
              ) {
                playedAudioClipsRef.current.add(clip.id);
                audioEngine.playSoundEffect(clip.name, (clip.volume || 100) / 100);
              }
            }
          }
        }

        return nextTime;
      });

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, isLooping, project.duration, project.inPoint, project.outPoint, project.tracks]);

  // Global Keyboard Shortcuts (CapCut Pro PC Standard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyI' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        setInPoint();
      } else if (e.code === 'KeyO' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        setOutPoint();
      } else if (e.code === 'KeyI' && e.shiftKey) {
        e.preventDefault();
        jumpToInPoint();
      } else if (e.code === 'KeyO' && e.shiftKey) {
        e.preventDefault();
        jumpToOutPoint();
      } else if (e.altKey && e.code === 'KeyX') {
        e.preventDefault();
        clearInOutPoints();
      } else if (e.ctrlKey && e.code === 'KeyL') {
        e.preventDefault();
        toggleLooping();
      } else if (e.code === 'KeyB' || (e.ctrlKey && e.code === 'KeyB')) {
        e.preventDefault();
        setActiveTool('split');
        splitClipAtPlayhead();
      } else if (e.code === 'KeyV') {
        e.preventDefault();
        setActiveTool('select');
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          removeClip(selectedClipId);
        }
      } else if (e.ctrlKey && e.code === 'KeyZ') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && (e.code === 'KeyY' || (e.shiftKey && e.code === 'KeyZ'))) {
        e.preventDefault();
        redo();
      } else if (e.ctrlKey && e.code === 'KeyD') {
        e.preventDefault();
        if (selectedClipId) duplicateClip(selectedClipId);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime(currentTime - (e.shiftKey ? 1.0 : 1 / 30));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime(currentTime + (e.shiftKey ? 1.0 : 1 / 30));
      } else if (e.code === 'KeyN') {
        toggleSnapping();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    clearInOutPoints,
    currentTime,
    duplicateClip,
    jumpToInPoint,
    jumpToOutPoint,
    redo,
    removeClip,
    selectedClipId,
    setCurrentTime,
    setInPoint,
    setOutPoint,
    splitClipAtPlayhead,
    toggleLooping,
    togglePlay,
    toggleSnapping,
    undo,
  ]);

  return (
    <EditorContext.Provider
      value={{
        project,
        currentTime,
        isPlaying,
        selectedClipId,
        activeTool,
        snappingEnabled,
        rippleEditEnabled,
        timelineZoom,
        lowSpecSettings,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        selectedClip,
        inPoint: project.inPoint ?? null,
        outPoint: project.outPoint ?? null,
        isLooping,
        setInPoint,
        setOutPoint,
        clearInOutPoints,
        toggleLooping,
        jumpToInPoint,
        jumpToOutPoint,
        splitAtInOutPoints,
        deleteRangeInOut,
        setCurrentTime,
        setIsPlaying,
        togglePlay,
        setSelectedClipId,
        setActiveTool,
        toggleSnapping,
        toggleRippleEdit,
        setTimelineZoom,
        updateLowSpecSettings,
        setAspectRatio,
        setProjectName,
        addClipToTrack,
        updateClip,
        removeClip,
        splitClipAtPlayhead,
        duplicateClip,
        updateTrack,
        undo,
        redo,
        saveProjectToDisk,
        exportProjectFile,
        importProjectFile,
        createNewProject,
        loadProjectData,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
