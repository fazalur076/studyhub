import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cx } from './primitives';

type Side = 'top' | 'right' | 'bottom' | 'left';

type Ctx = { open: boolean; setOpen: (open: boolean) => void };
const SheetCtx = createContext<Ctx | null>(null);

type RootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Sheet({ open: controlled, defaultOpen = false, onOpenChange, children }: RootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlled ?? internalOpen;
  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    onOpenChange?.(next);
  };
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <SheetCtx.Provider value={value}>{children}</SheetCtx.Provider>;
}

function useSheet(component: string) {
  const ctx = useContext(SheetCtx);
  if (!ctx) throw new Error(`${component} must be used within <Sheet>`);
  return ctx;
}

type TriggerProps = {
  asChild?: boolean;
  children: React.ReactElement;
};

export function SheetTrigger({ asChild = true, children }: TriggerProps) {
  const { setOpen } = useSheet('SheetTrigger');
  const props = {
    onClick: (e: React.MouseEvent) => {
      children.props?.onClick?.(e);
      setOpen(true);
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': false,
  } as const;
  return asChild ? React.cloneElement(children, props) : (
    <button type="button" {...props}>{children}</button>
  );
}

type CloseProps = {
  asChild?: boolean;
  children: React.ReactElement;
};

export function SheetClose({ asChild = true, children }: CloseProps) {
  const { setOpen } = useSheet('SheetClose');
  const props = {
    onClick: (e: React.MouseEvent) => {
      children.props?.onClick?.(e);
      setOpen(false);
    },
  } as const;
  return asChild ? React.cloneElement(children, props) : (
    <button type="button" {...props}>{children}</button>
  );
}

type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: Side;
  className?: string;
};

export function SheetContent({ side = 'right', className, children, ...rest }: ContentProps) {
  const { open, setOpen } = useSheet('SheetContent');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = original; };
  }, [open, setOpen]);

  if (!open) return null;

  const base = 'fixed inset-0 z-50';
  const panelBase = 'absolute bg-white shadow-2xl';
  const bySide: Record<Side, string> = {
    top: 'left-0 right-0 top-0 h-[50vh] rounded-b-2xl',
    bottom: 'left-0 right-0 bottom-0 h-[50vh] rounded-t-2xl',
    left: 'left-0 top-0 bottom-0 w-[85vw] max-w-sm rounded-r-2xl',
    right: 'right-0 top-0 bottom-0 w-[85vw] max-w-sm rounded-l-2xl',
  };

  return (
    <div className={base} role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={cx(panelBase, bySide[side], 'p-6', className)} {...rest}>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('mb-4 flex flex-col space-y-1.5', className)} {...rest} />;
}

export function SheetTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cx('text-xl font-semibold text-slate-900', className)} {...rest} />;
}

export function SheetDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx('text-slate-600', className)} {...rest} />;
}

export function SheetFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('mt-6 flex items-center justify-end gap-2', className)} {...rest} />;
}