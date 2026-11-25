# Piano Master — App PWA "Ricette" per Google Pixel 7

## Visione del Progetto

Sviluppare **"Ricette"**, una Progressive Web App (PWA) mobile-first, 100% locale e privacy-first, progettata per **Google Pixel 7**:
- Gestione **multi-profilo** (con selezione automatica quando esiste un solo profilo).
- Personalizzazione del **medico** e del **modello di testo email** (oggetto, apertura, chiusura) per ciascun profilo.
- Riconoscimento visivo immediato dei farmaci tramite **foto reale della scatola** (fotocamera Pixel 7 o galleria, compressa client-side e ingrandibile con un tap) oppure **icona + colore distintivo**.
- Nessun campo "numero confezioni" (prerogativa del medico).
- Selezione rapida dei farmaci + **nota libera opzionale** + anteprima live + apertura di **Gmail precompilata** (`mailto:`) e pulsante di backup **Copia testo**.
- Persistenza offline in **IndexedDB** + **Esporta / Importa JSON** comprensivo delle miniature.

---

## Roadmap a Fasi (F0 → F6)

### Fase F0 — Governance, Privacy & Setup Ecosistema Agenti
- **Obiettivo**: impostare regole, protezione privacy, piani, file di status, agenti e skill prima di scrivere codice.
- **Deliverable**:
  - `.gitignore` con esclusione tassativa di immagini personali nella root e backup locali
  - `GEMINI.md`
  - `docs/Piani/Piano_Master.md` e `docs/Piani/Architettura_Dati.md`
  - `.agents/agents/` (`architect.md`, `core-dev.md`, `frontend-pwa.md`, `qa-tester.md`, `reviewer-fixer.md`)
  - `.agents/skills/` (`project-status-tracker`, `dev-team-orchestrator`, `email-composer-spec`, `pwa-pixel7-ui`, `test-and-release-qa`)
  - `Stato_di_progetto.md` e `Registro_Operazioni.md`
  - Inizializzazione repository Git locale
- **Criterio di Done**: tutti i file presenti e `git status` conferma l'esclusione delle immagini sensibili nella root.

### Fase F1 — Scaffolding Progetto Vite + React + TypeScript + PWA
- **Obiettivo**: predisporre toolchain moderna, strict TypeScript, linting, PWA Workbox e runner di test.
- **Deliverable**:
  - `package.json`, `tsconfig.json`, `vite.config.ts` (con `vite-plugin-pwa`), `eslint.config.js`, `vitest.config.ts`, `playwright.config.ts`
  - `index.html`, `src/main.tsx`, `src/App.tsx`, icone PWA (`public/icons/`)
- **Criterio di Done**: `npm run typecheck`, `npm run lint`, `npm run build` verdi con `manifest.webmanifest` e Service Worker generati in `dist/`.

### Fase F2 — Dominio, Storage IndexedDB, Immagini & Generatore Mail
- **Obiettivo**: implementare tutta la logica pura senza dipendenze UI e coprirla con unit test rigorosi.
- **Deliverable**:
  - `src/domain/types.ts`, `src/domain/defaults.ts`
  - `src/domain/emailBuilder.ts` (composizione testo + URL `mailto:` RFC 6068 + controllo lunghezza)
  - `src/domain/imageProcessor.ts` (ridimensionamento e compressione foto client-side WebP/JPEG)
  - `src/domain/storage.ts` (IndexedDB versionato con fallback sicuro)
  - `src/domain/backup.ts` (export/import JSON validato con miniature incluse)
  - `src/hooks/useAppStore.ts`
  - Unit test in `tests/unit/`
- **Criterio di Done**: tutti gli unit test (`npm run test`) verdi al 100%, `typecheck` e `lint` verdi.

### Fase F3 — Interfaccia Material You, Riconoscimento Visivo & Flussi Pixel 7
- **Obiettivo**: realizzare l'intera interfaccia mobile-first seguendo `modern-web-guidance` e `pwa-pixel7-ui`.
- **Deliverable**:
  - Design tokens Material You chiaro/scuro automatico (`src/styles/tokens.css`, `src/styles/global.css`)
  - `Header`, `OnboardingView`, `MedicationVisualBadge`, `MedicationList`, `FreeNoteInput`, `EmailPreviewSheet`
  - `<dialog>` nativi accessibili: `ProfileManagerDialog`, `MedicationManagerDialog` (fotocamera/galleria + icona/colore + riordino), `ImageZoomDialog`, `BackupDialog`
  - Component test in `tests/components/`
- **Criterio di Done**: tutti i flussi utente funzionanti senza errori console, component test verdi.

### Fase F4 — PWA Offline, Accessibilità & Ottimizzazione Pixel 7
- **Obiettivo**: finalizzare comportamento PWA offline-first, icone Android maskable, safe-area Pixel 7, contrasto WCAG AA e notifica aggiornamento PWA.
- **Deliverable**:
  - Manifest completo (`name: "Ricette"`, `short_name: "Ricette"`, `display: "standalone"`, icone `192x192`, `512x512`, `maskable`)
  - Configurazione Workbox precache completo + componente notifica aggiornamento
  - Verifica accessibilità (label ARIA, focus-visible, target ≥ 48px, supporto tastiera `<dialog>`)
- **Criterio di Done**: build produzione verificata, Service Worker attivo, navigazione e accessibilità verificate.

### Fase F5 — Test E2E Pixel 7, Code Review & Bug Fixing
- **Obiettivo**: validazione end-to-end su profilo mobile Pixel 7 e revisione critica indipendente del codice.
- **Deliverable**:
  - Suite E2E Playwright (`tests/e2e/pixel7.spec.ts`) su viewport `412x915` con touch
  - Code review completa eseguita da `reviewer-fixer` (privacy, `mailto:`, edge case foto/storage, a11y, TypeScript strict)
  - Eventuali fix applicati e riverificati
- **Criterio di Done**: `npm run verify` (`typecheck + lint + test + test:e2e + build`) 100% verde.

### Fase F6 — Build Locale, Guida Installazione Pixel 7 & Scelta Hosting
- **Obiettivo**: preparare il pacchetto finale pronto per la distribuzione e guidare l'utente nella scelta dell'hosting HTTPS (Netlify Drop, Cloudflare Pages, GitHub Pages oppure USB `localhost`) e nel collaudo sul Pixel 7 reale.
- **Deliverable**:
  - Guida operativa `docs/Guida_Installazione_Pixel7.md` (tutte le opzioni di pubblicazione HTTPS + checklist collaudo su Pixel 7)
  - Build di produzione verificata in `dist/`
  - Walkthrough finale con risultati dei test e istruzioni d'uso
- **Criterio di Done**: documentazione completa, stato e registro aggiornati, app pronta per l'installazione sul Pixel 7.
