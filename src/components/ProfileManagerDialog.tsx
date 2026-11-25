import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  buildDefaultEmailOpening,
  DEFAULT_DOCTOR_NAME,
  DEFAULT_EMAIL_CLOSING,
  DEFAULT_EMAIL_SUBJECT,
} from '../domain/defaults';
import { isValidEmailAddress } from '../domain/emailBuilder';
import type { Profile, ProfileInput } from '../domain/types';
import { ModalDialog } from './ModalDialog';

interface ProfileManagerDialogProps {
  open: boolean;
  profiles: readonly Profile[];
  activeProfileId: string | null;
  initialMode?: 'list' | 'create' | 'edit-active';
  onClose: () => void;
  onSelectProfile: (profileId: string) => void;
  onAddProfile: (input: ProfileInput) => void;
  onUpdateProfile: (profileId: string, input: ProfileInput) => void;
  onDeleteProfile: (profileId: string) => void;
}

function emptyForm(): ProfileInput {
  return {
    label: '',
    doctorName: DEFAULT_DOCTOR_NAME,
    doctorEmail: '',
    emailSubject: DEFAULT_EMAIL_SUBJECT,
    emailOpening: buildDefaultEmailOpening(DEFAULT_DOCTOR_NAME),
    emailClosing: DEFAULT_EMAIL_CLOSING,
  };
}

function formFromProfile(profile: Profile): ProfileInput {
  return {
    label: profile.label,
    doctorName: profile.doctorName,
    doctorEmail: profile.doctorEmail,
    emailSubject: profile.emailSubject,
    emailOpening: profile.emailOpening,
    emailClosing: profile.emailClosing,
  };
}

export function ProfileManagerDialog({
  open,
  profiles,
  activeProfileId,
  initialMode = 'list',
  onClose,
  onSelectProfile,
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile,
}: ProfileManagerDialogProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileInput>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const wasOpenRef = useRef(false);

  const labelInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const labelId = useId();
  const labelHintId = useId();
  const labelErrorId = useId();
  const doctorNameId = useId();
  const doctorNameHintId = useId();
  const emailId = useId();
  const emailHintId = useId();
  const emailErrorId = useId();
  const subjectId = useId();
  const openingId = useId();
  const openingHintId = useId();
  const closingId = useId();

  // Inizializza solo sulla transizione di apertura (evita reset inattesi durante la modifica)
  useEffect(() => {
    const becameOpen = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!becameOpen) return;

    setConfirmDeleteId(null);
    setTouched({});
    setSubmitted(false);

    if (initialMode === 'create' || profiles.length === 0) {
      setView('form');
      setEditingId(null);
      setForm(emptyForm());
      return;
    }

    if (initialMode === 'edit-active') {
      const target =
        profiles.find((p) => p.id === activeProfileId) ?? profiles[0];
      if (target) {
        setView('form');
        setEditingId(target.id);
        setForm(formFromProfile(target));
        return;
      }
    }

    setView('list');
    setEditingId(null);
  }, [open, initialMode, profiles, activeProfileId]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setTouched({});
    setSubmitted(false);
    setView('form');
  };

  const startEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setForm(formFromProfile(profile));
    setTouched({});
    setSubmitted(false);
    setView('form');
  };

  const labelInvalid = form.label.trim().length === 0;
  const emailInvalid = !isValidEmailAddress(form.doctorEmail);
  const showLabelError = (submitted || touched.label) && labelInvalid;
  const showEmailError = (submitted || touched.doctorEmail) && emailInvalid;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (labelInvalid) {
      labelInputRef.current?.focus();
      return;
    }
    if (emailInvalid) {
      emailInputRef.current?.focus();
      return;
    }

    if (editingId) {
      onUpdateProfile(editingId, form);
    } else {
      onAddProfile(form);
    }
    onClose();
  };

  const dialogTitle =
    view === 'list'
      ? 'Gestione profili'
      : editingId
        ? 'Modifica profilo e modello mail'
        : 'Nuovo profilo';

  return (
    <ModalDialog open={open} title={dialogTitle} onClose={onClose}>
      {view === 'list' ? (
        <>
          {profiles.length === 0 ? (
            <div className="empty-state">
              <p style={{ margin: 0 }}>Nessun profilo configurato.</p>
            </div>
          ) : (
            <ul className="manage-list">
              {profiles.map((profile) => {
                const isActive = profile.id === activeProfileId;
                return (
                  <li key={profile.id} className="manage-item">
                    <div className="manage-item-info">
                      <div className="manage-item-text">
                        <div className="manage-item-title">
                          {profile.label} {isActive ? '(Attivo)' : ''}
                        </div>
                        <div className="manage-item-sub">
                          {profile.doctorName} ·{' '}
                          {profile.doctorEmail || 'Email non impostata'}
                        </div>
                      </div>
                    </div>
                    <div className="manage-item-actions">
                      {!isActive && (
                        <button
                          type="button"
                          className="btn btn--tonal btn--sm"
                          onClick={() => {
                            onSelectProfile(profile.id);
                            onClose();
                          }}
                        >
                          Usa
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--outlined btn--sm"
                        onClick={() => startEdit(profile)}
                      >
                        Modifica
                      </button>
                      {confirmDeleteId === profile.id ? (
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => {
                            onDeleteProfile(profile.id);
                            setConfirmDeleteId(null);
                          }}
                        >
                          Conferma
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="mini-icon-btn mini-icon-btn--danger"
                          aria-label={`Elimina profilo ${profile.label}`}
                          onClick={() => setConfirmDeleteId(profile.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            className="btn btn--primary btn--full"
            onClick={startCreate}
          >
            + Aggiungi nuovo profilo
          </button>
        </>
      ) : (
        <form className="form-stack" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor={labelId} className="field-label">
              Nome del profilo *
            </label>
            <span id={labelHintId} className="field-hint">
              Es. “Personale”, “Familiare” o il nome del paziente.
            </span>
            <input
              ref={labelInputRef}
              id={labelId}
              type="text"
              required
              className={`field-input ${showLabelError ? 'user-invalid-fallback' : ''}`}
              aria-invalid={showLabelError ? 'true' : 'false'}
              aria-describedby={
                showLabelError ? `${labelHintId} ${labelErrorId}` : labelHintId
              }
              placeholder="Es. Personale"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, label: true }))}
            />
            <div
              id={labelErrorId}
              role={showLabelError ? 'alert' : undefined}
              className={`error-msg ${showLabelError ? 'error-msg--visible' : ''}`}
            >
              Errore: inserisci un nome per identificare questo profilo.
            </div>
          </div>

          <div className="field">
            <label htmlFor={doctorNameId} className="field-label">
              Appellativo del medico
            </label>
            <span id={doctorNameHintId} className="field-hint">
              Es. “Doc”, “Dott. Rossi”, “Dott.ssa Verdi”.
            </span>
            <input
              id={doctorNameId}
              type="text"
              className="field-input"
              aria-describedby={doctorNameHintId}
              placeholder="Doc"
              value={form.doctorName}
              onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor={emailId} className="field-label">
              Email del medico *
            </label>
            <span id={emailHintId} className="field-hint">
              Formato: medico@esempio.it
            </span>
            <input
              ref={emailInputRef}
              id={emailId}
              type="email"
              required
              autoComplete="email"
              className={`field-input ${showEmailError ? 'user-invalid-fallback' : ''}`}
              aria-invalid={showEmailError ? 'true' : 'false'}
              aria-describedby={
                showEmailError ? `${emailHintId} ${emailErrorId}` : emailHintId
              }
              placeholder="medico@esempio.it"
              value={form.doctorEmail}
              onChange={(e) => setForm({ ...form, doctorEmail: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, doctorEmail: true }))}
            />
            <div
              id={emailErrorId}
              role={showEmailError ? 'alert' : undefined}
              className={`error-msg ${showEmailError ? 'error-msg--visible' : ''}`}
            >
              Errore: inserisci un indirizzo email valido (es. medico@esempio.it).
            </div>
          </div>

          <hr
            style={{
              border: 0,
              borderTop: '1px solid var(--md-outline)',
              margin: '4px 0',
            }}
          />

          <div className="section-header">
            <h3 className="section-title" style={{ fontSize: '0.98rem' }}>
              Modello testo email di questo profilo
            </h3>
            <button
              type="button"
              className="btn btn--outlined btn--sm"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  emailSubject: DEFAULT_EMAIL_SUBJECT,
                  emailOpening: buildDefaultEmailOpening(prev.doctorName),
                  emailClosing: DEFAULT_EMAIL_CLOSING,
                }))
              }
            >
              Ripristina testo
            </button>
          </div>

          <div className="field">
            <label htmlFor={subjectId} className="field-label">
              Oggetto email
            </label>
            <input
              id={subjectId}
              type="text"
              className="field-input"
              placeholder="Ricette"
              value={form.emailSubject}
              onChange={(e) => setForm({ ...form, emailSubject: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor={openingId} className="field-label">
              Frase di apertura (prima dell’elenco farmaci)
            </label>
            <span id={openingHintId} className="field-hint">
              Personalizza il messaggio per questo profilo (es. per te o per un
              familiare).
            </span>
            <textarea
              id={openingId}
              className="field-textarea"
              rows={3}
              aria-describedby={openingHintId}
              value={form.emailOpening}
              onChange={(e) => setForm({ ...form, emailOpening: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor={closingId} className="field-label">
              Saluti finali
            </label>
            <textarea
              id={closingId}
              className="field-textarea"
              rows={2}
              value={form.emailClosing}
              onChange={(e) => setForm({ ...form, emailClosing: e.target.value })}
            />
          </div>

          <div className="row-actions">
            {profiles.length > 0 && (
              <button
                type="button"
                className="btn btn--outlined"
                onClick={() => setView('list')}
              >
                Indietro
              </button>
            )}
            <button type="submit" className="btn btn--primary">
              {editingId ? 'Salva modifiche' : 'Crea profilo'}
            </button>
          </div>
        </form>
      )}
    </ModalDialog>
  );
}
