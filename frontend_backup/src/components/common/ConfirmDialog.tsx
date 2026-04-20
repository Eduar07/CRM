import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title = "Confirmar acción",
  message,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onConfirm}>Confirmar</Button>
      </div>
    </Modal>
  );
}
