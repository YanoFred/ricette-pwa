import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../src/App';
import { clearAppState } from '../../src/domain/storage';

describe('AppFlow — flusso completo Ricette', () => {
  beforeEach(async () => {
    await clearAppState();
  });

  it('guida dal primo avvio vuoto fino alla preparazione della mail senza campo confezioni', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Onboarding iniziale (app vuota e anonima)
    const createBtn = await screen.findByRole('button', {
      name: /Crea il primo profilo/i,
    });
    await user.click(createBtn);

    // 2. Creazione profilo con modello testo personalizzato
    const profileDialog = screen.getByRole('dialog');
    await user.type(
      within(profileDialog).getByLabelText(/Nome del profilo/i),
      'Profilo Test',
    );
    const emailInput = within(profileDialog).getByLabelText(/Email del medico/i);
    await user.type(emailInput, 'dott.prova@example.test');

    const openingTextarea = within(profileDialog).getByLabelText(
      /Frase di apertura/i,
    );
    await user.clear(openingTextarea);
    await user.click(openingTextarea);
    await user.paste(
      'Buongiorno Doc, per favore se mi puoi preparare la ricetta per Paziente Test per i seguenti farmaci:',
    );

    await user.click(
      within(profileDialog).getByRole('button', { name: /Crea profilo/i }),
    );

    // 3. Aggiunta di due farmaci con icona/colore (verifica assenza campo confezioni)
    await user.click(
      await screen.findByRole('button', { name: /Aggiungi il primo farmaco/i }),
    );

    let medDialog = screen.getByRole('dialog');
    expect(within(medDialog).queryByLabelText(/confezion/i)).not.toBeInTheDocument();

    await user.type(
      within(medDialog).getByLabelText(/Nome e dosaggio del farmaco/i),
      'Farmaco Alfa 2,5 mg',
    );
    await user.click(within(medDialog).getByRole('button', { name: /Arancione/i }));
    await user.click(
      within(medDialog).getByRole('button', { name: /Aggiungi farmaco/i }),
    );

    // Secondo farmaco dalla vista elenco del dialog
    medDialog = screen.getByRole('dialog');
    await user.click(
      within(medDialog).getByRole('button', { name: /\+ Aggiungi farmaco/i }),
    );
    await user.type(
      within(medDialog).getByLabelText(/Nome e dosaggio del farmaco/i),
      'Collirio Beta 20 mg/ml',
    );
    await user.click(
      within(medDialog).getByRole('button', { name: /Collirio \/ Gocce/i }),
    );
    await user.click(within(medDialog).getByRole('button', { name: /Azzurro/i }));
    await user.click(
      within(medDialog).getByRole('button', { name: /Aggiungi farmaco/i }),
    );

    // Chiudi dialog gestione farmaci
    await user.click(
      within(medDialog).getByRole('button', { name: /Chiudi Gestisci farmaci/i }),
    );

    // 4. Selezione dei due farmaci + nota libera
    await user.click(
      screen.getByRole('button', { name: /Farmaco Alfa 2,5 mg/i }),
    );
    await user.click(
      screen.getByRole('button', { name: /Collirio Beta 20 mg\/ml/i }),
    );

    await user.type(
      screen.getByLabelText(/Nota libera nella mail/i),
      'Quando hai tempo, grazie.',
    );

    // 5. Apertura anteprima mail e verifica testo + link mailto
    await user.click(screen.getByRole('button', { name: /Prepara Mail/i }));

    const previewBody = screen.getByTestId('email-preview-body');
    expect(previewBody.textContent).toBe(
      [
        'Buongiorno Doc, per favore se mi puoi preparare la ricetta per Paziente Test per i seguenti farmaci:',
        '- Farmaco Alfa 2,5 mg\n- Collirio Beta 20 mg/ml',
        'Quando hai tempo, grazie.',
        'Grazie mille\nSaluti',
      ].join('\n\n'),
    );

    const gmailLink = screen.getByTestId('open-gmail-link');
    const href = gmailLink.getAttribute('href') ?? '';
    expect(href.startsWith('mailto:dott.prova@example.test?subject=Ricette&body=')).toBe(
      true,
    );
    expect(href).toContain('%0D%0A');
  }, 15000);
});
