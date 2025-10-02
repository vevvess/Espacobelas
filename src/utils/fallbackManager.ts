// Fallback manager for handling persistent connectivity issues
import React from 'react';

interface FallbackState {
  isOfflineMode: boolean;
  lastOnlineTime: number;
  consecutiveFailures: number;
  shouldShowOfflineNotice: boolean;
}

class FallbackManager {
  private state: FallbackState = {
    isOfflineMode: false,
    lastOnlineTime: Date.now(),
    consecutiveFailures: 0,
    shouldShowOfflineNotice: false
  };

  private listeners: Array<(state: FallbackState) => void> = [];
  private readonly maxConsecutiveFailures = 5;
  private readonly offlineModeThresholdMs = 60000; // 1 minute

  recordFailure(error: Error) {
    this.state.consecutiveFailures++;
    
    const isNetworkError = error.message.includes('Failed to fetch') || 
                          error.message.includes('Network error') ||
                          error.message.includes('fetch');

    if (isNetworkError && this.state.consecutiveFailures >= this.maxConsecutiveFailures) {
      this.enableOfflineMode();
    }

    this.notifyListeners();
  }

  recordSuccess() {
    const wasOffline = this.state.isOfflineMode;
    
    this.state.consecutiveFailures = 0;
    this.state.lastOnlineTime = Date.now();
    this.state.isOfflineMode = false;
    this.state.shouldShowOfflineNotice = false;

    if (wasOffline) {
      console.log('✅ Connectivity restored - exiting offline mode');
    }

    this.notifyListeners();
  }

  private enableOfflineMode() {
    if (!this.state.isOfflineMode) {
      console.warn('🔄 Entering offline mode due to persistent connectivity issues');
      this.state.isOfflineMode = true;
      this.state.shouldShowOfflineNotice = true;
    }
  }

  shouldUseCache(): boolean {
    return this.state.isOfflineMode || this.state.consecutiveFailures >= 2;
  }

  shouldSkipNetworkOperation(): boolean {
    return this.state.isOfflineMode;
  }

  getTimeSinceLastOnline(): number {
    return Date.now() - this.state.lastOnlineTime;
  }

  getState(): FallbackState {
    return { ...this.state };
  }

  dismissOfflineNotice() {
    this.state.shouldShowOfflineNotice = false;
    this.notifyListeners();
  }

  forceOnlineMode() {
    console.log('🔄 Forcing exit from offline mode');
    this.state.isOfflineMode = false;
    this.state.consecutiveFailures = 0;
    this.state.shouldShowOfflineNotice = false;
    this.notifyListeners();
  }

  addListener(callback: (state: FallbackState) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in fallback manager listener:', error);
      }
    });
  }

  reset() {
    this.state = {
      isOfflineMode: false,
      lastOnlineTime: Date.now(),
      consecutiveFailures: 0,
      shouldShowOfflineNotice: false
    };
    this.notifyListeners();
  }
}

export const fallbackManager = new FallbackManager();

// Hook to use fallback state in components
export function useFallbackState() {
  const [state, setState] = React.useState(() => fallbackManager.getState());

  React.useEffect(() => {
    return fallbackManager.addListener(setState);
  }, []);

  return {
    ...state,
    dismissOfflineNotice: fallbackManager.dismissOfflineNotice.bind(fallbackManager),
    forceOnlineMode: fallbackManager.forceOnlineMode.bind(fallbackManager),
    reset: fallbackManager.reset.bind(fallbackManager)
  };
}

// Helper to wrap operations with fallback handling
export async function withFallbackHandling<T>(
  operation: () => Promise<T>,
  context: string = 'operation'
): Promise<T> {
  try {
    const result = await operation();
    fallbackManager.recordSuccess();
    return result;
  } catch (error) {
    console.error(`${context} failed:`, error.message);
    fallbackManager.recordFailure(error as Error);
    throw error;
  }
}
