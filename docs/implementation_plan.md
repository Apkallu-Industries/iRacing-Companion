# Update npm packages and harden telemetry bridge

## Goal Description

Refresh all outdated npm dependencies to their latest stable versions and improve the reliability of the telemetry ingestion bridge (the `local-bridge` component) so that it can handle network interruptions, malformed telemetry frames, and ensure graceful reconnection with Teams integration.

## User Review Required

> [!IMPORTANT]
> Please confirm that you are comfortable with a potentially breaking upgrade of core dependencies (e.g., Vite 8, TypeScript 6, ESLint 10, React 19). These updates may require code adjustments. If you prefer a more incremental upgrade, let us know.

## Open Questions

> [!WARNING]
>
> 1. **Team integration details** – The bridge currently posts telemetry to Microsoft Teams via a webhook. Do you have a specific webhook URL or authentication method that must remain unchanged?
> 2. **Runtime environment** – The bridge runs as a Node.js process started by `npm run bridge` (or similar). Should we add automatic restarts on crash (e.g., using `nodemon` or a Windows Service)?
> 3. **Telemetry schema** – Are there any new telemetry fields you expect to handle that are not currently encoded in `binaryEncoder.js`?
> 4. **Testing scope** – Would you like us to add unit tests for the bridge’s error‑handling paths, or rely on manual verification?

## Proposed Changes

---

### Package Updates

- **Root `package.json`** – Upgrade to latest versions:
  - `vite` → `^8.0.16`
  - `@vitejs/plugin-react` → `^6.0.2`
  - `typescript` → `^6.0.3`
  - `@eslint/js` → `^10.0.1`
  - `eslint` → `^10.4.1`
  - `react` & `react-dom` → `^19.2.0`
  - `@tanstack/react-query` → `^5.100.14`
  - `@tanstack/react-router` → `^1.170.10`
  - `@tanstack/react-start` → `^1.168.18`
  - `zod` → `^4.4.3`
  - `eslint-plugin-react-hooks` → `^7.1.1`
  - `eslint-plugin-react-refresh` → `^0.5.2`
  - `globals` → `^17.6.0`
  - `date-fns` → `^4.4.0`
  - `dotenv` → `^17.4.2`
  - `ws` → `^8.21.0`
  - `lucide-react` → `^1.17.0`
  - `react-day-picker` → `^10.0.1`
  - `react-hook-form` → `^7.77.0`
  - `react-resizable-panels` → `^4.11.2`
  - `recharts` → `^3.8.1`

- **Local‑bridge `package.json`** – Upgrade its own dependencies similarly (e.g., `ws`, `dotenv`).

- Add **`nodemon`** as a devDependency to automatically restart the bridge on crash.

- Run `npm install` after updating `package.json` files.

---

### Telemetry Bridge Hardening

1. **Error‑handling wrapper** around `encodeTelemetry` in `local-bridge/binaryEncoder.js`:
   - Validate input object shape with a runtime schema (using `zod`).
   - Catch any exceptions and log a detailed error without terminating the process.
2. **Reconnection logic** in `local-bridge/server.js` (or whichever file hosts the WebSocket server to Teams):
   - Detect `close`/`error` events on the WebSocket client.
   - Implement exponential back‑off reconnection with a maximum of 5 attempts.
   - Emit a health‑check event to the UI (`useTelemetry`) indicating connection state.
3. **Graceful shutdown** – Listen for `SIGINT`/`SIGTERM` and close WebSocket cleanly.
4. **Teams webhook resilience** – Wrap the HTTP POST to Teams in a retry helper (max 3 attempts, jitter).
5. **Logging** – Use a structured logger (e.g., `pino` or a lightweight custom logger) to capture timestamps, error stacks, and telemetry sequence numbers.
6. **Schema versioning** – Add a version field to the encoded telemetry payload so future changes can be detected and ignored safely.

---

### Code Adjustments

- Update imports where Vite or React version changes affect API (e.g., `import { defineConfig } from 'vite'` may need adjustments).
- Adjust ESLint configuration if rules have changed in ESLint 10.
- Ensure TypeScript `tsconfig.json` targets the new compiler version (may need `moduleResolution: "node16"`).
- Add new `zod` schema file `local-bridge/telemetry-schema.ts` and import it in `binaryEncoder.js`.

---

### Verification Plan

**Automated Tests**

- Run existing test suite (`npm run test` if present) after upgrades.
- Add a new test `local-bridge/__tests__/telemetry-bridge.test.ts` that simulates a malformed telemetry frame and asserts the process does not crash.

**Manual Verification**

- Start the bridge (`npm run bridge` or `node local-bridge/server.js`).
- Verify telemetry appears in the UI and that the Teams webhook receives messages.
- Simulate network loss (disconnect internet) and confirm reconnection attempts log correctly.
- Check that the UI reflects `t.connected` state appropriately.

---

### Documentation Updates

- Update `BRIDGE_ARCHITECTURE.md` with new error‑handling flow diagram.
- Add a section in `TEAMS.md` describing webhook configuration and retry behavior.

---

## Timeline

- **Day 1**: Apply package version bumps, run `npm install`, fix any compile errors.
- **Day 2**: Implement telemetry schema validation and error handling.
- **Day 3**: Add reconnection & retry logic for Teams webhook, integrate logger.
- **Day 4**: Write/adjust tests, run full verification, update docs.

---

## Verification Plan

### Automated Tests

- `npm run lint -- --fix` after upgrades to ensure no lint errors.
- Run `npm run build` to confirm the production bundle compiles.
- Execute the new bridge unit test.

### Manual Verification

- Launch the dev server (`npm run dev`) and confirm UI loads without console errors.
- Open a live telemetry session and observe stable data flow.
- Verify Teams messages are posted even after temporary network drops.

---
