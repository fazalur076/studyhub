import React, { useState } from 'react';
import { cx } from './primitives';

type Option = { label: string; value: string };

type Props = {
  options: Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function Select({ options, value: controlled, defaultValue, onValueChange, placeholder = 'Select...', className }: Props) {
  const [value, setValue] = useState<string | undefined>(controlled ?? defaultValue);
  const handleChange = (v: string) => {
    setValue(v);
    onValueChange?.(v);
  };

  return (
    <select
      className={cx('w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500', className)}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
    >
      {placeholder && <option value="" disabled selected={!value}>{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}



