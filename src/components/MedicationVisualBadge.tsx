import type {
  Medication,
  MedicationColorId,
  MedicationIconId,
} from '../domain/types';

export function MedicationIconSvg({
  icon,
  size = 26,
}: {
  icon: MedicationIconId;
  size?: number;
}) {
  switch (icon) {
    case 'pill':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.2" />
          <line x1="6.5" y1="17.5" x2="17.5" y2="6.5" stroke="currentColor" strokeWidth="2.2" />
        </svg>
      );
    case 'capsule':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="4"
            y="8"
            width="16"
            height="8"
            rx="4"
            transform="rotate(-35 12 12)"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <line x1="9.5" y1="8.5" x2="14.5" y2="15.5" stroke="currentColor" strokeWidth="2.2" />
        </svg>
      );
    case 'drops':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.5C12 3.5 6 10.2 6 14.5a6 6 0 1 0 12 0C18 10.2 12 3.5 12 3.5Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 15.2a2.7 2.7 0 0 0 2.7 2.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'sachet':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="4" width="14" height="16" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
          <line x1="5" y1="8.5" x2="19" y2="8.5" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'syringe':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M17.5 3.5 20.5 6.5M14.5 6.5 17.5 9.5M6.5 14.5 14.5 6.5l3 3-8 8-3.5.5.5-3.5ZM3.5 20.5 6.5 17.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'box':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="6" width="17" height="12" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
          <path d="M12 9.5v5M9.5 12h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
  }
}

interface MedicationVisualBadgeProps {
  name: string;
  icon: MedicationIconId;
  color: MedicationColorId;
  photoDataUrl?: string;
  size?: 'md' | 'sm';
  onZoom?: () => void;
}

export function MedicationVisualBadge({
  name,
  icon,
  color,
  photoDataUrl,
  size = 'md',
  onZoom,
}: MedicationVisualBadgeProps) {
  if (photoDataUrl) {
    if (onZoom) {
      return (
        <button
          type="button"
          className="med-visual-photo-btn"
          aria-label={`Ingrandisci foto di ${name}`}
          onClick={(e) => {
            e.stopPropagation();
            onZoom();
          }}
        >
          <img
            src={photoDataUrl}
            alt={`Confezione ${name}`}
            className="med-visual-photo-img"
          />
          <span className="med-visual-zoom-dot" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      );
    }

    return (
      <div
        className="med-visual-photo-btn"
        style={size === 'sm' ? { width: 44, height: 44, borderRadius: 12 } : undefined}
      >
        <img
          src={photoDataUrl}
          alt={`Confezione ${name}`}
          className="med-visual-photo-img"
        />
      </div>
    );
  }

  return (
    <div
      className={`med-visual-icon med-color-${color} ${size === 'sm' ? 'med-visual-icon--sm' : ''}`}
      aria-hidden="true"
    >
      <MedicationIconSvg icon={icon} size={size === 'sm' ? 22 : 26} />
    </div>
  );
}

export type MedicationZoomTarget = Pick<Medication, 'name' | 'photoDataUrl'>;
