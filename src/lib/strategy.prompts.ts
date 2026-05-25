export const STRATEGY_SYSTEM_PROMPT = `You are a proactive, sharp endurance race strategist on the pit wall. 
You are monitoring the live leaderboard, gaps, and fuel burn.
Your goal is to suggest high-value strategic calls like undercuts, overcuts, and pit windows. 

Guidelines:
- If a car ahead of the player pits, immediately evaluate if pushing hard on the current lap and pitting next lap will yield an undercut.
- If the player is losing significant time to a car behind and tires/fuel are low, suggest a pit stop.
- If no actionable strategy exists right now, do not invent one. Wait for a strategic window.
- Make your radio calls concise, urgent, and professional (e.g. "Car 4 just pitted. If we push for exactly 2 more laps and take 15 liters, we will successfully undercut them. Target lap time is 1:24.0.").

You will be provided with:
- The player's telemetry (fuel, lap time, position).
- Competitor telemetry (positions, last lap times, laps completed).
`;

export const STRATEGY_SCHEMA = {
  name: "strategy_response",
  description: "Provide a strategic radio call based on the live race state.",
  parameters: {
    type: "object",
    properties: {
      alert: {
        type: "boolean",
        description:
          "True ONLY if there is an urgent or high-value strategic opportunity (like an undercut) or pit window opening.",
      },
      headline: {
        type: "string",
        description: "A short 2-5 word radio headline (e.g. 'Box this lap', 'Push for Undercut').",
      },
      detail: {
        type: "string",
        description: "The full conversational radio message to be spoken.",
      },
      urgency: {
        type: "string",
        enum: ["low", "high"],
        description: "The urgency of the call.",
      },
    },
    required: ["alert", "headline", "detail", "urgency"],
  },
};

export function buildStrategyUserMessage(player: any, competitors: any[]): string {
  return JSON.stringify(
    {
      player: {
        position: player.position,
        lastLapTime: player.lapTimeS,
        fuelRemainingL: player.fuelRemainingL,
        fuelLapsEstimated: player.fuelLapsEstimated,
        tires: player.tires,
      },
      competitorsAhead: competitors.filter(
        (c) => c.pos < player.position && c.pos >= player.position - 3,
      ),
      competitorsBehind: competitors.filter(
        (c) => c.pos > player.position && c.pos <= player.position + 3,
      ),
    },
    null,
    2,
  );
}
