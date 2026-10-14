import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { X, Cpu, Zap, HardDrive, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PreviewQuality } from '../../types/editor';

interface LowSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LowSpecModal: React.FC<LowSpecModalProps> = ({ isOpen, onClose }) => {
  const { lowSpecSettings, updateLowSpecSettings } = useEditor();

  if (!isOpen) return null;

  const setPreset = (preset: 'low' | 'med' | 'high') => {
    if (preset === 'low') {
      updateLowSpecSettings({
        proxyMode: true,
        previewQuality: 'quarter',
        skipFiltersOnPlay: true,
        throttleFps: true,
        hardwareAccel: true,
      });
    } else if (preset === 'med') {
      updateLowSpecSettings({
        proxyMode: true,
        previewQuality: 'half',
        skipFiltersOnPlay: false,
        throttleFps: false,
        hardwareAccel: true,
      });
    } else {
      updateLowSpecSettings({
        proxyMode: false,
        previewQuality: 'full',
        skipFiltersOnPlay: false,
        throttleFps: false,
        hardwareAccel: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#18181c] border border-[#2a2a34] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-xs text-[#a0a0ab]">
        {/* Header */}
        <div className="p-3.5 px-4 bg-[#141417] border-b border-[#24242c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white text-sm">Low-End PC Optimizer</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:text-white rounded hover:bg-[#202026] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-[#a0a0ab] leading-relaxed">
            Fine-tune CapCut Pro PC to achieve butter-smooth 60 FPS playback on computers with 4GB-8GB RAM, integrated Intel graphics, or older dual-core processors.
          </p>

          {/* Quick Hardware Presets */}
          <div>
            <label className="text-[#8e8e9a] font-medium block mb-2">Hardware Profile</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPreset('low')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  lowSpecSettings.previewQuality === 'quarter'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-[#202026] border-[#2a2a34] hover:text-white'
                }`}
              >
                <span className="font-semibold block text-emerald-400">Low-End PC</span>
                <span className="text-[10px] text-[#6c6c7a] block mt-0.5">2-4GB RAM / Intel HD</span>
              </button>

              <button
                onClick={() => setPreset('med')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  lowSpecSettings.previewQuality === 'half'
                    ? 'bg-[#00f2fe]/10 border-[#00f2fe] text-white'
                    : 'bg-[#202026] border-[#2a2a34] hover:text-white'
                }`}
              >
                <span className="font-semibold block text-[#00f2fe]">Balanced</span>
                <span className="text-[10px] text-[#6c6c7a] block mt-0.5">8GB RAM / Standard</span>
              </button>

              <button
                onClick={() => setPreset('high')}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  lowSpecSettings.previewQuality === 'full'
                    ? 'bg-purple-500/10 border-purple-500 text-white'
                    : 'bg-[#202026] border-[#2a2a34] hover:text-white'
                }`}
              >
                <span className="font-semibold block text-purple-400">Max Quality</span>
                <span className="text-[10px] text-[#6c6c7a] block mt-0.5">Dedicated GPU</span>
              </button>
            </div>
          </div>

          {/* Detailed Toggles */}
          <div className="space-y-3 pt-2 border-t border-[#24242c]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-white block">Proxy Scrubbing Engine</span>
                <span className="text-[10px] text-[#6c6c7a]">
                  Render downscaled buffer during live timeline scrubbing
                </span>
              </div>
              <input
                type="checkbox"
                checked={lowSpecSettings.proxyMode}
                onChange={(e) => updateLowSpecSettings({ proxyMode: e.target.checked })}
                className="rounded border-[#2a2a34] text-[#00f2fe] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-white block">Skip Heavy Filters On Playback</span>
                <span className="text-[10px] text-[#6c6c7a]">
                  Disables color matrices while playing (applied on pause & export)
                </span>
              </div>
              <input
                type="checkbox"
                checked={lowSpecSettings.skipFiltersOnPlay}
                onChange={(e) => updateLowSpecSettings({ skipFiltersOnPlay: e.target.checked })}
                className="rounded border-[#2a2a34] text-[#00f2fe] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-white block">Cap Timeline FPS to 30</span>
                <span className="text-[10px] text-[#6c6c7a]">
                  Cuts CPU utilization in half on battery or slow laptops
                </span>
              </div>
              <input
                type="checkbox"
                checked={lowSpecSettings.throttleFps}
                onChange={(e) => updateLowSpecSettings({ throttleFps: e.target.checked })}
                className="rounded border-[#2a2a34] text-[#00f2fe] cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Zero lag guarantee: Final video export always renders in 100% full quality!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-4 bg-[#141417] border-t border-[#24242c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00f2fe] hover:bg-[#1ce5f0] text-[#121214] font-bold rounded shadow-sm transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
