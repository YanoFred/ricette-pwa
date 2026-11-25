# Regole di Progetto — App PWA "Ricette"

Questo file definisce le regole vincolanti per ogni agente che opera in `d:\Progetto Ricette`.

## 1. Lingua e Stile
- **UI, testi rivolti all'utente, documentazione e nomi dei test**: in **italiano** chiaro e naturale.
- **Codice sorgente, tipi, variabili, funzioni, commenti tecnici**: in **inglese** pulito con TypeScript `strict: true`.
- Evitare `any`, cast non sicuri e soppressioni ESLint non giustificate.

## 2. Privacy-by-Design (Regola Tassativa)
- **MAI** inserire nomi reali di pazienti, indirizzi email reali, terapie reali o foto reali di confezioni nel codice sorgente, nei fixture di test, nella documentazione versionata o nei commit Git.
- Nei test usare esclusivamente dati fittizi e anonimi (es. `Mario Rossi`, `dott.esempio@example.test`, `Farmaco Test 10 mg`).
- L'app deve partire completamente vuota al primo avvio (100% locale, nessun backend, nessun tracker, nessun invio dati verso server esterni).
- Tutte le immagini personali di riferimento nella root (`/*.png`, `/*.jpg`, ecc.) devono rimanere escluse da Git tramite `.gitignore`.

## 3. Regole di Dominio Medico
- **NESSUN campo "numero confezioni" o quantità**: la quantità prescrivibile è prerogativa esclusiva del medico.
- Ogni profilo gestisce in modo autonomo: nome profilo, medico di riferimento (appellativo + email), **modello di testo della mail** (oggetto, testo di apertura, testo di chiusura) ed elenco farmaci.
- Ogni farmaco supporta: nome/dosaggio, icona + colore identificativo (sempre presenti come fallback) e foto locale opzionale della scatola (compressa client-side).
- La composizione email segue rigorosamente la skill `.agents/skills/email-composer-spec/SKILL.md`.

## 4. Target Dispositivo & UI
- Dispositivo primario: **Google Pixel 7** (Chrome Android, viewport di riferimento `412x915`, touch target minimi `48x48px`, stile **Material You** con tema chiaro/scuro automatico di sistema).
- Prima di creare o modificare componenti HTML/CSS/DOM o pattern web client-side, consultare sempre la skill `modern-web-guidance` e `.agents/skills/pwa-pixel7-ui/SKILL.md`.

## 5. Tracciamento Obbligatorio dello Stato
- Al termine di ogni intervento significativo o fase, aggiornare sempre:
  1. `Registro_Operazioni.md` (solo in aggiunta / append-only, con data e ora reale di sistema `GG/MM/AAAA HH:mm`, ID univoco, esito `[OK]`/`[FALLITO]`/`[ANNULLATO]`/`[IN ATTESA]`, dettagli/file).
  2. `Stato_di_progetto.md` (tabella sintetica delle fasi + estratto ultime operazioni).
- Seguire la procedura in `.agents/skills/project-status-tracker/SKILL.md`.

## 6. Qualità e Verifica
- Nessuna fase può essere marcata `Completata` senza l'esecuzione con esito positivo della pipeline di verifica applicabile (`typecheck`, `lint`, `test`, `test:e2e`, `build`).
