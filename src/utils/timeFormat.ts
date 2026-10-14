export function formatTimecode(seconds: number, fps: number = 30): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const totalFrames = Math.floor(seconds * fps);
  const frames = totalFrames % fps;
  const totalSeconds = Math.floor(seconds);
  const secs = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const mins = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const pad = (num: number, size: number = 2) => String(num).padStart(size, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
  }
  return `${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

export function formatDurationSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${Number(secs) < 10 ? '0' : ''}${secs}s`;
}
