import {
  MAILTO_SAFE_LENGTH,
  type ComposedEmail,
  type Medication,
  type Profile,
} from './types';

export function sortMedications(medications: readonly Medication[]): Medication[] {
  return [...medications].sort((a, b) => a.order - b.order);
}

function encodeMailtoAddress(email: string): string {
  const clean = email.trim();
  const atIndex = clean.lastIndexOf('@');
  if (atIndex === -1) {
    return encodeURIComponent(clean);
  }
  const localPart = clean.slice(0, atIndex);
  const domainPart = clean.slice(atIndex + 1);
  return `${encodeURIComponent(localPart)}@${encodeURIComponent(domainPart)}`;
}

export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const cleanTo = to.trim();
  const encodedTo = cleanTo.length > 0 ? encodeMailtoAddress(cleanTo) : '';
  const params: string[] = [];
  const cleanSubject = subject.trim();
  const normalizedBody = body.replace(/\r\n|\r|\n/g, '\r\n');

  if (cleanSubject.length > 0) {
    params.push(`subject=${encodeURIComponent(cleanSubject)}`);
  }
  if (normalizedBody.length > 0) {
    params.push(`body=${encodeURIComponent(normalizedBody)}`);
  }

  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${encodedTo}${query}`;
}

export function buildPrescriptionEmail(
  profile: Profile,
  selectedMedicationIds: ReadonlySet<string> | readonly string[],
  freeNote = '',
): ComposedEmail {
  const selectedSet =
    selectedMedicationIds instanceof Set
      ? selectedMedicationIds
      : new Set(selectedMedicationIds);

  const selectedMedications = sortMedications(profile.medications).filter(
    (med) => selectedSet.has(med.id) && med.name.trim().length > 0,
  );

  const sections: string[] = [];

  const opening = profile.emailOpening.trim();
  if (opening.length > 0) {
    sections.push(opening);
  }

  if (selectedMedications.length > 0) {
    const listText = selectedMedications
      .map((med) => `- ${med.name.trim()}`)
      .join('\n');
    sections.push(listText);
  }

  const cleanNote = freeNote.trim();
  if (cleanNote.length > 0) {
    sections.push(cleanNote);
  }

  const closing = profile.emailClosing.trim();
  if (closing.length > 0) {
    sections.push(closing);
  }

  const to = profile.doctorEmail.trim();
  const subject = profile.emailSubject.trim();
  const body = sections.join('\n\n');
  const mailtoUrl = buildMailtoUrl(to, subject, body);

  return {
    to,
    subject,
    body,
    mailtoUrl,
    isLongMailtoUrl: mailtoUrl.length > MAILTO_SAFE_LENGTH,
    medicationCount: selectedMedications.length,
  };
}

export function isValidEmailAddress(email: string): boolean {
  const trimmed = email.trim();
  if (
    trimmed.length === 0 ||
    /[\s?&#%]/.test(trimmed) ||
    [...trimmed].some((ch) => {
      const code = ch.charCodeAt(0);
      return code < 32 || code === 127;
    })
  ) {
    return false;
  }
  return /^[^\s@?&#%]+@[^\s@?&#%]+\.[^\s@?&#%]+$/.test(trimmed);
}
