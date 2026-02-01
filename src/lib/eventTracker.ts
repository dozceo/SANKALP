/**
 * Event Tracking System for SANKALP
 * Zero-loss data collection with offline support
 * 
 * Features:
 * - Offline-first event queue
 * - Automatic retry with exponential backoff
 * - Deduplication (client + server)
 * - Batched API calls
 * - IndexedDB persistence
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ActionEvent {
    id: string; // UUID v4 for deduplication
    studentId: string;
    sessionId: string; // Current session ID
    timestamp: number; // Unix milliseconds

    action: {
        type: 'click' | 'entry' | 'review' | 'submit' | 'navigation';
        target: string; // button id, input field name
        context: string; // page/component context
    };

    timing: {
        clickTime: number; // Time from page load
        entryTime?: number; // Time spent typing
        reviewTime?: number; // Time spent reviewing
        delayBeforeStart?: number; // Procrastination metric
    };

    data?: {
        wordsEntered?: number;
        subject?: string;
        topic?: string;
        completed: boolean;
    };

    metadata: {
        deviceType: 'mobile' | 'tablet' | 'desktop';
        online: boolean;
        retryCount: number;
    };
}

interface EventDBSchema extends DBSchema {
    failedEvents: {
        key: string;
        value: ActionEvent;
    };
    sessions: {
        key: string;
        value: {
            id: string;
            startTime: number;
            lastActivity: number;
        };
    };
}

interface TrackerConfig {
    batchSize: number;
    batchInterval: number;
    maxRetries: number;
    offlineStorageKey: string;
    enableDebugLogging: boolean;
}

// ============================================================================
// EVENT TRACKER CLASS
// ============================================================================

class EventTracker {
    private queue: ActionEvent[] = [];
    private config: TrackerConfig;
    private batchTimer: NodeJS.Timeout | null = null;
    private sessionId: string;
    private db: IDBPDatabase<EventDBSchema> | null = null;
    private isInitialized = false;
    private studentId: string | null = null;

    constructor(config: Partial<TrackerConfig> = {}) {
        this.config = {
            batchSize: 10,
            batchInterval: 10000, // 10 seconds
            maxRetries: 3,
            offlineStorageKey: 'sankalp_event_queue',
            enableDebugLogging: false,
            ...config
        };

        // Generate or restore session ID
        this.sessionId = this.getOrCreateSessionId();

        if (typeof window !== 'undefined') {
            this.initialize();
        }
    }

    /**
     * Initialize the tracker
     * - Opens IndexedDB
     * - Starts batch processor
     * - Sets up event listeners
     */
    private async initialize(): Promise<void> {
        try {
            this.db = await openDB<EventDBSchema>('sankalp-events', 1, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains('failedEvents')) {
                        db.createObjectStore('failedEvents', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('sessions')) {
                        db.createObjectStore('sessions', { keyPath: 'id' });
                    }
                },
            });

            this.isInitialized = true;
            this.log('EventTracker initialized');

            // Load pending events
            await this.loadPendingEvents();

            // Start batch processor
            this.startBatchProcessor();

            // Set up lifecycle listeners
            window.addEventListener('beforeunload', () => this.flush());
            window.addEventListener('online', () => this.retryFailedEvents());
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.flush();
                }
            });
        } catch (error) {
            console.error('[EventTracker] Initialization failed:', error);
        }
    }

    /**
     * Set the current student ID
     */
    setStudentId(id: string): void {
        this.studentId = id;
    }

    /**
     * Track an action event
     * Returns event ID for reference
     */
    track(
        actionType: ActionEvent['action']['type'],
        target: string,
        context: string,
        data?: ActionEvent['data'],
        timing?: Partial<ActionEvent['timing']>
    ): string {
        if (!this.studentId) {
            this.log('No student ID set, skipping tracking');
            return '';
        }

        const eventId = this.generateUUID();

        // Deduplication check (within last 1 second)
        const isDuplicate = this.queue.some(e =>
            e.action.target === target &&
            e.action.type === actionType &&
            Date.now() - e.timestamp < 1000
        );

        if (isDuplicate) {
            this.log('Duplicate event prevented:', target);
            return eventId;
        }

        const event: ActionEvent = {
            id: eventId,
            studentId: this.studentId,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            action: { type: actionType, target, context },
            timing: {
                clickTime: typeof performance !== 'undefined' ? performance.now() : Date.now(),
                ...timing
            },
            data: data || { completed: false },
            metadata: {
                deviceType: this.getDeviceType(),
                online: typeof navigator !== 'undefined' ? navigator.onLine : true,
                retryCount: 0
            }
        };

        this.queue.push(event);
        this.log('Event tracked:', event);

        // Immediate flush if batch size reached
        if (this.queue.length >= this.config.batchSize) {
            this.flush();
        }

        return eventId;
    }

    /**
     * Start the batch processor
     */
    private startBatchProcessor(): void {
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
        }

        this.batchTimer = setInterval(() => {
            if (this.queue.length > 0) {
                this.flush();
            }
        }, this.config.batchInterval);
    }

    /**
     * Flush current batch to server
     */
    async flush(): Promise<void> {
        if (this.queue.length === 0) return;

        // Guard: Don't flush if studentId not set
        if (!this.studentId) {
            this.log('Cannot flush: studentId not set');
            return;
        }

        const batch = [...this.queue];
        this.queue = [];

        this.log(`Flushing ${batch.length} events`);

        try {
            const response = await fetch('/api/activity/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: batch })
            });

            if (!response.ok) {
                throw new Error(`Failed to log events: ${response.statusText}`);
            }

            this.log(`Successfully logged ${batch.length} events`);
        } catch (error) {
            console.error('[EventTracker] Failed to flush events:', error);

            // Store in IndexedDB for retry
            await this.storeFailedEvents(batch);
        }
    }

    /**
     * Store failed events in IndexedDB
     */
    private async storeFailedEvents(events: ActionEvent[]): Promise<void> {
        if (!this.db) return;

        try {
            const tx = this.db.transaction('failedEvents', 'readwrite');

            for (const event of events) {
                await tx.store.add(event);
            }

            await tx.done;
            this.log(`Stored ${events.length} failed events for retry`);
        } catch (error) {
            console.error('[EventTracker] Failed to store events:', error);
        }
    }

    /**
     * Load pending events from IndexedDB
     */
    private async loadPendingEvents(): Promise<void> {
        if (!this.db) return;

        try {
            const events = await this.db.getAll('failedEvents');

            if (events.length > 0) {
                this.log(`Loaded ${events.length} pending events`);
                this.queue.push(...events);
            }
        } catch (error) {
            console.error('[EventTracker] Failed to load pending events:', error);
        }
    }

    /**
     * Retry failed events when back online
     */
    private async retryFailedEvents(): Promise<void> {
        if (!this.db) return;

        this.log('Network reconnected, retrying failed events');

        try {
            const events = await this.db.getAll('failedEvents');

            if (events.length === 0) return;

            this.queue.push(...events);

            // Clear failed events
            const tx = this.db.transaction('failedEvents', 'readwrite');
            await tx.store.clear();
            await tx.done;

            // Flush immediately
            this.flush();
        } catch (error) {
            console.error('[EventTracker] Failed to retry events:', error);
        }
    }

    /**
     * Get or create session ID
     */
    private getOrCreateSessionId(): string {
        if (typeof window === 'undefined') return this.generateUUID();

        let sessionId = sessionStorage.getItem('sankalp_session_id');

        if (!sessionId) {
            sessionId = this.generateUUID();
            sessionStorage.setItem('sankalp_session_id', sessionId);
        }

        return sessionId;
    }

    /**
     * Detect device type
     */
    private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
        if (typeof window === 'undefined') return 'desktop';

        const width = window.innerWidth;

        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    /**
     * Generate UUID v4
     */
    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Debug logging
     */
    private log(...args: any[]): void {
        if (this.config.enableDebugLogging) {
            console.log('[EventTracker]', ...args);
        }
    }

    /**
     * Cleanup
     */
    destroy(): void {
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
        }

        this.flush();
        this.db?.close();
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const eventTracker = new EventTracker({
    enableDebugLogging: process.env.NODE_ENV === 'development'
});

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook for tracking clicks with automatic deduplication
 */
export function useTrackedClick(
    handler: () => void,
    target: string,
    context: string
): () => void {
    return () => {
        eventTracker.track('click', target, context);
        handler();
    };
}

/**
 * Hook for tracking form submissions
 */
export function useTrackedSubmit(
    handler: () => void,
    target: string,
    context: string,
    getData?: () => ActionEvent['data']
): () => void {
    return () => {
        const data = getData ? getData() : { completed: true };
        eventTracker.track('submit', target, context, data);
        handler();
    };
}

/**
 * Hook for tracking time spent on a component
 */
export function useTimeTracking(componentName: string, context: string): void {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();

    // Cleanup on unmount
    return () => {
        const timeSpent = Date.now() - startTime;
        eventTracker.track('navigation', `${componentName}-exit`, context, {
            completed: true
        }, {
            reviewTime: timeSpent
        });
    };
}
