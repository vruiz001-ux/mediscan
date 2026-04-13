# MediScan

MediScan is an **informational medication screening** MVP. Enter up to 10 medicines, add an optional patient profile (pregnancy, kidney / liver / ulcer history, allergies, alcohol), and get a clear **Go / Caution / No Go** result with per-finding plain-language explanations and recommended next steps.

> This is an informational medication screening tool only. Always confirm with a licensed doctor or pharmacist before taking, combining, stopping, or changing any medicine.

## Stack

- **Next.js 15** App Router, TypeScript strict
- **Tailwind 3.4** + shadcn-style UI primitives (Radix)
- **Prisma 5** + SQLite (dev) / libSQL-Turso (prod) via `@libsql/client/web` driver adapter
- **Zod** input validation on every API route
- **vitest** unit tests
- **lucide-react** icons, **Inter** font
- **Netlify** deploy (`netlify.toml`, `@netlify/plugin-nextjs`)

## Run locally

```bash
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run dev
```

Tests and build:

```bash
npm test
npm run build
```

## Architecture

Domain logic lives entirely in **code**, not the database — the DB only persists an anonymous record of each screening request so results can be re-opened by ID.

```
src/
  lib/
    types.ts                        # Finding / OverallResult / MedicineEntry / PatientProfile
    domain/
      drugDatabase.ts               # Molecule metadata (20 molecules, OTC flag, warnings)
      brandToMoleculeMap.ts         # Brand + alias → molecule IDs (Advil → ibuprofen, …)
      normalizationEngine.ts        # raw input → MedicineEntry
      interactionRules.ts           # molecule × molecule rules (FDA / Stockley's / UpToDate)
      duplicateTherapyRules.ts      # same molecule / same class / anticoagulant stacking
      contraindicationRules.ts      # profile × molecule (pregnancy, kidney, liver, …)
      sideEffectData.ts             # common + red-flag symptoms per molecule
      riskScoring.ts                # findings → overall Go / Caution / No Go
      recommendationEngine.ts       # ensure every finding has a plain-language action
      pipeline.ts                   # orchestrates the full screening
    history/localStore.ts           # Zod-validated localStorage wrapper
    db/client.ts                    # libSQL/Turso-ready Prisma client
  app/
    page.tsx                        # Home: hero + how-it-works + FAQ + disclaimers
    check/page.tsx + CheckClient    # Entry form (up to 10 medicines + profile)
    check/results/…                 # Results with OverallStatusBanner + FindingCards
    history/…                       # Local history
    print/[id]/…                    # Printable summary
    about, privacy, terms, faq      # Static pages
    api/suggest, /normalize, /check # Server endpoints
  components/app/                   # DisclaimerBanner, MedicineEntryRow, OverallStatusBanner, FindingCard, …
  components/marketing/             # Hero, HowItWorks, FAQAccordion, Nav, Footer
  components/ui/                    # Button, Card, Input, Badge, Separator
  test/                             # 7 vitest suites
```

### Normalization pipeline

`raw input → normalizationEngine → brandToMoleculeMap.lookupDrug() → DrugRecord → active molecule IDs` → rules engine.

Combination products (Co-codamol, Augmentin, Panadol Extra) resolve to multiple active ingredients and each is screened independently.

### How brand-name-to-molecule recognition works

MediScan is **local-first with an RxNav fallback**:

1. **Local lookup** — the built-in `brandToMoleculeMap` + `drugDatabase` (~20 molecules, common brands + aliases) is checked first. Autocomplete only returns local results when we have ≥3 matches or any exact hit.
2. **NIH RxNav fallback** — otherwise we call the free [RxNav REST API](https://rxnav.nlm.nih.gov/RxNormAPIs.html):
   - `approximateTerm` for fuzzy autocomplete (RxCUI → canonical name)
   - `rxcui.json?name=…&search=2` to resolve a brand/generic to an RxCUI
   - `rxcui/{id}/related.json?tty=IN` to get active ingredient names
3. **Caching** — every lookup is cached in Prisma (`RxCache` table: 1 day TTL for search, 7 days for resolved ingredient mappings) + an in-memory LRU (100 entries / 1h).
4. **Failure-tolerant** — 3 s timeout, one retry on 5xx, empty result on failure. The app still works fully offline with local data if RxNav is unreachable.

#### Limited data caveat

RxNav returns RxNorm ingredient names which may not match MediScan's internal rule database. When a medicine is resolved via RxNav to an ingredient we have no rule data for, the pipeline emits a `"Limited data for {molecule}"` finding at **moderate / caution** severity — so the overall result is always at least `caution` and the user is told to consult a pharmacist. We never silently assume "no rule = safe".

Disable the integration with `MEDISCAN_USE_RXNAV=false` if you hit rate-limit issues (NIH asks for ≤20 req/s; we enforce a local token bucket).

### Data sources

- **NIH / National Library of Medicine — RxNorm & RxNav** (<https://rxnav.nlm.nih.gov/>) — brand / generic / ingredient resolution. Public domain, no API key.
- FDA drug labels, EMA SmPC, UpToDate, Stockley's Drug Interactions — rule provenance (comments in the rule tables).

> RxNav's built-in interaction API was retired by NLM in 2024, so MediScan's interaction / duplicate / contraindication rules remain the single source of truth. RxNav is used **only** for name recognition.

### Rules

- **Interactions** — pairwise molecule × molecule table (warfarin + NSAID = critical no_go, SSRI + tramadol = critical no_go, simvastatin + clarithromycin = critical no_go, etc.).
- **Duplicate therapy** — same molecule in two products, or two molecules of the same class (two NSAIDs / two SSRIs / two anticoagulants).
- **Contraindications** — profile × molecule (pregnancy + warfarin/ibuprofen/naproxen/statin, kidney + metformin/NSAIDs, liver + paracetamol/statin, heavy alcohol + paracetamol/diazepam, allergy string match).
- **Unresolved input** — forces overall status to at least `caution` and surfaces an explicit finding.

Severity → overall status mapping (`riskScoring`):

- Any `critical` finding → `no_go`
- Else any `major` or `moderate` → `caution`
- Else → `go`
- Any unresolved input while status is `go` → upgraded to `caution`

Each rule layer is a small pure module — adding a rule is a single table append.

## API

- `GET /api/suggest?q=<string>` → `{ suggestions: DrugRecord[] }`
- `POST /api/normalize { entries: [{ inputName, … }] }` → `{ normalized: MedicineEntry[] }`
- `POST /api/check { medicines: MedicineEntry[1..10], profile? }` → `{ result: OverallResult, checkId }`

Server-side validation via Zod; 11th entry is rejected with HTTP 400.

## Deploy

```toml
# netlify.toml
[build]
  command = "prisma generate && next build"
  publish = ".next"
[[plugins]]
  package = "@netlify/plugin-nextjs"
[build.environment]
  NODE_VERSION = "20"
```

Set `LIBSQL_URL` and `LIBSQL_AUTH_TOKEN` in Netlify env for production. The `db/client.ts` wrapper uses `@libsql/client/web` (fetch-based, zero native bindings) and `binaryTargets = ["native", "rhel-openssl-3.0.x"]` is set in `schema.prisma`.

## Safety limitations — read this

This MVP uses a **limited demo ruleset**:

- ~20 molecules, ~16 interaction rules, ~15 contraindications, 3 class-duplication rules, 1 anticoagulant-stacking rule.
- **Not a validated clinical database.** Real-world clinical deployment requires RxNorm / DM+D / ATC-grade data, clinician review, and professional oversight.
- Absence of a flag does **not** mean a combination is safe.
- MediScan never tells users to start, stop, or change a medicine on their own.
- Every results view shows a prominent non-dismissible disclaimer.

Rule sources are cited as code comments (FDA labels, UpToDate, Stockley's, EMA SmPC). These are reference pointers — not a substitute for ongoing clinician curation.
