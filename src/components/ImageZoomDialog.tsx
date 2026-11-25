import { ModalDialog } from './ModalDialog';
import type { MedicationZoomTarget } from './MedicationVisualBadge';

interface ImageZoomDialogProps {
  target: MedicationZoomTarget | null;
  onClose: () => void;
}

export function ImageZoomDialog({ target, onClose }: ImageZoomDialogProps) {
  return (
    <ModalDialog
      open={Boolean(target?.photoDataUrl)}
      title={target ? target.name : 'Foto confezione'}
      onClose={onClose}
    >
      {target?.photoDataUrl && (
        <>
          <img
            src={target.photoDataUrl}
            alt={`Foto ingrandita della confezione di ${target.name}`}
            className="zoom-image"
          />
          <button
            type="button"
            className="btn btn--tonal btn--full"
            onClick={onClose}
          >
            Chiudi anteprima
          </button>
        </>
      )}
    </ModalDialog>
  );
}
