// Event emitter for progress tracking
type ProgressListener = (progress: ProgressEvent) => void;

export interface ProgressEvent {
  eventId: string;
  type: string;
  status: "started" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export class ProgressTracker {
  private listeners = new Map<string, Set<ProgressListener>>();
  private events = new Map<string, ProgressEvent[]>();

  /**
   * Subscribe to progress updates for an event
   */
  subscribe(eventId: string, listener: ProgressListener): () => void {
    if (!this.listeners.has(eventId)) {
      this.listeners.set(eventId, new Set());
    }
    this.listeners.get(eventId)!.add(listener);

    // Send last event immediately if exists
    const lastEvent = this.getLastEvent(eventId);
    if (lastEvent) {
      listener(lastEvent);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventId)?.delete(listener);
    };
  }

  /**
   * Emit a progress update
   */
  emit(progress: ProgressEvent): void {
    console.log(
      `[Progress] ${progress.eventId}: ${progress.message} (${progress.progress}%)`
    );

    // Store event
    if (!this.events.has(progress.eventId)) {
      this.events.set(progress.eventId, []);
    }
    this.events.get(progress.eventId)!.push(progress);

    // Notify listeners
    this.listeners.get(progress.eventId)?.forEach((listener) => {
      try {
        listener(progress);
      } catch (error) {
        console.error("[Progress] Listener error:", error);
      }
    });
  }

  /**
   * Get progress history for an event
   */
  getHistory(eventId: string): ProgressEvent[] {
    return this.events.get(eventId) || [];
  }

  /**
   * Get last progress event
   */
  getLastEvent(eventId: string): ProgressEvent | undefined {
    const history = this.events.get(eventId);
    return history?.[history.length - 1];
  }

  /**
   * Clear history
   */
  clear(eventId?: string): void {
    if (eventId) {
      this.events.delete(eventId);
      this.listeners.delete(eventId);
    } else {
      this.events.clear();
      this.listeners.clear();
    }
  }

  /**
   * Get all active events
   */
  getActive(): Map<string, ProgressEvent> {
    const active = new Map<string, ProgressEvent>();
    this.events.forEach((history, eventId) => {
      const last = history[history.length - 1];
      if (last && (last.status === "started" || last.status === "processing")) {
        active.set(eventId, last);
      }
    });
    return active;
  }
}

export const progressTracker = new ProgressTracker();
