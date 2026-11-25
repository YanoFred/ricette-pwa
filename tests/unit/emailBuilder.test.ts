import { describe, expect, it } from 'vitest';
import {
  buildMailtoUrl,
  buildPrescriptionEmail,
  isValidEmailAddress,
} from '../../src/domain/emailBuilder';
import type { Profile } from '../../src/domain/types';

function makeTestProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'prof-1',
    label: 'Profilo Test',
    doctorName: 'Doc',
    doctorEmail: 'dott.esempio@example.test',
    emailSubject: 'Ricette',
    emailOpening:
      'Buongiorno Doc, per favore se mi puoi preparare la ricetta per il paziente esempio per i seguenti farmaci:',
    emailClosing: 'Grazie mille\nSaluti',
    medications: [
      { id: 'm2', name: 'Farmaco Beta 40 mg', order: 1, icon: 'capsule', color: 'pink' },
      { id: 'm1', name: 'Farmaco Alfa 2,5 mg', order: 0, icon: 'pill', color: 'orange' },
      { id: 'm3', name: 'Collirio Gamma 20 mg/ml + 5 mg/ml', order: 2, icon: 'drops', color: 'blue' },
    ],
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
    ...overrides,
  };
}

describe('emailBuilder', () => {
  it('compone il testo email nell ordine configurato dei farmaci senza numero confezioni', () => {
    const profile = makeTestProfile();
    const result = buildPrescriptionEmail(profile, ['m3', 'm1']);

    expect(result.to).toBe('dott.esempio@example.test');
    expect(result.subject).toBe('Ricette');
    expect(result.medicationCount).toBe(2);
    expect(result.body).toBe(
      [
        'Buongiorno Doc, per favore se mi puoi preparare la ricetta per il paziente esempio per i seguenti farmaci:',
        '- Farmaco Alfa 2,5 mg\n- Collirio Gamma 20 mg/ml + 5 mg/ml',
        'Grazie mille\nSaluti',
      ].join('\n\n'),
    );
    expect(result.isLongMailtoUrl).toBe(false);
  });

  it('inserisce la nota libera tra la lista farmaci e i saluti finali solo se compilata', () => {
    const profile = makeTestProfile();
    const withNote = buildPrescriptionEmail(
      profile,
      new Set(['m1']),
      '  Possibilmente entro venerdì, grazie.  ',
    );

    expect(withNote.body).toBe(
      [
        'Buongiorno Doc, per favore se mi puoi preparare la ricetta per il paziente esempio per i seguenti farmaci:',
        '- Farmaco Alfa 2,5 mg',
        'Possibilmente entro venerdì, grazie.',
        'Grazie mille\nSaluti',
      ].join('\n\n'),
    );

    const blankNote = buildPrescriptionEmail(profile, new Set(['m1']), '   ');
    expect(blankNote.body).not.toContain('\n\n\n');
  });

  it('codifica correttamente mailto con CRLF e caratteri speciali/accentati', () => {
    const url = buildMailtoUrl(
      'medico@example.test',
      'Ricette urgenti — è venerdì',
      'Prima riga\n- Farmaco 20 mg/ml + 5 mg/ml\nGrazie!',
    );

    expect(url.startsWith('mailto:medico@example.test?subject=')).toBe(true);
    expect(url).toContain('%0D%0A');
    expect(url).toContain(encodeURIComponent('20 mg/ml + 5 mg/ml'));
    expect(url).toContain(encodeURIComponent('venerdì'));
  });

  it('segnala isLongMailtoUrl quando la URL supera la soglia sicura', () => {
    const longMeds = Array.from({ length: 45 }, (_, idx) => ({
      id: `med-${idx}`,
      name: `Farmaco Dimostrativo Lungo Numero ${idx + 1} 500 mg compresse`,
      order: idx,
      icon: 'pill' as const,
      color: 'teal' as const,
    }));
    const profile = makeTestProfile({ medications: longMeds });
    const result = buildPrescriptionEmail(
      profile,
      longMeds.map((m) => m.id),
    );

    expect(result.isLongMailtoUrl).toBe(true);
  });

  it('omette apertura o chiusura vuote senza lasciare righe vuote superflue', () => {
    const profile = makeTestProfile({ emailOpening: '   ', emailClosing: '' });
    const result = buildPrescriptionEmail(profile, ['m1']);
    expect(result.body).toBe('- Farmaco Alfa 2,5 mg');
  });

  it('valida correttamente gli indirizzi email e blocca caratteri di injection mailto', () => {
    expect(isValidEmailAddress('dott.rossi@example.test')).toBe(true);
    expect(isValidEmailAddress('  dott.rossi@studio.it  ')).toBe(true);
    expect(isValidEmailAddress('')).toBe(false);
    expect(isValidEmailAddress('non-valida')).toBe(false);
    expect(isValidEmailAddress('spazi @example.test')).toBe(false);
    expect(isValidEmailAddress('doc@example.test?bcc=altro@example.test')).toBe(
      false,
    );
    expect(isValidEmailAddress('doc@example.test#frag')).toBe(false);
    expect(isValidEmailAddress('doc@example.test&body=x')).toBe(false);
  });

  it('normalizza anche caratteri CR isolati in CRLF nella URL mailto', () => {
    const url = buildMailtoUrl('medico@example.test', 'Ricette', 'Riga 1\rRiga 2');
    expect(url).toContain('Riga%201%0D%0ARiga%202');
  });
});
