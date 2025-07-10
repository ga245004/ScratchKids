// Sound effects for better user feedback
class SoundEffects {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.3;
    this.initializeSounds();
  }

  initializeSounds() {
    // Create audio contexts for different sound types
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Initialize sound buffers
    this.sounds = {
      click: this.createBeep(800, 0.1, 'sine'),
      success: this.createBeep(1000, 0.3, 'sine'),
      error: this.createBeep(300, 0.5, 'sawtooth'),
      hover: this.createBeep(600, 0.05, 'sine'),
      complete: this.createSuccessChime(),
      badge: this.createBadgeSound(),
      step: this.createStepSound(),
      save: this.createSaveSound()
    };
  }

  createBeep(frequency, duration, type = 'sine') {
    return () => {
      if (!this.enabled) return;
      
      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
      } catch (error) {
        console.warn('Sound playback failed:', error);
      }
    };
  }

  createSuccessChime() {
    return () => {
      if (!this.enabled) return;
      
      try {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
          }, index * 100);
        });
      } catch (error) {
        console.warn('Success chime playback failed:', error);
      }
    };
  }

  createBadgeSound() {
    return () => {
      if (!this.enabled) return;
      
      try {
        const notes = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
        notes.forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.4);
          }, index * 80);
        });
      } catch (error) {
        console.warn('Badge sound playback failed:', error);
      }
    };
  }

  createStepSound() {
    return () => {
      if (!this.enabled) return;
      
      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(880, this.audioContext.currentTime + 0.1);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
      } catch (error) {
        console.warn('Step sound playback failed:', error);
      }
    };
  }

  createSaveSound() {
    return () => {
      if (!this.enabled) return;
      
      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.25);
      } catch (error) {
        console.warn('Save sound playback failed:', error);
      }
    };
  }

  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

// Create and export a singleton instance
export const soundManager = new SoundEffects();

// Export individual sound functions for convenience
export const playClick = () => soundManager.play('click');
export const playSuccess = () => soundManager.play('success');
export const playError = () => soundManager.play('error');
export const playHover = () => soundManager.play('hover');
export const playComplete = () => soundManager.play('complete');
export const playBadge = () => soundManager.play('badge');
export const playStep = () => soundManager.play('step');
export const playSave = () => soundManager.play('save');