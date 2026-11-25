# Architettura Dati e Specifiche Tecniche — App "Ricette"

## 1. Principi Architetturali

1. **Zero Backend / 100% Local-First**: tutti i dati di profili, medici, farmaci e miniature foto risiedono esclusivamente sul dispositivo dell'utente.
2. **Separazione Netta (`src/domain/` vs `src/components/`)**: tutta la logica di business (composizione mail, elaborazione immagini, storage IndexedDB, validazione backup JSON) è priva di dipendenze React e testabile in isolamento con Vitest.
3. **Resilienza e Migrazioni**: lo stato persistito include sempre `schemaVersion: 1` per consentire evoluzioni future senza perdita dati.

---

## 2. Schema Dati (`src/domain/types.ts`)

```typescript
export type MedicationIconId =
  | 'pill'      // Compressa
  | 'capsule'   // Capsula
  | 'drops'     // Collirio / Gocce
  | 'sachet'    // Bustina
  | 'syringe'   // Fiala / Siringa
  | 'box';      // Scatola generica

export type MedicationColorId =
  | 'teal'
  | 'orange'
  | 'pink'
  | 'blue'
  | 'green'
  | 'purple'
  | 'amber';

export interface Medication {
  id: string;
  name: string;             // Es. "Farmaco A 2,5 mg" (mai numero confezioni)
  order: number;
  icon: MedicationIconId;   // Icona fallback sempre presente
  color: MedicationColorId; // Colore badge sempre presente
  photoDataUrl?: string;    // Miniatura compressa WebP/JPEG (data:image/...)
}

export interface Profile {
  id: string;
  label: string;            // Nome profilo (es. "Personale", "Familiare")
  doctorName: string;       // Appellativo (es. "Doc", "Dott. Bianchi")
  doctorEmail: string;      // Email destinatario
  emailSubject: string;     // Default: "Ricette"
  emailOpening: string;     // Modello apertura personalizzato per profilo
  emailClosing: string;     // Default: "Grazie mille\nSaluti"
  medications: Medication[];
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}

export interface AppState {
  schemaVersion: 1;
  activeProfileId: string | null;
  profiles: Profile[];
}

export interface BackupPayload {
  app: 'ricette-pwa';
  schemaVersion: 1;
  exportedAt: string;       // ISO 8601
  state: AppState;
}
```

---

## 3. Persistenza Locale (`IndexedDB`)

- **Database**: `ricette_pwa_db` (versione `1`)
- **Object Store**: `app_state` con chiave unica `"root"` contenente `AppState`.
- **Perché IndexedDB invece del solo `localStorage`**:
  - `localStorage` è sincrono e limitato a ~5 MB: salvando foto di scatole su più profili si rischierebbe `QuotaExceededError`.
  - IndexedDB gestisce comodamente decine/centinaia di MB in modo asincrono, funziona perfettamente offline nei Service Worker / PWA Android su Chrome (Pixel 7) e mantiene comunque un fallback controllato su `localStorage` qualora `indexedDB` non sia disponibile in ambienti minimali.

---

## 4. Specifiche Foto Scatole (`imageProcessor.ts`)

- **Input accettati**: `image/jpeg`, `image/png`, `image/webp`, `image/heic`/`image/heif` (quando decodificabili dal browser). Limite file sorgente: `15 MB`.
- **Trasformazione client-side**:
  - Ridimensionamento proporzionale con lato massimo `320px` (nitido sia come miniatura `56x56px` ad alta densità Pixel 7 `2.625x`, sia nello zoom di consultazione rapida).
  - Compressione preferibilmente in `image/webp` (qualità `0.82`), con fallback automatico a `image/jpeg` (qualità `0.82`) se il browser non supporta l'export WebP.
  - Peso target per miniatura: **~12–30 KB**, ideale sia per IndexedDB che per inclusione diretta nel file di backup JSON.

---

## 5. Specifiche Composizione Email (`emailBuilder.ts`)

Struttura generata del corpo email:

```text
<emailOpening trimmed>

- <Farmaco 1>
- <Farmaco 2>

<freeNote trimmed, inclusa solo se non vuota>

<emailClosing trimmed>
```

Regole di costruzione URL `mailto:` (RFC 6068):
- Destinatario: `encodeURIComponent(doctorEmail.trim())` preservando `@` (o `mailto:${doctorEmail.trim()}` validato).
- Query parameters codificati rigorosamente con `encodeURIComponent`:
  - `subject`: `encodeURIComponent(subject)`
  - `body`: `encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))` (CRLF garantisce corretta resa degli a capo su Gmail Android).
- **Guardia lunghezza**: se la URL `mailto:` supera `1800` caratteri, l'UI mostra un avviso non bloccante che consiglia di usare **"Copia testo"** in caso di troncamento da parte del client email.
