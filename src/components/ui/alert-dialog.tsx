import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
};

export function AlertDialog({ open = false, onOpenChange, title, children }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {title ? <DialogTitle>{title}</DialogTitle> : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}



