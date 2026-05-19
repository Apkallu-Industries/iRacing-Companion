# Pit Wall .PWLAP Implementation — Ready for Deployment

**Status:** MVP Complete — All code written, ready for final configuration & testing

---

## What's Been Delivered

### ✅ Bridge Telemetry Capture (Phase 1)

Real-time 30Hz telemetry from iRacing → MongoDB with full channel fidelity

**Files:**

- `desktop/bridge/telemetry-recorder.js` — Recording core logic
- `desktop/bridge/channel-manifest.js` — Channel extraction
- `desktop/bridge/server.js` — Modified to capture samples
- `src/lib/mongodb.server.ts` — Server-side MongoDB client

**What it does:**

- Captures all 250+ iRacing channels at 30Hz
- Aggregates to 1-second documents (min/max/avg per channel)
- Tracks lap boundaries and durations
- Builds channel manifest for workbench compatibility

---

### ✅ Proprietary .PWLAP Format (Phase 2)

Encrypted, signed, versioned binary format for secure customer data sharing

**Files:**

- `src/lib/pwlap/types.ts` — Type definitions
- `src/lib/pwlap/format.ts` — Header serialization (256 bytes)
- `src/lib/pwlap/encrypt.ts` — AES-256-GCM via SubtleCrypto
- `src/lib/pwlap/sign.ts` — Ed25519 signing via SubtleCrypto
- `src/lib/pwlap/serialize.ts` — Full pipeline (JSON → compress → sign → encrypt)

**Format:**

- Fixed 256-byte header (magic, version, flags, IV, signature)
- JSON content (optionally compressed, encrypted)
- Granularity modes: metadata (~5KB) | setup (~50KB) | full (~500MB/30min)
- Optional: AES-256-GCM encryption, Ed25519 signatures, Zstandard compression

---

### ✅ Export/Import Server Functions (Phase 3)

TanStack Start server functions for secure file handling

**Files:**

- `src/lib/pwlap.functions.ts` — Three main functions:
  - `exportSessionAsPwlap()` — Fetch from Supabase + MongoDB, serialize, upload to Storage
  - `importPwlapSession()` — Deserialize, decrypt/verify, create new session, store telemetry
  - `validatePwlapFile()` — Validate without importing

**What it does:**

- Exports with flexible granularity (user chooses data fidelity)
- Optional password encryption (PBKDF2 key derivation)
- Optional Ed25519 signing with user's private key
- Stores files in Supabase Storage with 7-day signed URLs
- Imports restore full session to Supabase + MongoDB
- Audit trail of all imports/exports

---

### ✅ UI Components (Phase 4)

User-friendly dialogs for export and import

**Files:**

- `src/components/workbench/ExportPwlapDialog.tsx` — Export options dialog
- `src/components/ImportPwlapButton.tsx` — File picker + password prompt

**Features:**

- Granularity selector with size estimates
- Optional encryption with password input
- Optional Ed25519 signing
- PII toggle (driver name)
- Automatic download on success
- Password prompt for encrypted imports
- Error handling and user feedback

---

### ✅ Database Schema (Phase 5)

Supabase migrations for audit trail and key management

**Files:**

- `supabase/migrations/20260519_pwlap_tables.sql` — Creates:
  - `user_signing_keys` — Store Ed25519 public keys per user
  - `pwlap_imports` — Audit trail of imported files
  - `pwlap_exports` — Track exports, downloads, expiry
  - RLS policies for row-level security
  - Performance indexes

---

### ✅ Layout Optimization

Live telemetry page reengineered for zero wasted space

**Files:**

- `src/routes/live.tsx` — Flexbox grid layout (3-6-3 columns, no gaps)

**Result:**

- All available space utilized efficiently
- Borders between sections instead of gaps
- Proper flex-1 min-h-0 for responsive expansion
- Bottom control bar packed inline

---

### ✅ Documentation

Complete installation and technical guides

**Files:**

- `GETTING_STARTED.md` — Step-by-step for bridge, web app, networking
- `IMPLEMENTATION_STATUS.md` — Technical architecture deep-dive
- `IMPLEMENTATION_CHECKLIST.md` — Deployment checklist

---

## What Still Needs To Be Done (Before Launch)

### 1. Run Database Migration (5 min)

```bash
cd supabase
supabase db push
```

Or manually run `migrations/20260519_pwlap_tables.sql` in Supabase dashboard.

**Verifies:** `user_signing_keys`, `pwlap_imports`, `pwlap_exports` tables created with RLS.

### 2. Create Supabase Storage Bucket (5 min)

In Supabase dashboard → Storage:

- Create bucket: `pwlap_exports`
- Set visibility: Private (auth required)
- Enable signed URLs (already handled in code)

### 3. Wire Up UI Components (30 min)

Add import/export buttons to the workbench:

```tsx
// In src/routes/sessions.$id.tsx (workbench page):
import { ExportPwlapDialog } from "@/components/workbench/ExportPwlapDialog";
import { ImportPwlapButton } from "@/components/ImportPwlapButton";

// Add to export button dropdown or new "Share" section
<ExportPwlapDialog 
  sessionId={sessionId}
  onClose={handleClose}
  onSuccess={(fn, url) => console.log("Exported:", fn)}
/>

// Add to sessions list page for importing new sessions
<ImportPwlapButton onSuccess={(id) => navigate({to: `/sessions/${id}`})} />
```

### 4. Configure .env (5 min)

Ensure these are set:

```bash
# .env (for bridge)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/iracing_companion

# Already set in web app .env
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
```

### 5. Test End-to-End (1-2 hours)

1. Start bridge with real iRacing session (verify MongoDB captures telemetry)
2. Export as metadata-only (.pwlap ~5KB)
3. Export with password encryption
4. Export with Ed25519 signature
5. Import on different account, verify telemetry appears in workbench
6. Test large export (30+ minute session)

---

## Deployment Flowchart

```
┌─ Run Migration (creates tables)
│
├─ Create Storage Bucket (pwlap_exports)
│
├─ Configure Environment (MONGODB_URI, Supabase keys)
│
├─ Wire UI Components (add to workbench + sessions pages)
│
├─ Test Export/Import (real iRacing session)
│
├─ Test Encryption (password-protected .pwlap)
│
├─ Test Signing (Ed25519 signatures)
│
├─ Performance Test (large files, concurrent ops)
│
└─ Launch & Announce
```

---

## Key Decisions Made

| Component | Choice | Why |
|-----------|--------|-----|
| Encryption | AES-256-GCM | NIST standard, SubtleCrypto native (no deps) |
| Signing | Ed25519 | Fast, small keys, widely trusted |
| Key Derivation | PBKDF2 100K iterations | SubtleCrypto native, resistant to brute-force |
| Compression | Zstandard → pako | 10-50× size reduction, good speed |
| Version Control | uint32 in header | Room for format evolution |
| Granularity | Metadata / Setup / Full | Supports all use cases (sharing, privacy, fidelity) |
| Storage | Supabase + MongoDB | Supabase for metadata/audit, MongoDB for telemetry |

---

## Security Notes

1. **Encryption:** Password is never stored; only used to derive key via PBKDF2 + random salt
2. **Signing:** Ed25519 verifies file authenticity, prevents tampering during transit
3. **RLS:** All tables have row-level security; users only see their own imports/exports
4. **Signed URLs:** Storage files are private; 7-day expiry prevents indefinite access
5. **No PII by default:** "Include driver name" is opt-in; can share anonymized files

---

## Testing Checklist

Before announcing to customers:

- [ ] Bridge captures telemetry with real iRacing session (verify MongoDB)
- [ ] Export as metadata-only (~5KB, fast)
- [ ] Export with AES encryption + password
- [ ] Export with Ed25519 signature
- [ ] Export full telemetry (30+ min session, verify compression works)
- [ ] Import .pwlap on same account (verify session appears)
- [ ] Import .pwlap on different account (RLS verified)
- [ ] Decrypt encrypted import with correct password
- [ ] Decrypt encrypted import with wrong password (fails gracefully)
- [ ] Load imported telemetry in workbench (traces render)
- [ ] Large file export/import (stress test MongoDB)
- [ ] Concurrent exports/imports (no race conditions)
- [ ] Check audit trail (pwlap_imports table populated)

---

## Customer-Facing Messaging

### Feature Summary
>
> **Secure Session Sharing:** Export your iRacing sessions as encrypted, digitally-signed .PWLAP files. Share telemetry with teammates and coaches with full control over data fidelity. Metadata-only for privacy, setup sheets for setup sharing, or full telemetry for detailed analysis.

### Setup for Customers

1. Ensure bridge is running (telemetry → MongoDB)
2. In workbench, click "Export" → ".PWLAP"
3. Choose: metadata/setup/full + optional encryption
4. Share .pwlap file
5. Recipient imports in their account, telemetry auto-loads in workbench

---

## Migration Path (Existing Users)

✅ Fully backward compatible:

- Existing .ibt imports still work
- Existing sessions in Supabase unchanged
- .PWLAP is opt-in feature
- No migration needed; just deploy and announce

---

## Support Resources

1. **Installation:** `GETTING_STARTED.md`
2. **Architecture:** `IMPLEMENTATION_STATUS.md`
3. **Deployment:** `IMPLEMENTATION_CHECKLIST.md`
4. **API:** JSDoc comments in all functions

---

## Next Steps (In Order)

1. ✋ **You (Setup Phase)**
   - Run database migration
   - Create Storage bucket
   - Set MONGODB_URI in .env

2. 🧪 **Testing Phase**
   - Wire up UI components
   - Run end-to-end tests
   - Verify all scenarios work

3. 🚀 **Launch Phase**
   - Deploy to production
   - Announce to customers
   - Monitor usage & feedback

---

**Ready to start?** See `IMPLEMENTATION_CHECKLIST.md` for the detailed deployment checklist.

**Questions?** See `GETTING_STARTED.md` for troubleshooting or `IMPLEMENTATION_STATUS.md` for technical details.
