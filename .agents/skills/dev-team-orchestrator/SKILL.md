---
name: dev-team-orchestrator
description: >-
  Coordina il team dei 5 agenti specializzati del progetto Ricette (architect, core-dev,
  frontend-pwa, qa-tester, reviewer-fixer) tramite subagenti dedicati e passaggi di consegne ordinati.
---

# Dev Team Orchestrator

Usa questa skill quando devi orchestrare lo sviluppo di una fase o di una nuova funzionalità usando gli agenti specializzati definiti in `.agents/agents/`.

## Roster degli Agenti
- **`architect`** (`.agents/agents/architect.md`): `EnableWriteTools: false` (o solo docs) — contratti, schema dati, decisioni architetturali.
- **`core-dev`** (`.agents/agents/core-dev.md`): `EnableWriteTools: true` — `src/domain/`, `src/hooks/`.
- **`frontend-pwa`** (`.agents/agents/frontend-pwa.md`): `EnableWriteTools: true` — `src/components/`, `src/styles/`, PWA manifest/SW.
- **`qa-tester`** (`.agents/agents/qa-tester.md`): `EnableWriteTools: true` — `tests/unit/`, `tests/components/`, `tests/e2e/`.
- **`reviewer-fixer`** (`.agents/agents/reviewer-fixer.md`): `EnableWriteTools: true` — code review rigorosa, security/privacy check e bug fixing.

## Flusso Standard di Esecuzione

1. **Definizione**: leggi la specifica dell'agente da `.agents/agents/<nome>.md` e registralo tramite `define_subagent` passando i vincoli del file più le regole chiave di `GEMINI.md`.
2. **Delega focalizzata**: invoca l'agente con `invoke_subagent` specificando:
   - Fase corrente (es. `F2`, `F3`, `F5`)
   - File di competenza esclusiva (per evitare conflitti se lavori in parallelo tra `core-dev` e `frontend-pwa`)
   - Criterio oggettivo di completamento
3. **Passaggio di consegne**:
   - `architect` → fissa i tipi in `src/domain/types.ts`
   - `core-dev` e `frontend-pwa` → implementano ciascuno il proprio layer
   - `qa-tester` → scrive ed esegue la suite di verifica
   - `reviewer-fixer` → esegue review critica su tutti i file modificati e risolve eventuali rilievi
4. **Chiusura fase**: esegui la skill `project-status-tracker` per aggiornare `Registro_Operazioni.md` e `Stato_di_progetto.md`.
