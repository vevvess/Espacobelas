// Network connectivity utilities

export interface NetworkStatus {
  isOnline: boolean;
  type: 'unknown' | 'wifi' | 'cellular' | 'ethernet';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink?: number;
  rtt?: number;
}

export function getNetworkStatus(): NetworkStatus {
  if (typeof navigator === 'undefined') {
    return {
      isOnline: true,
      type: 'unknown',
      effectiveType: 'unknown'
    };
  }

  const connection = (navigator as any).connection 
    || (navigator as any).mozConnection 
    || (navigator as any).webkitConnection;

  return {
    isOnline: navigator.onLine,
    type: connection?.type || 'unknown',
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink,
    rtt: connection?.rtt
  };
}

export async function testConnectivity(): Promise<boolean> {
  try {
    // Use manual AbortController for better compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch (abortErr) {
        // Ignore abort errors
      }
    }, 5000);

    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Connectivity test timeout');
    } else {
      console.warn('Connectivity test failed:', error?.message || 'Unknown error');
    }
    return false;
  }
}

export function isSlowConnection(): boolean {
  const status = getNetworkStatus();
  return ['slow-2g', '2g'].includes(status.effectiveType) || 
         (status.downlink && status.downlink < 0.5);
}

export function shouldUseCache(): boolean {
  const status = getNetworkStatus();
  return !status.isOnline || isSlowConnection();
}

export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  const status = getNetworkStatus();
  
  // Slower connections need longer delays
  let multiplier = 1;
  if (status.effectiveType === 'slow-2g') {
    multiplier = 3;
  } else if (status.effectiveType === '2g') {
    multiplier = 2;
  } else if (status.effectiveType === '3g') {
    multiplier = 1.5;
  }
  
  return Math.min(baseDelay * attempt * multiplier, 10000); // Max 10 seconds
}

export function createAbortSignal(timeoutMs: number = 10000): AbortSignal {
  // Always use manual AbortController for consistent behavior
  const controller = new AbortController();
  setTimeout(() => {
    try {
      controller.abort();
    } catch (abortErr) {
      // Ignore abort errors during timeout
    }
  }, timeoutMs);
  return controller.signal;
}

// Enhanced fetch with better error handling for Failed to fetch scenarios
export async function robustFetch(
  url: string, 
  options: RequestInit = {}, 
  retries: number = 3
): Promise<Response> {
  const networkStatus = getNetworkStatus();
  
  if (!networkStatus.isOnline) {
    throw new Error('Network offline - Failed to fetch');
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const timeoutMs = networkStatus.effectiveType === 'slow-2g' ? 15000 : 10000;
      
      const response = await fetch(url, {
        ...options,
        signal: createAbortSignal(timeoutMs),
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.warn(`Fetch attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt === retries) {
        // Last attempt failed
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - Failed to fetch');
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error - Failed to fetch (check internet connection)');
        }
        throw error;
      }
      
      // Wait before retrying
      const delay = getRetryDelay(attempt, 1000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('All fetch attempts failed');
}

// Monitor network status changes
export function monitorNetworkStatus(callback: (status: NetworkStatus) => void) {
  if (typeof window === 'undefined') return () => {};
  
  const handleOnline = () => callback(getNetworkStatus());
  const handleOffline = () => callback(getNetworkStatus());
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Also monitor connection changes if available
  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', handleOnline);
  }
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    if (connection) {
      connection.removeEventListener('change', handleOnline);
    }
  };
}
