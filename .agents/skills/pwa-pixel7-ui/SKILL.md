---
name: pwa-pixel7-ui
description: >-
  Linee guida UI Material You, accessibilità, acquisizione foto scatola e configurazione PWA
  ottimizzate per Google Pixel 7 (Chrome Android). Usare per ogni lavoro su UI, CSS e manifest PWA.
---

# Linee Guida UI & PWA per Google Pixel 7

## Prerequisito Obbligatorio
Prima di scrivere o modificare HTML, CSS, `<dialog>`, form o dark mode, consultare sempre la skill installata **`modern-web-guidance`**.

## Specifiche Google Pixel 7
- **Viewport di riferimento**: `412 × 915` CSS px (`deviceScaleFactor: 2.625`), orientamento verticale (uso con una sola mano).
- **Safe Area**: usare `viewport-fit=cover` nel meta viewport e rispettare `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` su header e barra azioni fissa in basso.
- **Touch Target**: ogni controllo interattivo (checkbox/card farmaco, pulsanti, tab, icone azione) deve avere area cliccabile minima **`48 × 48px`**.
- **Zero overflow orizzontale**: verificare sempre che a `360px` e `412px` non compaia mai scrollbar orizzontale.

## Linguaggio Visivo Material You
- **Tema chiaro/scuro automatico**: supportare `color-scheme: light dark` e `prefers-color-scheme: dark` tramite custom properties CSS (`src/styles/tokens.css`).
- **Gerarchia pulita**:
  - Superfici morbide con angoli arrotondati (`16px`–`24px`) e contrasto minimo WCAG AA (≥ 4.5:1 per testo normale).
  - Card farmaco ben leggibile: miniatura foto scatola (`56×56px`, cliccabile per zoom) oppure badge icona+colore a sinistra, nome farmaco ben leggibile al centro, indicatore di selezione chiaro a destra.
  - Barra azioni fissa in basso (thumb zone) con conteggio farmaci selezionati e CTA primaria **"Prepara Mail"**.

## Riconoscimento Visivo Farmaci
- Nel dialog gestione farmaco offrire chiaramente 3 azioni semplici:
  1. **Scatta foto** (`<input type="file" accept="image/*" capture="environment">`)
  2. **Scegli da galleria** (`<input type="file" accept="image/*">`)
  3. **Icona e colore** (sempre selezionabili come fallback immediato o al posto della foto, più pulsante "Rimuovi foto").
- Tutte le immagini passano attraverso `src/domain/imageProcessor.ts` prima di essere salvate in IndexedDB.

## Requisiti PWA
- `name`: `"Ricette"`, `short_name`: `"Ricette"`, `lang`: `"it"`, `display`: `"standalone"`, `orientation`: `"portrait"`.
- Icone PNG `192×192`, `512×512` e variante `maskable` in `public/icons/`.
- Precache completo di tutti gli asset statici con Workbox (`vite-plugin-pwa`) per funzionamento immediato in modalità aereo.
