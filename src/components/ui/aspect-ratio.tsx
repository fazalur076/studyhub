import React from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  ratio?: number; // width / height
  children: React.ReactNode;
};

export function AspectRatio({ ratio = 16 / 9, style, children, ...rest }: Props) {
  const paddingTop = `${(1 / ratio) * 100}%`;
  return (
    <div style={{ position: 'relative', width: '100%', ...style }} {...rest}>
      <div style={{ paddingTop }} />
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
}



