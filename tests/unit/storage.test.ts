import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAppState,
  loadAppState,
  sanitizeAppState,
  saveAppState,
} from '../../src/domain/storage';
import type { AppState } from '../../src/domain/types';

describe('storage (IndexedDB + sanitizzazione)', () => {
  beforeEach(async () => {
    await clearAppState();
  });

  it('restituisce uno stato vuoto al primo avvio', async () => {
    const state = await loadAppState();
    expect(state).toEqual({
      schemaVersion: 1,
      activeProfileId: null,
      profiles: [],
    });
  });

  it('salva e ricarica profili, farmaci e miniature foto da IndexedDB', async () => {
    const samplePhoto = 'data:image/webp;base64,UklGRh4AAABXRUJQ';
    const state: AppState = {
      schemaVersion: 1,
      activeProfileId: null, // deve auto-selezionare l unico profilo
      profiles: [
        {
          id: 'p-1',
          label: 'Profilo Familiare',
          doctorName: 'Doc',
          doctorEmail: 'medico@example.test',
          emailSubject: 'Ricette',
          emailOpening: 'Buongiorno Doc, ecco i farmaci:',
          emailClosing: 'Grazie mille\nSaluti',
          medications: [
            {
              id: 'm-1',
              name: 'Farmaco Test 10 mg',
              order: 0,
              icon: 'pill',
              color: 'orange',
              photoDataUrl: samplePhoto,
            },
          ],
          createdAt: '2026-01-01T10:00:00.000Z',
          updatedAt: '2026-01-01T10:00:00.000Z',
        },
      ],
    };

    await saveAppState(state);
    const loaded = await loadAppState();

    expect(loaded.activeProfileId).toBe('p-1');
    expect(loaded.profiles).toHaveLength(1);
    expect(loaded.profiles[0].medications[0].photoDataUrl).toBe(samplePhoto);
  });

  it('ripulisce icone non valide e scarta foto non sicure durante la sanitizzazione', () => {
    const sanitized = sanitizeAppState({
      schemaVersion: 1,
      activeProfileId: 'id-inesistente',
      profiles: [
        {
          id: 'p-1',
          label: '  Utente Test  ',
          doctorName: 'Doc',
          doctorEmail: 'doc@example.test',
          emailSubject: 'Ricette',
          emailOpening: 'Ciao Doc:',
          emailClosing: 'Saluti',
          medications: [
            {
              id: 'm-1',
              name: 'Farmaco Uno',
              order: 5,
              icon: 'icona-finta',
              color: 'colore-finto',
              photoDataUrl: 'data:image/svg+xml;base64,PHN2Zz4=',
            },
          ],
        },
      ],
    });

    expect(sanitized.activeProfileId).toBe('p-1');
    expect(sanitized.profiles[0].label).toBe('Utente Test');
    expect(sanitized.profiles[0].medications[0].icon).toBe('pill');
    expect(sanitized.profiles[0].medications[0].color).toBe('teal');
    expect(sanitized.profiles[0].medications[0].order).toBe(0);
    expect(sanitized.profiles[0].medications[0].photoDataUrl).toBeUndefined();
  });

  it('deduplica eventuali ID farmaci duplicati durante la sanitizzazione', () => {
    const sanitized = sanitizeAppState({
      schemaVersion: 1,
      activeProfileId: 'p-1',
      profiles: [
        {
          id: 'p-1',
          label: 'Profilo Dup',
          doctorName: 'Doc',
          doctorEmail: 'doc@example.test',
          emailSubject: 'Ricette',
          emailOpening: 'Buongiorno:',
          emailClosing: 'Saluti',
          medications: [
            { id: 'same-id', name: 'Farmaco 1', order: 0, icon: 'pill', color: 'teal' },
            { id: 'same-id', name: 'Farmaco 2', order: 1, icon: 'box', color: 'blue' },
          ],
        },
      ],
    });

    const ids = sanitized.profiles[0].medications.map((m) => m.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});
