// Web Audio API Procedural Synthesizer and Sound Effects Engine
// 100% immune to external CDN failures or CORS blocking

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;
  private ambientGainNode: GainNode | null = null;
  private currentAmbientType: string | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientNoiseNode: AudioNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGainNode) {
      this.ambientGainNode.gain.setValueAtTime(muted ? 0 : this.masterVolume * 0.15, this.ctx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGainNode && !this.isMuted) {
      this.ambientGainNode.gain.setValueAtTime(this.masterVolume * 0.15, this.ctx?.currentTime || 0);
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  // Play Dice Roll Sound (Clicky, rattling dice clatter)
  public playDiceRoll() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const clicks = 5;
    for (let i = 0; i < clicks; i++) {
      const clickTime = now + i * 0.06 + Math.random() * 0.02;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + Math.random() * 600, clickTime);
      osc.frequency.exponentialRampToValueAtTime(100, clickTime + 0.04);

      gain.gain.setValueAtTime(0.3 * this.masterVolume, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(clickTime);
      osc.stop(clickTime + 0.05);
    }
  }

  // Play Dramatic Chime for Critical / Miraculous Success
  public playSuccessSound() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C major chord

    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2 * this.masterVolume, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  }

  // Play Deep Ominous Thud for Failure / Critical Failure
  public playFailureSound() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.8);

    gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  // Play subtle narrative text typing / completion sound
  public playTurnComplete() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

    gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Atmospheric Ambient Generator (Mystic, Rain, Tavern, Tension)
  public setAtmosphericAmbient(ambientTag?: string) {
    this.initContext();
    if (!this.ctx) return;

    const tag = ambientTag || 'mystic_journey';
    if (this.currentAmbientType === tag) return;
    this.currentAmbientType = tag;

    // Stop previous ambient
    this.stopAmbient();

    if (this.isMuted) return;

    const now = this.ctx.currentTime;
    this.ambientGainNode = this.ctx.createGain();
    this.ambientGainNode.gain.setValueAtTime(0.001, now);
    this.ambientGainNode.gain.exponentialRampToValueAtTime(this.masterVolume * 0.12, now + 2);
    this.ambientGainNode.connect(this.ctx.destination);

    // Create 2 warm sine drone harmonics
    const baseFreq = tag.includes('tension') ? 73.42 : tag.includes('rain') ? 87.31 : 110.0;
    const harmonics = [baseFreq, baseFreq * 1.5];

    harmonics.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Add gentle LFO vibrato
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(0.15, now);
      lfoGain.gain.setValueAtTime(1.5, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(this.ambientGainNode!);
      osc.start(now);
      lfo.start(now);

      this.ambientOscillators.push(osc, lfo);
    });
  }

  public stopAmbient() {
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.ambientOscillators = [];
    if (this.ambientGainNode) {
      try {
        this.ambientGainNode.disconnect();
      } catch {}
      this.ambientGainNode = null;
    }
  }
}

export const soundEngine = new AudioEngine();
