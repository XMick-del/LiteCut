import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', action: 'Play / Pause timeline' },
    { key: 'I', action: 'Mark In Point at playhead' },
    { key: 'O', action: 'Mark Out Point at playhead' },
    { key: 'Shift + I', action: 'Jump playhead to In Point' },
    { key: 'Shift + O', action: 'Jump playhead to Out Point' },
    { key: 'Alt + X', action: 'Clear In & Out markers' },
    { key: 'Ctrl + L', action: 'Toggle In/Out Preview Looping' },
    { key: 'Ctrl + B / B', action: 'Split clip at playhead (Razor Cut)' },
    { key: 'V', action: 'Selection arrow tool' },
    { key: 'Delete / Backspace', action: 'Delete selected clip' },
    { key: 'Ctrl + D', action: 'Duplicate selected clip' },
    { key: 'Ctrl + Z', action: 'Undo last change' },
    { key: 'Ctrl + Y', action: 'Redo change' },
    { key: 'N', action: 'Toggle magnetic snapping' },
    { key: '← / →', action: 'Step 1 frame backward / forward' },
    { key: 'Shift + ← / →', action: 'Jump 1 second backward / forward' },
    { key: 'Ctrl + Scroll Wheel', action: 'Zoom timeline in / out' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#18181c] border border-[#2a2a34] rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-xs text-[#a0a0ab]">
        <div className="p-3.5 px-4 bg-[#141417] border-b border-[#24242c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#00f2fe]" />
            <span className="font-semibold text-white text-sm">CapCut Pro Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:text-white rounded hover:bg-[#202026] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-[#202026] rounded border border-[#282834]"
            >
              <span className="text-[#e0e0e6]">{sc.action}</span>
              <kbd className="font-mono text-[11px] bg-[#141417] text-[#00f2fe] border border-[#2e2e3c] px-2 py-0.5 rounded shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 px-4 bg-[#141417] border-t border-[#24242c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#202026] hover:bg-[#282832] text-white rounded transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
