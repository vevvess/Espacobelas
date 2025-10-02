/**
 * Utilitários para reprodução de sons de notificação no chat
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    // Inicializar AudioContext quando o usuário interagir pela primeira vez
    this.initAudioContext();
  }

  private initAudioContext() {
    const init = () => {
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        } catch (error) {
          console.warn("AudioContext não suportado:", error);
        }
      }
      document.removeEventListener("click", init);
      document.removeEventListener("keydown", init);
    };

    document.addEventListener("click", init);
    document.addEventListener("keydown", init);
  }

  /**
   * Reproduzir som de notificação simples
   */
  playNotification() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configurar som
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        600,
        this.audioContext.currentTime + 0.1,
      );

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        this.audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 0.3,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn("Erro ao reproduzir som:", error);
    }
  }

  /**
   * Reproduzir som mais suave para mensagens próprias
   */
  playMessageSent() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Som mais suave
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.05,
        this.audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 0.1,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn("Erro ao reproduzir som:", error);
    }
  }

  /**
   * Habilitar/desabilitar sons
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem("chatSoundsEnabled", enabled.toString());
  }

  /**
   * Verificar se sons estão habilitados
   */
  isEnabled() {
    const saved = localStorage.getItem("chatSoundsEnabled");
    return saved !== null ? saved === "true" : true;
  }

  /**
   * Inicializar com configuração salva
   */
  init() {
    this.enabled = this.isEnabled();
  }
}

// Instância global do gerenciador de som
export const soundManager = new SoundManager();

// Funções de conveniência
export const playNotificationSound = () => soundManager.playNotification();
export const playMessageSentSound = () => soundManager.playMessageSent();
export const setSoundsEnabled = (enabled: boolean) =>
  soundManager.setEnabled(enabled);
export const areSoundsEnabled = () => soundManager.isEnabled();

// Inicializar automaticamente
soundManager.init();
