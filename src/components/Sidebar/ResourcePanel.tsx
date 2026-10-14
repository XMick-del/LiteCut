import React, { useState, useRef } from 'react';
import { useEditor, SAMPLE_ASSETS } from '../../context/EditorContext';
import { audioEngine } from '../../utils/audioEngine';
import {
  FolderOpen,
  Music,
  Type,
  Smile,
  Wand2,
  Sparkles,
  SlidersHorizontal,
  Film,
  Plus,
  Play,
  Upload,
  Mic,
  BrainCircuit,
  Bot,
  Video,
  Layers,
} from 'lucide-react';

interface ResourcePanelProps {
  onOpenAIDirector: () => void;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ onOpenAIDirector }) => {
  const { addClipToTrack, currentTime, project } = useEditor();
  const [activeCategory, setActiveCategory] = useState<
    'media' | 'audio' | 'text' | 'stickers' | 'effects' | 'transitions' | 'filters' | 'ai'
  >('media');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local file importer (Offline PC support)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const isAudio = file.type.startsWith('audio');
      const isVideo = file.type.startsWith('video') || file.type.startsWith('image');

      if (isAudio) {
        addClipToTrack('track-a1', {
          name: file.name.replace(/\.[^/.]+$/, ''),
          src: url,
          duration: 6.0,
          type: 'audio',
        });
      } else if (isVideo) {
        addClipToTrack('track-v1', {
          name: file.name.replace(/\.[^/.]+$/, ''),
          src: url,
          duration: 5.0,
          type: 'video',
        });
      }
    }
    audioEngine.playSoundEffect('pop', 0.8);
  };

  // Sound effects library
  const soundEffects = [
    { name: 'Cinematic Whoosh', category: 'Transitions', duration: 1.2 },
    { name: 'Bass Drop Impact', category: 'Hits', duration: 1.8 },
    { name: 'Pop', category: 'UI', duration: 0.3 },
    { name: 'Glitch Hit', category: 'Tech', duration: 0.8 },
    { name: 'Camera Shutter', category: 'Foley', duration: 0.5 },
  ];

  // Text template presets
  const textTemplates = [
    { name: 'Glowing Cyan Neon', text: 'CAPCUT PRO', style: 'glowing', fontSize: 46, color: '#ffffff' },
    { name: 'Viral Yellow Box', text: 'MRBEAST STYLE', style: 'bold-yellow', fontSize: 40, color: '#000000' },
    { name: 'Cinematic Lower Third', text: 'DIRECTED BY CAPCUT', style: 'minimal', fontSize: 28, color: '#ffffff' },
    { name: 'Cyberpunk Subtitle', text: 'OFFLINE 60FPS EDIT', style: 'standard', fontSize: 34, color: '#00f2fe' },
  ];

  // Video FX presets
  const effectPresets = [
    { id: 'glow', name: 'Bloom Glow', desc: 'Luminous light diffusion', filter: 'glow' },
    { id: 'cyber', name: 'Cyber Matrix', desc: 'Futuristic neon tint', filter: 'cyber' },
    { id: 'teal-orange', name: 'Teal & Orange', desc: 'Blockbuster movie grade', filter: 'teal-orange' },
    { id: 'moody', name: 'Moody Dark', desc: 'Low-key dramatic shadow', filter: 'moody' },
    { id: 'vintage', name: '90s Kodachrome', desc: 'Nostalgic film stock', filter: 'vintage' },
    { id: 'noir', name: 'Noir B&W', desc: 'High contrast monochrome', filter: 'noir' },
  ];

  return (
    <div className="flex h-full bg-[#18181c] border-r border-[#24242c] overflow-hidden select-none">
      {/* Category Icon Strip on far left */}
      <div className="w-16 bg-[#121214] border-r border-[#24242c] flex flex-col items-center py-2 gap-1 text-[10px] text-[#8e8e9a]">
        {[
          { id: 'media', label: 'Media', icon: FolderOpen },
          { id: 'audio', label: 'Audio', icon: Music },
          { id: 'text', label: 'Text', icon: Type },
          { id: 'stickers', label: 'Stickers', icon: Smile },
          { id: 'effects', label: 'Effects', icon: Sparkles },
          { id: 'transitions', label: 'Transitions', icon: Film },
          { id: 'filters', label: 'Filters', icon: SlidersHorizontal },
          { id: 'ai', label: 'AI Suite', icon: Bot, highlight: true },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id as any)}
              className={`w-14 py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                isActive
                  ? 'bg-[#22222a] text-white shadow-xs'
                  : item.highlight
                  ? 'text-[#00f2fe] hover:bg-[#1a1a20]'
                  : 'hover:bg-[#1a1a20] hover:text-[#d0d0da]'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.highlight ? 'text-[#00f2fe]' : ''}`} />
              <span className="font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Resource Content Sub-Panel */}
      <div className="w-72 flex flex-col h-full bg-[#18181c] text-xs text-[#a0a0ab] overflow-hidden">
        {/* Panel Header */}
        <div className="p-3 border-b border-[#24242c] flex items-center justify-between bg-[#141417]">
          <span className="font-semibold text-white capitalize text-sm flex items-center gap-1.5">
            {activeCategory === 'ai' ? (
              <>
                <BrainCircuit className="w-4 h-4 text-[#00f2fe]" />
                <span>AI Thinking Suite</span>
              </>
            ) : (
              <span>{activeCategory} Library</span>
            )}
          </span>

          {activeCategory === 'media' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 bg-[#202028] hover:bg-[#282834] text-[#00f2fe] px-2 py-1 rounded text-xs border border-[#2e2e3a] transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*,image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* MEDIA CATEGORY */}
          {activeCategory === 'media' && (
            <div className="space-y-4">
              {/* Drag and drop import card */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2a2a36] hover:border-[#00f2fe]/60 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#141417] hover:bg-[#181820]"
              >
                <Upload className="w-6 h-6 text-[#00f2fe] mb-1.5" />
                <span className="font-semibold text-white">Import Local Files</span>
                <span className="text-[10px] text-[#6c6c7a] mt-0.5">MP4, WebM, PNG, JPG, MP3</span>
              </div>

              {/* Sample Media Assets */}
              <div>
                <span className="text-[#6c6c7a] font-medium block mb-2 uppercase text-[10px] tracking-wider">
                  Sample 4K B-Roll (Offline Assets)
                </span>
                <div className="space-y-2">
                  {SAMPLE_ASSETS.map((asset) => (
                    <div
                      key={asset.id}
                      className="group relative bg-[#202026] rounded-lg overflow-hidden border border-[#2a2a34] hover:border-[#00f2fe]/60 transition-all flex items-center p-1.5 gap-2"
                    >
                      <img
                        src={asset.src}
                        alt={asset.name}
                        className="w-16 h-10 object-cover rounded shrink-0 bg-black"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium block truncate text-[11px]">{asset.name}</span>
                        <span className="text-[#6c6c7a] text-[10px]">{asset.duration}s · 4K Cinema</span>
                      </div>
                      <button
                        onClick={() => {
                          addClipToTrack('track-v1', {
                            name: asset.name,
                            src: asset.src,
                            duration: asset.duration,
                            type: 'video',
                            thumbnail: asset.src,
                          });
                          audioEngine.playSoundEffect('pop', 0.8);
                        }}
                        title="Add to Timeline (V1)"
                        className="p-1.5 bg-[#00f2fe] text-[#121214] rounded hover:bg-[#1ce5f0] shadow-sm transition-transform active:scale-95 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solid Color Mattes */}
              <div>
                <span className="text-[#6c6c7a] font-medium block mb-2 uppercase text-[10px] tracking-wider">
                  Color Generators
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Black Matte', color: '#000000' },
                    { name: 'Green Screen', color: '#00ff00' },
                    { name: 'Cyber Cyan', color: '#00f2fe' },
                    { name: 'Cinema White', color: '#ffffff' },
                  ].map((matte) => (
                    <button
                      key={matte.name}
                      onClick={() => {
                        // generate solid color canvas data URL
                        const c = document.createElement('canvas');
                        c.width = 1920;
                        c.height = 1080;
                        const ctx = c.getContext('2d');
                        if (ctx) {
                          ctx.fillStyle = matte.color;
                          ctx.fillRect(0, 0, 1920, 1080);
                          addClipToTrack('track-v1', {
                            name: matte.name,
                            src: c.toDataURL('image/png'),
                            duration: 4.0,
                            type: 'video',
                          });
                        }
                      }}
                      className="flex items-center gap-2 p-2 bg-[#202026] hover:bg-[#282832] border border-[#2a2a34] rounded text-left transition-colors"
                    >
                      <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: matte.color }} />
                      <span className="text-[11px] text-white truncate">{matte.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIO CATEGORY */}
          {activeCategory === 'audio' && (
            <div className="space-y-4">
              <div>
                <span className="text-[#6c6c7a] font-medium block mb-2 uppercase text-[10px] tracking-wider">
                  Instant Sound FX (Web Audio Synthesized)
                </span>
                <div className="space-y-1.5">
                  {soundEffects.map((sfx) => (
                    <div
                      key={sfx.name}
                      className="flex items-center justify-between p-2 bg-[#202026] rounded border border-[#2a2a34] hover:border-[#00f2fe]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => audioEngine.playSoundEffect(sfx.name, 1.0)}
                          title="Preview Sound"
                          className="p-1 rounded-full bg-[#2a2a36] hover:bg-[#00f2fe] hover:text-[#121214] text-white transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </button>
                        <div>
                          <span className="text-white font-medium block truncate text-[11px]">{sfx.name}</span>
                          <span className="text-[#6c6c7a] text-[10px]">{sfx.duration}s · {sfx.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addClipToTrack('track-a2', {
                            name: sfx.name,
                            duration: sfx.duration,
                            type: 'audio',
                            volume: 100,
                          });
                          audioEngine.playSoundEffect('pop', 0.8);
                        }}
                        title="Add to Audio Track (A2)"
                        className="p-1 bg-[#282834] hover:bg-[#00f2fe] hover:text-[#121214] text-[#a0a0ab] rounded transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TEXT CATEGORY */}
          {activeCategory === 'text' && (
            <div className="space-y-4">
              <div>
                <span className="text-[#6c6c7a] font-medium block mb-2 uppercase text-[10px] tracking-wider">
                  CapCut Text & Caption Templates
                </span>
                <div className="space-y-2">
                  {textTemplates.map((tmpl) => (
                    <div
                      key={tmpl.name}
                      className="p-2.5 bg-[#202026] rounded border border-[#2a2a34] hover:border-[#00f2fe]/60 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="text-white font-medium block text-[11px]">{tmpl.name}</span>
                        <div
                          className="mt-1 text-[10px] px-2 py-0.5 rounded font-bold inline-block"
                          style={{
                            color: tmpl.color,
                            backgroundColor: tmpl.style === 'bold-yellow' ? '#ffd200' : 'rgba(0,0,0,0.5)',
                            textShadow: tmpl.style === 'glowing' ? '0 0 8px #00f2fe' : 'none',
                          }}
                        >
                          {tmpl.text}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addClipToTrack('track-t1', {
                            name: tmpl.name,
                            text: tmpl.text,
                            textStyle: tmpl.style as any,
                            fontSize: tmpl.fontSize,
                            textColor: tmpl.color,
                            duration: 3.5,
                            type: 'text',
                          });
                          audioEngine.playSoundEffect('pop', 0.8);
                        }}
                        title="Add to Text Track (T1)"
                        className="p-1.5 bg-[#00f2fe] text-[#121214] rounded hover:bg-[#1ce5f0] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EFFECTS CATEGORY */}
          {activeCategory === 'effects' && (
            <div className="space-y-3">
              <span className="text-[#6c6c7a] font-medium block mb-1 uppercase text-[10px] tracking-wider">
                Video Filters & Look Presets
              </span>
              {effectPresets.map((eff) => (
                <div
                  key={eff.id}
                  className="p-2.5 bg-[#202026] rounded border border-[#2a2a34] flex items-center justify-between hover:border-[#00f2fe]/40 transition-colors"
                >
                  <div>
                    <span className="text-white font-medium block text-[11px]">{eff.name}</span>
                    <span className="text-[#6c6c7a] text-[10px]">{eff.desc}</span>
                  </div>
                  <button
                    onClick={() => {
                      // Apply to currently selected clip or add FX adjustment clip
                      addClipToTrack('track-v1', {
                        name: eff.name,
                        filter: eff.filter as any,
                        duration: 4.0,
                        type: 'video',
                        src: '/src/assets/images/sample_tech_abstract_1791902112731.jpg',
                      });
                      audioEngine.playSoundEffect('pop', 0.8);
                    }}
                    className="p-1 bg-[#282834] hover:bg-[#00f2fe] hover:text-[#121214] text-white rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TRANSITIONS & STICKERS */}
          {(activeCategory === 'transitions' || activeCategory === 'stickers' || activeCategory === 'filters') && (
            <div className="space-y-3">
              <span className="text-[#6c6c7a] font-medium block mb-1 uppercase text-[10px] tracking-wider">
                {activeCategory} Library
              </span>
              {[
                { name: 'Dip to Black', type: 'transition', duration: 1.0 },
                { name: 'White Flash Cut', type: 'transition', duration: 0.8 },
                { name: 'Cross Dissolve', type: 'transition', duration: 1.2 },
                { name: 'Whip Pan Blur', type: 'transition', duration: 0.6 },
                { name: 'Subscribe Overlay Badge', type: 'sticker', duration: 3.0 },
                { name: 'Like & Bell Reminder', type: 'sticker', duration: 3.0 },
              ].map((item) => (
                <div
                  key={item.name}
                  className="p-2.5 bg-[#202026] rounded border border-[#2a2a34] flex items-center justify-between hover:border-[#00f2fe]/40 transition-colors"
                >
                  <span className="text-white font-medium text-[11px]">{item.name}</span>
                  <button
                    onClick={() => {
                      addClipToTrack('track-t1', {
                        name: item.name,
                        text: item.name.toUpperCase(),
                        duration: item.duration,
                        type: 'text',
                        textStyle: 'bold-yellow',
                      });
                      audioEngine.playSoundEffect('pop', 0.8);
                    }}
                    className="p-1 bg-[#282834] hover:bg-[#00f2fe] hover:text-[#121214] text-white rounded transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI SUITE CATEGORY */}
          {activeCategory === 'ai' && (
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-br from-[#00f2fe]/10 via-[#181822] to-[#14141a] rounded-lg border border-[#00f2fe]/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#00f2fe]" />
                  <span className="font-semibold text-white text-xs">Gemini 3.1 Pro AI Director</span>
                </div>
                <p className="text-[11px] text-[#a0a0ab] leading-relaxed mb-3">
                  High-reasoning AI video director. Analyzes pacing, beat drops, B-roll selection, sound hits, and generates complete multi-track timeline blueprints.
                </p>
                <button
                  onClick={onOpenAIDirector}
                  className="w-full py-2 bg-gradient-to-r from-[#00f2fe] to-[#00b4d8] hover:from-[#1ce5f0] hover:to-[#0096c7] text-[#121214] font-bold text-xs rounded transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Launch AI Thinking Director</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[#6c6c7a] font-medium block uppercase text-[10px] tracking-wider">
                  Quick AI Actions
                </span>
                {[
                  { title: 'Auto Subtitles & Captions', desc: 'Generate synchronized karaoke subtitles', mode: 'auto-captions' },
                  { title: 'Silence & Gap Remover', desc: 'Tighten cuts to keep audience retention', mode: 'smart-cut' },
                  { title: 'Beat-Matched Montage', desc: 'Sync clip transitions with audio transients', mode: 'beat-sync' },
                ].map((act) => (
                  <button
                    key={act.title}
                    onClick={onOpenAIDirector}
                    className="w-full p-2.5 bg-[#202026] hover:bg-[#282832] rounded border border-[#2a2a34] text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-white font-medium block text-[11px] group-hover:text-[#00f2fe] transition-colors">
                        {act.title}
                      </span>
                      <span className="text-[#6c6c7a] text-[10px]">{act.desc}</span>
                    </div>
                    <Wand2 className="w-3.5 h-3.5 text-[#6c6c7a] group-hover:text-[#00f2fe] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
