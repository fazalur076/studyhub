import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal = ({
    open,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    onConfirm,
    onCancel,
    confirmText = "Delete",
    cancelText = "Cancel"
}: ConfirmModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-slate-600 mt-2">{description}</p>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        {cancelText}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onConfirm}
                        className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600"
                    >
                        {confirmText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmModal;
