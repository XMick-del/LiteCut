import React, { useState, useRef } from 'react';
import { useEditor } from '../../context/EditorContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  Download,
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  Sparkles,
  Keyboard,
  Cpu,
  Wifi,
  WifiOff,
  ChevronDown,
  FilePlus,
  Share2,
  HardDrive,
  MonitorDown,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface TopBarProps {
  onOpenExport: () => void;
  onOpenAIDirector: () => void;
  onOpenShortcuts: () => void;
  onOpenLowSpec: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenExport,
  onOpenAIDirector,
  onOpenShortcuts,
  onOpenLowSpec,
}) => {
  const {
    project,
    setProjectName,
    undo,
    redo,
    canUndo,
    canRedo,
    saveProjectToDisk,
    exportProjectFile,
    importProjectFile,
    createNewProject,
    lowSpecSettings,
  } = useEditor();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.name);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { isInstallable, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      setProjectName(titleInput.trim());
    }
  };

  const handleSave = () => {
    saveProjectToDisk();
    setSaveToast(true);
    audioEngine.playSoundEffect('pop', 0.8);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <header className="h-11 bg-[#141417] border-b border-[#24242c] flex items-center justify-between px-3 text-xs select-none z-30">
      {/* Zone 1: Brand & Project Identity */}
      <div className="flex items-center gap-3">
        {/* CapCut Pro Wordmark */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#1e1e24] to-[#121214] border border-[#2e2e3a] flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#00f2fe]">
              <path d="M5 4h14l-4 7 4 7H5l4-7-4-7z" opacity="0.4" />
              <path d="M7 6l5 6-5 6h2l5-6-5-6H7z" />
            </svg>
          </div>
          <span className="font-extrabold text-white tracking-tight text-sm">CapCut</span>
          <span className="text-[9px] font-black tracking-widest text-[#121214] bg-gradient-to-r from-[#ffd200] to-[#f7971e] px-1 py-0.2 rounded font-mono shadow-xs">
            PRO
          </span>
        </div>

        {/* File Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowFileMenu((p) => !p)}
            className="flex items-center gap-1 text-[#a0a0ab] hover:text-white px-2 py-1 rounded hover:bg-[#202026] transition-colors"
          >
            <span>File</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showFileMenu && (
            <div
              className="absolute left-0 top-full mt-1 w-48 bg-[#18181c] border border-[#2a2a34] rounded-lg shadow-xl py-1 z-50 text-xs text-[#c0c0ca]"
              onClick={() => setShowFileMenu(false)}
            >
              <button
                onClick={() => createNewProject('New CapCut Project')}
                className="w-full px-3 py-1.5 hover:bg-[#202028] hover:text-white flex items-center gap-2 text-left"
              >
                <FilePlus className="w-3.5 h-3.5 text-[#00f2fe]" />
                <span>New Project</span>
              </button>
              <button
                onClick={handleSave}
                className="w-full px-3 py-1.5 hover:bg-[#202028] hover:text-white flex items-center gap-2 text-left"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save to Local DB</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-1.5 hover:bg-[#202028] hover:text-white flex items-center gap-2 text-left"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Project File...</span>
              </button>
              <button
                onClick={exportProjectFile}
                className="w-full px-3 py-1.5 hover:bg-[#202028] hover:text-white flex items-center gap-2 text-left"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Project Backup (.json)</span>
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".capcutproj,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importProjectFile(f);
          }}
        />

        {/* Editable Project Title */}
        <div className="flex items-center gap-1.5">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="bg-[#202026] text-white px-2 py-0.5 rounded border border-[#00f2fe] text-xs focus:outline-none"
            />
          ) : (
            <span
              onClick={() => {
                setTitleInput(project.name);
                setIsEditingTitle(true);
              }}
              title="Click to rename project"
              className="font-medium text-[#e0e0e6] hover:text-white cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#202026] transition-colors truncate max-w-40"
            >
              {project.name}
            </span>
          )}

          <span className="text-[10px] text-[#6c6c7a] font-mono bg-[#1c1c22] px-1.5 py-0.2 rounded border border-[#24242c]">
            {project.settings.width}x{project.settings.height}
          </span>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1 rounded text-[#a0a0ab] hover:text-white hover:bg-[#202026] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1 rounded text-[#a0a0ab] hover:text-white hover:bg-[#202026] disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zone 2: Status & Low-End PC Telemetry Badges */}
      <div className="flex items-center gap-2">
        {/* Low-End PC Mode Trigger */}
        <button
          onClick={onOpenLowSpec}
          title="Low-End PC Optimizer Settings"
          className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1c1c22] hover:bg-[#24242c] text-[#a0a0ab] hover:text-white border border-[#2a2a34] rounded transition-colors"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium hidden sm:inline">Low-End PC:</span>
          <span className="text-[10px] text-[#00f2fe] font-mono font-semibold">
            {lowSpecSettings.previewQuality === 'quarter'
              ? '1/4 Proxy'
              : lowSpecSettings.previewQuality === 'half'
              ? '1/2 Proxy'
              : 'Full'}
          </span>
        </button>

        {/* Offline DB Status */}
        <div
          title={isOnline ? 'Online + Offline IndexedDB Active' : 'Offline Mode (Local Storage)'}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#1c1c22] text-[#8e8e9a] border border-[#2a2a34] rounded text-[11px]"
        >
          <HardDrive className="w-3 h-3 text-[#00f2fe]" />
          <span className="hidden md:inline">Offline Ready</span>
        </div>

        {saveToast && (
          <span className="text-emerald-400 text-[11px] animate-fade-in font-medium">
            Saved!
          </span>
        )}
      </div>

      {/* Zone 3: Actions & Export */}
      <div className="flex items-center gap-2">
        {/* AI Director Trigger Button with High Thinking Indicator */}
        <button
          onClick={onOpenAIDirector}
          title="Launch Gemini 3.1 Pro AI Director"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#202028] hover:bg-[#282834] text-[#00f2fe] border border-cyan-500/30 rounded font-medium transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Director</span>
        </button>

        {/* Keyboard Shortcuts Button */}
        <button
          onClick={onOpenShortcuts}
          title="Shortcuts Cheatsheet"
          className="p-1 text-[#8e8e9a] hover:text-white hover:bg-[#202026] rounded transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        {/* PWA Install Button if available */}
        {isInstallable && (
          <button
            onClick={install}
            className="flex items-center gap-1 px-2 py-1 bg-[#22222c] hover:bg-[#2c2c38] text-white border border-[#343444] rounded text-[11px] transition-colors"
          >
            <MonitorDown className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span className="hidden sm:inline">Install PC App</span>
          </button>
        )}

        {/* Primary Export CTA */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#00f2fe] to-[#00b4d8] hover:from-[#1ce5f0] hover:to-[#0096c7] text-[#121214] font-bold text-xs rounded transition-all shadow-sm active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
