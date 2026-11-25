import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { sortMedications } from '../domain/emailBuilder';
import { compressMedicationImage } from '../domain/imageProcessor';
import {
  MEDICATION_COLORS,
  MEDICATION_ICONS,
  type Medication,
  type MedicationInput,
} from '../domain/types';
import {
  MedicationIconSvg,
  MedicationVisualBadge,
} from './MedicationVisualBadge';
import { ModalDialog } from './ModalDialog';

interface MedicationManagerDialogProps {
  open: boolean;
  medications: readonly Medication[];
  onClose: () => void;
  onAddMedication: (input: MedicationInput) => void;
  onUpdateMedication: (medicationId: string, input: MedicationInput) => void;
  onDeleteMedication: (medicationId: string) => void;
  onMoveMedication: (medicationId: string, direction: 'up' | 'down') => void;
}

function defaultMedForm(): MedicationInput {
  return {
    name: '',
    icon: 'pill',
    color: 'teal',
    photoDataUrl: undefined,
  };
}

export function MedicationManagerDialog({
  open,
  medications,
  onClose,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onMoveMedication,
}: MedicationManagerDialogProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MedicationInput>(defaultMedForm);
  const [submitted, setSubmitted] = useState(false);
  const [touchedName, setTouchedName] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const wasOpenRef = useRef(false);
  const photoRequestIdRef = useRef(0);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const nameHintId = useId();
  const nameErrorId = useId();

  const sorted = sortMedications(medications);

  // Inizializza solo sulla transizione di apertura (e invalida eventuali compressioni in volo alla chiusura)
  useEffect(() => {
    const becameOpen = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!open) {
      photoRequestIdRef.current += 1;
      setPhotoBusy(false);
      return;
    }
    if (!becameOpen) return;

    setConfirmDeleteId(null);
    setPhotoError(null);
    setSubmitted(false);
    setTouchedName(false);
    if (medications.length === 0) {
      setView('form');
      setEditingId(null);
      setForm(defaultMedForm());
    } else {
      setView('list');
      setEditingId(null);
    }
  }, [open, medications.length]);

  const startCreate = () => {
    photoRequestIdRef.current += 1;
    setPhotoBusy(false);
    setEditingId(null);
    setForm(defaultMedForm());
    setSubmitted(false);
    setTouchedName(false);
    setPhotoError(null);
    setView('form');
  };

  const startEdit = (med: Medication) => {
    photoRequestIdRef.current += 1;
    setPhotoBusy(false);
    setEditingId(med.id);
    setForm({
      name: med.name,
      icon: med.icon,
      color: med.color,
      photoDataUrl: med.photoDataUrl,
    });
    setSubmitted(false);
    setTouchedName(false);
    setPhotoError(null);
    setView('form');
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const requestId = ++photoRequestIdRef.current;
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const compressed = await compressMedicationImage(file);
      if (photoRequestIdRef.current !== requestId) return;
      setForm((prev) => ({ ...prev, photoDataUrl: compressed }));
    } catch (err) {
      if (photoRequestIdRef.current !== requestId) return;
      const msg =
        err instanceof Error
          ? err.message
          : 'Errore durante l’elaborazione della foto.';
      setPhotoError(msg);
    } finally {
      if (photoRequestIdRef.current === requestId) {
        setPhotoBusy(false);
      }
    }
  };

  const nameInvalid = form.name.trim().length === 0;
  const showNameError = (submitted || touchedName) && nameInvalid;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (nameInvalid) {
      nameInputRef.current?.focus();
      return;
    }

    if (editingId) {
      onUpdateMedication(editingId, form);
    } else {
      onAddMedication(form);
    }
    setView('list');
    setEditingId(null);
    setForm(defaultMedForm());
  };

  const title =
    view === 'list'
      ? 'Gestisci farmaci'
      : editingId
        ? 'Modifica farmaco'
        : 'Nuovo farmaco';

  return (
    <ModalDialog open={open} title={title} onClose={onClose}>
      {view === 'list' ? (
        <>
          {sorted.length === 0 ? (
            <div className="empty-state">
              <p style={{ margin: 0 }}>Nessun farmaco in questo profilo.</p>
            </div>
          ) : (
            <ul className="manage-list">
              {sorted.map((med, index) => (
                <li key={med.id} className="manage-item">
                  <div className="manage-item-info">
                    <MedicationVisualBadge
                      name={med.name}
                      icon={med.icon}
                      color={med.color}
                      photoDataUrl={med.photoDataUrl}
                      size="sm"
                    />
                    <div className="manage-item-text">
                      <div className="manage-item-title">{med.name}</div>
                      <div className="manage-item-sub">
                        {med.photoDataUrl ? 'Foto scatola' : 'Icona colorata'}
                      </div>
                    </div>
                  </div>
                  <div className="manage-item-actions">
                    <button
                      type="button"
                      className="mini-icon-btn"
                      aria-label={`Sposta su ${med.name}`}
                      disabled={index === 0}
                      onClick={() => onMoveMedication(med.id, 'up')}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="mini-icon-btn"
                      aria-label={`Sposta giù ${med.name}`}
                      disabled={index === sorted.length - 1}
                      onClick={() => onMoveMedication(med.id, 'down')}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn--outlined btn--sm"
                      onClick={() => startEdit(med)}
                    >
                      Modifica
                    </button>
                    {confirmDeleteId === med.id ? (
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => {
                          onDeleteMedication(med.id);
                          setConfirmDeleteId(null);
                        }}
                      >
                        Conferma
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="mini-icon-btn mini-icon-btn--danger"
                        aria-label={`Elimina ${med.name}`}
                        onClick={() => setConfirmDeleteId(med.id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="btn btn--primary btn--full"
            onClick={startCreate}
          >
            + Aggiungi farmaco
          </button>
        </>
      ) : (
        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor={nameId} className="field-label">
              Nome e dosaggio del farmaco *
            </label>
            <span id={nameHintId} className="field-hint">
              Scrivi nome e dosaggio come vuoi che appaia nella mail (es.
              “Farmaco esempio 10 mg”). Non serve indicare il numero di
              confezioni.
            </span>
            <input
              ref={nameInputRef}
              id={nameId}
              type="text"
              required
              className={`field-input ${showNameError ? 'user-invalid-fallback' : ''}`}
              aria-invalid={showNameError ? 'true' : 'false'}
              aria-describedby={
                showNameError ? `${nameHintId} ${nameErrorId}` : nameHintId
              }
              placeholder="Es. Farmaco esempio 10 mg"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() => setTouchedName(true)}
            />
            <div
              id={nameErrorId}
              role={showNameError ? 'alert' : undefined}
              className={`error-msg ${showNameError ? 'error-msg--visible' : ''}`}
            >
              Errore: inserisci il nome del farmaco.
            </div>
          </div>

          <div className="field">
            <span className="field-label">Foto della scatola (consigliata)</span>
            <span className="field-hint">
              Scatta una foto con il Pixel 7 o sceglila dalla galleria: viene
              compressa e salvata solo sul telefono.
            </span>
            <div className="photo-editor-row">
              <MedicationVisualBadge
                name={form.name || 'Anteprima'}
                icon={form.icon}
                color={form.color}
                photoDataUrl={form.photoDataUrl}
              />
              <div className="photo-btn-group">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={handlePhotoChange}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  tabIndex={-1}
                  aria-hidden="true"
                  data-testid="medication-gallery-input"
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  className="btn btn--tonal btn--sm"
                  disabled={photoBusy}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  {photoBusy ? 'Elaborazione...' : 'Scatta foto'}
                </button>
                <button
                  type="button"
                  className="btn btn--outlined btn--sm"
                  disabled={photoBusy}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  Galleria
                </button>
                {form.photoDataUrl && (
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    disabled={photoBusy}
                    onClick={() => {
                      photoRequestIdRef.current += 1;
                      setForm((prev) => ({ ...prev, photoDataUrl: undefined }));
                    }}
                  >
                    Rimuovi foto
                  </button>
                )}
              </div>
            </div>
            {photoError && (
              <div className="alert-box alert-box--error" role="alert">
                {photoError}
              </div>
            )}
          </div>

          <div className="field">
            <span className="field-label">
              Icona identificativa{' '}
              {form.photoDataUrl ? '(usata se rimuovi la foto)' : ''}
            </span>
            <div
              className="picker-grid"
              role="group"
              aria-label="Scegli icona farmaco"
            >
              {MEDICATION_ICONS.map((item) => {
                const active = form.icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`picker-tile ${active ? 'picker-tile--active' : ''}`}
                    aria-pressed={active}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        icon: item.id,
                      }))
                    }
                  >
                    <MedicationIconSvg icon={item.id} size={22} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Colore distintivo</span>
            <div
              className="color-row"
              role="group"
              aria-label="Scegli colore farmaco"
            >
              {MEDICATION_COLORS.map((colorItem) => {
                const active = form.color === colorItem.id;
                return (
                  <button
                    key={colorItem.id}
                    type="button"
                    className={`color-swatch-btn ${active ? 'color-swatch-btn--active' : ''}`}
                    aria-label={colorItem.label}
                    aria-pressed={active}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        color: colorItem.id,
                      }))
                    }
                  >
                    <span
                      className="color-swatch-dot"
                      style={{ backgroundColor: colorItem.swatch }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="row-actions">
            {sorted.length > 0 && (
              <button
                type="button"
                className="btn btn--outlined"
                onClick={() => {
                  photoRequestIdRef.current += 1;
                  setPhotoBusy(false);
                  setView('list');
                }}
              >
                Indietro
              </button>
            )}
            <button
              type="submit"
              className="btn btn--primary"
              disabled={photoBusy}
            >
              {editingId ? 'Salva farmaco' : 'Aggiungi farmaco'}
            </button>
          </div>
        </form>
      )}
    </ModalDialog>
  );
}
