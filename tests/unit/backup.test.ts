import { describe, expect, it } from 'vitest';
import {
  buildBackupFilename,
  parseAndValidateBackup,
  serializeBackup,
} from '../../src/domain/backup';
import type { AppState } from '../../src/domain/types';

describe('backup JSON', () => {
  it('esporta e re-importa profili, farmaci e miniature senza perdita dati', () => {
    const samplePhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    const state: AppState = {
      schemaVersion: 1,
      activeProfileId: 'p-2',
      profiles: [
        {
          id: 'p-1',
          label: 'Profilo Uno',
          doctorName: 'Doc',
          doctorEmail: 'doc1@example.test',
          emailSubject: 'Ricette',
          emailOpening: 'Buongiorno Doc:',
          emailClosing: 'Saluti',
          medications: [
            {
              id: 'm-1',
              name: 'Farmaco A 5 mg',
              order: 0,
              icon: 'pill',
              color: 'teal',
              photoDataUrl: samplePhoto,
            },
          ],
          createdAt: '2026-01-01T08:00:00.000Z',
          updatedAt: '2026-01-01T08:00:00.000Z',
        },
        {
          id: 'p-2',
          label: 'Profilo Due',
          doctorName: 'Dott. Bianchi',
          doctorEmail: 'doc2@example.test',
          emailSubject: 'Richiesta ricette',
          emailOpening: 'Buongiorno Dott. Bianchi:',
          emailClosing: 'Grazie mille',
          medications: [
            {
              id: 'm-2',
              name: 'Farmaco B 10 mg',
              order: 0,
              icon: 'drops',
              color: 'blue',
            },
          ],
          createdAt: '2026-01-02T08:00:00.000Z',
          updatedAt: '2026-01-02T08:00:00.000Z',
        },
      ],
    };

    const json = serializeBackup(state, new Date('2026-11-25T11:30:00.000Z'));
    const parsed = parseAndValidateBackup(json);

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.profileCount).toBe(2);
    expect(parsed.medicationCount).toBe(2);
    expect(parsed.photoCount).toBe(1);
    expect(parsed.state.activeProfileId).toBe('p-2');
    expect(parsed.state.profiles[0].medications[0].photoDataUrl).toBe(samplePhoto);
  });

  it('rifiuta JSON corrotti o provenienti da altre app', () => {
    expect(parseAndValidateBackup('{non valido').ok).toBe(false);
    expect(
      parseAndValidateBackup(
        JSON.stringify({ app: 'altra-app', schemaVersion: 1, state: { profiles: [] } }),
      ).ok,
    ).toBe(false);
    expect(
      parseAndValidateBackup(
        JSON.stringify({ app: 'ricette-pwa', schemaVersion: 99, state: { profiles: [] } }),
      ).ok,
    ).toBe(false);
    expect(
      parseAndValidateBackup(
        JSON.stringify({
          app: 'ricette-pwa',
          schemaVersion: 1,
          state: { profiles: [{ corrotto: true }] },
        }),
      ).ok,
    ).toBe(false);
  });

  it('genera un nome file leggibile con data ISO', () => {
    expect(buildBackupFilename(new Date(2026, 10, 25))).toBe(
      'ricette-backup-2026-11-25.json',
    );
  });
});
