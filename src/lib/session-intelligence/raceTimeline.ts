/**
 * raceTimeline.ts — Chronological Endurance Race Timeline Subsystem
 *
 * Compiles the persistent chronological institutional memory of the race,
 * cataloging driver changes, fuel stops, cautions, damage, and adjustments.
 */

export interface EnduranceRaceEvent {
  eventId: string;
  timestamp: Date;
  lapNumber: number;
  carNumber: string;
  driverName: string;
  eventType:
    | "DRIVER_SWAP"
    | "FUEL_STOP"
    | "TYRE_CHANGE"
    | "DAMAGE_REPORT"
    | "CAUTION_PACE"
    | "TRACK_CROSSOVER"
    | "SETUP_ADJUSTMENT";
  description: string;
  metadata: Record<string, any>;
}

class RaceTimelineStore {
  private timeline: EnduranceRaceEvent[] = [];

  /**
   * Appends an operational event node to the chronological race timeline.
   */
  public addTimelineEvent(
    lapNumber: number,
    carNumber: string,
    driverName: string,
    eventType: EnduranceRaceEvent["eventType"],
    description: string,
    metadata: Record<string, any> = {},
  ): EnduranceRaceEvent {
    const event: EnduranceRaceEvent = {
      eventId: `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
      lapNumber,
      carNumber,
      driverName,
      eventType,
      description,
      metadata,
    };

    this.timeline.push(event);
    return event;
  }

  /**
   * Retrieves all chronological timeline events.
   */
  public getTimelineEvents(carNumber?: string): EnduranceRaceEvent[] {
    let list = [...this.timeline];
    if (carNumber) {
      list = list.filter((e) => e.carNumber === carNumber);
    }
    return list.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  public clearTimeline() {
    this.timeline = [];
  }
}

export const raceTimelineEngine = new RaceTimelineStore();
