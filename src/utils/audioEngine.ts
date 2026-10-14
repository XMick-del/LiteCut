// Web Audio API offline sound synthesizer & audio manager for CapCut Pro PC

class CapCutAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGainNode: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.value = 1.0;
        this.masterGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val: number) {
    this.initCtx();
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : Math.max(0, Math.min(2, val)), this.ctx.currentTime);
    }
  }

  toggleMute(muted: boolean) {
    this.isMuted = muted;
    this.initCtx();
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
    }
  }

  // Synthesize sound effects on-the-fly (zero disk storage, zero lag)
  playSoundEffect(name: string, volume: number = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGainNode) return;

    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.connect(this.masterGainNode);

    switch (name.toLowerCase()) {
      case 'whoosh':
      case 'cinematic whoosh': {
        // White noise through sweeping bandpass filter
        const bufferSize = this.ctx.sampleRate * 0.4;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.38);
        filter.Q.value = 3.0;

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        whiteNoise.connect(filter);
        filter.connect(gain);
        whiteNoise.start(now);
        whiteNoise.stop(now + 0.4);
        break;
      }

      case 'bass drop':
      case 'bass drop impact':
      case 'boom': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

        gain.gain.setValueAtTime(volume * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }

      case 'pop':
      case 'snap': {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'glitch':
      case 'glitch hit': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(320, now);
        osc2.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(volume * 0.7, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.16);
        osc2.stop(now + 0.16);
        break;
      }

      case 'camera shutter':
      case 'click': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(volume * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      default: {
        // Standard pleasant beep notification
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    }
  }

  // Pre-generate audio buffer for export audio mixing
  async renderAudioMix(
    clips: Array<{ name: string; start: number; duration: number; volume: number }>,
    totalDuration: number
  ): Promise<AudioBuffer | null> {
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    if (!OfflineCtx) return null;

    const sampleRate = 44100;
    const lengthInSamples = Math.max(1, Math.ceil(totalDuration * sampleRate));
    const offlineCtx = new OfflineCtx(2, lengthInSamples, sampleRate);

    // Render audio clips
    for (const clip of clips) {
      const now = clip.start;
      const gain = offlineCtx.createGain();
      gain.gain.setValueAtTime(clip.volume || 1.0, now);
      gain.connect(offlineCtx.destination);

      if (clip.name.toLowerCase().includes('bass') || clip.name.toLowerCase().includes('boom')) {
        const osc = offlineCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + Math.min(0.6, clip.duration));
        gain.gain.setValueAtTime(clip.volume * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + Math.min(0.7, clip.duration));
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + Math.min(0.7, clip.duration));
      } else if (clip.name.toLowerCase().includes('whoosh')) {
        const bufferSize = sampleRate * 0.4;
        const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = offlineCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.38);
        filter.Q.value = 3.0;
        whiteNoise.connect(filter);
        filter.connect(gain);
        whiteNoise.start(now);
        whiteNoise.stop(now + 0.4);
      }
    }

    try {
      return await offlineCtx.startRendering();
    } catch {
      return null;
    }
  }
}

export const audioEngine = new CapCutAudioEngine();
