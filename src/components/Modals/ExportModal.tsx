import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { X, Download, CheckCircle2, Film, AlertCircle, Loader2 } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project } = useEditor();

  const [filename, setFilename] = useState<string>(project.name || 'CapCut_Export');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [fps, setFps] = useState<30 | 60>(30);
  const [bitrateQuality, setBitrateQuality] = useState<'recommended' | 'low' | 'high'>('recommended');

  const hasRange = project.inPoint != null && project.outPoint != null && project.inPoint < project.outPoint;
  const [exportScope, setExportScope] = useState<'entire' | 'range'>(hasRange ? 'range' : 'entire');

  // Export progress state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [exportComplete, setExportComplete] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const abortExportRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setFilename(project.name || 'CapCut_Export');
      setProgress(0);
      setIsExporting(false);
      setExportComplete(false);
      setDownloadUrl(null);
      abortExportRef.current = false;
      if (project.inPoint != null && project.outPoint != null && project.inPoint < project.outPoint) {
        setExportScope('range');
      } else {
        setExportScope('entire');
      }
    }
  }, [isOpen, project.name, project.inPoint, project.outPoint]);

  if (!isOpen) return null;

  // Resolution dimensions
  const getDims = () => {
    const isPortrait = project.settings.aspectRatio === '9:16';
    const isSquare = project.settings.aspectRatio === '1:1';

    if (resolution === '720p') {
      if (isPortrait) return { width: 720, height: 1280 };
      if (isSquare) return { width: 720, height: 720 };
      return { width: 1280, height: 720 };
    }
    if (resolution === '4k') {
      if (isPortrait) return { width: 2160, height: 3840 };
      if (isSquare) return { width: 2160, height: 2160 };
      return { width: 3840, height: 2160 };
    }
    // Default 1080p
    if (isPortrait) return { width: 1080, height: 1920 };
    if (isSquare) return { width: 1080, height: 1080 };
    return { width: 1920, height: 1080 };
  };

  const dims = getDims();

  const effectiveStart = exportScope === 'range' && hasRange ? project.inPoint! : 0;
  const effectiveDuration = exportScope === 'range' && hasRange ? (project.outPoint! - project.inPoint!) : project.duration;

  // Estimate file size based on resolution and effective duration
  const estimatedMb = (
    (effectiveDuration * (resolution === '4k' ? 24 : resolution === '1080p' ? 8 : 4) * (fps / 30)) /
    8
  ).toFixed(1);

  // Client-Side Canvas MediaRecorder Offline Export Pipeline
  const startExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setExportComplete(false);
    abortExportRef.current = false;

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = dims.width;
      exportCanvas.height = dims.height;
      const ctx = exportCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Check supported mime types
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const stream = exportCanvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond:
          bitrateQuality === 'high' ? 12000000 : bitrateQuality === 'low' ? 3000000 : 6000000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(videoBlob);
        setDownloadUrl(url);
        setIsExporting(false);
        setExportComplete(true);
        audioEngine.playSoundEffect('pop', 1.0);
      };

      recorder.start();

      // Preload images into cache
      const imgMap: Map<string, HTMLImageElement> = new Map();
      for (const track of project.tracks) {
        for (const clip of track.clips) {
          if (clip.src && !imgMap.has(clip.src)) {
            const im = new Image();
            im.src = clip.src;
            imgMap.set(clip.src, im);
          }
        }
      }

      // Render frames sequentially
      const totalFrames = Math.max(1, Math.floor(effectiveDuration * fps));
      const frameDuration = 1 / fps;

      for (let f = 0; f < totalFrames; f++) {
        if (abortExportRef.current) {
          recorder.stop();
          return;
        }

        const t = effectiveStart + f * frameDuration;

        // Render frame at time t
        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, dims.width, dims.height);

        // Draw clips active at time t
        for (const track of project.tracks) {
          if (track.hidden) continue;

          for (const clip of track.clips) {
            if (t >= clip.start && t <= clip.start + clip.duration) {
              if (track.type === 'video' && clip.src) {
                const img = imgMap.get(clip.src);
                if (img && img.complete) {
                  ctx.save();
                  ctx.globalAlpha = (clip.opacity ?? 100) / 100;
                  if (clip.blendMode && clip.blendMode !== 'normal') {
                    ctx.globalCompositeOperation = clip.blendMode;
                  }

                  const cx = dims.width / 2 + (clip.x || 0);
                  const cy = dims.height / 2 + (clip.y || 0);
                  ctx.translate(cx, cy);

                  if (clip.rotation) ctx.rotate((clip.rotation * Math.PI) / 180);
                  const sc = (clip.scale || 100) / 100;
                  ctx.scale(sc, sc);

                  const imgRatio = img.naturalWidth / img.naturalHeight;
                  const canvasRatio = dims.width / dims.height;
                  let dw = dims.width;
                  let dh = dims.height;
                  if (imgRatio > canvasRatio) {
                    dw = dims.height * imgRatio;
                  } else {
                    dh = dims.width / imgRatio;
                  }
                  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
                  ctx.restore();
                }
              } else if (track.type === 'text' && clip.text) {
                ctx.save();
                const cx = dims.width / 2 + (clip.x || 0);
                const cy = dims.height / 2 + (clip.y || 0);
                ctx.translate(cx, cy);
                const sc = (clip.scale || 100) / 100;
                ctx.scale(sc, sc);

                const fontSize = (clip.fontSize || 40) * (dims.height / 1080);
                ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const text = clip.text;
                const metrics = ctx.measureText(text);
                const padX = 24 * (dims.height / 1080);
                const padY = 14 * (dims.height / 1080);
                const bgW = metrics.width + padX * 2;
                const bgH = fontSize * 1.3 + padY * 2;

                if (clip.textStyle === 'bold-yellow') {
                  ctx.fillStyle = '#ffd200';
                  ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH);
                  ctx.fillStyle = '#0c0c0e';
                  ctx.fillText(text, 0, 0);
                } else if (clip.textStyle === 'glowing') {
                  ctx.shadowColor = '#00f2fe';
                  ctx.shadowBlur = 24;
                  ctx.fillStyle = '#ffffff';
                  ctx.fillText(text, 0, 0);
                  ctx.strokeStyle = '#00f2fe';
                  ctx.lineWidth = 2;
                  ctx.strokeText(text, 0, 0);
                } else {
                  ctx.fillStyle = clip.backgroundColor || 'rgba(12,12,14,0.75)';
                  ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH);
                  ctx.fillStyle = clip.textColor || '#ffffff';
                  ctx.fillText(text, 0, 0);
                }
                ctx.restore();
              }
            }
          }
        }

        setProgress(Math.round(((f + 1) / totalFrames) * 100));

        // Yield execution to event loop so UI does not freeze on low-end single-core or dual-core CPU
        if (f % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 8));
        }
      }

      setTimeout(() => {
        recorder.stop();
      }, 200);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${filename || 'capcut_pro_export'}.${format}`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#18181c] border border-[#2a2a34] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs text-[#a0a0ab]">
        {/* Header */}
        <div className="p-3.5 px-4 bg-[#141417] border-b border-[#24242c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#00f2fe]" />
            <span className="font-semibold text-white text-sm">CapCut Pro Export</span>
          </div>
          <button
            onClick={() => {
              if (isExporting) abortExportRef.current = true;
              onClose();
            }}
            className="p-1 hover:text-white rounded hover:bg-[#202026] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* File Name */}
          <div>
            <label className="text-[#8e8e9a] block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-[#202026] text-white rounded p-2 text-xs border border-[#2a2a34] focus:outline-none focus:border-[#00f2fe]"
              placeholder="Export File Name..."
            />
          </div>

          {/* Export Range Selector (when In/Out markers exist) */}
          {hasRange && (
            <div>
              <label className="text-[#8e8e9a] block mb-1 font-medium">Timeline Export Region</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportScope('range')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    exportScope === 'range'
                      ? 'bg-[#00f2fe]/10 border-[#00f2fe] text-white'
                      : 'bg-[#202026] border-[#2a2a34] text-[#8e8e9a] hover:text-white'
                  }`}
                >
                  <span className="font-semibold block text-xs text-[#00f2fe]">In / Out Selected Range</span>
                  <span className="text-[10px] text-[#6c6c7a] block mt-0.5 font-mono">
                    {project.inPoint}s → {project.outPoint}s ({effectiveDuration.toFixed(2)}s)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportScope('entire')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    exportScope === 'entire'
                      ? 'bg-[#00f2fe]/10 border-[#00f2fe] text-white'
                      : 'bg-[#202026] border-[#2a2a34] text-[#8e8e9a] hover:text-white'
                  }`}
                >
                  <span className="font-semibold block text-xs">Entire Timeline</span>
                  <span className="text-[10px] text-[#6c6c7a] block mt-0.5 font-mono">
                    0.0s → {project.duration.toFixed(1)}s
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Resolution Options */}
          <div>
            <label className="text-[#8e8e9a] block mb-1 font-medium">Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '720p', label: '720P HD', desc: 'Fastest (Low-End PC)' },
                { id: '1080p', label: '1080P Full HD', desc: 'Standard Recommended' },
                { id: '4k', label: '4K Ultra HD', desc: 'Crisp Cinema Quality' },
              ].map((res) => (
                <button
                  key={res.id}
                  onClick={() => setResolution(res.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    resolution === res.id
                      ? 'bg-[#00f2fe]/10 border-[#00f2fe] text-white'
                      : 'bg-[#202026] border-[#2a2a34] text-[#8e8e9a] hover:text-white'
                  }`}
                >
                  <span className="font-semibold block text-xs">{res.label}</span>
                  <span className="text-[10px] text-[#6c6c7a] block mt-0.5">{res.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid Settings: Format, FPS, Bitrate */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[#8e8e9a] block mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full bg-[#202026] text-white rounded p-1.5 border border-[#2a2a34] focus:border-[#00f2fe]"
              >
                <option value="webm">WebM (Fast)</option>
                <option value="mp4">MP4 Video</option>
              </select>
            </div>

            <div>
              <label className="text-[#8e8e9a] block mb-1">Frame Rate</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value) as any)}
                className="w-full bg-[#202026] text-white rounded p-1.5 border border-[#2a2a34] focus:border-[#00f2fe]"
              >
                <option value={30}>30 FPS (Low CPU)</option>
                <option value={60}>60 FPS (Ultra Smooth)</option>
              </select>
            </div>

            <div>
              <label className="text-[#8e8e9a] block mb-1">Bitrate</label>
              <select
                value={bitrateQuality}
                onChange={(e) => setBitrateQuality(e.target.value as any)}
                className="w-full bg-[#202026] text-white rounded p-1.5 border border-[#2a2a34] focus:border-[#00f2fe]"
              >
                <option value="recommended">Recommended</option>
                <option value="low">Low (Fast)</option>
                <option value="high">High Bitrate</option>
              </select>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3 bg-[#141417] rounded-lg border border-[#24242c] flex items-center justify-between text-[11px]">
            <div>
              <span className="text-[#6c6c7a] block">Target Output:</span>
              <span className="font-mono text-white font-medium">
                {dims.width} × {dims.height} · {fps}fps · ~{estimatedMb} MB ({effectiveDuration.toFixed(1)}s{exportScope === 'range' ? ' Range' : ''})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#6c6c7a] block">Engine:</span>
              <span className="text-[#00f2fe] font-medium">100% Offline PC Render</span>
            </div>
          </div>

          {/* Progress Bar when exporting */}
          {isExporting && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#00f2fe] flex items-center gap-1.5 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Rendering Frames Locally...</span>
                </span>
                <span className="font-mono text-white font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#202026] rounded-full overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#00f2fe] to-[#00b4d8] transition-all duration-150"
                />
              </div>
            </div>
          )}

          {/* Export Complete State */}
          {exportComplete && downloadUrl && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-semibold text-xs">Export Finished Successfully!</span>
              </div>
              <button
                onClick={handleDownload}
                className="px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-[#121214] font-bold text-xs rounded transition-colors flex items-center gap-1 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Video</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-4 bg-[#141417] border-t border-[#24242c] flex items-center justify-between">
          <span className="text-[11px] text-[#6c6c7a]">
            Zero upload delay · No watermarks · Fully client-side
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isExporting) abortExportRef.current = true;
                onClose();
              }}
              className="px-3 py-1.5 rounded hover:bg-[#202026] text-white transition-colors"
            >
              Cancel
            </button>
            {!exportComplete ? (
              <button
                onClick={startExport}
                disabled={isExporting}
                className="px-4 py-1.5 bg-gradient-to-r from-[#00f2fe] to-[#00b4d8] hover:from-[#1ce5f0] hover:to-[#0096c7] text-[#121214] font-bold rounded shadow-sm transition-all disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Start Export'}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="px-4 py-1.5 bg-[#00f2fe] hover:bg-[#1ce5f0] text-[#121214] font-bold rounded shadow-sm transition-all"
              >
                Download Video
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
