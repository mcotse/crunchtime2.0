import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}
export function Input({
  className,
  label,
  error,
  inputRef,
  ...props
}: InputProps) {
  return <div className="w-full space-y-2">
      {label && <label className="block text-[13px] font-medium text-eqx-secondary uppercase tracking-widest leading-[18px]">
          {label}
        </label>}
      <input ref={inputRef} className={cn(
      // Underline-only style — no box border
      'w-full bg-transparent text-eqx-primary text-base leading-[22px]', 'border-0 border-b outline-none', 'py-2 px-0', 'placeholder:text-eqx-tertiary', error ? 'border-eqx-coral focus:border-eqx-coral' : 'border-eqx-hairline focus:border-eqx-primary', 'transition-colors duration-[120ms]', className)} {...props} />
      {error && <p className="text-[13px] text-eqx-coral leading-[18px]">{error}</p>}
    </div>;
}