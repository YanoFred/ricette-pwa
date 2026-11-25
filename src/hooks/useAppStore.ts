import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createEmptyAppState,
  createMedication,
  createProfile,
  DEFAULT_DOCTOR_NAME,
  DEFAULT_EMAIL_SUBJECT,
} from '../domain/defaults';
import { loadAppState, sanitizeAppState, saveAppState } from '../domain/storage';
import type {
  AppState,
  MedicationInput,
  Profile,
  ProfileInput,
} from '../domain/types';

export interface AppStore {
  state: AppState;
  activeProfile: Profile | null;
  isLoading: boolean;
  storageError: string | null;
  selectProfile: (profileId: string) => void;
  addProfile: (input: ProfileInput) => Profile;
  updateProfile: (profileId: string, input: ProfileInput) => void;
  deleteProfile: (profileId: string) => void;
  addMedication: (profileId: string, input: MedicationInput) => void;
  updateMedication: (
    profileId: string,
    medicationId: string,
    input: MedicationInput,
  ) => void;
  deleteMedication: (profileId: string, medicationId: string) => void;
  moveMedication: (
    profileId: string,
    medicationId: string,
    direction: 'up' | 'down',
  ) => void;
  replaceState: (nextState: AppState) => void;
}

export function useAppStore(): AppStore {
  const [state, setState] = useState<AppState>(() => createEmptyAppState());
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());
  const isDirtyRef = useRef(false);

  useEffect(() => {
    let active = true;
    loadAppState()
      .then((loaded) => {
        if (!active) return;
        setState(loaded);
        hasLoadedRef.current = true;
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setStorageError(
          'Impossibile leggere i dati locali salvati. Avvio con configurazione vuota.',
        );
        hasLoadedRef.current = true;
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Persistenza serializzata fuori dagli updater setState (sicura in StrictMode, zero lost-update)
  useEffect(() => {
    if (!hasLoadedRef.current || !isDirtyRef.current) return;
    isDirtyRef.current = false;
    const snapshot = state;
    saveChainRef.current = saveChainRef.current
      .catch(() => undefined)
      .then(() => saveAppState(snapshot))
      .then(() => {
        setStorageError(null);
      })
      .catch(() => {
        setStorageError(
          'Errore nel salvataggio locale. Verifica lo spazio disponibile sul dispositivo.',
        );
      });
  }, [state]);

  const commitState = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      isDirtyRef.current = true;
      return sanitizeAppState(updater(prev));
    });
  }, []);

  const selectProfile = useCallback(
    (profileId: string) => {
      commitState((prev) => ({
        ...prev,
        activeProfileId: profileId,
      }));
    },
    [commitState],
  );

  const addProfile = useCallback(
    (input: ProfileInput): Profile => {
      const created = createProfile(input);
      commitState((prev) => ({
        ...prev,
        activeProfileId: created.id,
        profiles: [...prev.profiles, created],
      }));
      return created;
    },
    [commitState],
  );

  const updateProfile = useCallback(
    (profileId: string, input: ProfileInput) => {
      const nowIso = new Date().toISOString();
      commitState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((profile) =>
          profile.id === profileId
            ? {
                ...profile,
                label: input.label.trim(),
                doctorName: input.doctorName.trim() || DEFAULT_DOCTOR_NAME,
                doctorEmail: input.doctorEmail.trim(),
                emailSubject: input.emailSubject.trim() || DEFAULT_EMAIL_SUBJECT,
                emailOpening: input.emailOpening.trim(),
                emailClosing: input.emailClosing.trim(),
                updatedAt: nowIso,
              }
            : profile,
        ),
      }));
    },
    [commitState],
  );

  const deleteProfile = useCallback(
    (profileId: string) => {
      commitState((prev) => {
        const remaining = prev.profiles.filter((p) => p.id !== profileId);
        const nextActive =
          prev.activeProfileId === profileId
            ? (remaining[0]?.id ?? null)
            : prev.activeProfileId;
        return {
          ...prev,
          activeProfileId: nextActive,
          profiles: remaining,
        };
      });
    },
    [commitState],
  );

  const addMedication = useCallback(
    (profileId: string, input: MedicationInput) => {
      const nowIso = new Date().toISOString();
      commitState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((profile) => {
          if (profile.id !== profileId) return profile;
          const nextOrder = profile.medications.length;
          const created = createMedication(input, nextOrder);
          return {
            ...profile,
            medications: [...profile.medications, created],
            updatedAt: nowIso,
          };
        }),
      }));
    },
    [commitState],
  );

  const updateMedication = useCallback(
    (profileId: string, medicationId: string, input: MedicationInput) => {
      const nowIso = new Date().toISOString();
      commitState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((profile) => {
          if (profile.id !== profileId) return profile;
          return {
            ...profile,
            medications: profile.medications.map((med) => {
              if (med.id !== medicationId) return med;
              return {
                id: med.id,
                name: input.name.trim(),
                order: med.order,
                icon: input.icon,
                color: input.color,
                ...(input.photoDataUrl ? { photoDataUrl: input.photoDataUrl } : {}),
              };
            }),
            updatedAt: nowIso,
          };
        }),
      }));
    },
    [commitState],
  );

  const deleteMedication = useCallback(
    (profileId: string, medicationId: string) => {
      const nowIso = new Date().toISOString();
      commitState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((profile) => {
          if (profile.id !== profileId) return profile;
          const nextMeds = profile.medications
            .filter((med) => med.id !== medicationId)
            .map((med, index) => ({ ...med, order: index }));
          return {
            ...profile,
            medications: nextMeds,
            updatedAt: nowIso,
          };
        }),
      }));
    },
    [commitState],
  );

  const moveMedication = useCallback(
    (profileId: string, medicationId: string, direction: 'up' | 'down') => {
      const nowIso = new Date().toISOString();
      commitState((prev) => ({
        ...prev,
        profiles: prev.profiles.map((profile) => {
          if (profile.id !== profileId) return profile;
          const list = [...profile.medications].sort((a, b) => a.order - b.order);
          const idx = list.findIndex((m) => m.id === medicationId);
          if (idx === -1) return profile;
          const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= list.length) return profile;
          const [moved] = list.splice(idx, 1);
          list.splice(targetIdx, 0, moved);
          return {
            ...profile,
            medications: list.map((med, order) => ({ ...med, order })),
            updatedAt: nowIso,
          };
        }),
      }));
    },
    [commitState],
  );

  const replaceState = useCallback(
    (nextState: AppState) => {
      commitState(() => nextState);
    },
    [commitState],
  );

  const activeProfile =
    state.profiles.find((p) => p.id === state.activeProfileId) ??
    state.profiles[0] ??
    null;

  return {
    state,
    activeProfile,
    isLoading,
    storageError,
    selectProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    addMedication,
    updateMedication,
    deleteMedication,
    moveMedication,
    replaceState,
  };
}
