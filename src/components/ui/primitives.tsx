import React, { forwardRef } from 'react';

export type ClassedProps<T> = React.ComponentPropsWithoutRef<T> & { className?: string };

export const cx = (...classes: Array<string | undefined | false | null>) =>
  classes.filter(Boolean).join(' ');

export const Div = forwardRef<HTMLDivElement, ClassedProps<'div'>>(function Div(
  { className, ...rest },
  ref
) {
  return <div ref={ref} className={className} {...rest} />;
});

export const Span = forwardRef<HTMLSpanElement, ClassedProps<'span'>>(function Span(
  { className, ...rest },
  ref
) {
  return <span ref={ref} className={className} {...rest} />;
});

export const ButtonBase = forwardRef<HTMLButtonElement, ClassedProps<'button'>>(function ButtonBase(
  { className, type = 'button', ...rest },
  ref
) {
  return <button ref={ref} type={type} className={className} {...rest} />;
});

export const InputBase = forwardRef<HTMLInputElement, ClassedProps<'input'>>(function InputBase(
  { className, ...rest },
  ref
) {
  return <input ref={ref} className={className} {...rest} />;
});

export const LabelBase = forwardRef<HTMLLabelElement, ClassedProps<'label'>>(function LabelBase(
  { className, ...rest },
  ref
) {
  return <label ref={ref} className={className} {...rest} />;
});



