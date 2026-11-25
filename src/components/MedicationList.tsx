import { useMemo, useState } from 'react';
import { sortMedications } from '../domain/emailBuilder';
import type { Medication } from '../domain/types';
import {
  MedicationVisualBadge,
  type MedicationZoomTarget,
} from './MedicationVisualBadge';

interface MedicationListProps {
  medications: readonly Medication[];
  selectedIds: ReadonlySet<string>;
  onToggleSelect: (medicationId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onOpenManage: () => void;
  onZoomPhoto: (target: MedicationZoomTarget) => void;
}

export function MedicationList({
  medications,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onOpenManage,
  onZoomPhoto,
}: MedicationListProps) {
  const [query, setQuery] = useState('');

  const sorted = useMemo(() => sortMedications(medications), [medications]);
  const showSearch = sorted.length >= 6;
  const filtered = useMemo(() => {
    if (!showSearch) return sorted;
    const clean = query.trim().toLowerCase();
    if (!clean) return sorted;
    return sorted.filter((med) => med.name.toLowerCase().includes(clean));
  }, [query, showSearch, sorted]);

  const allSelected =
    sorted.length > 0 && sorted.every((med) => selectedIds.has(med.id));

  return (
    <section className="surface-card" aria-labelledby="meds-heading">
      <div className="section-header" style={{ marginBottom: 12 }}>
        <h2 id="meds-heading" className="section-title">
          Elenco farmaci ({sorted.length})
        </h2>
        <div className="section-actions">
          {sorted.length > 0 && (
            <button
              type="button"
              className="btn btn--outlined btn--sm"
              onClick={allSelected ? onClearSelection : onSelectAll}
            >
              {allSelected ? 'Deseleziona' : 'Tutti'}
            </button>
          )}
          <button
            type="button"
            className="btn btn--tonal btn--sm"
            onClick={onOpenManage}
          >
            Gestisci
          </button>
        </div>
      </div>

      {sorted.length >= 6 && (
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="med-search" className="visually-hidden">
            Cerca farmaco
          </label>
          <input
            id="med-search"
            type="search"
            className="search-input"
            placeholder="Filtra farmaci per nome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p style={{ margin: 0 }}>
            Nessun farmaco ancora presente in questo profilo. Aggiungi i tuoi
            farmaci con foto della scatola o icona colorata.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onOpenManage}
          >
            Aggiungi il primo farmaco
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ margin: 0 }}>
            Nessun farmaco corrisponde a “{query.trim()}”.
          </p>
          <button
            type="button"
            className="btn btn--outlined btn--sm"
            onClick={() => setQuery('')}
          >
            Mostra tutti
          </button>
        </div>
      ) : (
        <ul className="med-list">
          {filtered.map((med) => {
            const isSelected = selectedIds.has(med.id);
            return (
              <li
                key={med.id}
                className={`med-card ${isSelected ? 'med-card--selected' : ''}`}
              >
                <MedicationVisualBadge
                  name={med.name}
                  icon={med.icon}
                  color={med.color}
                  photoDataUrl={med.photoDataUrl}
                  onZoom={
                    med.photoDataUrl
                      ? () =>
                          onZoomPhoto({
                            name: med.name,
                            photoDataUrl: med.photoDataUrl,
                          })
                      : undefined
                  }
                />
                <button
                  type="button"
                  className="med-select-btn"
                  aria-pressed={isSelected}
                  onClick={() => onToggleSelect(med.id)}
                >
                  <span className="med-name">{med.name}</span>
                  <span className="med-check-circle" aria-hidden="true">
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
