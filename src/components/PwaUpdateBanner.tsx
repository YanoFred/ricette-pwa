import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdateBanner() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="pwa-snackbar" role="status" aria-live="polite">
      <span>
        {needRefresh
          ? 'È disponibile una versione aggiornata di Ricette.'
          : 'App pronta per l’uso offline.'}
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        {needRefresh && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => {
              void Promise.resolve(updateServiceWorker(true)).catch(() => undefined);
            }}
          >
            Aggiorna
          </button>
        )}
        <button
          type="button"
          className="btn btn--outlined btn--sm"
          onClick={() => {
            setOfflineReady(false);
            setNeedRefresh(false);
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
