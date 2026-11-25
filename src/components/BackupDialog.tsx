import { useRef, useState, type ChangeEvent } from 'react';
import {
  buildBackupFilename,
  parseAndValidateBackup,
  serializeBackup,
} from '../domain/backup';
import type { AppState } from '../domain/types';
import { ModalDialog } from './ModalDialog';

const MAX_BACKUP_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

interface BackupDialogProps {
  open: boolean;
  state: AppState;
  onClose: () => void;
  onImportState: (nextState: AppState) => void;
}

interface PendingImport {
  state: AppState;
  profileCount: number;
  medicationCount: number;
  photoCount: number;
}

export function BackupDialog({
  open,
  state,
  onClose,
  onImportState,
}: BackupDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    setError(null);
    const json = serializeBackup(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = buildBackupFilename();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage('Backup JSON esportato con successo (comprese le miniature foto).');
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleFilePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setMessage(null);
    if (file.size > MAX_BACKUP_FILE_BYTES) {
      setPending(null);
      setError('Il file di backup supera il limite consentito di 25 MB.');
      return;
    }
    try {
      const text = await file.text();
      const result = parseAndValidateBackup(text);
      if (!result.ok) {
        setPending(null);
        setError(result.error);
        return;
      }
      setPending({
        state: result.state,
        profileCount: result.profileCount,
        medicationCount: result.medicationCount,
        photoCount: result.photoCount,
      });
    } catch {
      setError('Impossibile leggere il file selezionato.');
    }
  };

  const handleConfirmImport = () => {
    if (!pending) return;
    onImportState(pending.state);
    setPending(null);
    setMessage('Backup importato correttamente!');
  };

  const handleClose = () => {
    setPending(null);
    setError(null);
    setMessage(null);
    onClose();
  };

  return (
    <ModalDialog open={open} title="Backup locale (Esporta / Importa)" onClose={handleClose}>
      <p style={{ margin: 0, color: 'var(--md-text-muted)' }}>
        Esporta tutti i profili, i modelli email, i farmaci e le foto compresse
        in un file JSON per conservarli al sicuro o trasferirli su un altro
        telefono.
      </p>

      <div className="form-stack">
        <button
          type="button"
          className="btn btn--primary btn--full"
          disabled={state.profiles.length === 0}
          onClick={handleExport}
        >
          Esporta backup JSON
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          tabIndex={-1}
          aria-hidden="true"
          data-testid="backup-file-input"
          onChange={handleFilePick}
        />

        <button
          type="button"
          className="btn btn--outlined btn--full"
          onClick={() => fileInputRef.current?.click()}
        >
          Importa backup JSON
        </button>
      </div>

      {pending && (
        <div className="alert-box alert-box--warning" role="alert">
          <div>
            <strong>Backup valido pronto da importare:</strong>{' '}
            {pending.profileCount}{' '}
            {pending.profileCount === 1 ? 'profilo' : 'profili'},{' '}
            {pending.medicationCount}{' '}
            {pending.medicationCount === 1 ? 'farmaco' : 'farmaci'},{' '}
            {pending.photoCount}{' '}
            {pending.photoCount === 1 ? 'foto scatola' : 'foto scatole'}.
          </div>
          <div>
            L’importazione sostituirà i dati attualmente salvati su questo
            dispositivo.
          </div>
          <div className="row-actions">
            <button
              type="button"
              className="btn btn--outlined btn--sm"
              onClick={() => setPending(null)}
            >
              Annulla
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleConfirmImport}
            >
              Conferma importazione
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-box alert-box--error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert-box alert-box--success" role="status">
          {message}
        </div>
      )}
    </ModalDialog>
  );
}
