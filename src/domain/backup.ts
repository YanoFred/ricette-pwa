import { sanitizeAppState } from './storage';
import type { AppState, BackupPayload } from './types';

export type BackupParseResult =
  | {
      ok: true;
      state: AppState;
      profileCount: number;
      medicationCount: number;
      photoCount: number;
    }
  | {
      ok: false;
      error: string;
    };

export function createBackupPayload(
  state: AppState,
  now = new Date(),
): BackupPayload {
  return {
    app: 'ricette-pwa',
    schemaVersion: 1,
    exportedAt: now.toISOString(),
    state: sanitizeAppState(state),
  };
}

export function serializeBackup(state: AppState, now = new Date()): string {
  return JSON.stringify(createBackupPayload(state, now), null, 2);
}

export function buildBackupFilename(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `ricette-backup-${year}-${month}-${day}.json`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseAndValidateBackup(jsonText: string): BackupParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      ok: false,
      error: 'Il file selezionato non contiene un JSON valido.',
    };
  }

  if (!isRecord(parsed)) {
    return {
      ok: false,
      error: 'Struttura del file di backup non riconosciuta.',
    };
  }

  if (parsed.app !== 'ricette-pwa') {
    return {
      ok: false,
      error: 'Questo file non è un backup esportato dall’app Ricette.',
    };
  }

  if (parsed.schemaVersion !== 1) {
    return {
      ok: false,
      error: 'Versione del backup non supportata da questa versione dell’app.',
    };
  }

  if (!isRecord(parsed.state) || !Array.isArray(parsed.state.profiles)) {
    return {
      ok: false,
      error: 'Il backup non contiene un elenco profili valido.',
    };
  }

  const state = sanitizeAppState(parsed.state);
  if (parsed.state.profiles.length > 0 && state.profiles.length === 0) {
    return {
      ok: false,
      error: 'Nessun profilo valido trovato nel file di backup.',
    };
  }
  const medicationCount = state.profiles.reduce(
    (sum, p) => sum + p.medications.length,
    0,
  );
  const photoCount = state.profiles.reduce(
    (sum, p) => sum + p.medications.filter((m) => Boolean(m.photoDataUrl)).length,
    0,
  );

  return {
    ok: true,
    state,
    profileCount: state.profiles.length,
    medicationCount,
    photoCount,
  };
}
