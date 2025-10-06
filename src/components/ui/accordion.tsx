import React, { useState, createContext, useContext } from 'react';
import { Div, ButtonBase, cx } from './primitives';

type AccordionCtx = {
  type: 'single' | 'multiple';
  value: string[];
  setValue: (v: string[] | ((v: string[]) => string[])) => void;
};

const Ctx = createContext<AccordionCtx | null>(null);

type RootProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: 'single' | 'multiple';
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (v: string[]) => void;
};

export function Accordion({
  type = 'single',
  defaultValue = [],
  value: controlled,
  onValueChange,
  className,
  ...rest
}: RootProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const value = controlled ?? internal;
  const setValue = (v: string[] | ((v: string[]) => string[])) => {
    const next = typeof v === 'function' ? (v as any)(value) : v;
    setInternal(next);
    onValueChange?.(next);
  };
  return (
    <Ctx.Provider value={{ type, value, setValue }}>
      <Div className={cx('space-y-2', className)} {...rest} />
    </Ctx.Provider>
  );
}

type ItemProps = React.HTMLAttributes<HTMLDivElement> & { value: string };
export function AccordionItem({ value, className, ...rest }: ItemProps) {
  return <Div data-value={value} className={cx('border rounded-lg', className)} {...rest} />;
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string };
export function AccordionTrigger({ className, ...rest }: TriggerProps) {
  return (
    <ButtonBase
      className={cx('flex w-full items-center justify-between p-3 font-medium', className)}
      {...rest}
    />
  );
}

type ContentProps = React.HTMLAttributes<HTMLDivElement>;
export function AccordionContent({ className, ...rest }: ContentProps) {
  return <Div className={cx('p-3 text-sm text-slate-600', className)} {...rest} />;
}



