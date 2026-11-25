---
name: email-composer-spec
description: >-
  Specifica tecnica obbligatoria per la generazione del testo email al medico e della URL mailto:
  nell'app Ricette. Usare per qualsiasi modifica alla logica di composizione, anteprima o copia mail.
---

# Specifica Composizione Email al Medico

## Struttura Esatta del Messaggio

Ogni profilo possiede i propri testi configurabili:
- `emailSubject` (default: `"Ricette"`)
- `emailOpening` (es. `"Buongiorno Doc, per favore se mi puoi preparare la ricetta per i seguenti farmaci:"`)
- `emailClosing` (default: `"Grazie mille\nSaluti"`)

Il corpo generato da `buildPrescriptionEmail()` deve seguire **esattamente** questo ordine:

```text
<emailOpening.trim()>

- <Farmaco 1.name.trim()>
- <Farmaco 2.name.trim()>

<freeNote.trim() — sezione omessa completamente se vuota>

<emailClosing.trim()>
```

## Vincoli Inderogabili

1. **Nessuna quantità / numero confezioni**: ogni riga dell'elenco contiene esclusivamente `- ` seguito dal nome/dosaggio del farmaco.
2. **Ordine deterministico**: i farmaci selezionati mantengono l'ordine configurato nel profilo (`order` crescente).
3. **Nessun testo vuoto**: se `emailOpening` o `emailClosing` sono vuoti, omettere la sezione senza lasciare righe vuote doppie all'inizio o alla fine.
4. **Costruzione `mailto:` (RFC 6068) per Gmail su Pixel 7**:
   - Destinatario pulito (`doctorEmail.trim()`).
   - Convertire tutti i `\n` in `\r\n` prima di applicare `encodeURIComponent` per la massima compatibilità con Gmail Android.
   - Formato: `mailto:<email>?subject=<encodedSubject>&body=<encodedBody>` (omettendo parametri vuoti).
   - Calcolare `isLongMailtoUrl = mailtoUrl.length > 1800` per mostrare un avviso discreto in UI che suggerisce il pulsante **"Copia testo"** di backup.
5. **Privacy**: mai includere dati reali negli esempi o nei default del codice.
