// Utility functions for sound and haptic feedback

export interface FeedbackOptions {
  enableSound?: boolean;
  enableHaptic?: boolean;
  volume?: number;
}

// Default feedback settings
const DEFAULT_OPTIONS: FeedbackOptions = {
  enableSound: true,
  enableHaptic: true,
  volume: 0.3,
};

// Sound frequencies for different events
const SOUND_FREQUENCIES = {
  completion: 800,
  transition: 400,
  settle: 600,
};

// Create audio context for sound generation
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported:', e);
      return null;
    }
  }
  return audioContext;
};

// Play a tone with given frequency and duration
const playTone = (frequency: number, duration: number, volume: number = 0.3) => {
  const context = getAudioContext();
  if (!context) return;

  try {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  } catch (e) {
    console.warn('Error playing tone:', e);
  }
};

// Haptic feedback function
const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' = 'medium') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  const patterns = {
    light: 50,
    medium: 100,
    heavy: 200,
  };

  try {
    navigator.vibrate(patterns[pattern]);
  } catch (e) {
    console.warn('Haptic feedback not supported:', e);
  }
};

// Exported feedback functions
export const completionFeedback = (options: FeedbackOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.enableSound) {
    // Play success chime (ascending tones)
    playTone(SOUND_FREQUENCIES.completion, 0.15, opts.volume);
    setTimeout(() => playTone(SOUND_FREQUENCIES.completion * 1.25, 0.15, opts.volume), 100);
  }

  if (opts.enableHaptic) {
    triggerHaptic('medium');
  }
};

export const transitionFeedback = (options: FeedbackOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.enableSound) {
    // Play whoosh sound (frequency sweep)
    const context = getAudioContext();
    if (context) {
      try {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.setValueAtTime(600, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.3);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(opts.volume! * 0.5, context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.3);
      } catch (e) {
        console.warn('Error playing transition sound:', e);
      }
    }
  }

  if (opts.enableHaptic) {
    triggerHaptic('light');
  }
};

export const settleFeedback = (options: FeedbackOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.enableSound) {
    // Play gentle settle sound
    playTone(SOUND_FREQUENCIES.settle, 0.1, opts.volume! * 0.4);
  }

  if (opts.enableHaptic) {
    triggerHaptic('light');
  }
};

// Initialize audio context on user interaction (required by browsers)
export const initializeAudio = () => {
  if (typeof window === 'undefined') return;
  
  const context = getAudioContext();
  if (context && context.state === 'suspended') {
    context.resume().catch(e => console.warn('Failed to resume audio context:', e));
  }
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if audio is supported
export const isAudioSupported = (): boolean => {
  return typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext);
};

// Check if haptic is supported
export const isHapticSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};
