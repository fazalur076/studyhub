import React, { useState } from 'react';
import { cx } from './primitives';

type Tab = { value: string; label: React.ReactNode };

type Props = {
  tabs: Tab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  className?: string;
};

export function Tabs({ tabs, value: controlled, defaultValue, onValueChange, className }: Props) {
  const [value, setValue] = useState(controlled ?? defaultValue ?? tabs[0]?.value);
  const change = (v: string) => {
    setValue(v);
    onValueChange?.(v);
  };
  return (
    <div className={cx('w-full', className)}>
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={cx(
              'rounded-lg px-3 py-2 text-sm font-medium',
              value === t.value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
            onClick={() => change(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}



