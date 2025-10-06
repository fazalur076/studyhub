import React, { useEffect, useRef, useState } from 'react';
import { cx } from './primitives';

type DropdownProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
};

export function DropdownMenu({ trigger, children, align = 'start' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cx(
            'absolute z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg',
            align === 'center' && 'left-1/2 -translate-x-1/2',
            align === 'end' && 'right-0',
            align === 'start' && 'left-0'
          )}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="menuitem"
      className={cx(
        'cursor-pointer select-none rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100',
        className
      )}
      {...rest}
    />
  );
}



