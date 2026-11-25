import type {
  AppState,
  Medication,
  MedicationInput,
  Profile,
  ProfileInput,
} from './types';

export const DEFAULT_DOCTOR_NAME = 'Doc';
export const DEFAULT_EMAIL_SUBJECT = 'Ricette';
export const DEFAULT_EMAIL_CLOSING = 'Grazie mille\nSaluti';

export function buildDefaultEmailOpening(doctorName = DEFAULT_DOCTOR_NAME): string {
  const cleanDoctor = doctorName.trim() || DEFAULT_DOCTOR_NAME;
  return `Buongiorno ${cleanDoctor}, per favore se mi puoi preparare la ricetta per i seguenti farmaci:`;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `id-${Date.now().toString(36)}-${randomPart}`;
}

export function createEmptyAppState(): AppState {
  return {
    schemaVersion: 1,
    activeProfileId: null,
    profiles: [],
  };
}

export function createProfile(input: ProfileInput, now = new Date()): Profile {
  const iso = now.toISOString();
  const doctorName = input.doctorName.trim() || DEFAULT_DOCTOR_NAME;
  return {
    id: generateId(),
    label: input.label.trim(),
    doctorName,
    doctorEmail: input.doctorEmail.trim(),
    emailSubject: input.emailSubject.trim() || DEFAULT_EMAIL_SUBJECT,
    emailOpening: input.emailOpening.trim(),
    emailClosing: input.emailClosing.trim(),
    medications: [],
    createdAt: iso,
    updatedAt: iso,
  };
}

export function createMedication(
  input: MedicationInput,
  order: number,
): Medication {
  const med: Medication = {
    id: generateId(),
    name: input.name.trim(),
    order,
    icon: input.icon,
    color: input.color,
  };
  if (input.photoDataUrl) {
    med.photoDataUrl = input.photoDataUrl;
  }
  return med;
}
