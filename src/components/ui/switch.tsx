import React from 'react';
import { cx } from './primitives';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Switch({ className, ...rest }: Props) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input type="checkbox" className="peer sr-only" {...rest} />
      <span
        className={
          cx(
            'h-6 w-11 rounded-full bg-slate-300 transition-colors duration-200 peer-checked:bg-indigo-600',
            'relative after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:duration-200 peer-checked:after:translate-x-5',
            className
          )
        }
      />
    </label>
  );
}



