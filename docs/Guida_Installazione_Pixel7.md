# Guida all'Installazione e Collaudo su Google Pixel 7

Questa guida spiega come portare la PWA **"Ricette"** sul tuo **Google Pixel 7** (e opzionalmente condividerla con i tuoi familiari), scegliendo la modalità di distribuzione HTTPS che preferisci.

> **Nota sulla privacy**: qualunque opzione scegli sotto, **nessun dato sanitario** (profili, medici, farmaci, foto scatole) viene mai inviato online. Tutti i dati restano salvati **esclusivamente in locale** nella memoria IndexedDB del singolo telefono.

---

## Prerequisito: generare il pacchetto pronto (`dist/`)

Sul tuo PC, dalla cartella `d:\Progetto Ricette`, esegui:

```powershell
npm.cmd run build
```

Verrà generata la cartella `d:\Progetto Ricette\dist` contenente l'intera PWA pronta (HTML, JS, CSS, icone, `manifest.webmanifest` e Service Worker offline).

---

## Scegli come pubblicare la PWA in HTTPS (4 opzioni)

Android/Chrome abilita **"Installa app"**, il funzionamento offline completo e la **fotocamera** solo da un indirizzo `https://...` (oppure da `localhost` via cavo USB).

### Opzione 1 — Netlify Drop *(più veloce, senza GitHub)*
1. Apri [app.netlify.com/drop](https://app.netlify.com/drop) dal browser del PC (puoi accedere con il tuo account Google).
2. Trascina l'intera cartella `d:\Progetto Ricette\dist` nell'area di caricamento.
3. In ~10 secondi ottieni un link `https://...netlify.app` pronto.
4. *(Consigliato)* Nelle impostazioni del sito su Netlify puoi rinominare l'URL in qualcosa di semplice da ricordare (es. `ricette-famiglia.netlify.app`).

### Opzione 2 — Cloudflare Pages *(senza GitHub, gratis e velocissimo)*
1. Accedi a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Scegli un nome progetto e carica la cartella `d:\Progetto Ricette\dist`.
3. Ottieni subito un link `https://<nome>.pages.dev`.

### Opzione 3 — GitHub Pages *(con account GitHub gratuito)*
1. Crea un account gratuito su GitHub e un repository (es. `ricette-pwa`).
2. Verifica prima di fare push con `git status` che nessuna immagine personale (`/*.png`) sia inclusa (`.gitignore` le esclude già automaticamente).
3. Pubblica i file del progetto su `main` e attiva **Settings → Pages → Source: GitHub Actions**.

### Opzione 4 — Solo locale via cavo USB *(zero siti online)*
1. Attiva **Debug USB** sul Pixel 7 e collegalo al PC.
2. Sul PC avvia `npm.cmd run preview -- --port 4173`.
3. In Chrome sul PC apri `chrome://inspect/#devices`, attiva **Port forwarding** (`4173 -> localhost:4173`) e apri `http://localhost:4173` su Chrome del Pixel 7.

---

## Installazione sul Google Pixel 7 (2 tap)

1. Apri il link `https://...` in **Google Chrome** sul tuo Pixel 7.
2. Tocca il menu **⋮** in alto a destra → **"Aggiungi a schermata Home"** → **"Installa app"** (o tocca il banner di installazione se compare in basso).
3. Conferma **"Installa"**: sulla schermata Home apparirà l'icona **"Ricette"**.
4. Aprirla dall'icona Home: l'app si avvia a schermo intero (senza barra degli indirizzi) in tema chiaro o scuro coerente con il tuo Pixel 7.

---

## Checklist di Collaudo sul Pixel 7 Reale

- [ ] **Primo avvio pulito**: l'app mostra la schermata guidata per creare il primo profilo.
- [ ] **Creazione profilo**: inserisci nome profilo, appellativo medico (es. `Doc`), email del medico e personalizza il modello di testo (oggetto `Ricette`, frase di apertura e chiusura).
- [ ] **Inserimento farmaci + Riconoscimento visivo**:
  - [ ] Aggiungi un farmaco scattando la **foto reale della scatola** con la fotocamera del Pixel 7.
  - [ ] Tocca la miniatura nella lista e verifica che si apra lo **zoom nitido** della scatola.
  - [ ] Aggiungi un altro farmaco scegliendo **icona + colore** (senza foto).
- [ ] **Test Offline (Modalità Aereo)**: attiva la Modalità Aereo, chiudi e riapri l'app **"Ricette"** dalla Home; verifica che profilo, farmaci e miniature foto si carichino istantaneamente.
- [ ] **Invio a Gmail**: seleziona alcuni farmaci, scrivi una nota libera opzionale, controlla l'anteprima e tocca **"Apri in Gmail"**; verifica che Gmail si apra con destinatario, oggetto `Ricette` e corpo formattato correttamente (accenti e a capo).
- [ ] **Backup JSON**: apri **Backup**, esporta il file `.json` e verifica che possa essere re-importato (anche su un secondo telefono di un familiare) mantenendo profili, farmaci e foto delle scatole.
