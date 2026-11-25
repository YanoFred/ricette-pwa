# Registro Operazioni — App PWA "Ricette"

> Registro cronologico **append-only**: ogni operazione significativa (inclusi errori, blocchi o tentativi falliti) viene accodata senza mai modificare o eliminare le righe storiche.

| ID | Data e Ora | Operazione | Esito | Dettagli / File |
| :--- | :--- | :--- | :--- | :--- |
| F0-01 | 25/11/2026 11:21 | Creazione protezione privacy, regole progetto e piani | [OK] | `.gitignore`, `GEMINI.md`, `docs/Piani/Piano_Master.md`, `docs/Piani/Architettura_Dati.md` |
| F0-02 | 25/11/2026 11:22 | Creazione specifiche dei 5 agenti specializzati | [OK] | `.agents/agents/architect.md`, `core-dev.md`, `frontend-pwa.md`, `qa-tester.md`, `reviewer-fixer.md` |
| F0-03 | 25/11/2026 11:22 | Creazione delle 5 skill custom di progetto | [OK] | `.agents/skills/{project-status-tracker,dev-team-orchestrator,email-composer-spec,pwa-pixel7-ui,test-and-release-qa}/SKILL.md` |
| F0-04 | 25/11/2026 11:23 | Inizializzazione documenti di tracciamento stato e registro | [OK] | `Stato_di_progetto.md`, `Registro_Operazioni.md` |
| F0-05 | 25/11/2026 11:23 | Inizializzazione Git locale e verifica esclusione immagini personali | [OK] | `git init`; `git status --short --ignored` conferma ignorati i 4 screenshot email ed `esempio_farmaci.png` |
| F1-01 | 25/11/2026 11:24 | Creazione configurazione scaffolding Vite + React + TS + PWA + ESLint + Vitest + Playwright | [OK] | `package.json`, `tsconfig*.json`, `vite.config.ts`, `eslint.config.js`, `vitest.config.ts`, `playwright.config.ts`, `index.html`, `public/favicon.svg` |
| F1-02 | 25/11/2026 11:25 | Generazione icone PNG PWA Android (`192x192`, `512x512`, `maskable`) | [OK] | `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` |
| F1-03 | 25/11/2026 11:25 | Tentativo installazione dipendenze con `npm install` in PowerShell | [FALLITO] | `npm.ps1` bloccato da ExecutionPolicy Windows; risolto usando `npm.cmd` |
| F1-04 | 25/11/2026 11:25 | Tentativo `npm.cmd install` in sandbox senza rete | [FALLITO] | `E403 Forbidden` verso `registry.npmjs.org` per isolamento rete sandbox |
| F1-05 | 25/11/2026 11:30 | Installazione dipendenze npm (`npm.cmd install`) con accesso rete | [OK] | 536 pacchetti installati (`package-lock.json` generato) |
| F2-01 | 25/11/2026 11:27 | Implementazione dominio puro, IndexedDB, compressione foto, backup JSON e hook store | [OK] | `src/domain/{types,defaults,emailBuilder,imageProcessor,storage,backup}.ts`, `src/hooks/useAppStore.ts` |
| F2-02 | 25/11/2026 11:28 | Creazione test unitari dominio (16 test anonimi) | [OK] | `tests/unit/{emailBuilder,imageProcessor,storage,backup}.test.ts` |
| F2-03 | 25/11/2026 11:35 | Prima verifica `typecheck` su configurazione Playwright | [FALLITO] | `playwright.config.ts` usava `process.env.CI` senza `@types/node`; risolto con lettura tipizzata su `globalThis` |
| F2-04 | 25/11/2026 11:39 | Verifica completa F1+F2 (`typecheck`, `lint`, `vitest`, `build` PWA) | [OK] | 16/16 test unitari verdi; `dist/manifest.webmanifest` e `dist/sw.js` generati |
| F3-01 | 25/11/2026 11:34 | Consultazione obbligatoria `modern-web-guidance` su dialog, scroll-lock, dark mode e form | [OK] | Recuperate 4 guide (`light-dismiss-a-dialog`, `prevent-page-scroll-under-modal-dialog`, `dark-mode`, `validate-input-after-interaction`) |
| F3-02 | 25/11/2026 11:43 | Sviluppo design system Material You light/dark e tutti i componenti UI + test `AppFlow` | [OK] | `src/styles/{tokens,global}.css`, `src/components/*.tsx`, `src/App.tsx`, `tests/components/AppFlow.test.tsx` |
| F4-01 | 25/11/2026 11:44 | Creazione suite E2E Playwright Pixel 7, fixture anonime e workflow GitHub Actions opzionale | [OK] | `tests/e2e/pixel7.spec.ts`, `tests/e2e/fixtures/test-box.png`, `.github/workflows/deploy.yml` |
| F4-02 | 25/11/2026 11:44 | Verifica `typecheck` su `tests/e2e/pixel7.spec.ts` | [FALLITO] | Mancava `"DOM"` in `tsconfig.node.json` e `Buffer`; risolto aggiungendo `"DOM"` e usando fixture file `test-box.png` |
| F5-01 | 25/11/2026 11:48 | Prima esecuzione test componenti `AppFlow.test.tsx` | [FALLITO] | Import `virtual:pwa-register/react` non risolto in Vitest; risolto con alias `tests/mocks/pwaRegister.ts` in `vitest.config.ts` |
| F5-02 | 25/11/2026 11:51 | Seconda esecuzione `AppFlow.test.tsx` | [FALLITO] | Timeout 5000ms su `userEvent.type` lungo in jsdom; risolto usando `user.paste` e timeout 15s (passato in 7.9s) |
| F5-03 | 25/11/2026 11:54 | Prima esecuzione Playwright E2E in sandbox | [FALLITO] | `ERR_CONNECTION_REFUSED` su `127.0.0.1:4173` per isolamento porte sandbox; rilanciato fuori sandbox |
| F5-04 | 25/11/2026 11:55 | Esecuzione Playwright E2E su Pixel 7 | [FALLITO] | Violazione strict mode locator `/Farmaco Con Foto 5 mg/i` (corrispondeva anche al pulsante zoom); reso esatto con `{ exact: true }` |
| F5-05 | 25/11/2026 11:57 | Esecuzione Playwright E2E su Pixel 7 (`412x915`) | [OK] | `1 passed` (onboarding, foto + zoom, icona/colore, IndexedDB reload, `mailto:`, multi-profilo) |
| F5-06 | 25/11/2026 11:57 | Code review indipendente eseguita dal subagente `reviewer-fixer` | [OK] | Rilevati 17 finding (3 critici, 9 medi, 5 bassi) su 5 assi (prima istanza interrotta su lettura binari, seconda completata) |
| F5-07 | 25/11/2026 12:02 | Applicazione integrale dei 17 fix della code review ed estensione test unitari ed E2E | [OK] | Fix su `ModalDialog`, `useAppStore`, `EmailPreviewSheet`, `emailBuilder`, `storage`, `backup`, `tokens.css`, `global.css`, `ProfileManagerDialog`, `MedicationManagerDialog`, `BackupDialog`, `App.tsx`; aggiunti test injection/dedup/dark-mode/backup |
| F5-08 | 25/11/2026 12:07 | Riesecuzione completa pipeline di verifica post-fix | [OK] | `typecheck` OK, `eslint` OK, Vitest **19/19** verdi, `build` PWA OK (14 asset precache, 300 KiB), Playwright Pixel 7 **2/2** verdi |
| F6-01 | 25/11/2026 12:08 | Guida installazione Pixel 7, verifica privacy Git, cattura screenshot reali e walkthrough | [OK] | `docs/Guida_Installazione_Pixel7.md`, `git status --ignored` conferma 5 immagini personali escluse, `walkthrough.md` creato |
| M-01 | 25/11/2026 13:51 | Primo commit su `main` ("Primo commit app Ricette v1.0"), tag `v1.0` e creazione branch `v2-grafica` | [OK] | Commit `07461b0`, tag `v1.0`, branch attivo `v2-grafica`; immagini personali escluse |
| M-02 | 25/11/2026 13:53 | Generazione logo grafico pulito stile etichetta per test caricamento Galleria (locale) | [OK] | `local_references/bisoprololo_2_5mg_logo.png` (`1120x600`, escluso da Git) |
| M-03 | 25/11/2026 13:57 | Restyling card farmaci per leggibilità Pixel 7 su `v2-grafica` e verifica completa | [OK] | `src/styles/global.css`, `src/components/MedicationVisualBadge.tsx`, `src/domain/imageProcessor.ts` (`640px`, `object-fit: contain`, `136x74px`); `typecheck`, `lint`, Vitest 19/19, build e Playwright Pixel 7 2/2 verdi |
| M-04 | 25/11/2026 14:47 | Commit modifiche grafiche e leggibilità Pixel 7 sul branch `v2-grafica` | [OK] | `src/styles/global.css`, `src/components/MedicationVisualBadge.tsx`, `src/domain/imageProcessor.ts`, `Stato_di_progetto.md`, `Registro_Operazioni.md` |
