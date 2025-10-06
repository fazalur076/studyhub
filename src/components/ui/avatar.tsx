import React from 'react';
import { cx, Div } from './primitives';

type AvatarProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: React.ReactNode;
};

export function Avatar({ className, fallback, alt = '', ...rest }: AvatarProps) {
  return (
    <Div className={cx('relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200', className)}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img className="h-full w-full object-cover" alt={alt} {...rest} onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }} />
      <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-600">
        {fallback ?? alt?.slice(0, 2).toUpperCase()}
      </span>
    </Div>
  );
}



