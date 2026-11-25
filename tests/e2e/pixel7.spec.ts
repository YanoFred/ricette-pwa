import { expect, test } from '@playwright/test';

const SYNTHETIC_FIXTURE_PATH = 'tests/e2e/fixtures/test-box.png';

test.describe('Ricette PWA — Collaudo E2E su Google Pixel 7 (412x915)', () => {
  test('flusso completo: onboarding, foto scatola + zoom, icona/colore, persistenza IDB, mailto e multi-profilo', async ({
    page,
  }) => {
    await page.goto('/');

    // Verifica assenza overflow orizzontale su viewport Pixel 7 (412px)
    const noHorizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );
    expect(noHorizontalOverflow).toBe(true);

    // Verifica manifest PWA servito correttamente
    const manifestRes = await page.request.get('/manifest.webmanifest');
    expect(manifestRes.ok()).toBe(true);
    const manifest = (await manifestRes.json()) as {
      name: string;
      display: string;
    };
    expect(manifest.name).toBe('Ricette');
    expect(manifest.display).toBe('standalone');

    // 1. Primo avvio vuoto -> creazione primo profilo
    await page.getByRole('button', { name: /Crea il primo profilo/i }).click();
    const profileDialog = page.getByRole('dialog');
    await profileDialog
      .getByLabel(/Nome del profilo/i)
      .fill('Profilo Familiare Test');
    await profileDialog
      .getByLabel(/Email del medico/i)
      .fill('dott.esempio@example.test');
    await profileDialog
      .getByLabel(/Frase di apertura/i)
      .fill(
        'Buongiorno Doc, per favore se mi puoi preparare la ricetta per Familiare Test per i seguenti farmaci:',
      );
    await profileDialog.getByRole('button', { name: /Crea profilo/i }).click();

    // 2. Aggiunta Farmaco 1 con foto sintetica della scatola
    await page
      .getByRole('button', { name: /Aggiungi il primo farmaco/i })
      .click();
    const medDialog = page.getByRole('dialog');

    // Verifica esplicita: nessun campo numero confezioni
    await expect(medDialog.getByLabel(/confezion/i)).toHaveCount(0);

    await medDialog
      .getByLabel(/Nome e dosaggio del farmaco/i)
      .fill('Farmaco Con Foto 5 mg');
    await medDialog
      .getByTestId('medication-gallery-input')
      .setInputFiles(SYNTHETIC_FIXTURE_PATH);
    await expect(
      medDialog.getByRole('button', { name: /Rimuovi foto/i }),
    ).toBeVisible();
    await medDialog.getByRole('button', { name: /Aggiungi farmaco/i }).click();

    // 3. Aggiunta Farmaco 2 con icona + colore
    await medDialog.getByRole('button', { name: /\+ Aggiungi farmaco/i }).click();
    await medDialog
      .getByLabel(/Nome e dosaggio del farmaco/i)
      .fill('Collirio Test 20 mg/ml');
    await medDialog.getByRole('button', { name: /Collirio \/ Gocce/i }).click();
    await medDialog.getByRole('button', { name: /Azzurro/i }).click();
    await medDialog.getByRole('button', { name: /Aggiungi farmaco/i }).click();

    // Verifica zero overflow orizzontale dentro il dialog gestione farmaci aperto su 412px
    const dialogFitsWidth = await medDialog.evaluate(
      (el) => el.scrollWidth <= el.clientWidth + 1,
    );
    expect(dialogFitsWidth).toBe(true);

    // Chiudi dialog gestione farmaci
    await medDialog
      .getByRole('button', { name: /Chiudi Gestisci farmaci/i })
      .click();

    // 4. Ricarica pagina per verificare persistenza IndexedDB (profilo + farmaci + foto)
    await page.reload();
    await expect(
      page.getByRole('button', { name: 'Farmaco Con Foto 5 mg', exact: true }),
    ).toBeVisible();

    // 5. Verifica apertura Zoom foto scatola senza selezionare il farmaco
    await page
      .getByRole('button', { name: /Ingrandisci foto di Farmaco Con Foto 5 mg/i })
      .click();
    const zoomDialog = page.getByRole('dialog');
    await expect(
      zoomDialog.getByAltText(/Foto ingrandita della confezione di Farmaco Con Foto 5 mg/i),
    ).toBeVisible();
    await zoomDialog.getByRole('button', { name: /Chiudi anteprima/i }).click();

    // 6. Selezione di entrambi i farmaci + nota libera + controllo mailto
    await page
      .getByRole('button', { name: 'Farmaco Con Foto 5 mg', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Collirio Test 20 mg/ml', exact: true })
      .click();
    await page
      .getByLabel(/Nota libera nella mail/i)
      .fill('Quando hai tempo, grazie mille.');

    await page.getByRole('button', { name: /Prepara Mail/i }).click();
    const previewDialog = page.getByRole('dialog');
    const previewText = await previewDialog
      .getByTestId('email-preview-body')
      .textContent();
    expect(previewText).toBe(
      [
        'Buongiorno Doc, per favore se mi puoi preparare la ricetta per Familiare Test per i seguenti farmaci:',
        '- Farmaco Con Foto 5 mg\n- Collirio Test 20 mg/ml',
        'Quando hai tempo, grazie mille.',
        'Grazie mille\nSaluti',
      ].join('\n\n'),
    );

    const href = await previewDialog
      .getByTestId('open-gmail-link')
      .getAttribute('href');
    expect(href).toContain('mailto:dott.esempio@example.test?subject=Ricette&body=');
    expect(href).toContain('%0D%0A');

    await previewDialog
      .getByRole('button', { name: /Chiudi Anteprima email al medico/i })
      .click();

    // 7. Verifica multi-profilo con secondo modello testo distinto
    await page.getByRole('button', { name: /Gestisci profili/i }).click();
    const multiDialog = page.getByRole('dialog');
    await multiDialog
      .getByRole('button', { name: /\+ Aggiungi nuovo profilo/i })
      .click();
    await multiDialog.getByLabel(/Nome del profilo/i).fill('Profilo Personale');
    await multiDialog
      .getByLabel(/Email del medico/i)
      .fill('dott.personale@example.test');
    await multiDialog.getByRole('button', { name: /Crea profilo/i }).click();

    // Lo switcher rapido dei profili ora è visibile in alto
    await expect(
      page.getByRole('button', { name: 'Profilo Familiare Test' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Profilo Personale' }),
    ).toBeVisible();

    // Verifica zero overflow orizzontale anche con multi-profilo attivo
    const stillNoOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );
    expect(stillNoOverflow).toBe(true);
  });

  test('tema scuro automatico (Pixel 7 Dark Mode) e import backup JSON con foto', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    await page.goto('/');

    // Verifica applicazione automatica tema scuro Material You
    const darkBg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(darkBg).toBe('rgb(14, 21, 19)');

    // Apre dialog backup e importa un JSON fittizio con 1 profilo + 1 farmaco
    await page.getByRole('button', { name: /Importa da backup JSON/i }).click();
    const backupDialog = page.getByRole('dialog');
    await backupDialog
      .getByTestId('backup-file-input')
      .setInputFiles('tests/e2e/fixtures/test-backup.json');

    await expect(
      backupDialog.getByText(/1 profilo, 1 farmaco, 0 foto scatole/i),
    ).toBeVisible();
    await backupDialog
      .getByRole('button', { name: /Conferma importazione/i })
      .click();
    await backupDialog
      .getByRole('button', { name: /Chiudi Backup locale/i })
      .click();

    await expect(
      page.getByRole('button', { name: 'Farmaco Backup 10 mg', exact: true }),
    ).toBeVisible();

    await context.close();
  });
});
