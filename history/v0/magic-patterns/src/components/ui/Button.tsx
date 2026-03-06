import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}
export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const variants = {
    // Filled white pill — EQX primary CTA
    primary: 'bg-eqx-primary text-eqx-base font-semibold active:opacity-[0.92] disabled:bg-eqx-hairline disabled:text-eqx-secondary',
    // Outline pill — EQX secondary CTA
    secondary: 'bg-transparent border border-eqx-primary text-eqx-primary font-semibold active:opacity-[0.92] disabled:border-eqx-hairline disabled:text-eqx-tertiary',
    // Alias for outline
    outline: 'bg-transparent border border-eqx-hairline text-eqx-primary font-medium active:opacity-[0.92]',
    // Ghost — muted text, no bg
    ghost: 'bg-transparent text-eqx-secondary font-medium active:opacity-[0.92]',
    // Danger — coral outline pill
    danger: 'bg-transparent border border-eqx-coral text-eqx-coral font-semibold active:opacity-[0.92]'
  };
  const sizes = {
    sm: 'h-9 px-4 text-[13px]',
    md: 'h-11 px-5 text-[15px]',
    lg: 'h-14 px-6 text-base',
    icon: 'h-11 w-11 p-0 flex items-center justify-center'
  };
  return <button className={cn('inline-flex items-center justify-center rounded-[9999px] transition-opacity', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eqx-primary/40', 'disabled:pointer-events-none', variants[variant], sizes[size], className)} {...props} />;
}