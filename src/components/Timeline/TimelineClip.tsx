import React, { useRef, useState } from 'react';
import { ClipItem, TrackType } from '../../types/editor';
import { useEditor } from '../../context/EditorContext';
import { Volume2, Type, Sparkles, Video, Music } from 'lucide-react';

interface TimelineClipProps {
  clip: ClipItem;
  trackType: TrackType;
  timelineZoom: number;
}

export const TimelineClip: React.FC<TimelineClipProps> = ({ clip, trackType, timelineZoom }) => {
  const {
    selectedClipId,
    setSelectedClipId,
    updateClip,
    snappingEnabled,
    currentTime,
    splitClipAtPlayhead,
    removeClip,
    duplicateClip,
  } = useEditor();

  const isSelected = selectedClipId === clip.id;
  const clipRef = useRef<HTMLDivElement | null>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialStart, setInitialStart] = useState(0);

  // Trimming state
  const [isTrimmingLeft, setIsTrimmingLeft] = useState(false);
  const [isTrimmingRight, setIsTrimmingRight] = useState(false);
  const [initialDuration, setInitialDuration] = useState(0);

  const clipLeft = clip.start * timelineZoom;
  const clipWidth = Math.max(16, clip.duration * timelineZoom);

  // Mouse drag moving clip
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    e.stopPropagation();
    setSelectedClipId(clip.id);

    setIsDragging(true);
    setDragStartX(e.clientX);
    setInitialStart(clip.start);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - e.clientX;
      const deltaTime = deltaX / timelineZoom;
      let newStart = Math.max(0, initialStart + deltaTime);

      // Snap to playhead if nearby
      if (snappingEnabled && Math.abs(newStart - currentTime) < 0.25) {
        newStart = currentTime;
      }

      updateClip(clip.id, { start: Number(newStart.toFixed(2)) });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Left Trim Handle
  const handleLeftTrimMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTrimmingLeft(true);
    const startX = e.clientX;
    const origStart = clip.start;
    const origDur = clip.duration;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / timelineZoom;
      const proposedStart = origStart + deltaTime;
      const proposedDur = origDur - deltaTime;

      if (proposedDur >= 0.2 && proposedStart >= 0) {
        updateClip(clip.id, {
          start: Number(proposedStart.toFixed(2)),
          duration: Number(proposedDur.toFixed(2)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsTrimmingLeft(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Right Trim Handle
  const handleRightTrimMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTrimmingRight(true);
    const startX = e.clientX;
    const origDur = clip.duration;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / timelineZoom;
      const proposedDur = Math.max(0.2, origDur + deltaTime);

      updateClip(clip.id, {
        duration: Number(proposedDur.toFixed(2)),
      });
    };

    const handleMouseUp = () => {
      setIsTrimmingRight(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Background styling based on track type
  const getClipStyle = () => {
    switch (trackType) {
      case 'video':
        return 'bg-[#252834] border-[#383d4e] text-cyan-200';
      case 'audio':
        return 'bg-[#18342b] border-[#225243] text-emerald-200';
      case 'text':
        return 'bg-[#3b2b1a] border-[#5a4126] text-amber-200';
      case 'effect':
        return 'bg-[#311f3d] border-[#4f2f63] text-purple-200';
      default:
        return 'bg-[#22222a] border-[#30303c] text-gray-200';
    }
  };

  return (
    <div
      ref={clipRef}
      onMouseDown={handleMouseDown}
      style={{
        left: `${clipLeft}px`,
        width: `${clipWidth}px`,
      }}
      className={`absolute top-1 bottom-1 rounded-md border flex items-center overflow-hidden cursor-grab active:cursor-grabbing select-none transition-shadow ${getClipStyle()} ${
        isSelected
          ? 'ring-2 ring-[#00f2fe] border-transparent shadow-lg shadow-cyan-500/20 z-10'
          : 'hover:brightness-110 z-1'
      }`}
    >
      {/* Left Trim Handle */}
      <div
        onMouseDown={handleLeftTrimMouseDown}
        className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/30 hover:bg-[#00f2fe] cursor-ew-resize flex items-center justify-center transition-colors z-20 group"
        title="Trim Start"
      >
        <div className="w-0.5 h-3 bg-white/40 group-hover:bg-[#121214] rounded-full" />
      </div>

      {/* Clip Content Preview */}
      <div className="flex-1 flex items-center px-3 h-full overflow-hidden gap-1.5 pointer-events-none">
        {/* Thumbnail Preview for Video */}
        {clip.thumbnail && (
          <img
            src={clip.thumbnail}
            alt=""
            className="w-7 h-5 object-cover rounded shrink-0 opacity-80"
          />
        )}

        {trackType === 'audio' && (
          <div className="flex items-center gap-0.5 h-4 opacity-70 shrink-0">
            {[40, 70, 95, 60, 85, 45, 100, 75, 50, 90].map((h, i) => (
              <span
                key={i}
                className="w-0.5 bg-emerald-400 rounded-full"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        )}

        {trackType === 'text' && <Type className="w-3.5 h-3.5 text-amber-300 shrink-0" />}

        <span className="text-[11px] font-medium truncate text-white drop-shadow-sm">
          {clip.name}
        </span>

        {/* Clip Duration Badge */}
        <span className="text-[9px] font-mono opacity-60 ml-auto shrink-0">
          {clip.duration.toFixed(1)}s
        </span>
      </div>

      {/* Right Trim Handle */}
      <div
        onMouseDown={handleRightTrimMouseDown}
        className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/30 hover:bg-[#00f2fe] cursor-ew-resize flex items-center justify-center transition-colors z-20 group"
        title="Trim End"
      >
        <div className="w-0.5 h-3 bg-white/40 group-hover:bg-[#121214] rounded-full" />
      </div>
    </div>
  );
};
