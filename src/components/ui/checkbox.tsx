import React from 'react';
import { cx } from './primitives';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className, ...rest }: Props) {
  return (
    <input
      type="checkbox"
      className={cx('h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500', className)}
      {...rest}
    />
  );
}



