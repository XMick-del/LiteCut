import React, { useRef, useState, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { TimelineClip } from './TimelineClip';
import { formatTimecode } from '../../utils/timeFormat';
import {
  MousePointer,
  Scissors,
  Trash2,
  Magnet,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Layers,
  Repeat,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export const Timeline: React.FC = () => {
  const {
    project,
    currentTime,
    setCurrentTime,
    selectedClipId,
    setSelectedClipId,
    activeTool,
    setActiveTool,
    snappingEnabled,
    toggleSnapping,
    rippleEditEnabled,
    toggleRippleEdit,
    timelineZoom,
    setTimelineZoom,
    splitClipAtPlayhead,
    removeClip,
    duplicateClip,
    updateTrack,
    inPoint,
    outPoint,
    isLooping,
    setInPoint,
    setOutPoint,
    clearInOutPoints,
    toggleLooping,
    jumpToInPoint,
    jumpToOutPoint,
    splitAtInOutPoints,
    deleteRangeInOut,
  } = useEditor();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isScrubbingRef = useRef<boolean>(false);
  const [isDraggingIn, setIsDraggingIn] = useState<boolean>(false);
  const [isDraggingOut, setIsDraggingOut] = useState<boolean>(false);

  // Ruler tick generation
  const totalSeconds = Math.max(15, project.duration + 2);
  const totalWidth = totalSeconds * timelineZoom;

  // Handle playhead scrubbing when clicking/dragging on the time ruler
  const handleRulerMouseDown = (e: React.MouseEvent) => {
    isScrubbingRef.current = true;
    updateTimeFromMouse(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (isScrubbingRef.current) {
        updateTimeFromMouse(moveEvent.clientX);
      }
    };

    const handleMouseUp = () => {
      isScrubbingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const updateTimeFromMouse = (clientX: number) => {
    if (!scrollContainerRef.current) return;
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const offsetX = clientX - rect.left + scrollLeft;
    const newTime = Math.max(0, offsetX / timelineZoom);
    setCurrentTime(newTime);
  };

  // Dragging In Handle on Ruler
  const handleInHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingIn(true);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!scrollContainerRef.current) return;
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const offsetX = moveEvent.clientX - rect.left + scrollLeft;
      const newIn = Math.max(0, offsetX / timelineZoom);
      setInPoint(newIn);
    };
    const handleMouseUp = () => {
      setIsDraggingIn(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Dragging Out Handle on Ruler
  const handleOutHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingOut(true);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!scrollContainerRef.current) return;
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const offsetX = moveEvent.clientX - rect.left + scrollLeft;
      const newOut = Math.max(0, offsetX / timelineZoom);
      setOutPoint(newOut);
    };
    const handleMouseUp = () => {
      setIsDraggingOut(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setTimelineZoom(Math.max(15, Math.min(160, timelineZoom + delta)));
  };

  // Ctrl + Wheel to zoom timeline
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleZoom(e.deltaY < 0 ? 8 : -8);
    }
  };

  // Render second marks on ruler
  const renderRulerTicks = () => {
    const ticks = [];
    const interval = timelineZoom < 30 ? 2 : 1; // interval in seconds

    for (let sec = 0; sec <= totalSeconds; sec += interval) {
      const left = sec * timelineZoom;
      ticks.push(
        <div
          key={sec}
          style={{ left: `${left}px` }}
          className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
        >
          <span className="text-[9px] font-mono text-[#6c6c7a] select-none pl-1">
            {formatTimecode(sec, project.settings.fps)}
          </span>
          <div className="w-px h-2 bg-[#2e2e38]" />
        </div>
      );
    }
    return ticks;
  };

  const hasRange = inPoint != null && outPoint != null && inPoint < outPoint;
  const inPosition = inPoint != null ? inPoint * timelineZoom : 0;
  const outPosition = outPoint != null ? outPoint * timelineZoom : 0;
  const rangeWidth = hasRange ? (outPoint! - inPoint!) * timelineZoom : 0;
  const rangeDuration = hasRange ? (outPoint! - inPoint!).toFixed(2) : null;

  return (
    <div
      className="flex flex-col h-full bg-[#18181c] border-t border-[#24242c] select-none overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Timeline Action Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141417] border-b border-[#24242c] text-xs text-[#a0a0ab]">
        {/* Left Editing Tools */}
        <div className="flex items-center gap-1">
          {/* Select Tool (V) */}
          <button
            onClick={() => setActiveTool('select')}
            title="Selection Tool (V)"
            className={`p-1.5 rounded flex items-center gap-1 transition-colors ${
              activeTool === 'select'
                ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/40'
                : 'hover:bg-[#202028] text-[#a0a0ab] hover:text-white'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Select</span>
          </button>

          {/* Split / Razor Cut Tool (B) */}
          <button
            onClick={() => {
              setActiveTool('split');
              splitClipAtPlayhead();
            }}
            title="Split at Playhead (Ctrl+B / B)"
            className={`p-1.5 rounded flex items-center gap-1 transition-colors ${
              activeTool === 'split'
                ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/40'
                : 'hover:bg-[#202028] text-[#a0a0ab] hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Split</span>
          </button>

          {/* Delete (Del) */}
          <button
            onClick={() => {
              if (selectedClipId) removeClip(selectedClipId);
            }}
            disabled={!selectedClipId}
            title="Delete Selected Clip (Del)"
            className="p-1.5 rounded hover:bg-[#202028] text-[#a0a0ab] hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate (Ctrl+D) */}
          <button
            onClick={() => {
              if (selectedClipId) duplicateClip(selectedClipId);
            }}
            disabled={!selectedClipId}
            title="Duplicate Selected Clip (Ctrl+D)"
            className="p-1.5 rounded hover:bg-[#202028] text-[#a0a0ab] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-[#2c2c36] mx-1" />

          {/* Magnet Snapping (N) */}
          <button
            onClick={toggleSnapping}
            title="Toggle Snapping Magnet (N)"
            className={`p-1.5 rounded flex items-center gap-1 transition-colors ${
              snappingEnabled
                ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30'
                : 'hover:bg-[#202028] text-[#6c6c7a] hover:text-[#a0a0ab]'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden md:inline">Snapping</span>
          </button>

          <div className="w-px h-4 bg-[#2c2c36] mx-1" />

          {/* Precision In / Out Marker Controls */}
          <div className="flex items-center gap-1 bg-[#1a1a20] px-1 py-0.5 rounded border border-[#262632]">
            {/* Mark In (I) */}
            <button
              onClick={() => setInPoint()}
              title="Set In Point at Playhead (I)"
              className="px-2 py-0.5 rounded hover:bg-[#282834] text-[#e0e0e6] hover:text-[#00f2fe] font-mono text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <span className="text-[#00f2fe] font-bold">[</span>
              <span>In</span>
            </button>

            {/* Mark Out (O) */}
            <button
              onClick={() => setOutPoint()}
              title="Set Out Point at Playhead (O)"
              className="px-2 py-0.5 rounded hover:bg-[#282834] text-[#e0e0e6] hover:text-[#00f2fe] font-mono text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <span>Out</span>
              <span className="text-[#00f2fe] font-bold">]</span>
            </button>

            {/* Clear In / Out (Alt+X) */}
            {(inPoint != null || outPoint != null) && (
              <button
                onClick={clearInOutPoints}
                title="Clear In / Out Markers (Alt+X)"
                className="p-1 hover:bg-[#282834] text-[#8e8e9a] hover:text-rose-400 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Preview Looping Toggle */}
            <button
              onClick={toggleLooping}
              title={`Preview Loop: ${isLooping ? 'ON (Looping In-to-Out Range)' : 'OFF'}`}
              className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                isLooping
                  ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40'
                  : 'hover:bg-[#282834] text-[#6c6c7a]'
              }`}
            >
              <Repeat className="w-3 h-3" />
            </button>

            {/* Precision Cut In/Out Range */}
            {hasRange && (
              <button
                onClick={splitAtInOutPoints}
                title="Precision Split All Tracks at In & Out Points"
                className="px-2 py-0.5 bg-[#252532] hover:bg-[#2e2e40] text-cyan-300 hover:text-white rounded text-[11px] font-medium border border-cyan-500/30 transition-colors flex items-center gap-1"
              >
                <Scissors className="w-3 h-3" />
                <span className="hidden xl:inline">Cut Range</span>
              </button>
            )}

            {/* Delete Range In/Out */}
            {hasRange && (
              <button
                onClick={() => deleteRangeInOut(false)}
                title="Delete Range Between In & Out"
                className="p-1 hover:bg-[#282834] text-[#8e8e9a] hover:text-rose-400 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Current Playhead & Range Readout */}
        <div className="flex items-center gap-2">
          {hasRange && (
            <div className="hidden lg:flex items-center gap-1.5 bg-[#181822] px-2 py-0.5 rounded border border-[#00f2fe]/30 font-mono text-[10px] text-[#00f2fe]">
              <span className="text-[#8e8e9a]">Range:</span>
              <span className="font-semibold">{rangeDuration}s</span>
              <span className="text-[#4e4e5e]">({formatTimecode(inPoint!, project.settings.fps)} → {formatTimecode(outPoint!, project.settings.fps)})</span>
            </div>
          )}

          <div className="font-mono text-xs font-semibold text-[#00f2fe] tracking-wider bg-[#1c1c22] px-2.5 py-0.5 rounded border border-[#2a2a34]">
            {formatTimecode(currentTime, project.settings.fps)}
          </div>
        </div>

        {/* Right: Zoom slider controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(-10)}
            title="Zoom Out"
            className="p-1 hover:text-white hover:bg-[#202028] rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="20"
            max="120"
            value={timelineZoom}
            onChange={(e) => setTimelineZoom(Number(e.target.value))}
            className="w-20 h-1 bg-[#282834] rounded appearance-none cursor-pointer"
            title={`Timeline Zoom: ${timelineZoom}px/s`}
          />

          <button
            onClick={() => handleZoom(10)}
            title="Zoom In"
            className="p-1 hover:text-white hover:bg-[#202028] rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tracks & Ruler Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Track Headers */}
        <div className="w-48 bg-[#141417] border-r border-[#24242c] shrink-0 flex flex-col pt-7 z-10 shadow-md">
          {project.tracks.map((track) => (
            <div
              key={track.id}
              className="h-14 px-3 flex items-center justify-between border-b border-[#202026] hover:bg-[#1a1a20] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium text-[#e0e0e6] truncate">
                  {track.name}
                </span>
              </div>

              {/* Track Controls: Mute, Lock, Hide */}
              <div className="flex items-center gap-1 shrink-0 text-[#6c6c7a]">
                <button
                  onClick={() => updateTrack(track.id, { muted: !track.muted })}
                  title={track.muted ? 'Unmute Track' : 'Mute Track'}
                  className={`p-1 rounded hover:bg-[#282834] transition-colors ${
                    track.muted ? 'text-rose-400' : 'hover:text-white'
                  }`}
                >
                  {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => updateTrack(track.id, { hidden: !track.hidden })}
                  title={track.hidden ? 'Show Track' : 'Hide Track'}
                  className={`p-1 rounded hover:bg-[#282834] transition-colors ${
                    track.hidden ? 'text-amber-400' : 'hover:text-white'
                  }`}
                >
                  {track.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Scrollable Area: Ruler + Track Clip Lanes */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#101013]"
          onClick={() => setSelectedClipId(null)}
        >
          <div style={{ width: `${Math.max(800, totalWidth)}px` }} className="relative h-full">
            {/* Top Time Ruler */}
            <div
              onMouseDown={handleRulerMouseDown}
              className="h-7 bg-[#16161a] border-b border-[#24242c] relative cursor-pointer hover:bg-[#1a1a20] transition-colors select-none sticky top-0 z-20"
            >
              {renderRulerTicks()}

              {/* In / Out Range Highlight on Ruler */}
              {hasRange && (
                <div
                  style={{
                    left: `${inPosition}px`,
                    width: `${rangeWidth}px`,
                  }}
                  className="absolute top-0 bottom-0 bg-[#00f2fe]/20 border-y border-[#00f2fe]/70 pointer-events-none"
                />
              )}

              {/* In Marker Handle on Ruler */}
              {inPoint != null && (
                <div
                  style={{ left: `${inPosition}px` }}
                  onMouseDown={handleInHandleMouseDown}
                  title={`In Marker: ${formatTimecode(inPoint, project.settings.fps)} (Drag to adjust)`}
                  className="absolute top-0 bottom-0 z-25 flex items-center cursor-ew-resize group"
                >
                  <div className="w-3 h-full bg-[#00f2fe] text-[#121214] flex items-center justify-center font-black text-[10px] rounded-r-xs shadow-md shadow-cyan-500/50 border border-white/30 select-none">
                    [
                  </div>
                  <div className="absolute -top-4 left-0 bg-[#00f2fe] text-[#121214] font-mono text-[9px] font-bold px-1 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                    IN {formatTimecode(inPoint, project.settings.fps)}
                  </div>
                </div>
              )}

              {/* Out Marker Handle on Ruler */}
              {outPoint != null && (
                <div
                  style={{ left: `${outPosition}px` }}
                  onMouseDown={handleOutHandleMouseDown}
                  title={`Out Marker: ${formatTimecode(outPoint, project.settings.fps)} (Drag to adjust)`}
                  className="absolute top-0 bottom-0 z-25 flex items-center -ml-3 cursor-ew-resize group"
                >
                  <div className="w-3 h-full bg-[#00f2fe] text-[#121214] flex items-center justify-center font-black text-[10px] rounded-l-xs shadow-md shadow-cyan-500/50 border border-white/30 select-none">
                    ]
                  </div>
                  <div className="absolute -top-4 right-0 bg-[#00f2fe] text-[#121214] font-mono text-[9px] font-bold px-1 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                    OUT {formatTimecode(outPoint, project.settings.fps)}
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Playhead Needle Indicator (Red CapCut Needle) */}
            <div
              style={{
                left: `${currentTime * timelineZoom}px`,
                transform: 'translateX(-50%)',
              }}
              className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
            >
              {/* Needle Head Triangle */}
              <div
                className="w-3.5 h-3.5 bg-rose-500 rounded-b-xs shadow-md shadow-rose-500/50 -mt-0.5 cursor-ew-resize pointer-events-auto"
                onMouseDown={handleRulerMouseDown}
              />
              {/* Vertical Laser Line */}
              <div className="w-0.5 flex-1 bg-rose-500/90 shadow-xs shadow-rose-500" />
            </div>

            {/* In / Out Vertical Range Band Across All Tracks */}
            {hasRange && (
              <div
                style={{
                  left: `${inPosition}px`,
                  width: `${rangeWidth}px`,
                  top: '28px',
                }}
                className="absolute bottom-0 bg-[#00f2fe]/5 border-x border-[#00f2fe]/35 pointer-events-none z-10"
              />
            )}

            {/* Track Lanes */}
            <div className="flex flex-col">
              {project.tracks.map((track) => (
                <div
                  key={track.id}
                  className={`h-14 border-b border-[#1c1c24] relative flex items-center transition-colors ${
                    track.hidden ? 'opacity-40' : ''
                  } ${track.type === 'video' ? 'bg-[#121216]' : 'bg-[#101013]'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // move playhead to clicked time on track
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    setCurrentTime(offsetX / timelineZoom);
                  }}
                >
                  {/* Subtle Grid background lines */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-5"
                    style={{
                      backgroundImage: `repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent ${timelineZoom}px)`,
                    }}
                  />

                  {/* Render clips on track */}
                  {track.clips.map((clip) => (
                    <TimelineClip
                      key={clip.id}
                      clip={clip}
                      trackType={track.type}
                      timelineZoom={timelineZoom}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
