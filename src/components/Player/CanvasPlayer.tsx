import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useEditor } from '../../context/EditorContext';
import { formatTimecode } from '../../utils/timeFormat';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Shield, Eye, Settings2, Repeat, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

export const CanvasPlayer: React.FC<{ onOpenExport: () => void }> = ({ onOpenExport }) => {
  const {
    project,
    currentTime,
    isPlaying,
    togglePlay,
    setCurrentTime,
    lowSpecSettings,
    updateLowSpecSettings,
    setAspectRatio,
    inPoint,
    outPoint,
    isLooping,
    toggleLooping,
    jumpToInPoint,
    jumpToOutPoint,
  } = useEditor();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showSafeGuides, setShowSafeGuides] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<'fit' | '50%' | '100%'>('fit');

  // Cache loaded Image objects in memory to prevent reloading images every frame
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Aspect ratio calculations
  const aspectConfig = useMemo(() => {
    const ratio = project.settings.aspectRatio;
    switch (ratio) {
      case '9:16':
        return { width: 1080, height: 1920, cssRatio: '9/16', label: '9:16 TikTok' };
      case '1:1':
        return { width: 1080, height: 1080, cssRatio: '1/1', label: '1:1 Square' };
      case '4:3':
        return { width: 1440, height: 1080, cssRatio: '4/3', label: '4:3 Classic' };
      case '21:9':
        return { width: 2560, height: 1080, cssRatio: '21/9', label: '21:9 Ultra' };
      default:
        return { width: 1920, height: 1080, cssRatio: '16/9', label: '16:9 YouTube' };
    }
  }, [project.settings.aspectRatio]);

  // Low-end PC resolution scaling factor
  const qualityScale = useMemo(() => {
    if (!isPlaying) return 1.0; // Always render full crisp resolution when paused!
    if (lowSpecSettings.previewQuality === 'quarter') return 0.25;
    if (lowSpecSettings.previewQuality === 'half') return 0.5;
    return 1.0;
  }, [isPlaying, lowSpecSettings.previewQuality]);

  // Master volume control
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
      audioEngine.toggleMute(true);
    } else {
      if (isMuted) {
        setIsMuted(false);
        audioEngine.toggleMute(false);
      }
      audioEngine.setMasterVolume(newVol / 100);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.toggleMute(next);
  };

  // Render current frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const baseW = aspectConfig.width;
    const baseH = aspectConfig.height;
    const renderW = Math.round(baseW * qualityScale);
    const renderH = Math.round(baseH * qualityScale);

    if (canvas.width !== renderW || canvas.height !== renderH) {
      canvas.width = renderW;
      canvas.height = renderH;
    }

    // Scale canvas context to match normalized 1920x1080 coordinates
    ctx.save();
    ctx.scale(qualityScale, qualityScale);

    // 1. Draw Canvas background
    ctx.fillStyle = '#08080a';
    ctx.fillRect(0, 0, baseW, baseH);

    // 2. Find clips active at current time across all tracks
    // Priority order: V1 (main video), V2 (overlay/PiP), T1 (text), FX
    const activeVideoClips: Array<any> = [];
    const activeTextClips: Array<any> = [];

    for (const track of project.tracks) {
      if (track.hidden) continue;
      for (const clip of track.clips) {
        if (currentTime >= clip.start && currentTime <= clip.start + clip.duration) {
          if (track.type === 'video') {
            activeVideoClips.push(clip);
          } else if (track.type === 'text') {
            activeTextClips.push(clip);
          }
        }
      }
    }

    // Draw video/image clips
    for (const clip of activeVideoClips) {
      if (!clip.src) continue;

      let img = imageCacheRef.current.get(clip.src);
      if (!img) {
        img = new Image();
        img.src = clip.src;
        imageCacheRef.current.set(clip.src, img);
      }

      if (img.complete && img.naturalWidth > 0) {
        ctx.save();

        // Apply Opacity
        ctx.globalAlpha = Math.max(0, Math.min(1, (clip.opacity ?? 100) / 100));

        // Apply Blend Mode
        if (clip.blendMode && clip.blendMode !== 'normal') {
          ctx.globalCompositeOperation = clip.blendMode;
        }

        // Apply Color Filters (if not skipped for extreme low-end PC playback)
        if (!lowSpecSettings.skipFiltersOnPlay || !isPlaying) {
          if (clip.filter === 'cyber') {
            ctx.filter = 'contrast(125%) saturate(160%) hue-rotate(150deg)';
          } else if (clip.filter === 'teal-orange') {
            ctx.filter = 'contrast(115%) saturate(135%) sepia(20%)';
          } else if (clip.filter === 'moody') {
            ctx.filter = 'contrast(110%) brightness(85%) saturate(90%)';
          } else if (clip.filter === 'vintage') {
            ctx.filter = 'sepia(40%) contrast(95%) brightness(105%)';
          } else if (clip.filter === 'noir') {
            ctx.filter = 'grayscale(100%) contrast(140%)';
          } else if (clip.filter === 'vibrant') {
            ctx.filter = 'saturate(180%) contrast(110%)';
          } else if (clip.filter === 'glow') {
            ctx.filter = 'brightness(115%) contrast(115%)';
          }
        }

        // Clip transforms: Translate to center + user offsets
        const centerX = baseW / 2 + (clip.x || 0);
        const centerY = baseH / 2 + (clip.y || 0);
        ctx.translate(centerX, centerY);

        if (clip.rotation) {
          ctx.rotate((clip.rotation * Math.PI) / 180);
        }

        const scale = (clip.scale || 100) / 100;
        ctx.scale(scale, scale);

        // Aspect fit cover math
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = baseW / baseH;
        let drawW = baseW;
        let drawH = baseH;

        if (imgRatio > canvasRatio) {
          drawW = baseH * imgRatio;
        } else {
          drawH = baseW / imgRatio;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }
    }

    // Draw text overlays (titles, subtitles)
    for (const textClip of activeTextClips) {
      if (!textClip.text) continue;

      ctx.save();
      const posX = baseW / 2 + (textClip.x || 0);
      const posY = baseH / 2 + (textClip.y || 0);

      ctx.translate(posX, posY);
      if (textClip.rotation) {
        ctx.rotate((textClip.rotation * Math.PI) / 180);
      }
      const scale = (textClip.scale || 100) / 100;
      ctx.scale(scale, scale);

      const fontSize = textClip.fontSize || 40;
      ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = textClip.text;
      const metrics = ctx.measureText(text);
      const paddingX = 24;
      const paddingY = 14;
      const bgW = metrics.width + paddingX * 2;
      const bgH = fontSize * 1.3 + paddingY * 2;

      // Draw background box if styled
      if (textClip.textStyle === 'bold-yellow') {
        ctx.fillStyle = '#ffd200';
        ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH);
        ctx.fillStyle = '#0c0c0e';
        ctx.fillText(text, 0, 0);
      } else if (textClip.textStyle === 'glowing') {
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, 0, 0);

        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.strokeText(text, 0, 0);
      } else {
        // Standard subtitle box
        ctx.fillStyle = textClip.backgroundColor || 'rgba(12,12,14,0.75)';
        ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH);
        if (textClip.strokeColor && textClip.strokeWidth) {
          ctx.strokeStyle = textClip.strokeColor;
          ctx.lineWidth = textClip.strokeWidth;
          ctx.strokeText(text, 0, 0);
        }
        ctx.fillStyle = textClip.textColor || '#ffffff';
        ctx.fillText(text, 0, 0);
      }

      ctx.restore();
    }

    // Draw Safe Zone Guides if enabled
    if (showSafeGuides) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);

      // Action safe (90%)
      const marginX = baseW * 0.05;
      const marginY = baseH * 0.05;
      ctx.strokeRect(marginX, marginY, baseW - marginX * 2, baseH - marginY * 2);

      // Title safe (80%)
      const titleMarginX = baseW * 0.1;
      const titleMarginY = baseH * 0.1;
      ctx.strokeStyle = 'rgba(255, 210, 0, 0.4)';
      ctx.strokeRect(titleMarginX, titleMarginY, baseW - titleMarginX * 2, baseH - titleMarginY * 2);

      // Center crosshair
      ctx.beginPath();
      ctx.moveTo(baseW / 2 - 20, baseH / 2);
      ctx.lineTo(baseW / 2 + 20, baseH / 2);
      ctx.moveTo(baseW / 2, baseH / 2 - 20);
      ctx.lineTo(baseW / 2, baseH / 2 + 20);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }, [currentTime, aspectConfig, isPlaying, lowSpecSettings.skipFiltersOnPlay, project.tracks, qualityScale, showSafeGuides]);

  // Step 1 frame forward or backward
  const stepFrame = (frames: number) => {
    const fps = project.settings.fps || 30;
    setCurrentTime(currentTime + frames * (1 / fps));
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-[#141417] border-b border-[#24242c] relative select-none"
    >
      {/* Top Monitor Bar with Aspect Ratio, Low-Spec Quality, Safe Guides */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#18181c] border-b border-[#24242c] text-xs text-[#a0a0ab]">
        {/* Aspect Ratio Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#6c6c7a] font-medium">Aspect:</span>
          <select
            value={project.settings.aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as any)}
            className="bg-[#202026] text-[#e0e0e6] hover:bg-[#282832] border border-[#2c2c36] rounded px-2 py-0.5 text-xs focus:outline-none focus:border-[#00f2fe] cursor-pointer"
          >
            <option value="16:9">16:9 (Landscape YouTube)</option>
            <option value="9:16">9:16 (Vertical TikTok / Shorts)</option>
            <option value="1:1">1:1 (Square Instagram)</option>
            <option value="4:3">4:3 (Classic TV)</option>
            <option value="21:9">21:9 (Ultrawide Cinematic)</option>
          </select>
        </div>

        {/* Center: Low-End PC Preview Quality Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#202026] px-2 py-0.5 rounded border border-[#2c2c36]">
            <span className="text-[11px] text-[#8e8e9a]">Preview:</span>
            <select
              value={lowSpecSettings.previewQuality}
              onChange={(e) => updateLowSpecSettings({ previewQuality: e.target.value as any })}
              className="bg-transparent text-[#00f2fe] font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="full" className="bg-[#18181c] text-[#e0e0e6]">100% Full</option>
              <option value="half" className="bg-[#18181c] text-[#e0e0e6]">50% 1/2 (Smooth PC)</option>
              <option value="quarter" className="bg-[#18181c] text-[#e0e0e6]">25% 1/4 (Low-End PC)</option>
            </select>
            {lowSpecSettings.previewQuality !== 'full' && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded font-mono">
                {lowSpecSettings.previewQuality === 'half' ? '1/2 GPU' : '1/4 GPU'}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowSafeGuides((p) => !p)}
            title="Toggle Safe Area Guides (Action & Title Safe)"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors border ${
              showSafeGuides
                ? 'bg-[#00f2fe]/10 text-[#00f2fe] border-[#00f2fe]/40'
                : 'text-[#8e8e9a] hover:text-white border-transparent'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Safe Area</span>
          </button>
        </div>

        {/* Right: Monitor Zoom */}
        <div className="flex items-center gap-2">
          <select
            value={zoomLevel}
            onChange={(e) => setZoomLevel(e.target.value as any)}
            className="bg-[#202026] text-[#c0c0ca] border border-[#2c2c36] rounded px-1.5 py-0.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="fit">Fit</option>
            <option value="50%">50%</option>
            <option value="100%">100%</option>
          </select>
          <button
            onClick={handleFullscreen}
            title="Fullscreen Preview"
            className="p-1 hover:text-white hover:bg-[#202026] rounded transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 flex items-center justify-center p-3 relative overflow-hidden bg-[#0c0c0e]">
        <div
          className="relative shadow-2xl flex items-center justify-center border border-[#1f1f26] rounded-sm bg-black overflow-hidden transition-all duration-150"
          style={{
            aspectRatio: aspectConfig.cssRatio,
            maxHeight: '100%',
            maxWidth: '100%',
            height: zoomLevel === '100%' ? `${aspectConfig.height}px` : zoomLevel === '50%' ? `${aspectConfig.height * 0.5}px` : '100%',
            width: zoomLevel === '100%' ? `${aspectConfig.width}px` : zoomLevel === '50%' ? `${aspectConfig.width * 0.5}px` : 'auto',
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block select-none"
            style={{
              imageRendering: isPlaying && lowSpecSettings.previewQuality === 'quarter' ? 'pixelated' : 'auto',
            }}
          />

          {/* Low-End PC Live Status Watermark (subtle, non-intrusive) */}
          {isPlaying && lowSpecSettings.previewQuality !== 'full' && (
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[#00f2fe] text-[10px] px-1.5 py-0.5 rounded font-mono border border-cyan-500/20 pointer-events-none">
              PROXY {lowSpecSettings.previewQuality === 'half' ? '1/2' : '1/4'}
            </div>
          )}
        </div>
      </div>

      {/* Player Transport Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#18181c] border-t border-[#24242c]">
        {/* Timecode readout (Tabular mono numbers) */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-wider text-[#00f2fe]">
            {formatTimecode(currentTime, project.settings.fps)}
          </span>
          <span className="text-[#60606f] font-mono text-xs">/</span>
          <span className="font-mono text-xs text-[#8e8e9a]">
            {formatTimecode(project.duration, project.settings.fps)}
          </span>
        </div>

        {/* Center Transport Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Jump to In Point */}
          <button
            onClick={jumpToInPoint}
            title={inPoint != null ? `Jump to In Point: ${formatTimecode(inPoint, project.settings.fps)} (Shift+I)` : 'Jump to Beginning'}
            className="p-1.5 rounded-full hover:bg-[#262630] text-[#a0a0ab] hover:text-[#00f2fe] transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Frame */}
          <button
            onClick={() => stepFrame(-1)}
            title="Previous Frame (Left Arrow)"
            className="p-1.5 rounded-full hover:bg-[#262630] text-[#a0a0ab] hover:text-white transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            title="Play / Pause (Space)"
            className={`p-2.5 rounded-full font-bold shadow-md transition-transform active:scale-95 ${
              isPlaying
                ? 'bg-[#00f2fe] text-[#121214] hover:bg-[#1ce5f0]'
                : 'bg-white text-[#121214] hover:bg-[#e0e0e6]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Next Frame */}
          <button
            onClick={() => stepFrame(1)}
            title="Next Frame (Right Arrow)"
            className="p-1.5 rounded-full hover:bg-[#262630] text-[#a0a0ab] hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Jump to Out Point */}
          <button
            onClick={jumpToOutPoint}
            title={outPoint != null ? `Jump to Out Point: ${formatTimecode(outPoint, project.settings.fps)} (Shift+O)` : 'Jump to End'}
            className="p-1.5 rounded-full hover:bg-[#262630] text-[#a0a0ab] hover:text-[#00f2fe] transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-[#2a2a34] mx-1" />

          {/* Loop Preview Toggle */}
          <button
            onClick={toggleLooping}
            title={`Loop Preview: ${isLooping ? 'ON (Looping In-to-Out Range)' : 'OFF (Plays Once)'} (Ctrl+L)`}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${
              isLooping
                ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/40'
                : 'hover:bg-[#262630] text-[#6c6c7a] hover:text-[#a0a0ab]'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium hidden md:inline">Loop</span>
          </button>
        </div>

        {/* Right Volume & Export Action */}
        <div className="flex items-center gap-3">
          {/* Master Audio Slider */}
          <div className="flex items-center gap-1.5 group">
            <button
              onClick={handleToggleMute}
              className="text-[#a0a0ab] hover:text-white p-1 rounded transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#00f2fe]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="150"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-16 h-1 bg-[#282834] rounded-lg appearance-none cursor-pointer"
              title={`Master Volume: ${volume}%`}
            />
          </div>

          {/* Quick Export Trigger Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#00f2fe] to-[#00b4d8] hover:from-[#1ce5f0] hover:to-[#0096c7] text-[#121214] font-semibold text-xs rounded transition-all shadow-sm active:scale-95"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};
