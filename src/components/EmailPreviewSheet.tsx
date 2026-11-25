import { useEffect, useRef, useState } from 'react';
import { isValidEmailAddress } from '../domain/emailBuilder';
import type { ComposedEmail } from '../domain/types';
import { ModalDialog } from './ModalDialog';

interface EmailPreviewSheetProps {
  open: boolean;
  email: ComposedEmail;
  onClose: () => void;
  onEditProfile: () => void;
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Passa al fallback legacy
  }

  try {
    // Inserisce la textarea dentro il dialog modale aperto per evitare lo stato inert di body
    const host = document.querySelector('dialog[open]') ?? document.body;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    host.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    host.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function EmailPreviewSheet({
  open,
  email,
  onClose,
  onEditProfile,
}: EmailPreviewSheetProps) {
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'ok' | 'error'>('idle');
  const feedbackTimerRef = useRef<number | null>(null);
  const hasValidRecipient = isValidEmailAddress(email.to);

  useEffect(() => {
    if (!open) {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      setCopyFeedback('idle');
    }
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, [open]);

  const handleCopy = async () => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    const ok = await copyTextWithFallback(email.body);
    setCopyFeedback(ok ? 'ok' : 'error');
    feedbackTimerRef.current = window.setTimeout(() => {
      setCopyFeedback('idle');
      feedbackTimerRef.current = null;
    }, 3000);
  };

  return (
    <ModalDialog open={open} title="Anteprima email al medico" onClose={onClose}>
      <div className="email-meta-grid">
        <div>
          <strong>A:</strong>{' '}
          {email.to || <em>Indirizzo email medico non impostato</em>}
        </div>
        <div>
          <strong>Oggetto:</strong> {email.subject || <em>(nessun oggetto)</em>}
        </div>
        <div>
          <strong>Farmaci selezionati:</strong> {email.medicationCount}
        </div>
      </div>

      {!hasValidRecipient && (
        <div className="alert-box alert-box--warning" role="alert">
          <span>
            L’indirizzo email del medico manca o non sembra valido. Inseriscilo
            nelle impostazioni del profilo oppure usa “Copia testo”.
          </span>
          <button
            type="button"
            className="btn btn--outlined btn--sm"
            onClick={() => {
              onClose();
              onEditProfile();
            }}
          >
            Modifica profilo
          </button>
        </div>
      )}

      {email.isLongMailtoUrl && (
        <div className="alert-box alert-box--warning" role="status">
          Il messaggio è molto lungo: se il client email dovesse troncarlo, usa
          il pulsante “Copia testo” qui sotto.
        </div>
      )}

      <div>
        <div className="field-label" style={{ marginBottom: 6 }}>
          Testo pronto da inviare
        </div>
        <pre className="email-preview-pre" data-testid="email-preview-body">
          {email.body}
        </pre>
      </div>

      <div className="form-stack">
        {hasValidRecipient ? (
          <a
            href={email.mailtoUrl}
            className="btn btn--primary btn--full"
            data-testid="open-gmail-link"
          >
            Apri in Gmail / Mail
          </a>
        ) : (
          <button type="button" className="btn btn--primary btn--full" disabled>
            Apri in Gmail / Mail
          </button>
        )}

        <button
          type="button"
          className="btn btn--tonal btn--full"
          onClick={handleCopy}
        >
          {copyFeedback === 'ok'
            ? 'Testo copiato negli appunti!'
            : 'Copia testo negli appunti'}
        </button>

        <div aria-live="polite" className="visually-hidden">
          {copyFeedback === 'ok'
            ? 'Testo email copiato negli appunti.'
            : copyFeedback === 'error'
              ? 'Errore nella copia del testo.'
              : ''}
        </div>

        {copyFeedback === 'error' && (
          <div className="alert-box alert-box--error" role="alert">
            Impossibile copiare automaticamente. Seleziona e copia il testo dal
            riquadro sopra.
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
