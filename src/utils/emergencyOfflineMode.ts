// Emergency offline mode for handling persistent network failures

class EmergencyOfflineMode {
  private consecutiveFailures = 0;
  private isOfflineMode = false;
  private lastFailureTime = 0;
  private maxConsecutiveFailures = 3;
  private cooldownPeriod = 60000; // 1 minute
  private listeners: Array<(isOffline: boolean) => void> = [];

  recordFailure(error: Error) {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    // Enter offline mode after too many consecutive failures
    if (this.consecutiveFailures >= this.maxConsecutiveFailures && !this.isOfflineMode) {
      this.enableOfflineMode();
    }
  }

  recordSuccess() {
    if (this.isOfflineMode && this.consecutiveFailures > 0) {
      console.log('✅ Connection restored - exiting emergency offline mode');
    }
    
    this.consecutiveFailures = 0;
    this.lastFailureTime = 0;
    
    if (this.isOfflineMode) {
      this.disableOfflineMode();
    }
  }

  private enableOfflineMode() {
    console.warn('🚨 Entering emergency offline mode due to persistent connection failures');
    this.isOfflineMode = true;
    this.notifyListeners();
    
    // Show user notification
    this.showOfflineNotification();
  }

  private disableOfflineMode() {
    console.log('🌐 Exiting emergency offline mode - connection restored');
    this.isOfflineMode = false;
    this.notifyListeners();
  }

  private showOfflineNotification() {
    // Create a non-intrusive notification
    const notification = document.createElement('div');
    notification.id = 'emergency-offline-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      ���� Modo offline ativo - Problemas de conectividade
    `;

    document.body.appendChild(notification);

    // Auto-remove after showing
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  shouldBlockNetworkRequests(): boolean {
    return this.isOfflineMode;
  }

  canRetry(): boolean {
    if (!this.isOfflineMode) return true;
    
    // Allow retry after cooldown period
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    return timeSinceLastFailure > this.cooldownPeriod;
  }

  getStatus() {
    return {
      isOfflineMode: this.isOfflineMode,
      consecutiveFailures: this.consecutiveFailures,
      timeSinceLastFailure: this.lastFailureTime ? Date.now() - this.lastFailureTime : 0,
      canRetry: this.canRetry()
    };
  }

  addListener(callback: (isOffline: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.isOfflineMode);
      } catch (error) {
        console.error('Error in offline mode listener:', error);
      }
    });
  }

  reset() {
    this.consecutiveFailures = 0;
    this.lastFailureTime = 0;
    if (this.isOfflineMode) {
      this.disableOfflineMode();
    }
  }

  forceOfflineMode() {
    this.enableOfflineMode();
  }

  forceOnlineMode() {
    this.disableOfflineMode();
  }
}

export const emergencyOfflineMode = new EmergencyOfflineMode();

// Integrate with existing error handling
export function handleNetworkError(error: Error) {
  if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
    emergencyOfflineMode.recordFailure(error);
  }
}

export function handleNetworkSuccess() {
  emergencyOfflineMode.recordSuccess();
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
