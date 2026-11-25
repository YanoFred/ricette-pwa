---
name: project-status-tracker
description: >-
  Procedura obbligatoria per aggiornare Stato_di_progetto.md e Registro_Operazioni.md
  al termine di ogni operazione significativa, fase, test o tentativo fallito nel progetto Ricette.
---

# Project Status Tracker

Usa questa skill al termine di ogni fase o intervento significativo su `d:\Progetto Ricette`.

## Passi Obbligatori

1. **Rileva data e ora reali di sistema** (mai inventarle):
   ```powershell
   Get-Date -Format "dd/MM/yyyy HH:mm"
   ```
2. **Aggiorna `Registro_Operazioni.md` (SOLO IN AGGIUNTA / APPEND-ONLY)**:
   - Non modificare né cancellare mai righe storiche esistenti.
   - Assegna un ID univoco progressivo (`F<Fase>-<NN>` per attività di fase, `M-<NN>` per manutenzione).
   - Usa esclusivamente uno degli esiti ammessi: `[OK]`, `[FALLITO]`, `[ANNULLATO]`, `[IN ATTESA]`.
   - Indica file coinvolti, esito dei comandi o causa esatta dell'errore se `[FALLITO]`.
   - Registra anche eventuali errori, blocchi o tentativi falliti.
3. **Aggiorna `Stato_di_progetto.md`**:
   - Mantieni la tabella snella delle fasi con le colonne esatte:
     `| Fase | Descrizione Componente | Stato | Data e Ora | Note di Avanzamento |`
   - Metti in `Data e Ora` solo il timestamp reale dell'ultimo aggiornamento (`GG/MM/AAAA HH:mm`).
   - Mantieni in `Note di Avanzamento` una sintesi tecnica concisa (senza elenchi cronologici).
   - Aggiorna la sezione **"Ultime Operazioni Recenti"** con gli ultimi 5 ID dal registro e verifica che il link a `Registro_Operazioni.md` sia integro.

## Verifica
- Controlla che ogni ID nel registro sia univoco e ordinato cronologicamente.
- Controlla che lo stato della fase in `Stato_di_progetto.md` sia coerente con l'ultimo esito nel registro.
