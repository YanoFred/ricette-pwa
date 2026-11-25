import type { Profile } from '../domain/types';

interface HeaderProps {
  profiles: readonly Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  onSelectProfile: (profileId: string) => void;
  onOpenProfiles: () => void;
  onOpenBackup: () => void;
}

export function Header({
  profiles,
  activeProfile,
  isLoading,
  onSelectProfile,
  onOpenProfiles,
  onOpenBackup,
}: HeaderProps) {
  return (
    <header className="top-bar">
      <div className="top-bar-row">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="brand-title">Ricette</h1>
        </div>

        <div className="top-actions">
          <button
            type="button"
            className="icon-btn"
            disabled={isLoading}
            onClick={onOpenProfiles}
            aria-label="Gestisci profili"
          >
            Profili
          </button>
          <button
            type="button"
            className="icon-btn"
            disabled={isLoading}
            onClick={onOpenBackup}
            aria-label="Backup esporta e importa"
          >
            Backup
          </button>
        </div>
      </div>

      {profiles.length > 1 && (
        <nav className="profile-strip" aria-label="Selezione profilo">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfile?.id;
            return (
              <button
                key={profile.id}
                type="button"
                className={`profile-chip ${isActive ? 'profile-chip--active' : ''}`}
                aria-pressed={isActive}
                onClick={() => onSelectProfile(profile.id)}
              >
                {profile.label}
              </button>
            );
          })}
        </nav>
      )}

      {activeProfile && (
        <div className="active-profile-banner">
          <span>
            Profilo: <span className="active-profile-name">{activeProfile.label}</span>
            {activeProfile.doctorName ? ` · ${activeProfile.doctorName}` : ''}
          </span>
        </div>
      )}
    </header>
  );
}
