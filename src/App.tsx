import { useMemo, useState } from 'react';
import { BackupDialog } from './components/BackupDialog';
import { EmailPreviewSheet } from './components/EmailPreviewSheet';
import { FreeNoteInput } from './components/FreeNoteInput';
import { Header } from './components/Header';
import { ImageZoomDialog } from './components/ImageZoomDialog';
import { MedicationList } from './components/MedicationList';
import { MedicationManagerDialog } from './components/MedicationManagerDialog';
import type { MedicationZoomTarget } from './components/MedicationVisualBadge';
import { OnboardingView } from './components/OnboardingView';
import { ProfileManagerDialog } from './components/ProfileManagerDialog';
import { PwaUpdateBanner } from './components/PwaUpdateBanner';
import { buildPrescriptionEmail } from './domain/emailBuilder';
import { useAppStore } from './hooks/useAppStore';

export function App() {
  const store = useAppStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [freeNote, setFreeNote] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [profilesDialog, setProfilesDialog] = useState<{
    open: boolean;
    mode: 'list' | 'create' | 'edit-active';
  }>({ open: false, mode: 'list' });
  const [medsDialogOpen, setMedsDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<MedicationZoomTarget | null>(null);

  const activeProfile = store.activeProfile;

  // Mantiene solo gli ID selezionati che appartengono al profilo attivo
  const validSelectedIds = useMemo(() => {
    if (!activeProfile) return new Set<string>();
    const validSet = new Set(activeProfile.medications.map((m) => m.id));
    const filtered = new Set<string>();
    for (const id of selectedIds) {
      if (validSet.has(id)) filtered.add(id);
    }
    return filtered;
  }, [activeProfile, selectedIds]);

  const composedEmail = useMemo(() => {
    if (!activeProfile) return null;
    return buildPrescriptionEmail(activeProfile, validSelectedIds, freeNote);
  }, [activeProfile, validSelectedIds, freeNote]);

  const handleSelectProfile = (profileId: string) => {
    store.selectProfile(profileId);
    setSelectedIds(new Set());
    setFreeNote('');
  };

  const handleToggleMedication = (medicationId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(medicationId)) {
        next.delete(medicationId);
      } else {
        next.add(medicationId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!activeProfile) return;
    setSelectedIds(new Set(activeProfile.medications.map((m) => m.id)));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  return (
    <div className="app-shell">
      <Header
        profiles={store.state.profiles}
        activeProfile={activeProfile}
        isLoading={store.isLoading}
        onSelectProfile={handleSelectProfile}
        onOpenProfiles={() => setProfilesDialog({ open: true, mode: 'list' })}
        onOpenBackup={() => setBackupDialogOpen(true)}
      />

      <PwaUpdateBanner />

      <main className="main-content">
        {store.storageError && (
          <div className="alert-box alert-box--error" role="alert">
            {store.storageError}
          </div>
        )}

        {store.isLoading ? (
          <section className="surface-card empty-state" aria-busy="true">
            Caricamento dati locali...
          </section>
        ) : !activeProfile ? (
          <OnboardingView
            onCreateFirstProfile={() =>
              setProfilesDialog({ open: true, mode: 'create' })
            }
            onOpenBackup={() => setBackupDialogOpen(true)}
          />
        ) : (
          <>
            <MedicationList
              key={activeProfile.id}
              medications={activeProfile.medications}
              selectedIds={validSelectedIds}
              onToggleSelect={handleToggleMedication}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onOpenManage={() => setMedsDialogOpen(true)}
              onZoomPhoto={(target) => setZoomTarget(target)}
            />

            <FreeNoteInput value={freeNote} onChange={setFreeNote} />
          </>
        )}
      </main>

      {activeProfile && (
        <div className="bottom-bar" role="region" aria-label="Azioni richiesta mail">
          <div className="bottom-bar-meta">
            <span className="bottom-bar-count">
              {validSelectedIds.size}{' '}
              {validSelectedIds.size === 1 ? 'farmaco' : 'farmaci'}
            </span>
            <span className="bottom-bar-sub">
              {activeProfile.doctorEmail || 'Imposta email medico'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            disabled={validSelectedIds.size === 0}
            onClick={() => setPreviewOpen(true)}
          >
            Prepara Mail
          </button>
        </div>
      )}

      {composedEmail && (
        <EmailPreviewSheet
          open={previewOpen}
          email={composedEmail}
          onClose={() => setPreviewOpen(false)}
          onEditProfile={() =>
            setProfilesDialog({ open: true, mode: 'edit-active' })
          }
        />
      )}

      <ProfileManagerDialog
        open={profilesDialog.open}
        profiles={store.state.profiles}
        activeProfileId={activeProfile?.id ?? null}
        initialMode={profilesDialog.mode}
        onClose={() => setProfilesDialog((prev) => ({ ...prev, open: false }))}
        onSelectProfile={handleSelectProfile}
        onAddProfile={(input) => {
          store.addProfile(input);
          setSelectedIds(new Set());
          setFreeNote('');
        }}
        onUpdateProfile={store.updateProfile}
        onDeleteProfile={(id) => {
          const isDeletingActive = activeProfile?.id === id;
          store.deleteProfile(id);
          if (isDeletingActive) {
            setSelectedIds(new Set());
            setFreeNote('');
          }
        }}
      />

      {activeProfile && (
        <MedicationManagerDialog
          open={medsDialogOpen}
          medications={activeProfile.medications}
          onClose={() => setMedsDialogOpen(false)}
          onAddMedication={(input) =>
            store.addMedication(activeProfile.id, input)
          }
          onUpdateMedication={(medId, input) =>
            store.updateMedication(activeProfile.id, medId, input)
          }
          onDeleteMedication={(medId) => {
            store.deleteMedication(activeProfile.id, medId);
            setSelectedIds((prev) => {
              const next = new Set(prev);
              next.delete(medId);
              return next;
            });
          }}
          onMoveMedication={(medId, dir) =>
            store.moveMedication(activeProfile.id, medId, dir)
          }
        />
      )}

      <BackupDialog
        open={backupDialogOpen}
        state={store.state}
        onClose={() => setBackupDialogOpen(false)}
        onImportState={(nextState) => {
          store.replaceState(nextState);
          setSelectedIds(new Set());
          setFreeNote('');
        }}
      />

      <ImageZoomDialog target={zoomTarget} onClose={() => setZoomTarget(null)} />
    </div>
  );
}
