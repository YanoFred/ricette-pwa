interface OnboardingViewProps {
  onCreateFirstProfile: () => void;
  onOpenBackup: () => void;
}

export function OnboardingView({
  onCreateFirstProfile,
  onOpenBackup,
}: OnboardingViewProps) {
  return (
    <section className="surface-card onboarding-card" aria-labelledby="onboarding-heading">
      <div>
        <h2 id="onboarding-heading" className="section-title" style={{ fontSize: '1.25rem' }}>
          Benvenuto in Ricette
        </h2>
        <p style={{ margin: '8px 0 0', color: 'var(--md-text-muted)' }}>
          Tutti i dati restano salvati esclusivamente sul tuo dispositivo, anche
          senza connessione internet.
        </p>
      </div>

      <ol className="onboarding-steps">
        <li>
          Crea un profilo con il medico di riferimento e il tuo modello di testo
          email personalizzato.
        </li>
        <li>
          Aggiungi i farmaci con la <strong>foto della scatola</strong> oppure
          un’<strong>icona colorata</strong> per riconoscerli subito.
        </li>
        <li>
          Seleziona ciò che ti serve con un tap e apri Gmail già precompilata.
        </li>
      </ol>

      <div className="onboarding-actions">
        <button
          type="button"
          className="btn btn--primary btn--full"
          onClick={onCreateFirstProfile}
        >
          Crea il primo profilo
        </button>
        <button
          type="button"
          className="btn btn--outlined btn--full"
          onClick={onOpenBackup}
        >
          Importa da backup JSON
        </button>
      </div>
    </section>
  );
}
