import { useId } from 'react';

interface FreeNoteInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function FreeNoteInput({ value, onChange }: FreeNoteInputProps) {
  const inputId = useId();
  const hintId = useId();

  return (
    <section className="surface-card">
      <div className="field">
        <div className="section-header">
          <label htmlFor={inputId} className="field-label">
            Nota libera nella mail (opzionale)
          </label>
          {value.trim().length > 0 && (
            <button
              type="button"
              className="btn btn--outlined btn--sm"
              onClick={() => onChange('')}
            >
              Svuota
            </button>
          )}
        </div>
        <span id={hintId} className="field-hint">
          Verrà aggiunta in fondo all’elenco farmaci, prima dei saluti.
        </span>
        <textarea
          id={inputId}
          className="field-textarea"
          rows={2}
          aria-describedby={hintId}
          placeholder="Es. Quando hai tempo, grazie mille."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </section>
  );
}
