
/**
 * Chaos Configuration Manager
 *
 * Manages the state of chaos injection for the application.
 * Allows setting failure modes and tracking metrics for resilience testing.
 */

type ChaosState = {
  mlLatency: number; // ms
  mlError: boolean;
  mlCrash: boolean;
  genkitLatency: number; // ms
  genkitError: boolean;
  genkitQuotaExceeded: boolean;
  firestoreReadLatency: number; // ms
  firestoreReadError: boolean;
  firestoreWriteError: boolean;
};

type ChaosMetrics = {
  mlCalls: number;
  genkitCalls: number;
  firestoreReadCalls: number;
  firestoreWriteCalls: number;
};

class ChaosManager {
  private state: ChaosState = {
    mlLatency: 0,
    mlError: false,
    mlCrash: false,
    genkitLatency: 0,
    genkitError: false,
    genkitQuotaExceeded: false,
    firestoreReadLatency: 0,
    firestoreReadError: false,
    firestoreWriteError: false,
  };

  private metrics: ChaosMetrics = {
    mlCalls: 0,
    genkitCalls: 0,
    firestoreReadCalls: 0,
    firestoreWriteCalls: 0,
  };

  // Getters
  public getState(): ChaosState {
    return { ...this.state };
  }

  public getMetrics(): ChaosMetrics {
    return { ...this.metrics };
  }

  // Setters
  public setState(newState: Partial<ChaosState>) {
    this.state = { ...this.state, ...newState };
    console.log('[ChaosManager] State updated:', this.state);
  }

  public resetState() {
    this.state = {
      mlLatency: 0,
      mlError: false,
      mlCrash: false,
      genkitLatency: 0,
      genkitError: false,
      genkitQuotaExceeded: false,
      firestoreReadLatency: 0,
      firestoreReadError: false,
      firestoreWriteError: false,
    };
    console.log('[ChaosManager] State reset');
  }

  public resetMetrics() {
    this.metrics = {
      mlCalls: 0,
      genkitCalls: 0,
      firestoreReadCalls: 0,
      firestoreWriteCalls: 0,
    };
  }

  // Helpers for instrumentation
  public recordCall(service: keyof ChaosMetrics) {
    this.metrics[service]++;
  }

  public async checkChaos(service: 'ml' | 'genkit' | 'firestoreRead' | 'firestoreWrite'): Promise<void> {
    // Only active in non-production or if explicitly enabled
    if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_CHAOS) return;

    switch (service) {
      case 'ml':
        this.recordCall('mlCalls');
        if (this.state.mlLatency > 0) await this.sleep(this.state.mlLatency);
        if (this.state.mlError) throw new Error('Simulated ML Service Failure');
        if (this.state.mlCrash) throw new Error('Simulated ML Process Crash');
        break;
      case 'genkit':
        this.recordCall('genkitCalls');
        if (this.state.genkitLatency > 0) await this.sleep(this.state.genkitLatency);
        if (this.state.genkitQuotaExceeded) throw new Error('429: Quota Exceeded');
        if (this.state.genkitError) throw new Error('Simulated Genkit Failure');
        break;
      case 'firestoreRead':
        this.recordCall('firestoreReadCalls');
        if (this.state.firestoreReadLatency > 0) await this.sleep(this.state.firestoreReadLatency);
        if (this.state.firestoreReadError) throw new Error('Simulated Firestore Read Failure');
        break;
      case 'firestoreWrite':
        this.recordCall('firestoreWriteCalls');
        if (this.state.firestoreWriteError) throw new Error('Simulated Firestore Write Failure');
        break;
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton export
export const chaos = new ChaosManager();
