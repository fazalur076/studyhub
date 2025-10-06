import React from 'react';
import { cx } from './primitives';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-md bg-slate-200', className)} />;
}



