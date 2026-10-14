import React, { useState } from 'react';
import { EditorProvider } from './context/EditorContext';
import { TopBar } from './components/Header/TopBar';
import { ResourcePanel } from './components/Sidebar/ResourcePanel';
import { CanvasPlayer } from './components/Player/CanvasPlayer';
import { InspectorPanel } from './components/Inspector/InspectorPanel';
import { Timeline } from './components/Timeline/Timeline';
import { ExportModal } from './components/Modals/ExportModal';
import { AIDirectorModal } from './components/Modals/AIDirectorModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { LowSpecModal } from './components/Modals/LowSpecModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';

function MainEditor() {
  const [showExport, setShowExport] = useState(false);
  const [showAIDirector, setShowAIDirector] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showLowSpec, setShowLowSpec] = useState(false);

  const isOnline = useOnlineStatus();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#121214] text-[#ececed]">
      {/* Top Navigation Bar */}
      <TopBar
        onOpenExport={() => setShowExport(true)}
        onOpenAIDirector={() => setShowAIDirector(true)}
        onOpenShortcuts={() => setShowShortcuts(true)}
        onOpenLowSpec={() => setShowLowSpec(true)}
      />

      {/* Main Center Area: Left Resources | Center Player | Right Inspector */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Resource Pool & Asset Library */}
        <ResourcePanel onOpenAIDirector={() => setShowAIDirector(true)} />

        {/* Center: Canvas Monitor Player Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <CanvasPlayer onOpenExport={() => setShowExport(true)} />
        </div>

        {/* Right: Clip Details & Video / Audio / Text Properties */}
        <InspectorPanel />
      </div>

      {/* Bottom Area: Multi-Track Timeline (40% height of screen) */}
      <div className="h-[42%] min-h-[220px] max-h-[460px] flex flex-col shrink-0">
        <Timeline />
      </div>

      {/* Modals */}
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
      <AIDirectorModal isOpen={showAIDirector} onClose={() => setShowAIDirector(false)} />
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <LowSpecModal isOpen={showLowSpec} onClose={() => setShowLowSpec(false)} />

      {/* Non-intrusive offline indicator toast when offline */}
      {!isOnline && (
        <div className="fixed bottom-3 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#202026] border border-[#2e2e3a] px-3 py-1.5 text-xs text-[#00f2fe] shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Offline Mode Active — 100% Local PC Processing</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <MainEditor />
    </EditorProvider>
  );
}
