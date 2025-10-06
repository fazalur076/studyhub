import React from 'react';
import { Div, cx } from './primitives';

export function Alert({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Div
      role="alert"
      className={cx('rounded-xl border border-slate-200 bg-white p-4 text-slate-800', className)}
      {...rest}
    />
  );
}

export function AlertTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cx('mb-1 font-semibold', className)} {...rest} />;
}

export function AlertDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx('text-slate-600', className)} {...rest} />;
}



