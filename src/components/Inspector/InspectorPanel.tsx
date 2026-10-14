import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { FilterType } from '../../types/editor';
import { Sliders, Type, Volume2, Gauge, Trash2, Copy, Scissors, Eye, Layers } from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const {
    project,
    selectedClip,
    updateClip,
    removeClip,
    duplicateClip,
    splitClipAtPlayhead,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'speed' | 'text'>('video');

  // If text clip selected, default to text tab
  React.useEffect(() => {
    if (selectedClip?.type === 'text') {
      setActiveTab('text');
    } else if (selectedClip?.type === 'audio') {
      setActiveTab('audio');
    } else {
      setActiveTab('video');
    }
  }, [selectedClip?.id, selectedClip?.type]);

  if (!selectedClip) {
    return (
      <div className="w-72 bg-[#18181c] border-l border-[#24242c] flex flex-col h-full text-xs text-[#a0a0ab]">
        <div className="p-3 border-b border-[#24242c] font-semibold text-[#e0e0e6] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00f2fe]" />
          <span>Project Properties</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[#6c6c7a] block mb-1">Project Name</label>
            <div className="p-2 bg-[#202026] rounded border border-[#2a2a34] text-white font-medium">
              {project.name}
            </div>
          </div>
          <div>
            <label className="text-[#6c6c7a] block mb-1">Canvas Resolution</label>
            <div className="p-2 bg-[#202026] rounded border border-[#2a2a34] text-white font-mono">
              {project.settings.width} × {project.settings.height} ({project.settings.aspectRatio})
            </div>
          </div>
          <div>
            <label className="text-[#6c6c7a] block mb-1">Frame Rate</label>
            <div className="p-2 bg-[#202026] rounded border border-[#2a2a34] text-white font-mono">
              {project.settings.fps} FPS
            </div>
          </div>
          <div>
            <label className="text-[#6c6c7a] block mb-1">Timeline Length</label>
            <div className="p-2 bg-[#202026] rounded border border-[#2a2a34] text-white font-mono">
              {project.duration.toFixed(1)} seconds
            </div>
          </div>

          <div className="pt-4 border-t border-[#24242c]">
            <p className="text-[11px] text-[#6c6c7a] leading-relaxed">
              💡 Select any clip on the timeline to edit its scale, position, color grade, chroma key, audio volume, or text captions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-76 bg-[#18181c] border-l border-[#24242c] flex flex-col h-full text-xs text-[#a0a0ab] overflow-hidden">
      {/* Header with clip title & quick action icons */}
      <div className="p-2.5 px-3 border-b border-[#24242c] flex items-center justify-between bg-[#141417]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-[#e0e0e6] truncate">{selectedClip.name}</span>
          <span className="bg-[#24242e] text-[10px] text-[#00f2fe] px-1.5 py-0.2 rounded uppercase font-mono">
            {selectedClip.type}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => splitClipAtPlayhead(selectedClip.id)}
            title="Split Clip at Playhead (Ctrl+B)"
            className="p-1 hover:text-[#00f2fe] hover:bg-[#202026] rounded transition-colors"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => duplicateClip(selectedClip.id)}
            title="Duplicate Clip (Ctrl+D)"
            className="p-1 hover:text-white hover:bg-[#202026] rounded transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => removeClip(selectedClip.id)}
            title="Delete Clip (Del)"
            className="p-1 hover:text-rose-400 hover:bg-[#202026] rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#24242c] bg-[#161619]">
        {selectedClip.type === 'text' && (
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'text'
                ? 'border-[#00f2fe] text-white bg-[#1a1a20]'
                : 'border-transparent text-[#8e8e9a] hover:text-[#e0e0e6]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text</span>
          </button>
        )}

        {selectedClip.type === 'video' && (
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'video'
                ? 'border-[#00f2fe] text-white bg-[#1a1a20]'
                : 'border-transparent text-[#8e8e9a] hover:text-[#e0e0e6]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'audio'
              ? 'border-[#00f2fe] text-white bg-[#1a1a20]'
              : 'border-transparent text-[#8e8e9a] hover:text-[#e0e0e6]'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('speed')}
          className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'speed'
              ? 'border-[#00f2fe] text-white bg-[#1a1a20]'
              : 'border-transparent text-[#8e8e9a] hover:text-[#e0e0e6]'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Speed</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TEXT TAB */}
        {activeTab === 'text' && selectedClip.type === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="text-[#8e8e9a] block mb-1 font-medium">Text Content</label>
              <textarea
                value={selectedClip.text || ''}
                onChange={(e) => updateClip(selectedClip.id, { text: e.target.value })}
                rows={3}
                className="w-full bg-[#202026] text-white rounded p-2 text-xs border border-[#2a2a34] focus:outline-none focus:border-[#00f2fe]"
                placeholder="Enter title or subtitles..."
              />
            </div>

            <div>
              <label className="text-[#8e8e9a] block mb-1 font-medium">CapCut Pro Text Style</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'glowing', label: 'Glowing Neon' },
                  { id: 'bold-yellow', label: 'Viral Yellow' },
                  { id: 'standard', label: 'Classic Box' },
                  { id: 'minimal', label: 'Minimalist' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => updateClip(selectedClip.id, { textStyle: st.id as any })}
                    className={`py-1.5 px-2 rounded text-[11px] font-medium border transition-colors ${
                      selectedClip.textStyle === st.id
                        ? 'bg-[#00f2fe]/10 border-[#00f2fe] text-[#00f2fe]'
                        : 'bg-[#202026] border-[#2a2a34] text-[#a0a0ab] hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8e8e9a]">Font Size</span>
                <span className="font-mono text-white">{selectedClip.fontSize || 40}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="90"
                value={selectedClip.fontSize || 40}
                onChange={(e) => updateClip(selectedClip.id, { fontSize: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#8e8e9a] block mb-1">Text Color</label>
                <input
                  type="color"
                  value={selectedClip.textColor || '#ffffff'}
                  onChange={(e) => updateClip(selectedClip.id, { textColor: e.target.value })}
                  className="w-full h-7 rounded bg-[#202026] border border-[#2a2a34] cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[#8e8e9a] block mb-1">Outline Stroke</label>
                <input
                  type="color"
                  value={selectedClip.strokeColor || '#00f2fe'}
                  onChange={(e) => updateClip(selectedClip.id, { strokeColor: e.target.value })}
                  className="w-full h-7 rounded bg-[#202026] border border-[#2a2a34] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* VIDEO TAB */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            {/* Scale */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8e8e9a]">Scale</span>
                <span className="font-mono text-white">{selectedClip.scale || 100}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                value={selectedClip.scale || 100}
                onChange={(e) => updateClip(selectedClip.id, { scale: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Position X and Y */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#8e8e9a] block mb-1">Position X</label>
                <input
                  type="number"
                  value={selectedClip.x || 0}
                  onChange={(e) => updateClip(selectedClip.id, { x: Number(e.target.value) })}
                  className="w-full bg-[#202026] text-white rounded p-1.5 text-xs border border-[#2a2a34] font-mono focus:border-[#00f2fe]"
                />
              </div>
              <div>
                <label className="text-[#8e8e9a] block mb-1">Position Y</label>
                <input
                  type="number"
                  value={selectedClip.y || 0}
                  onChange={(e) => updateClip(selectedClip.id, { y: Number(e.target.value) })}
                  className="w-full bg-[#202026] text-white rounded p-1.5 text-xs border border-[#2a2a34] font-mono focus:border-[#00f2fe]"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8e8e9a]">Rotation</span>
                <span className="font-mono text-white">{selectedClip.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedClip.rotation || 0}
                onChange={(e) => updateClip(selectedClip.id, { rotation: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8e8e9a]">Opacity</span>
                <span className="font-mono text-white">{selectedClip.opacity ?? 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedClip.opacity ?? 100}
                onChange={(e) => updateClip(selectedClip.id, { opacity: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Blend Mode */}
            <div>
              <label className="text-[#8e8e9a] block mb-1 font-medium">Blend Mode</label>
              <select
                value={selectedClip.blendMode || 'normal'}
                onChange={(e) => updateClip(selectedClip.id, { blendMode: e.target.value as any })}
                className="w-full bg-[#202026] text-white rounded p-1.5 text-xs border border-[#2a2a34] focus:outline-none focus:border-[#00f2fe]"
              >
                <option value="normal">Normal</option>
                <option value="screen">Screen (Lighten)</option>
                <option value="multiply">Multiply (Darken)</option>
                <option value="overlay">Overlay (High Contrast)</option>
              </select>
            </div>

            {/* Color LUT Filters */}
            <div>
              <label className="text-[#8e8e9a] block mb-1 font-medium">Color Grade (LUT Filter)</label>
              <select
                value={selectedClip.filter || 'none'}
                onChange={(e) => updateClip(selectedClip.id, { filter: e.target.value as FilterType })}
                className="w-full bg-[#202026] text-white rounded p-1.5 text-xs border border-[#2a2a34] focus:outline-none focus:border-[#00f2fe]"
              >
                <option value="none">None (Natural)</option>
                <option value="teal-orange">Teal & Orange (Cinema Blockbuster)</option>
                <option value="cyber">Cyber Neon (Sci-Fi / Matrix)</option>
                <option value="moody">Moody Dark (Dramatic Shadow)</option>
                <option value="vintage">Vintage Kodachrome 90s</option>
                <option value="noir">Noir Monochrome Black & White</option>
                <option value="vibrant">Vibrant Pop (Social Media Boost)</option>
                <option value="glow">Soft Glow Bloom</option>
              </select>
            </div>

            {/* Chroma Key / Green Screen */}
            <div className="pt-2 border-t border-[#24242c]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[#e0e0e6]">Chroma Key (Cutout)</span>
                <input
                  type="checkbox"
                  checked={selectedClip.chromaKey || false}
                  onChange={(e) => updateClip(selectedClip.id, { chromaKey: e.target.checked })}
                  className="rounded border-[#2a2a34] text-[#00f2fe] focus:ring-0 cursor-pointer"
                />
              </div>
              {selectedClip.chromaKey && (
                <div className="space-y-2 bg-[#121214] p-2 rounded border border-[#24242c]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#8e8e9a]">Key Color</span>
                    <input
                      type="color"
                      value={selectedClip.chromaColor || '#00ff00'}
                      onChange={(e) => updateClip(selectedClip.id, { chromaColor: e.target.value })}
                      className="w-8 h-5 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#8e8e9a]">Intensity</span>
                      <span className="font-mono text-white">{selectedClip.chromaSimilarity || 40}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={selectedClip.chromaSimilarity || 40}
                      onChange={(e) => updateClip(selectedClip.id, { chromaSimilarity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUDIO TAB */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8e8e9a]">Clip Volume</span>
                <span className="font-mono text-white">{selectedClip.volume || 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={selectedClip.volume || 100}
                onChange={(e) => updateClip(selectedClip.id, { volume: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#8e8e9a] block mb-1">Fade In (sec)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={selectedClip.fadeIn || 0}
                  onChange={(e) => updateClip(selectedClip.id, { fadeIn: Number(e.target.value) })}
                  className="w-full bg-[#202026] text-white rounded p-1.5 text-xs border border-[#2a2a34] font-mono"
                />
              </div>
              <div>
                <label className="text-[#8e8e9a] block mb-1">Fade Out (sec)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={selectedClip.fadeOut || 0}
                  onChange={(e) => updateClip(selectedClip.id, { fadeOut: Number(e.target.value) })}
                  className="w-full bg-[#202026] text-white rounded p-1.5 text-xs border border-[#2a2a34] font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#24242c] flex items-center justify-between">
              <span className="text-[#8e8e9a]">Mute Audio</span>
              <input
                type="checkbox"
                checked={selectedClip.muted || false}
                onChange={(e) => updateClip(selectedClip.id, { muted: e.target.checked })}
                className="rounded border-[#2a2a34] text-[#00f2fe] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* SPEED TAB */}
        {activeTab === 'speed' && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8e8e9a]">Playback Speed</span>
                <span className="font-mono text-[#00f2fe] font-semibold">{selectedClip.speed || 1.0}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.1"
                value={selectedClip.speed || 1.0}
                onChange={(e) => {
                  const newSpeed = Number(e.target.value);
                  const durationRatio = (selectedClip.speed || 1.0) / newSpeed;
                  updateClip(selectedClip.id, {
                    speed: newSpeed,
                    duration: Math.max(0.2, selectedClip.duration * durationRatio),
                  });
                }}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              {[0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => updateClip(selectedClip.id, { speed: s })}
                  className={`flex-1 py-1 rounded text-xs border transition-colors ${
                    selectedClip.speed === s
                      ? 'bg-[#00f2fe]/10 text-[#00f2fe] border-[#00f2fe]'
                      : 'bg-[#202026] border-[#2a2a34] text-[#8e8e9a] hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-[#121214] rounded border border-[#24242c]">
              <span className="text-[11px] text-[#6c6c7a] block">Effective Duration</span>
              <span className="font-mono text-sm text-white font-medium">{selectedClip.duration.toFixed(2)}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
