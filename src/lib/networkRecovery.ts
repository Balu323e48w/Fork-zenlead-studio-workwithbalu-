import { BookApiService } from './bookApi';

interface HeartbeatOptions {
  interval: number; // milliseconds
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onMissedEvents?: (events: any[]) => void;
}

export class NetworkRecoveryManager {
  private usageId: string;
  private interval: number;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastEventId: string | null = null;
  private isConnected: boolean = true;
  private onDisconnect?: () => void;
  private onReconnect?: () => void;
  private onMissedEvents?: (events: any[]) => void;
  private missedHeartbeats: number = 0;
  private maxMissedHeartbeats: number = 3;

  constructor(usageId: string, options: HeartbeatOptions) {
    this.usageId = usageId;
    this.interval = options.interval;
    this.onDisconnect = options.onDisconnect;
    this.onReconnect = options.onReconnect;
    this.onMissedEvents = options.onMissedEvents;
  }

  start(): void {
    this.stop(); // Clear any existing timer
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.interval);
    
    console.log(`🔄 Network recovery started for ${this.usageId} (interval: ${this.interval}ms)`);
  }

  stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      console.log(`⏹️ Network recovery stopped for ${this.usageId}`);
    }
  }

  setLastEventId(eventId: string): void {
    this.lastEventId = eventId;
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      const heartbeatData = {
        client_timestamp: new Date().toISOString(),
        last_received_event: this.lastEventId,
        connection_id: this.generateConnectionId()
      };

      // Call the new backend heartbeat endpoint
      const response = await fetch(`/api/ai/long-form-book/${this.usageId}/heartbeat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heartbeatData)
      });

      if (!response.ok) {
        throw new Error(`Heartbeat failed: ${response.status}`);
      }

      const result = await response.json();
      const heartbeatResponse = result.success ? result.data : {
        server_timestamp: new Date().toISOString(),
        connection_healthy: false,
        missed_events: []
      };

      if (heartbeatResponse.connection_healthy) {
        if (!this.isConnected) {
          this.handleReconnection();
        }
        this.missedHeartbeats = 0;
        this.isConnected = true;

        // Handle missed events if any
        if (heartbeatResponse.missed_events && heartbeatResponse.missed_events.length > 0 && this.onMissedEvents) {
          this.onMissedEvents(heartbeatResponse.missed_events);
        }
      }

    } catch (error) {
      console.warn('Heartbeat failed:', error);
      this.missedHeartbeats++;
      
      if (this.missedHeartbeats >= this.maxMissedHeartbeats && this.isConnected) {
        this.handleDisconnection();
      }
    }
  }

  private handleDisconnection(): void {
    console.warn('🔴 Network disconnection detected');
    this.isConnected = false;
    if (this.onDisconnect) {
      this.onDisconnect();
    }
  }

  private handleReconnection(): void {
    console.log('🟢 Network reconnection detected');
    this.isConnected = true;
    if (this.onReconnect) {
      this.onReconnect();
    }
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isNetworkConnected(): boolean {
    return this.isConnected;
  }

  getMissedHeartbeats(): number {
    return this.missedHeartbeats;
  }
}

export class StateRecoveryManager {
  private usageId: string;
  private recoveryData: any = {};

  constructor(usageId: string) {
    this.usageId = usageId;
  }

  saveState(state: any): void {
    const stateKey = `book_state_${this.usageId}`;
    const stateData = {
      ...state,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    try {
      localStorage.setItem(stateKey, JSON.stringify(stateData));
      console.log('💾 State saved locally');
    } catch (error) {
      console.warn('Failed to save state locally:', error);
    }
  }

  loadState(): any | null {
    const stateKey = `book_state_${this.usageId}`;
    
    try {
      const savedState = localStorage.getItem(stateKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        console.log('📂 State loaded from local storage');
        return parsedState;
      }
    } catch (error) {
      console.warn('Failed to load state from local storage:', error);
    }

    return null;
  }

  clearState(): void {
    const stateKey = `book_state_${this.usageId}`;
    localStorage.removeItem(stateKey);
    console.log('🗑️ Local state cleared');
  }

  async recoverFromServer(): Promise<any | null> {
    try {
      console.log('🔄 Attempting server recovery...');

      // Call the new recovery endpoint
      const response = await fetch(`/api/ai/long-form-book/${this.usageId}/recovery`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Recovery failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        return result.data;
      }

      return null;
    } catch (error) {
      console.warn('Server recovery failed:', error);
      return null;
    }
  }

  async attemptRecovery(): Promise<any | null> {
    // Try local storage first
    let recoveredState = this.loadState();
    
    if (recoveredState) {
      console.log('✅ Recovery successful from local storage');
      return recoveredState;
    }

    // Try server recovery as fallback
    recoveredState = await this.recoverFromServer();
    
    if (recoveredState) {
      console.log('✅ Recovery successful from server');
      return recoveredState;
    }

    console.log('❌ No recovery data found');
    return null;
  }
}

export class BookGenerationRecovery {
  private networkManager: NetworkRecoveryManager;
  private stateManager: StateRecoveryManager;
  private usageId: string;

  constructor(usageId: string) {
    this.usageId = usageId;
    this.stateManager = new StateRecoveryManager(usageId);
    this.networkManager = new NetworkRecoveryManager(usageId, {
      interval: 30000, // 30 seconds
      onDisconnect: () => this.handleNetworkDisconnect(),
      onReconnect: () => this.handleNetworkReconnect(),
      onMissedEvents: (events) => this.handleMissedEvents(events)
    });
  }

  startMonitoring(): void {
    this.networkManager.start();
  }

  stopMonitoring(): void {
    this.networkManager.stop();
  }

  saveProgress(progressData: any): void {
    this.stateManager.saveState(progressData);
  }

  async recoverState(): Promise<any | null> {
    return await this.stateManager.attemptRecovery();
  }

  updateLastEvent(eventId: string): void {
    this.networkManager.setLastEventId(eventId);
  }

  private handleNetworkDisconnect(): void {
    console.log('📡 Network disconnected - switching to offline mode');
    // You could show a banner or change UI to indicate offline mode
  }

  private handleNetworkReconnect(): void {
    console.log('📡 Network reconnected - resuming live updates');
    // You could hide offline banner and resume real-time updates
  }

  private handleMissedEvents(events: any[]): void {
    console.log(`📬 Received ${events.length} missed events`);
    // Process missed events to catch up on what happened during disconnection
    events.forEach(event => {
      console.log('Processing missed event:', event);
      // You'd emit these events to your component
    });
  }

  cleanup(): void {
    this.stopMonitoring();
    this.stateManager.clearState();
  }

  getNetworkStatus(): boolean {
    return this.networkManager.isNetworkConnected();
  }
}
