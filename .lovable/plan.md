
## Goal

Today, four pieces of state are trapped on one browser / one PC:

| Item | Where it lives now |
| --- | --- |
| Gear ratios (per car) | `localStorage` in `GearAdvisor.tsx` |
| Channel list layout | `localStorage` in `ConfigurableChannelList.tsx` |
| Car → class mappings | `localStorage` in `lib/fingerprint/carClass.ts` |
| Desktop offline laps | `~/.pitwall/laps.jsonl` on one PC |

Move all four to Lovable Cloud with a **public community library** model (like `shared_themes`): you own your private copy, and you can optionally **Publish** so other users can browse and **Import**.

## Data model (one migration)

Four new tables, all RLS: owner full access, **anyone authenticated can SELECT** published rows.

```text
shared_gear_ratios
  id, user_id, car, ratios jsonb, samples jsonb,
  published bool, name, votes int default 0, created_at, updated_at
  UNIQUE(user_id, car)

shared_channel_layouts
  id, user_id, name, layout jsonb (pinned channel ids + order + group config),
  published bool, votes int, created_at, updated_at

shared_car_classes
  id, user_id, car, car_class, confidence,
  published bool, votes int, created_at, updated_at
  UNIQUE(user_id, car)

-- desktop offline laps just sync into existing live_lap_records;
-- no new table, just an upload path
```

Public read policy pattern:
```sql
CREATE POLICY "Anyone can view published" ON shared_gear_ratios
  FOR SELECT TO authenticated USING (published = true OR user_id = auth.uid());
```

(Same shape for the other two tables.)

## Server functions (`src/lib/community.functions.ts`)

```text
upsertMyGearRatios({ car, ratios, samples })
publishMyGearRatios({ car, name })          // flips published=true
listCommunityGearRatios({ car? })           // top N by votes
voteCommunityGearRatios({ id })
importCommunityGearRatios({ id })           // copies into my private row

(same trio for channel layouts and car classes)

syncDesktopLaps({ laps[] })                 // bulk insert into live_lap_records,
                                            // dedup by (user_id, track, car, recorded_at)
```

All `.middleware([requireSupabaseAuth])` — RLS does the rest.

## Frontend wiring

- **`GearAdvisor.tsx`** — on ratio update, debounced `upsertMyGearRatios`. Add a small footer: `Publish` / `Browse community ratios`. Browse opens a sheet listing top published maps for the current car, with `Import` button.
- **`ConfigurableChannelList.tsx`** — same pattern. Save layout → Cloud. `Browse layouts` shows community layouts, `Import` overwrites local pinned set.
- **`lib/fingerprint/carClass.ts`** — when the user assigns/edits a class, upsert. `/fingerprint` page gets a "Community classes for unmapped cars" row.
- **Desktop bridge (`desktop/bridge/server.js`)** — every 60s when online and the dashboard is open, POST `~/.pitwall/laps.jsonl` deltas to `syncDesktopLaps`. Mark synced rows in the local file (append `synced:true`). Show "X laps synced" in the Pit Wall status bar.

## Conflict + privacy rules

- Importing a community ratio map / layout **does not auto-publish** your version.
- Publishing requires an explicit click — nothing leaks by default.
- Voting is one-per-user (small `community_votes(user_id, target_id, kind)` table — implied, simple unique constraint).
- Owner can unpublish at any time → row stays, `published=false`.

## Files

```text
NEW supabase migration              — 4 tables + RLS + community_votes
NEW src/lib/community.functions.ts  — all server fns above
NEW src/components/community/GearRatioBrowser.tsx
NEW src/components/community/ChannelLayoutBrowser.tsx
NEW src/components/community/CarClassBrowser.tsx
EDIT src/components/live/GearAdvisor.tsx
EDIT src/components/live/ConfigurableChannelList.tsx
EDIT src/lib/fingerprint/carClass.ts (+ wherever it's consumed)
EDIT desktop/bridge/server.js       — sync loop
EDIT desktop/bridge/lap-cache.js    — track synced flag
```

## Honesty notes

- Car string matching is fuzzy across iRacing builds. The existing `findPair` logic in `fingerprint/compute.ts` is reused; mismatches surface as "no community data for this car" instead of silent wrong matches.
- Community gear ratios are **opinions**, not truth. The UI shows sample count + vote count so users can judge.
- Desktop sync only runs when the bridge process is up AND the user is logged into the dashboard (token needed). Offline-collected laps queue until the next sync.
- No moderation tooling in v1. If spam becomes an issue we'd add a report flag and a `hidden` column.

Approve and I'll start with the migration.
