// Connection recovery utilities for Failed to fetch scenarios

import { testConnectivity, getNetworkStatus, shouldUseCache } from './networkUtils';
import { connectionMonitor } from '@/lib/connectionMonitor';
import { fallbackManager } from './fallbackManager';

export interface RecoveryOptions {
  maxRetries?: number;
  baseDelay?: number;
  useExponentialBackoff?: boolean;
  testConnectivity?: boolean;
  fallbackToCache?: boolean;
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  usedCache?: boolean;
  attempts?: number;
}

class ConnectionRecovery {
  private failureCount = 0;
  private lastFailureTime = 0;
  private isRecovering = false;

  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    options: RecoveryOptions = {}
  ): Promise<RecoveryResult<T>> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      useExponentialBackoff = true,
      testConnectivity: shouldTestConnectivity = true,
      fallbackToCache = true
    } = options;

    let lastError: Error | undefined;
    let attempts = 0;

    // Check if we should use cache immediately
    if (fallbackToCache && shouldUseCache()) {
      console.log('🔄 Network conditions poor, checking cache first');
      return { success: false, error: new Error('Poor network conditions'), usedCache: true };
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      attempts = attempt;
      try {
        // Test connectivity before attempting operation if requested
        if (shouldTestConnectivity && attempt > 1) {
          const hasConnectivity = await testConnectivity();
          if (!hasConnectivity) {
            console.warn(`🔄 No connectivity detected on attempt ${attempt}`);
            throw new Error('No internet connectivity detected');
          }
        }

        const result = await operation();
        
        // Success - reset failure tracking
        if (this.failureCount > 0) {
          console.log('✅ Connection recovered after', this.failureCount, 'failures');
          this.failureCount = 0;
          this.lastFailureTime = 0;
          connectionMonitor.addEvent('success', 'Connection recovered via recovery utility', attempt);
        }

        // Notify fallback manager of success
        fallbackManager.recordSuccess();

        return { success: true, data: result, attempts };

      } catch (error) {
        lastError = error as Error;
        this.failureCount++;
        this.lastFailureTime = Date.now();

        console.warn(`🔄 Recovery attempt ${attempt}/${maxRetries} failed:`, error.message);

        // Log specific error types
        if (error.message.includes('Failed to fetch')) {
          connectionMonitor.addEvent('fetch_error', `Recovery attempt ${attempt}: ${error.message}`, attempt);
        }

        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          console.log('💥 Error type should not be retried:', error.message);
          break;
        }

        // If this is the last attempt, don't wait
        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, baseDelay, useExponentialBackoff);
        console.log(`⏱️ Waiting ${delay}ms before attempt ${attempt + 1}...`);
        await this.sleep(delay);
      }
    }

    // All attempts failed
    console.error('💥 All recovery attempts failed:', lastError?.message);

    // Notify fallback manager of failure
    if (lastError) {
      fallbackManager.recordFailure(lastError);
    }

    return {
      success: false,
      error: lastError || new Error('Unknown error during recovery'),
      attempts,
      usedCache: false
    };
  }

  private shouldNotRetry(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Don't retry on schema errors
    if (message.includes('does not exist') || message.includes('schema')) {
      return true;
    }
    
    // Don't retry on authentication errors
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return true;
    }
    
    // Don't retry on syntax errors
    if (message.includes('syntax error') || message.includes('invalid query')) {
      return true;
    }
    
    return false;
  }

  private calculateDelay(attempt: number, baseDelay: number, useExponential: boolean): number {
    const networkStatus = getNetworkStatus();
    
    let delay = baseDelay;
    
    if (useExponential) {
      delay = baseDelay * Math.pow(2, attempt - 1);
    } else {
      delay = baseDelay * attempt;
    }
    
    // Adjust for network conditions
    if (networkStatus.effectiveType === 'slow-2g') {
      delay *= 2;
    } else if (networkStatus.effectiveType === '2g') {
      delay *= 1.5;
    }
    
    // Cap the delay
    return Math.min(delay, 10000); // Max 10 seconds
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getTimeSinceLastFailure(): number {
    return this.lastFailureTime ? Date.now() - this.lastFailureTime : 0;
  }

  isInCooldown(cooldownMs: number = 30000): boolean {
    return this.getTimeSinceLastFailure() < cooldownMs;
  }

  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.isRecovering = false;
  }
}

export const connectionRecovery = new ConnectionRecovery();

// Helper function for database operations
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  context: string = 'database operation'
): Promise<T> {
  const result = await connectionRecovery.executeWithRecovery(operation, {
    maxRetries: 3,
    baseDelay: 1000,
    useExponentialBackoff: true,
    testConnectivity: true,
    fallbackToCache: true
  });

  if (result.success && result.data !== undefined) {
    return result.data;
  }

  // If cache was used, throw a specific error
  if (result.usedCache) {
    throw new Error(`${context}: Network conditions poor, use cache fallback`);
  }

  throw result.error || new Error(`${context}: Recovery failed after ${result.attempts} attempts`);
}

// Hook to monitor recovery status
export function useConnectionRecoveryStatus() {
  return {
    failureCount: connectionRecovery.getFailureCount(),
    timeSinceLastFailure: connectionRecovery.getTimeSinceLastFailure(),
    isInCooldown: connectionRecovery.isInCooldown(),
    reset: connectionRecovery.reset.bind(connectionRecovery)
  };
}
