import {
  buildDefaultEmailOpening,
  createEmptyAppState,
  DEFAULT_DOCTOR_NAME,
  DEFAULT_EMAIL_CLOSING,
  DEFAULT_EMAIL_SUBJECT,
  generateId,
} from './defaults';
import { isSafePhotoDataUrl } from './imageProcessor';
import {
  MEDICATION_COLOR_IDS,
  MEDICATION_ICON_IDS,
  type AppState,
  type Medication,
  type MedicationColorId,
  type MedicationIconId,
  type Profile,
} from './types';

const DB_NAME = 'ricette_pwa_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const ROOT_KEY = 'root';
const LOCAL_STORAGE_FALLBACK_KEY = 'ricette_pwa_state_v1';

const ICON_SET = new Set<string>(MEDICATION_ICON_IDS);
const COLOR_SET = new Set<string>(MEDICATION_COLOR_IDS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeIcon(value: unknown): MedicationIconId {
  if (typeof value === 'string' && ICON_SET.has(value)) {
    return value as MedicationIconId;
  }
  return 'pill';
}

function sanitizeColor(value: unknown): MedicationColorId {
  if (typeof value === 'string' && COLOR_SET.has(value)) {
    return value as MedicationColorId;
  }
  return 'teal';
}

function sanitizeMedication(raw: unknown, fallbackOrder: number): Medication | null {
  if (!isRecord(raw)) return null;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (name.length === 0) return null;

  const id =
    typeof raw.id === 'string' && raw.id.trim().length > 0
      ? raw.id.trim()
      : generateId();
  const order =
    typeof raw.order === 'number' && Number.isFinite(raw.order)
      ? raw.order
      : fallbackOrder;

  const medication: Medication = {
    id,
    name,
    order,
    icon: sanitizeIcon(raw.icon),
    color: sanitizeColor(raw.color),
  };

  if (isSafePhotoDataUrl(raw.photoDataUrl)) {
    medication.photoDataUrl = raw.photoDataUrl;
  }

  return medication;
}

function sanitizeProfile(raw: unknown): Profile | null {
  if (!isRecord(raw)) return null;
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  if (label.length === 0) return null;

  const nowIso = new Date().toISOString();
  const id =
    typeof raw.id === 'string' && raw.id.trim().length > 0
      ? raw.id.trim()
      : generateId();
  const doctorName =
    typeof raw.doctorName === 'string' && raw.doctorName.trim().length > 0
      ? raw.doctorName.trim()
      : DEFAULT_DOCTOR_NAME;
  const doctorEmail =
    typeof raw.doctorEmail === 'string' ? raw.doctorEmail.trim() : '';
  const emailSubject =
    typeof raw.emailSubject === 'string' && raw.emailSubject.trim().length > 0
      ? raw.emailSubject.trim()
      : DEFAULT_EMAIL_SUBJECT;
  const emailOpening =
    typeof raw.emailOpening === 'string'
      ? raw.emailOpening.trim()
      : buildDefaultEmailOpening(doctorName);
  const emailClosing =
    typeof raw.emailClosing === 'string'
      ? raw.emailClosing.trim()
      : DEFAULT_EMAIL_CLOSING;

  const rawMedications = Array.isArray(raw.medications) ? raw.medications : [];
  const seenMedIds = new Set<string>();
  const medications = rawMedications
    .map((item, index) => sanitizeMedication(item, index))
    .filter((item): item is Medication => item !== null)
    .sort((a, b) => a.order - b.order)
    .map((med, index) => {
      const uniqueId = seenMedIds.has(med.id) ? generateId() : med.id;
      seenMedIds.add(uniqueId);
      return { ...med, id: uniqueId, order: index };
    });

  return {
    id,
    label,
    doctorName,
    doctorEmail,
    emailSubject,
    emailOpening,
    emailClosing,
    medications,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : nowIso,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : nowIso,
  };
}

export function sanitizeAppState(raw: unknown): AppState {
  if (!isRecord(raw) || !Array.isArray(raw.profiles)) {
    return createEmptyAppState();
  }

  const seenProfileIds = new Set<string>();
  const profiles: Profile[] = [];

  for (const rawProfile of raw.profiles) {
    const profile = sanitizeProfile(rawProfile);
    if (!profile) continue;
    if (seenProfileIds.has(profile.id)) {
      profile.id = generateId();
    }
    seenProfileIds.add(profile.id);
    profiles.push(profile);
  }

  let activeProfileId: string | null = null;
  if (profiles.length === 1) {
    activeProfileId = profiles[0].id;
  } else if (profiles.length > 1) {
    const candidate =
      typeof raw.activeProfileId === 'string' ? raw.activeProfileId : null;
    activeProfileId =
      candidate && profiles.some((p) => p.id === candidate)
        ? candidate
        : profiles[0].id;
  }

  return {
    schemaVersion: 1,
    activeProfileId,
    profiles,
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB non disponibile'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Errore apertura IndexedDB'));
    request.onblocked = () =>
      reject(new Error('Database IndexedDB bloccato da un’altra scheda'));
  });
}

function clearLocalStorageFallback(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_FALLBACK_KEY);
    }
  } catch {
    // Ignora errori localStorage
  }
}

function loadFromLocalStorageFallback(): AppState {
  try {
    if (typeof localStorage === 'undefined') {
      return createEmptyAppState();
    }
    const serialized = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    if (!serialized) return createEmptyAppState();
    return sanitizeAppState(JSON.parse(serialized));
  } catch {
    return createEmptyAppState();
  }
}

function saveToLocalStorageFallback(state: AppState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(state));
}

export async function loadAppState(): Promise<AppState> {
  try {
    const db = await openDatabase();
    try {
      const raw = await new Promise<unknown>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(ROOT_KEY);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () =>
          reject(req.error ?? new Error('Errore lettura IndexedDB'));
        tx.onabort = () =>
          reject(tx.error ?? new Error('Lettura IndexedDB annullata'));
      });
      if (raw === undefined) {
        return loadFromLocalStorageFallback();
      }
      return sanitizeAppState(raw);
    } finally {
      db.close();
    }
  } catch {
    return loadFromLocalStorageFallback();
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  const cleanState = sanitizeAppState(state);
  try {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(cleanState, ROOT_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () =>
          reject(tx.error ?? new Error('Errore scrittura IndexedDB'));
        tx.onabort = () =>
          reject(tx.error ?? new Error('Transazione IndexedDB annullata'));
      });
      // Rimuove eventuali residui obsoleti dal fallback localStorage
      clearLocalStorageFallback();
    } finally {
      db.close();
    }
  } catch {
    saveToLocalStorageFallback(cleanState);
  }
}

export async function clearAppState(): Promise<void> {
  try {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(ROOT_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error('Errore reset IndexedDB'));
        tx.onabort = () => reject(tx.error ?? new Error('Reset IndexedDB annullato'));
      });
    } finally {
      db.close();
    }
  } catch {
    // Ignora errori IDB in fase di reset
  }
  clearLocalStorageFallback();
}
