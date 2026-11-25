import { describe, expect, it } from 'vitest';
import {
  calculateResizedDimensions,
  isSafePhotoDataUrl,
  MAX_SOURCE_IMAGE_BYTES,
  validateImageFile,
} from '../../src/domain/imageProcessor';

describe('imageProcessor', () => {
  it('accetta file immagine validi entro i limiti', () => {
    expect(
      validateImageFile({
        name: 'scatola.jpg',
        type: 'image/jpeg',
        size: 120_000,
      }),
    ).toEqual({ ok: true });

    expect(
      validateImageFile({
        name: 'foto.webp',
        type: 'image/webp',
        size: 50_000,
      }),
    ).toEqual({ ok: true });
  });

  it('rifiuta file vuoti, troppo grandi o non immagine', () => {
    const empty = validateImageFile({ name: 'a.jpg', type: 'image/jpeg', size: 0 });
    expect(empty.ok).toBe(false);

    const tooBig = validateImageFile({
      name: 'huge.png',
      type: 'image/png',
      size: MAX_SOURCE_IMAGE_BYTES + 1,
    });
    expect(tooBig.ok).toBe(false);

    const notImage = validateImageFile({
      name: 'documento.pdf',
      type: 'application/pdf',
      size: 2048,
    });
    expect(notImage.ok).toBe(false);
  });

  it('calcola correttamente il ridimensionamento proporzionale', () => {
    expect(calculateResizedDimensions(1600, 800, 320)).toEqual({
      width: 320,
      height: 160,
    });
    expect(calculateResizedDimensions(600, 1200, 320)).toEqual({
      width: 160,
      height: 320,
    });
    expect(calculateResizedDimensions(200, 150, 320)).toEqual({
      width: 200,
      height: 150,
    });
  });

  it('valida solo data URL immagine sicuri e rifiuta SVG o script', () => {
    expect(isSafePhotoDataUrl('data:image/webp;base64,UklGRh4AAABXRUJQ')).toBe(
      true,
    );
    expect(isSafePhotoDataUrl('data:image/jpeg;base64,/9j/4AAQSkZJRg==')).toBe(
      true,
    );
    expect(isSafePhotoDataUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBe(false);
    expect(isSafePhotoDataUrl('javascript:alert(1)')).toBe(false);
    expect(isSafePhotoDataUrl('')).toBe(false);
  });
});
