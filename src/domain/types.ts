export const MEDICATION_ICON_IDS = [
  'pill',
  'capsule',
  'drops',
  'sachet',
  'syringe',
  'box',
] as const;

export type MedicationIconId = (typeof MEDICATION_ICON_IDS)[number];

export const MEDICATION_COLOR_IDS = [
  'teal',
  'orange',
  'pink',
  'blue',
  'green',
  'purple',
  'amber',
] as const;

export type MedicationColorId = (typeof MEDICATION_COLOR_IDS)[number];

export interface MedicationIconMeta {
  id: MedicationIconId;
  label: string;
}

export interface MedicationColorMeta {
  id: MedicationColorId;
  label: string;
  swatch: string;
}

export const MEDICATION_ICONS: readonly MedicationIconMeta[] = [
  { id: 'pill', label: 'Compressa' },
  { id: 'capsule', label: 'Capsula' },
  { id: 'drops', label: 'Collirio / Gocce' },
  { id: 'sachet', label: 'Bustina' },
  { id: 'syringe', label: 'Fiala / Siringa' },
  { id: 'box', label: 'Scatola' },
];

export const MEDICATION_COLORS: readonly MedicationColorMeta[] = [
  { id: 'teal', label: 'Verde acqua', swatch: '#006a60' },
  { id: 'orange', label: 'Arancione', swatch: '#d85b00' },
  { id: 'pink', label: 'Fucsia', swatch: '#b81d69' },
  { id: 'blue', label: 'Azzurro', swatch: '#0b6bcb' },
  { id: 'green', label: 'Verde', swatch: '#2e7d32' },
  { id: 'purple', label: 'Viola', swatch: '#7b3fa0' },
  { id: 'amber', label: 'Giallo ambra', swatch: '#b27a00' },
];

export interface Medication {
  id: string;
  name: string;
  order: number;
  icon: MedicationIconId;
  color: MedicationColorId;
  photoDataUrl?: string;
}

export interface Profile {
  id: string;
  label: string;
  doctorName: string;
  doctorEmail: string;
  emailSubject: string;
  emailOpening: string;
  emailClosing: string;
  medications: Medication[];
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  schemaVersion: 1;
  activeProfileId: string | null;
  profiles: Profile[];
}

export interface BackupPayload {
  app: 'ricette-pwa';
  schemaVersion: 1;
  exportedAt: string;
  state: AppState;
}

export interface ComposedEmail {
  to: string;
  subject: string;
  body: string;
  mailtoUrl: string;
  isLongMailtoUrl: boolean;
  medicationCount: number;
}

export interface ProfileInput {
  label: string;
  doctorName: string;
  doctorEmail: string;
  emailSubject: string;
  emailOpening: string;
  emailClosing: string;
}

export interface MedicationInput {
  name: string;
  icon: MedicationIconId;
  color: MedicationColorId;
  photoDataUrl?: string;
}

export const MAILTO_SAFE_LENGTH = 1800;
