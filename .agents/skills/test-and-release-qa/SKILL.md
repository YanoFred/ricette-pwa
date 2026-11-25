---
name: test-and-release-qa
description: >-
  Runbook completo di verifica qualità, privacy check, test unitari/componenti/E2E Pixel 7
  e build produzione prima di chiudere una fase o rilasciare l'app Ricette.
---

# Test & Release QA Runbook

Usa questa skill prima di marcare completata qualsiasi fase di sviluppo o dopo aver applicato fix.

## Pipeline di Verifica Standard

Eseguire in sequenza dalla root `d:\Progetto Ricette`:

```powershell
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

*(Oppure il comando cumulativo `npm run verify` una volta definito in `package.json`.)*

## Controlli Obbligatori Pre-Chiusura

1. **Verifica Privacy Git**:
   ```powershell
   git status --short
   ```
   - Controllare che **nessuna** immagine personale (`Screenshot*.png`, `esempio_farmaci.png`, `backup-*.json`) compaia tra i file tracciati o untracked pronti per il commit.
2. **Verifica Output PWA**:
   - Controllare che `dist/manifest.webmanifest` e `dist/sw.js` siano generati correttamente dopo `npm run build`.
3. **Verifica Test E2E Pixel 7**:
   - Confermare che `tests/e2e/pixel7.spec.ts` giri sul viewport `412×915` con touch abilitato e verifichi:
     - onboarding profilo + personalizzazione modello mail
     - aggiunta farmaco con icona/colore e farmaco con foto caricata
     - zoom immagine scatola
     - selezione farmaci + nota libera + controllo URL `mailto:` + pulsante copia
     - backup Esporta/Importa JSON + persistenza dopo reload
4. **Tracciamento**:
   - Registrare esito completo in `Registro_Operazioni.md` e aggiornare `Stato_di_progetto.md` tramite la skill `project-status-tracker`.
