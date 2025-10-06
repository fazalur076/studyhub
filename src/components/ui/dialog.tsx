import React, { createContext, useContext, useEffect, useRef } from 'react';

type DialogContextValue = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean; // not used, for API parity
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function useDialogContext(component: string): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Dialog>`);
  }
  return ctx;
}

type DialogContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function DialogContent({ children, className = '', ...rest }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext('DialogContent');
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange?.(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // Prevent background scroll while dialog is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // Backdrop click closes
        if (e.target === e.currentTarget) {
          onOpenChange?.(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div
        ref={contentRef}
        className={
          `relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl outline-none ` +
          `animate-in fade-in zoom-in duration-200 ` +
          className
        }
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function DialogHeader({ children, className = '', ...rest }: DialogHeaderProps) {
  return (
    <div className={`mb-4 flex flex-col space-y-1.5 ${className}`} {...rest}>
      {children}
    </div>
  );
}

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children: React.ReactNode;
};

export function DialogTitle({ children, className = '', ...rest }: DialogTitleProps) {
  return (
    <h2 className={`text-2xl font-bold text-slate-800 ${className}`} {...rest}>
      {children}
    </h2>
  );
}

// Optional: simple description component for parity
export function DialogDescription({ children, className = '', ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-slate-600 ${className}`} {...rest}>
      {children}
    </p>
  );
}


