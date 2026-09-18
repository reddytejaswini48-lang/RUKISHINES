// High-Fidelity Indian Festive Background Music & Sound Effects Engine
// Pure Web Audio API — 100% offline, zero-latency, realistic synthesis of:
// - Tanpura (harmonic drone)
// - Bansuri (bamboo flute with expressive vibrato & meend)
// - Shehnai (festive auspicious reed horn)
// - Temple Bells & Manjira (tierce/quint harmonic brass resonance)
// - Dholak & Tabla (deep resonant bass, crisp dayan ring, wooden rim clicks)
// - Sacred Conch (Shankha call)

export interface LevelMusicTheme {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  tempo: number;
}

export const LEVEL_THEMES: Record<string, LevelMusicTheme> = {
  MENU: {
    id: 'menu_sanctuary',
    name: 'Divine Temple Flute & Tanpura',
    hindiName: 'मंदिर बांसुरी व तानपुरा',
    description: 'Serene devotional meditation in Raga Bhupali',
    tempo: 70,
  },
  LEVEL_1: {
    id: 'level_1_modak',
    name: 'Modak Utsav Dholak Swing',
    hindiName: 'मोदक उत्सव ढोलक धुन',
    description: 'Upbeat festive 6/8 folk rhythm with lively shehnai',
    tempo: 116,
  },
  LEVEL_2: {
    id: 'level_2_puzzle',
    name: 'Sacred Mandap Bells & Sitar',
    hindiName: 'मंडप घंटा व सितार ध्वनि',
    description: 'Contemplative temple bells and serene melodic strings',
    tempo: 76,
  },
  LEVEL_3: {
    id: 'level_3_collector',
    name: 'Energetic Sacred Temple Bells & Ghanta Chimes',
    hindiName: 'ऊर्जावान मंदिर घंटा व घंटी ध्वनि',
    description: 'High-energy rhythmic brass temple bells, cascading chimes, and dancing manjira',
    tempo: 118,
  },
  LEVEL_4: {
    id: 'level_4_shringar',
    name: 'Royal Shringar Sitar & Veena Harmony',
    hindiName: 'राजसी श्रृंगार सितार व वीणा राग',
    description: 'Auspicious classical raga with sitar, veena, temple flute and sparkling jewelry bells',
    tempo: 96,
  },
  LEVEL_5: {
    id: 'level_5_damru_dance',
    name: 'Shankar Ji Ka Damru (Cartoon Dance Beat)',
    hindiName: 'शंकर जी का डमरू बोले डम डम डम',
    description: 'Playful cartoon beat with rapid Damru rhythm, cheerful flute, bouncing dholak & bells',
    tempo: 132,
  },
  CELEBRATION: {
    id: 'celebration_visarjan',
    name: 'Maha Aarti & Visarjan Celebration',
    hindiName: 'महाआरती व विसर्जन उत्सव',
    description: 'Triumphant fanfare with cascading temple bells and grand dhol',
    tempo: 128,
  },
};

type AudioStateListener = () => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;

  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private musicPlaying: boolean = false;

  private musicVolume: number = 0.32; // Pleasant, gentle background level
  private sfxVolume: number = 0.75;

  private currentLevelKey: string = 'MENU';
  private schedulerTimer: any = null;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;

  // Drone oscillators
  private droneNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  // Listeners for UI state reactivity
  private listeners: Set<AudioStateListener> = new Set();

  constructor() {
    // Restore sound preferences
    try {
      const savedSound = localStorage.getItem('ganesha_sound_enabled');
      if (savedSound !== null) {
        this.soundEnabled = savedSound === 'true';
      }
      const savedMusic = localStorage.getItem('ganesha_music_enabled');
      if (savedMusic !== null) {
        this.musicEnabled = savedMusic === 'true';
      }
    } catch (e) {
      console.warn('Audio settings storage notice:', e);
    }

    // Auto-unlock audio context upon first user gesture anywhere
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initCtx();
        if (this.soundEnabled && this.musicEnabled && !this.musicPlaying) {
          this.startLevelMusic(this.currentLevelKey);
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('pointerdown', unlock, { passive: true, once: true });
      window.addEventListener('keydown', unlock, { passive: true, once: true });
      window.addEventListener('touchstart', unlock, { passive: true, once: true });
    }
  }

  public subscribe(cb: AudioStateListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error(err);
      }
    });
  }

  public initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.soundEnabled ? 1 : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Music Master Filter (Warm acoustic warmth, removes harsh high-frequency digital aliasing)
        this.musicFilter = this.ctx.createBiquadFilter();
        this.musicFilter.type = 'lowpass';
        this.musicFilter.frequency.setValueAtTime(3400, this.ctx.currentTime);
        this.musicFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);
        this.musicFilter.connect(this.masterGain);

        // Music Gain
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
        this.musicGain.connect(this.musicFilter);

        // SFX Gain
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound & Music Toggles & Controls ---

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public isMusicPlaying(): boolean {
    return this.musicPlaying && this.musicEnabled && this.soundEnabled;
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public getCurrentTheme(): LevelMusicTheme {
    return LEVEL_THEMES[this.currentLevelKey] || LEVEL_THEMES.MENU;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    try {
      localStorage.setItem('ganesha_sound_enabled', String(this.soundEnabled));
    } catch {}

    this.initCtx();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.soundEnabled ? 1 : 0,
        this.ctx.currentTime,
        0.05
      );
    }

    if (!this.soundEnabled) {
      this.stopMusic();
    } else {
      this.playClick();
      if (this.musicEnabled) {
        this.startLevelMusic(this.currentLevelKey);
      }
    }

    this.notify();
    return this.soundEnabled;
  }

  public setSoundEnabled(val: boolean) {
    if (this.soundEnabled === val) return;
    this.toggleSound();
  }

  // Automatically switch background music for each level / screen
  public playTrackForLevel(levelOrScreen: string) {
    let targetKey = 'MENU';

    if (levelOrScreen === 'MENU' || levelOrScreen === 'INTRO') {
      targetKey = 'MENU';
    } else if (levelOrScreen === 'LEVEL_1' || levelOrScreen === '1') {
      targetKey = 'LEVEL_1';
    } else if (levelOrScreen === 'LEVEL_2' || levelOrScreen === '2') {
      targetKey = 'LEVEL_2';
    } else if (levelOrScreen === 'LEVEL_3' || levelOrScreen === '3') {
      targetKey = 'LEVEL_3';
    } else if (levelOrScreen === 'LEVEL_4' || levelOrScreen === '4') {
      targetKey = 'LEVEL_4';
    } else if (levelOrScreen === 'LEVEL_5' || levelOrScreen === '5') {
      targetKey = 'LEVEL_5';
    } else if (levelOrScreen === 'CELEBRATION' || levelOrScreen === 'REWARD') {
      targetKey = 'CELEBRATION';
    }

    if (this.currentLevelKey !== targetKey) {
      this.currentLevelKey = targetKey;
      if (this.musicPlaying) {
        this.stopMusic();
        this.startLevelMusic(targetKey);
      } else if (this.soundEnabled && this.musicEnabled) {
        this.startLevelMusic(targetKey);
      }
      this.notify();
    } else if (!this.musicPlaying && this.soundEnabled && this.musicEnabled) {
      this.startLevelMusic(targetKey);
    }
  }

  // --- Musical Synthesizer Engine (Lookahead Scheduler) ---

  public startFestiveMusic() {
    this.startLevelMusic(this.currentLevelKey);
  }

  public startLevelMusic(levelKey: string) {
    if (!this.soundEnabled || !this.musicEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    this.currentLevelKey = levelKey;

    if (this.musicPlaying) {
      this.stopMusic();
    }

    this.musicPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;

    // Start level-specific atmospheric drone (C / G root)
    this.startTanpuraDrone(levelKey);

    // Start precision musical scheduler
    this.runScheduler();
    this.notify();
  }

  public stopMusic() {
    this.musicPlaying = false;
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.stopTanpuraDrone();
    this.notify();
  }

  private runScheduler = () => {
    if (!this.musicPlaying || !this.ctx || !this.musicGain) return;

    const lookAheadTime = 0.25; // schedule notes 250ms ahead
    const theme = LEVEL_THEMES[this.currentLevelKey] || LEVEL_THEMES.MENU;
    const stepDuration = 60 / theme.tempo / 4; // 16th note step duration

    while (this.nextNoteTime < this.ctx.currentTime + lookAheadTime) {
      this.scheduleLevelStep(this.currentStep, this.nextNoteTime, this.currentLevelKey);
      this.nextNoteTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 64; // 4 measures of 16 steps
    }

    this.schedulerTimer = setTimeout(this.runScheduler, 50);
  };

  // --- Acoustic Instrument Synthesis Layer ---

  // 1. Tanpura Sacred Drone
  private startTanpuraDrone(levelKey: string) {
    this.stopTanpuraDrone();
    if (!this.ctx || !this.musicGain) return;

    // Harmonically tuned frequencies: Root C3 (130.81), Fifth G3 (196.00), Upper Sa C4 (261.63)
    const pitches = levelKey === 'LEVEL_2'
      ? [130.81, 196.0, 261.63, 392.0] // Extra deep chime for temple puzzle
      : levelKey === 'LEVEL_3'
      ? [261.63, 392.0, 523.25] // Shimmering high temple bell overtone resonance
      : levelKey === 'LEVEL_4'
      ? [130.81, 164.81, 196.0, 261.63] // Royal Shringar harmonic strings drone (C, E, G, C)
      : levelKey === 'LEVEL_5'
      ? [130.81, 196.0, 261.63, 329.63] // Energetic Kailash Bhupali drone for Damru dance
      : [130.81, 131.2, 196.0, 261.63];

    const now = this.ctx.currentTime;

    pitches.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const targetGain = 0.035 / (idx + 1);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(targetGain, now + 1.2);

      osc.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(now);
      this.droneNodes.push({ osc, gain });
    });
  }

  private stopTanpuraDrone() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.droneNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.setTargetAtTime(0.0001, now, 0.2);
        osc.stop(now + 0.3);
      } catch {}
    });
    this.droneNodes = [];
  }

  // 2. Bansuri (Indian Bamboo Flute with natural breath vibrato)
  private playBansuriNote(
    freq: number,
    startTime: number,
    duration: number,
    volume: number = 0.18,
    slideFrom?: number
  ) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, startTime);
    filter.Q.setValueAtTime(1.2, startTime);

    // Warm breath vibrato LFO (5 Hz)
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(5.0, startTime);
    vibratoGain.gain.setValueAtTime(0, startTime);
    vibratoGain.gain.setValueAtTime(0, startTime + 0.06);
    vibratoGain.gain.linearRampToValueAtTime(freq * 0.018, startTime + duration * 0.6);

    vibrato.connect(osc.frequency);
    vibrato.start(startTime);
    vibrato.stop(startTime + duration + 0.05);

    osc.type = 'triangle';
    if (slideFrom) {
      osc.frequency.setValueAtTime(slideFrom, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.07);
    } else {
      osc.frequency.setValueAtTime(freq, startTime);
    }

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.04);
    gain.gain.setValueAtTime(volume * 0.9, startTime + duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // 3. Shehnai (Auspicious Festive Reed Horn)
  private playShehnaiNote(
    freq: number,
    startTime: number,
    duration: number,
    volume: number = 0.14
  ) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.2, startTime);
    filter.Q.setValueAtTime(2.4, startTime);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // 4. Sitar / Veena (Plucked String with Metallic Chikari Resonance)
  private playSitarNote(
    freq: number,
    startTime: number,
    duration: number,
    volume: number = 0.16
  ) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration);
    filter.Q.setValueAtTime(2.0, startTime);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    // Pluck envelope: immediate sharp attack, sustained jawari shimmer
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // 5. Authentic Indian Temple Bell (Mandir Ghanta)
  public playTempleGhanta(
    startTime?: number,
    tone: 'deep' | 'resonant' | 'bright' = 'resonant',
    volume: number = 0.35,
    isSfx: boolean = false
  ) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = startTime !== undefined ? startTime : this.ctx.currentTime;
    const destGain = isSfx && this.sfxGain ? this.sfxGain : (this.musicGain || this.masterGain);
    if (!destGain) return;

    let baseFreq = 440; // A4
    let humFreq = 220; // A3
    let decayTime = 2.0;

    if (tone === 'deep') {
      baseFreq = 293.66; // D4
      humFreq = 146.83; // D3
      decayTime = 2.8;
    } else if (tone === 'bright') {
      baseFreq = 659.25; // E5
      humFreq = 329.63; // E4
      decayTime = 1.4;
    }

    // Strike clapper transient
    const strikeOsc = this.ctx.createOscillator();
    const strikeGain = this.ctx.createGain();
    strikeOsc.type = 'triangle';
    strikeOsc.frequency.setValueAtTime(baseFreq * 3.5, t);
    strikeGain.gain.setValueAtTime(volume * 0.4, t);
    strikeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    strikeOsc.connect(strikeGain);
    strikeGain.connect(destGain);
    strikeOsc.start(t);
    strikeOsc.stop(t + 0.04);

    // Dual-oscillator undulating hum ("wah-wah-wah" beating of brass bells)
    const humOsc1 = this.ctx.createOscillator();
    const humOsc2 = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();

    humOsc1.type = 'sine';
    humOsc2.type = 'sine';
    humOsc1.frequency.setValueAtTime(humFreq, t);
    humOsc2.frequency.setValueAtTime(humFreq + 1.2, t);

    humGain.gain.setValueAtTime(volume * 0.45, t);
    humGain.gain.exponentialRampToValueAtTime(0.0001, t + decayTime);

    humOsc1.connect(humGain);
    humOsc2.connect(humGain);
    humGain.connect(destGain);

    humOsc1.start(t);
    humOsc2.start(t);
    humOsc1.stop(t + decayTime);
    humOsc2.stop(t + decayTime);

    // Overtones (prime, minor 3rd tierce, fifth, octave)
    const partials = [
      { ratio: 1.0, vol: 0.7, decay: decayTime * 0.8 },
      { ratio: 1.189, vol: 0.45, decay: decayTime * 0.65 },
      { ratio: 1.503, vol: 0.38, decay: decayTime * 0.6 },
      { ratio: 2.0, vol: 0.32, decay: decayTime * 0.45 },
    ];

    partials.forEach(({ ratio, vol, decay }) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, t);
      g.gain.setValueAtTime(volume * vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(g);
      g.connect(destGain);

      osc.start(t);
      osc.stop(t + decay);
    });
  }

  // 6. Manjira (Hand Brass Finger Cymbals)
  public playManjira(startTime?: number, volume: number = 0.12) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const destGain = this.sfxGain || this.musicGain;
    if (!destGain) return;
    const t = startTime !== undefined ? startTime : this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(3136, t); // G7 high chime
    osc2.frequency.setValueAtTime(3200, t); // beating overtone

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(destGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.35);
    osc2.stop(t + 0.35);
  }

  // 7. Percussion: Dhol Bass, Dayan Treble, Rim Clatter
  private playDholBass(startTime: number, punch: boolean = false, vol: number = 0.28) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(punch ? 130 : 100, startTime);
    osc.frequency.exponentialRampToValueAtTime(48, startTime + 0.18);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + 0.2);
  }

  private playTablaRim(startTime: number, vol: number = 0.15) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, startTime); // D5
    osc.frequency.exponentialRampToValueAtTime(523.25, startTime + 0.06);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + 0.08);
  }

  private playRimClick(startTime: number, vol: number = 0.1) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(900, startTime);
    osc.frequency.exponentialRampToValueAtTime(250, startTime + 0.03);

    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + 0.03);
  }

  // 9. Sacred Damru (Hourglass drum with striking beads - sharp pop with pitch bend)
  public playDamruSound(startTime: number, isHighBead: boolean = false, volume: number = 0.22) {
    if (!this.ctx) return;
    const dest = this.sfxGain || this.musicGain;
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = isHighBead ? 520 : 380;
    const endFreq = isHighBead ? 190 : 130;

    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.045);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    // Filter to give authentic leather head resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHighBead ? 580 : 400, startTime);
    filter.Q.setValueAtTime(2.2, startTime);

    osc.connect(gain);
    gain.connect(filter);
    filter.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + 0.06);

    // Bead impact click
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'sine';
    click.frequency.setValueAtTime(isHighBead ? 1400 : 1050, startTime);
    click.frequency.exponentialRampToValueAtTime(200, startTime + 0.015);
    clickGain.gain.setValueAtTime(volume * 0.7, startTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.018);
    click.connect(clickGain);
    clickGain.connect(dest);
    click.start(startTime);
    click.stop(startTime + 0.02);
  }

  // Rapid Damru twirl roll (Dum-dum-dum-dum!)
  public playDamruRoll(startTime: number, count: number = 4, interval: number = 0.06, volume: number = 0.22) {
    for (let i = 0; i < count; i++) {
      this.playDamruSound(startTime + i * interval, i % 2 === 1, volume * (0.85 + 0.15 * Math.sin(i)));
    }
  }

  public playDamruTap(isHigh: boolean = false) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.playDamruSound(this.ctx.currentTime, isHigh, 0.32);
  }

  // 8. Ghunghroo (Cluster of small brass temple ankle bells)
  private playGhungroo(startTime: number, volume: number = 0.15) {
    if (!this.ctx || !this.musicGain) return;

    // Multi-tone high-frequency brass pellets rattling inside small bells
    const bellPitches = [3400, 4200, 5600, 6800];
    bellPitches.forEach((pitch, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const delay = i * 0.003;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, startTime + delay);

      gain.gain.setValueAtTime(volume * 0.3, startTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + delay + 0.06);

      osc.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(startTime + delay);
      osc.stop(startTime + delay + 0.06);
    });
  }

  // --- Energetic Festival Bell Synthesis (Level 3) ---

  // Tuned Brass Temple Bell & Chimes (Ghanta / Hand Bell)
  private playFestiveBell(
    freq: number,
    startTime: number,
    decayTime: number = 1.6,
    volume: number = 0.22,
    brightness: 'high' | 'mid' | 'deep' = 'mid'
  ) {
    if (!this.ctx || !this.musicGain) return;

    const t = startTime;
    const destGain = this.musicGain;

    // 1. Clapper strike impact (metallic transient ping)
    const strikeOsc = this.ctx.createOscillator();
    const strikeGain = this.ctx.createGain();
    strikeOsc.type = 'triangle';
    strikeOsc.frequency.setValueAtTime(freq * 2.8, t);
    strikeGain.gain.setValueAtTime(volume * 0.35, t);
    strikeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    strikeOsc.connect(strikeGain);
    strikeGain.connect(destGain);
    strikeOsc.start(t);
    strikeOsc.stop(t + 0.035);

    // 2. Bell Undulating Dual Fundamental (beating bell resonance)
    const humOsc1 = this.ctx.createOscillator();
    const humOsc2 = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();
    humOsc1.type = 'sine';
    humOsc2.type = 'sine';
    humOsc1.frequency.setValueAtTime(freq, t);
    humOsc2.frequency.setValueAtTime(freq + 1.4, t);
    humGain.gain.setValueAtTime(volume * 0.5, t);
    humGain.gain.exponentialRampToValueAtTime(0.0001, t + decayTime);
    humOsc1.connect(humGain);
    humOsc2.connect(humGain);
    humGain.connect(destGain);
    humOsc1.start(t);
    humOsc2.start(t);
    humOsc1.stop(t + decayTime);
    humOsc2.stop(t + decayTime);

    // 3. Tuned Bell Harmonics
    const partials =
      brightness === 'high'
        ? [
            { ratio: 1.0, vol: 0.6, decay: decayTime * 0.9 },
            { ratio: 1.5, vol: 0.45, decay: decayTime * 0.7 },
            { ratio: 2.0, vol: 0.35, decay: decayTime * 0.6 },
            { ratio: 2.76, vol: 0.28, decay: decayTime * 0.45 },
            { ratio: 3.5, vol: 0.2, decay: decayTime * 0.3 },
          ]
        : [
            { ratio: 1.0, vol: 0.65, decay: decayTime * 0.9 },
            { ratio: 1.189, vol: 0.4, decay: decayTime * 0.75 },
            { ratio: 1.503, vol: 0.35, decay: decayTime * 0.65 },
            { ratio: 2.0, vol: 0.28, decay: decayTime * 0.5 },
          ];

    partials.forEach(({ ratio, vol, decay }) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * ratio, t);
      g.gain.setValueAtTime(volume * vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      osc.connect(g);
      g.connect(destGain);
      osc.start(t);
      osc.stop(t + decay);
    });
  }

  // --- DISTINCT LEVEL BACKGROUND MUSIC COMPOSITIONS ---

  private scheduleLevelStep(step: number, time: number, levelKey: string) {
    switch (levelKey) {
      case 'MENU':
        this.composeMenuSanctuary(step, time);
        break;
      case 'LEVEL_1':
        this.composeLevel1ModakUtsav(step, time);
        break;
      case 'LEVEL_2':
        this.composeLevel2MandapBells(step, time);
        break;
      case 'LEVEL_3':
        this.composeLevel3EnergeticBells(step, time);
        break;
      case 'LEVEL_4':
        this.composeLevel4RoyalShringar(step, time);
        break;
      case 'LEVEL_5':
        this.composeLevel5DamruDance(step, time);
        break;
      case 'CELEBRATION':
        this.composeCelebrationVisarjan(step, time);
        break;
      default:
        this.composeMenuSanctuary(step, time);
    }
  }

  // THEME 1: MENU / INTRO — "Divine Temple Flute & Tanpura" (70 BPM, Serene Raga Bhupali)
  private composeMenuSanctuary(step: number, time: number) {
    const stepDuration = 60 / 70 / 4; // ~0.21s

    // Soft temple bell on measure starts
    if (step === 0) {
      this.playTempleGhanta(time, 'deep', 0.2, false);
    } else if (step === 32) {
      this.playTempleGhanta(time, 'resonant', 0.16, false);
    }

    // Very gentle tabla drone tap
    if (step % 16 === 0) {
      this.playDholBass(time, false, 0.18);
    }
    if (step % 16 === 8) {
      this.playTablaRim(time, 0.08);
    }

    // Peaceful, meditative Bansuri melodies in Raga Bhupali (C4, D4, E4, G4, A4, C5)
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.0, A4 = 440.0, C5 = 523.25;

    if (step === 0) this.playBansuriNote(C4, time, stepDuration * 6, 0.18);
    if (step === 8) this.playBansuriNote(D4, time, stepDuration * 5, 0.19);
    if (step === 14) this.playBansuriNote(E4, time, stepDuration * 8, 0.2, D4);

    if (step === 24) this.playBansuriNote(G4, time, stepDuration * 6, 0.2);
    if (step === 32) this.playBansuriNote(A4, time, stepDuration * 5, 0.21);
    if (step === 38) this.playBansuriNote(C5, time, stepDuration * 8, 0.22, A4);

    if (step === 48) this.playBansuriNote(A4, time, stepDuration * 5, 0.2);
    if (step === 54) this.playBansuriNote(G4, time, stepDuration * 4, 0.19);
    if (step === 58) this.playBansuriNote(E4, time, stepDuration * 6, 0.18, D4);
  }

  // THEME 2: LEVEL 1 — "Modak Utsav Dholak Swing" (116 BPM, Upbeat 6/8 folk rhythm)
  private composeLevel1ModakUtsav(step: number, time: number) {
    const stepDuration = 60 / 116 / 4;

    // Upbeat 6-step Dholak swing
    if (step % 6 === 0) {
      this.playDholBass(time, true, 0.35);
      this.playTempleGhanta(time, 'bright', 0.12, false);
    } else if (step % 6 === 3) {
      this.playDholBass(time, false, 0.25);
      this.playTablaRim(time, 0.18);
    } else {
      this.playRimClick(time, 0.08);
    }

    // Lively folk melody on Shehnai & Flute
    const G4 = 392.0, A4 = 440.0, C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99;

    if (step === 0) this.playShehnaiNote(G4, time, stepDuration * 2.5, 0.18);
    if (step === 3) this.playShehnaiNote(A4, time, stepDuration * 2.5, 0.19);
    if (step === 6) this.playShehnaiNote(C5, time, stepDuration * 4.0, 0.21);

    if (step === 12) this.playShehnaiNote(D5, time, stepDuration * 2.5, 0.2);
    if (step === 15) this.playShehnaiNote(E5, time, stepDuration * 4.5, 0.22);

    if (step === 24) this.playShehnaiNote(G5, time, stepDuration * 4.0, 0.24);
    if (step === 30) this.playShehnaiNote(E5, time, stepDuration * 2.5, 0.2);
    if (step === 33) this.playShehnaiNote(D5, time, stepDuration * 2.5, 0.19);

    if (step === 36) this.playBansuriNote(C5, time, stepDuration * 5.0, 0.22);
    if (step === 44) this.playBansuriNote(A4, time, stepDuration * 3.5, 0.2);
    if (step === 50) this.playBansuriNote(G4, time, stepDuration * 5.0, 0.18);
  }

  // THEME 3: LEVEL 2 — "Sacred Mandap Bells & Sitar" (76 BPM, Calm, Contemplative)
  private composeLevel2MandapBells(step: number, time: number) {
    const stepDuration = 60 / 76 / 4;

    // Resonant Temple Bells mark the sanctuary phrasing
    if (step === 0) {
      this.playTempleGhanta(time, 'deep', 0.32, false);
    } else if (step === 16) {
      this.playTempleGhanta(time, 'resonant', 0.24, false);
    } else if (step === 32) {
      this.playTempleGhanta(time, 'bright', 0.26, false);
    } else if (step === 48) {
      this.playTempleGhanta(time, 'resonant', 0.24, false);
    }

    // Soft sitar plucks creating thoughtful puzzle atmosphere
    const D3 = 146.83, A3 = 220.0, D4 = 293.66, Fs4 = 369.99, A4 = 440.0, C5 = 523.25, D5 = 587.33;

    if (step % 8 === 0) {
      this.playSitarNote(D3, time, stepDuration * 3.5, 0.18);
    }
    if (step % 8 === 4) {
      this.playSitarNote(A3, time, stepDuration * 3.0, 0.16);
    }

    // Sitar melodic ornaments
    if (step === 4) this.playSitarNote(D4, time, stepDuration * 2.8, 0.18);
    if (step === 12) this.playSitarNote(Fs4, time, stepDuration * 3.2, 0.2);
    if (step === 20) this.playSitarNote(A4, time, stepDuration * 3.5, 0.21);
    if (step === 28) this.playSitarNote(C5, time, stepDuration * 3.2, 0.2);
    if (step === 36) this.playSitarNote(D5, time, stepDuration * 4.5, 0.22);
    if (step === 44) this.playSitarNote(A4, time, stepDuration * 3.0, 0.19);
    if (step === 52) this.playSitarNote(Fs4, time, stepDuration * 3.5, 0.18);
    if (step === 60) this.playSitarNote(D4, time, stepDuration * 4.0, 0.17);
  }

  // THEME 4: LEVEL 3 — "Energetic Sacred Temple Bells & Ghanta Chimes" (118 BPM, High-Energy Bell Carillon)
  private composeLevel3EnergeticBells(step: number, time: number) {
    const stepDuration = 60 / 118 / 4; // ~0.127s per 16th note

    // 1. Deep & Resonant Temple Sanctum Bells (Mahaghanta)
    if (step === 0 || step === 16 || step === 32 || step === 48) {
      this.playTempleGhanta(time, 'deep', 0.44, false);
    } else if (step === 8 || step === 24 || step === 40 || step === 56) {
      this.playTempleGhanta(time, 'bright', 0.32, false);
    }

    // 2. Continuous Dancing Ghunghroo Bell Shimmer
    if (step % 2 === 0) {
      this.playGhungroo(time, 0.15);
    }

    // 3. Crisp Syncopated Hand Brass Manjira (Devotional Procession Rhythm)
    const stepInMeasure = step % 16;
    if (
      stepInMeasure === 2 ||
      stepInMeasure === 4 ||
      stepInMeasure === 7 ||
      stepInMeasure === 10 ||
      stepInMeasure === 12 ||
      stepInMeasure === 15
    ) {
      this.playManjira(time, 0.18);
    }

    // 4. Supportive Acoustic Temple Dhol & Rim (Acoustic Procession Pulse)
    if (step % 8 === 0) {
      this.playDholBass(time, step % 16 === 0, 0.24);
    } else if (step % 4 === 2) {
      this.playRimClick(time, 0.11);
    }

    // 5. Tuned High-Energy Festive Hand Bells (Melodic Carillon & Chimes)
    const C4 = 261.63, E4 = 329.63, G4 = 392.0, A4 = 440.0;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880.0;
    const C6 = 1046.5, D6 = 1174.66, E6 = 1318.51;

    // Harmonic bell bell-tine anchor on strong beats
    if (step % 16 === 0) this.playFestiveBell(C4, time, 1.8, 0.28, 'deep');
    if (step % 16 === 8) this.playFestiveBell(G4, time, 1.4, 0.24, 'mid');

    // Measure 1: Joyful Rising Bell Arpeggio & Sparkling Descent
    if (step === 0) this.playFestiveBell(C5, time, 1.6, 0.26, 'mid');
    if (step === 2) this.playFestiveBell(E5, time, 1.4, 0.25, 'mid');
    if (step === 4) this.playFestiveBell(G5, time, 1.5, 0.27, 'high');
    if (step === 6) this.playFestiveBell(A5, time, 1.3, 0.26, 'high');
    if (step === 8) this.playFestiveBell(C6, time, 1.8, 0.3, 'high'); // high chime
    if (step === 10) this.playFestiveBell(A5, time, 1.2, 0.25, 'high');
    if (step === 12) this.playFestiveBell(G5, time, 1.3, 0.26, 'mid');
    if (step === 14) this.playFestiveBell(E5, time, 1.1, 0.23, 'mid');

    // Measure 2: High Energy Dancing Bell Flourish
    if (step === 16) this.playFestiveBell(G5, time, 1.4, 0.27, 'high');
    if (step === 18) this.playFestiveBell(G5, time, 1.2, 0.25, 'high');
    if (step === 20) this.playFestiveBell(A5, time, 1.4, 0.28, 'high');
    if (step === 22) this.playFestiveBell(C6, time, 1.6, 0.3, 'high');
    if (step === 24) this.playFestiveBell(D6, time, 1.5, 0.3, 'high'); // peak bell
    if (step === 26) this.playFestiveBell(C6, time, 1.4, 0.28, 'high');
    if (step === 28) this.playFestiveBell(A5, time, 1.3, 0.26, 'high');
    if (step === 30) this.playFestiveBell(G5, time, 1.2, 0.24, 'mid');

    // Measure 3: Devotional Aarti Bell Homage
    if (step === 32) this.playFestiveBell(G5, time, 1.4, 0.26, 'mid');
    if (step === 34) this.playFestiveBell(G5, time, 1.2, 0.24, 'mid');
    if (step === 36) this.playFestiveBell(A5, time, 1.4, 0.28, 'high');
    if (step === 38) this.playFestiveBell(G5, time, 1.3, 0.25, 'mid');
    if (step === 40) this.playFestiveBell(E5, time, 1.2, 0.23, 'mid');
    if (step === 42) this.playFestiveBell(G5, time, 1.4, 0.26, 'high');
    if (step === 44) this.playFestiveBell(A5, time, 1.4, 0.27, 'high');
    if (step === 46) this.playFestiveBell(C6, time, 1.6, 0.29, 'high');

    // Measure 4: Cascading Temple Bell Fanfare & Resonant Climax
    if (step === 48) this.playFestiveBell(C6, time, 1.5, 0.28, 'high');
    if (step === 50) this.playFestiveBell(D6, time, 1.5, 0.29, 'high');
    if (step === 52) this.playFestiveBell(E6, time, 1.8, 0.32, 'high'); // luminous high chime!
    if (step === 54) this.playFestiveBell(D6, time, 1.4, 0.28, 'high');
    if (step === 56) this.playFestiveBell(C6, time, 1.5, 0.28, 'high');
    if (step === 58) this.playFestiveBell(A5, time, 1.3, 0.25, 'high');
    if (step === 60) this.playFestiveBell(G5, time, 1.4, 0.25, 'mid');
    if (step === 62) {
      // Grand double harmonic bell ring closing the cycle
      this.playFestiveBell(C5, time, 2.2, 0.26, 'mid');
      this.playFestiveBell(C6, time, 2.2, 0.28, 'high');
    }
  }

  // THEME 5: LEVEL 4 — "Royal Shringar Sitar & Veena Harmony" (96 BPM, Graceful Attire & Jewelry Raga)
  private composeLevel4RoyalShringar(step: number, time: number) {
    const stepDuration = 60 / 96 / 4; // ~0.156s per 16th note

    // 1. Subtle royal rhythm & soft ghunghroo shimmer
    if (step % 8 === 0) {
      this.playDholBass(time, step % 16 === 0, 0.22);
    } else if (step % 8 === 4) {
      this.playRimClick(time, 0.1);
    }

    if (step % 2 === 0) {
      this.playGhungroo(time, 0.1);
    }

    if (step % 16 === 8 || step % 16 === 14) {
      this.playManjira(time, 0.12);
    }

    // 2. Frequencies for Raga Bilawal / Bhupali Shringar
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.0, A4 = 440.0;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880.0, C6 = 1046.5;

    // Resonant temple bell chime on first beat of every measure
    if (step === 0 || step === 32) {
      this.playTempleGhanta(time, 'resonant', 0.28, false);
    }

    // Measure 1: Sitar royal shringar ascending phrase
    if (step === 0) this.playSitarNote(C4, time, stepDuration * 3.5, 0.24);
    if (step === 4) this.playSitarNote(E4, time, stepDuration * 3.0, 0.22);
    if (step === 8) this.playSitarNote(G4, time, stepDuration * 3.5, 0.25);
    if (step === 12) this.playSitarNote(A4, time, stepDuration * 3.5, 0.22);

    // Measure 2: Lyrical flute response (Bansuri)
    if (step === 16) this.playBansuriNote(C5, time, stepDuration * 3.5, 0.24);
    if (step === 20) this.playBansuriNote(D5, time, stepDuration * 3.0, 0.22);
    if (step === 24) this.playBansuriNote(E5, time, stepDuration * 4.0, 0.26);
    if (step === 28) this.playBansuriNote(D5, time, stepDuration * 2.5, 0.2);

    // Measure 3: Delicate jewelry bell flourishes & Veena plucks
    if (step === 32) this.playFestiveBell(G5, time, 1.2, 0.22, 'high');
    if (step === 34) this.playFestiveBell(A5, time, 1.1, 0.22, 'high');
    if (step === 36) this.playSitarNote(G4, time, stepDuration * 3.0, 0.22);
    if (step === 40) this.playSitarNote(E4, time, stepDuration * 3.0, 0.2);
    if (step === 44) this.playFestiveBell(C6, time, 1.4, 0.25, 'high');

    // Measure 4: Graceful cadence returning to C
    if (step === 48) this.playBansuriNote(G4, time, stepDuration * 3.0, 0.22);
    if (step === 52) this.playBansuriNote(A4, time, stepDuration * 3.0, 0.22);
    if (step === 56) this.playBansuriNote(C5, time, stepDuration * 4.0, 0.25);
    if (step === 60) this.playSitarNote(C4, time, stepDuration * 3.5, 0.22);
  }

  // Public sound effect for equipping costumes & jewelries
  public playJewelryEquip() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    // Glistening golden jewelry chime (triad arpeggio with high harmonic bell)
    const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.035);
      gain.gain.setValueAtTime(0.12, t + i * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.035 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.035);
      osc.stop(t + i * 0.035 + 0.35);
    });
  }

  // THEME 5: LEVEL 5 — "Shankar Ji Ka Damru (Cartoon Dance Beat)" (132 BPM, Playful & Bouncing)
  private composeLevel5DamruDance(step: number, time: number) {
    const stepDuration = 60 / 132 / 4;

    // Pitch constants
    const C4 = 261.63;
    const D4 = 293.66;
    const E4 = 329.63;
    const F4 = 349.23;
    const G4 = 392.00;
    const A4 = 440.00;
    const B4 = 493.88;
    const C5 = 523.25;
    const D5 = 587.33;
    const E5 = 659.25;
    const G5 = 783.99;

    // --- 1. Sacred Damru Rhythmic Twirls (Dum-dum! Dum-dum-dum!) ---
    // Every 2 steps bouncy rhythm
    if (step % 4 === 0) {
      this.playDamruSound(time, false, 0.26); // Deep Dum
    } else if (step % 4 === 2) {
      this.playDamruSound(time, true, 0.28); // Snappy Dum
    }

    // Occasional rapid damru rolls for joyful cartoon flourish
    if (step === 30 || step === 62) {
      this.playDamruRoll(time, 3, 0.045, 0.24);
    }

    // --- 2. Bouncing Bass Dholak & Tabla Grooves ---
    if (step % 8 === 0) {
      this.playDholBass(time, false, 0.38);
    }
    if (step % 8 === 6) {
      this.playDholBass(time, true, 0.32);
    }
    if (step % 4 === 2) {
      this.playTablaRim(time, 0.18);
    }

    // --- 3. Manjira and Dancing Ghunghroo Ankle Bells ---
    if (step % 4 === 2 || step % 4 === 0) {
      this.playGhungroo(time, 0.12);
    }
    if (step % 8 === 4) {
      this.playManjira(time, 0.18);
    }
    if (step % 16 === 0) {
      this.playFestiveBell(1318.5, time, 0.5, 0.18, 'high'); // High cheerful bell
    }

    // --- 4. Catchy Cartoon Lead Melody ("Shankar Ji Ka Damru Baaje Dum Dum Dum") ---
    // Measure 1 (steps 0 - 15): "Shan-kar Ji Ka Dam-ru Bo-le"
    if (step === 0) this.playBansuriNote(G4, time, stepDuration * 1.8, 0.35);
    if (step === 2) this.playBansuriNote(G4, time, stepDuration * 1.8, 0.35);
    if (step === 4) this.playBansuriNote(E4, time, stepDuration * 1.8, 0.36);
    if (step === 6) this.playBansuriNote(G4, time, stepDuration * 1.8, 0.36);
    if (step === 8) this.playBansuriNote(A4, time, stepDuration * 1.8, 0.38);
    if (step === 10) this.playBansuriNote(G4, time, stepDuration * 1.8, 0.38);
    if (step === 12) this.playBansuriNote(E4, time, stepDuration * 1.8, 0.36);
    if (step === 14) this.playBansuriNote(D4, time, stepDuration * 1.8, 0.34);

    // Measure 2 (steps 16 - 31): "Dum Dum Dum Dum Dam-ru Baa-je"
    if (step === 16) {
      this.playSitarNote(C4, time, stepDuration * 1.6, 0.34);
      this.playDamruSound(time, false, 0.3);
    }
    if (step === 18) {
      this.playSitarNote(C4, time, stepDuration * 1.6, 0.34);
      this.playDamruSound(time, true, 0.3);
    }
    if (step === 20) {
      this.playSitarNote(D4, time, stepDuration * 1.6, 0.35);
      this.playDamruSound(time, false, 0.3);
    }
    if (step === 22) {
      this.playSitarNote(E4, time, stepDuration * 1.6, 0.35);
      this.playDamruSound(time, true, 0.3);
    }
    if (step === 24) this.playBansuriNote(G4, time, stepDuration * 1.8, 0.36);
    if (step === 26) this.playBansuriNote(A4, time, stepDuration * 1.8, 0.38);
    if (step === 28) this.playBansuriNote(G4, time, stepDuration * 1.8, 0.38);
    if (step === 30) this.playBansuriNote(E4, time, stepDuration * 1.8, 0.36);

    // Measure 3 (steps 32 - 47): "Bho-le-naath San-ga Naa-che Re"
    if (step === 32) this.playBansuriNote(C5, time, stepDuration * 1.8, 0.40);
    if (step === 34) this.playBansuriNote(C5, time, stepDuration * 1.8, 0.40);
    if (step === 36) this.playBansuriNote(A4, time, stepDuration * 1.8, 0.38);
    if (step === 38) this.playBansuriNote(C5, time, stepDuration * 1.8, 0.40);
    if (step === 40) this.playBansuriNote(D5, time, stepDuration * 1.8, 0.42);
    if (step === 42) this.playBansuriNote(C5, time, stepDuration * 1.8, 0.40);
    if (step === 44) this.playBansuriNote(A4, time, stepDuration * 1.8, 0.38);
    if (step === 46) this.playBansuriNote(G4, time, stepDuration * 2.5, 0.38);

    // Measure 4 (steps 48 - 63): "Gan-pa-ti Moo-shak Sang Naa-che!"
    if (step === 48) this.playBansuriNote(E5, time, stepDuration * 1.8, 0.42);
    if (step === 50) this.playBansuriNote(D5, time, stepDuration * 1.8, 0.42);
    if (step === 52) this.playBansuriNote(C5, time, stepDuration * 1.8, 0.40);
    if (step === 54) this.playBansuriNote(A4, time, stepDuration * 1.8, 0.38);
    if (step === 56) this.playBansuriNote(G4, time, stepDuration * 1.8, 0.38);
    if (step === 58) this.playBansuriNote(A4, time, stepDuration * 1.8, 0.40);
    if (step === 60) {
      this.playBansuriNote(C5, time, stepDuration * 3.5, 0.45);
      this.playFestiveBell(time, 1046.5, 0.25, 0.8);
    }
  }

  // THEME 6: CELEBRATION — "Maha Aarti & Visarjan Celebration" (128 BPM, Triumphant Fanfare)
  private composeCelebrationVisarjan(step: number, time: number) {
    const stepDuration = 60 / 128 / 4;

    // High energy celebration beats with thunderous bass and cascading bells
    if (step % 16 === 0) {
      this.playDholBass(time, true, 0.45);
      this.playTempleGhanta(time, 'deep', 0.35, false);
    }
    if (step % 16 === 4) this.playDholBass(time, false, 0.32);
    if (step % 16 === 8) {
      this.playDholBass(time, true, 0.38);
      this.playTempleGhanta(time, 'resonant', 0.28, false);
    }
    if (step % 16 === 12) this.playDholBass(time, false, 0.3);

    if (step % 2 === 0) {
      this.playTablaRim(time, 0.16);
    } else {
      this.playRimClick(time, 0.12);
    }

    // Grand triumphant brass shehnai fanfare
    const C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880.0, C6 = 1046.5;

    if (step === 0) this.playShehnaiNote(C5, time, stepDuration * 3.5, 0.22);
    if (step === 4) this.playShehnaiNote(E5, time, stepDuration * 3.5, 0.24);
    if (step === 8) this.playShehnaiNote(G5, time, stepDuration * 3.8, 0.26);
    if (step === 12) this.playShehnaiNote(G5, time, stepDuration * 3.5, 0.25);

    if (step === 16) this.playShehnaiNote(A5, time, stepDuration * 3.5, 0.26);
    if (step === 20) this.playShehnaiNote(G5, time, stepDuration * 3.5, 0.25);
    if (step === 24) this.playShehnaiNote(E5, time, stepDuration * 3.5, 0.23);
    if (step === 28) this.playShehnaiNote(C5, time, stepDuration * 3.5, 0.22);

    if (step === 32) this.playShehnaiNote(E5, time, stepDuration * 3.5, 0.24);
    if (step === 36) this.playShehnaiNote(G5, time, stepDuration * 3.5, 0.25);
    if (step === 40) this.playShehnaiNote(A5, time, stepDuration * 3.5, 0.27);
    if (step === 44) this.playShehnaiNote(C6, time, stepDuration * 4.0, 0.3);

    if (step === 48) this.playShehnaiNote(A5, time, stepDuration * 3.5, 0.26);
    if (step === 52) this.playShehnaiNote(G5, time, stepDuration * 3.5, 0.25);
    if (step === 56) this.playShehnaiNote(E5, time, stepDuration * 3.5, 0.23);
    if (step === 60) this.playShehnaiNote(C5, time, stepDuration * 4.0, 0.22);
  }

  // --- Sound Effects (SFX) ---

  // Button click
  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Modak slice: crisp golden swoosh
  public playSlice() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, t);
    osc1.frequency.exponentialRampToValueAtTime(200, t + 0.1);
    gain1.gain.setValueAtTime(0.28, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.1);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, t + 0.02); // D6
    osc2.frequency.exponentialRampToValueAtTime(1760, t + 0.16); // A6
    gain2.gain.setValueAtTime(0.22, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t + 0.02);
    osc2.stop(t + 0.2);
  }

  // Combo slice chime
  public playCombo() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [880, 1108.73, 1318.51, 1760];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + i * 0.04;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.2, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(st);
      osc.stop(st + 0.22);
    });
  }

  // Obstacle hit
  public playObstacleHit() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Puzzle swap
  public playPuzzleSwap() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playPuzzleCorrect() {
    this.playTempleGhanta(undefined, 'resonant', 0.36, true);
  }

  public playBell() {
    this.playTempleGhanta(undefined, 'bright', 0.3, true);
  }

  public playSuccess() {
    this.playLevelComplete();
  }

  // Sacred temple bells cascade (Aarti Ghantanaad)
  public playTempleGhantaCascade() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.playTempleGhanta(t, 'bright', 0.26, true);
    this.playTempleGhanta(t + 0.16, 'resonant', 0.32, true);
    this.playTempleGhanta(t + 0.38, 'deep', 0.38, true);
    this.playTempleGhanta(t + 0.65, 'resonant', 0.3, true);
  }

  // Runner item collection
  public playCollect() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, t);
    osc1.frequency.exponentialRampToValueAtTime(1318.51, t + 0.14);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, t + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(2637.02, t + 0.16);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc1.stop(t + 0.3);
    osc2.start(t + 0.03);
    osc2.stop(t + 0.3);
  }

  public playJump() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.16);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playSlide() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.18);

    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playLevelComplete() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const chord = [
      { f: 523.25, start: 0, dur: 0.2 },
      { f: 659.25, start: 0.14, dur: 0.2 },
      { f: 783.99, start: 0.28, dur: 0.24 },
      { f: 1046.5, start: 0.42, dur: 0.5 },
      { f: 1318.51, start: 0.42, dur: 0.5 },
    ];

    chord.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + n.start;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, st);

      gain.gain.setValueAtTime(0.2, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + n.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(st);
      osc.stop(st + n.dur);
    });
  }

  public playLifeLost() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(130, t + 0.28);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  public playCelebrate() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const bellNotes = [659.25, 783.99, 987.77, 1046.5, 1318.51];
    for (let i = 0; i < 10; i++) {
      const noteTime = t + i * 0.12;
      const f = bellNotes[i % bellNotes.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    }
  }
}

export const sound = new SoundManager();
