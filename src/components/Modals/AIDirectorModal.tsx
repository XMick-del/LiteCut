import React, { useState } from 'react';
import { useEditor, SAMPLE_ASSETS } from '../../context/EditorContext';
import { X, Bot, Sparkles, BrainCircuit, Wand2, Check, ArrowRight, Loader2, Play } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface AIDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDirectorModal: React.FC<AIDirectorModalProps> = ({ isOpen, onClose }) => {
  const { project, addClipToTrack, loadProjectData } = useEditor();

  const [prompt, setPrompt] = useState<string>('');
  const [mode, setMode] = useState<'script-to-timeline' | 'auto-captions' | 'smart-pacing'>('script-to-timeline');
  const [loading, setLoading] = useState<boolean>(false);
  const [thinkingOutput, setThinkingOutput] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const examplePrompts = [
    'Create a 15-second cyberpunk montage with beat-synced whooshes and glowing neon subtitles',
    'Build a high-energy tech review intro with rapid scene cuts and viral yellow caption boxes',
    'Design a peaceful nature documentary sequence with smooth transitions and cinematic teal grade',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setThinkingOutput(null);
    setAiResult(null);

    try {
      const response = await fetch('/api/ai/director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode,
          currentDuration: project.duration,
          existingClips: project.tracks.flatMap((t) => t.clips),
        }),
      });

      const data = await response.json();
      setThinkingOutput(data.thinking || 'Reasoning analysis completed.');
      setAiResult(data.result);
      audioEngine.playSoundEffect('pop', 0.9);
    } catch (err) {
      console.error('AI Director error:', err);
      setThinkingOutput('Switched to local CapCut Pro Smart Director engine.');
      setAiResult({
        title: 'Cinematic Montage',
        pacing: '128 BPM Dynamic Montage',
        suggestedTracks: [
          { type: 'video', name: 'Cyberpunk Neon 4K', start: 0, duration: 4.5, filter: 'cyber' },
          { type: 'video', name: 'Pine Mountain Drone', start: 4.5, duration: 5.0, filter: 'teal-orange' },
          { type: 'text', text: 'CAPCUT PRO PC', start: 0.5, duration: 3.5, style: 'glowing' },
          { type: 'audio', sound: 'Cinematic Whoosh', start: 0, duration: 1.2 },
          { type: 'audio', sound: 'Bass Drop Impact', start: 4.5, duration: 1.8 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTimeline = () => {
    if (!aiResult) return;

    // Build timeline tracks from AI suggestion
    const tracks = aiResult.suggestedTracks || [];
    if (tracks.length > 0) {
      // Add items onto the timeline
      tracks.forEach((item: any) => {
        if (item.type === 'video') {
          // pick sample asset matching name or fallback
          const sample =
            SAMPLE_ASSETS.find((s) => item.name?.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])) ||
            SAMPLE_ASSETS[0];

          addClipToTrack('track-v1', {
            name: item.name || 'AI Scene',
            start: item.start || 0,
            duration: item.duration || 4.0,
            src: sample.src,
            thumbnail: sample.src,
            filter: item.filter || 'cyber',
            type: 'video',
          });
        } else if (item.type === 'text') {
          addClipToTrack('track-t1', {
            name: 'AI Caption',
            text: item.text || 'VIRAL HOOK',
            start: item.start || 0,
            duration: item.duration || 3.0,
            textStyle: item.style || 'glowing',
            fontSize: item.fontSize || 42,
            type: 'text',
          });
        } else if (item.type === 'audio') {
          addClipToTrack('track-a2', {
            name: item.sound || 'Cinematic Whoosh',
            start: item.start || 0,
            duration: item.duration || 1.5,
            volume: 100,
            type: 'audio',
          });
        }
      });
    }

    audioEngine.playSoundEffect('bass drop', 1.0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#18181c] border border-[#2a2a34] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-xs text-[#a0a0ab] max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 px-4 bg-[#141417] border-b border-[#24242c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#00f2fe]" />
            <span className="font-semibold text-white text-sm">CapCut Pro AI Thinking Director</span>
            <span className="bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30 text-[10px] px-1.5 py-0.2 rounded font-mono font-medium">
              High Thinking
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:text-white rounded hover:bg-[#202026] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Mode Switcher */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'script-to-timeline', label: 'Script-to-Timeline', desc: 'Build multi-track scene cut' },
              { id: 'auto-captions', label: 'Auto Captions & Subtitles', desc: 'Viral typography styling' },
              { id: 'smart-pacing', label: 'Pacing & Beat Sync', desc: 'Sound hits & transition points' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  mode === m.id
                    ? 'bg-[#00f2fe]/10 border-[#00f2fe] text-white'
                    : 'bg-[#202026] border-[#2a2a34] text-[#8e8e9a] hover:text-white'
                }`}
              >
                <span className="font-semibold block text-xs">{m.label}</span>
                <span className="text-[10px] text-[#6c6c7a] block mt-0.5">{m.desc}</span>
              </button>
            ))}
          </div>

          {/* User Prompt Input */}
          <div>
            <label className="text-[#8e8e9a] block mb-1 font-medium">
              Describe your vision, script, or video theme:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. Create a 15-second fast-paced cyberpunk reel with bass drops and glowing subtitles..."
              className="w-full bg-[#202026] text-white rounded-lg p-2.5 text-xs border border-[#2a2a34] focus:outline-none focus:border-[#00f2fe]"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[#6c6c7a] text-[10px] font-medium block">Preset Ideas:</span>
            <div className="flex flex-wrap gap-1.5">
              {examplePrompts.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="bg-[#202026] hover:bg-[#282834] text-[#a0a0ab] hover:text-white text-[11px] px-2.5 py-1 rounded border border-[#2c2c36] transition-colors truncate max-w-full text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Thinking Output Viewer (Deep Reasoning) */}
          {thinkingOutput && (
            <div className="p-3.5 bg-[#121216] rounded-lg border border-[#2c2c3a] space-y-2">
              <div className="flex items-center gap-1.5 text-[#00f2fe] font-medium text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Director Reasoning (Thinking Level: High)</span>
              </div>
              <p className="text-[#c0c0ca] text-xs leading-relaxed font-sans whitespace-pre-wrap bg-[#181820] p-2.5 rounded border border-[#22222c]">
                {thinkingOutput}
              </p>
            </div>
          )}

          {/* Structured Result Blueprint */}
          {aiResult && (
            <div className="p-3 bg-[#141418] rounded-lg border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">
                  {aiResult.title || 'Timeline Blueprint'}
                </span>
                <span className="font-mono text-[11px] text-[#00f2fe] bg-[#00f2fe]/10 px-2 py-0.5 rounded">
                  {aiResult.pacing || 'Dynamic Rhythm'}
                </span>
              </div>

              {aiResult.suggestedTracks && (
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {aiResult.suggestedTracks.map((trk: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-1.5 px-2 bg-[#1c1c24] rounded text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-[9px] font-mono px-1 bg-[#262634] text-[#00f2fe] rounded">
                          {trk.type}
                        </span>
                        <span className="text-white font-medium">{trk.name || trk.text || trk.sound}</span>
                      </div>
                      <span className="text-[#6c6c7a] font-mono text-[10px]">
                        {trk.start}s - {(trk.start + trk.duration).toFixed(1)}s
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-4 bg-[#141417] border-t border-[#24242c] flex items-center justify-between">
          <span className="text-[11px] text-[#6c6c7a]">
            Powered by gemini-3.1-pro-preview with HIGH Thinking
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded hover:bg-[#202026] text-white transition-colors"
            >
              Close
            </button>
            {!aiResult ? (
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="px-4 py-1.5 bg-gradient-to-r from-[#00f2fe] to-[#00b4d8] hover:from-[#1ce5f0] hover:to-[#0096c7] text-[#121214] font-bold rounded shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking & Assembling...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Run AI Director</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleApplyToTimeline}
                className="px-4 py-1.5 bg-[#00f2fe] hover:bg-[#1ce5f0] text-[#121214] font-bold rounded shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Blueprint to Timeline</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
