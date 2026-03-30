import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

export function Card({ padding = 'md', className, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-sm border border-slate-100',
        paddings[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
