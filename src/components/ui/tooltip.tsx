import React, { useEffect, useRef, useState } from 'react';
import { cx } from './primitives';

type Props = {
  content: React.ReactNode;
  children: React.ReactNode;
};

export function Tooltip({ content, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onEnter = () => setOpen(true);
    const onLeave = () => setOpen(false);
    node.addEventListener('mouseenter', onEnter);
    node.addEventListener('mouseleave', onLeave);
    node.addEventListener('focusin', onEnter);
    node.addEventListener('focusout', onLeave);
    return () => {
      node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave);
      node.removeEventListener('focusin', onEnter);
      node.removeEventListener('focusout', onLeave);
    };
  }, []);

  return (
    <div className="relative inline-flex" ref={ref}>
      {children}
      {open && (
        <div className={cx('absolute left-1/2 z-50 -translate-x-1/2 translate-y-2 rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-md')}
        >
          {content}
        </div>
      )}
    </div>
  );
}



