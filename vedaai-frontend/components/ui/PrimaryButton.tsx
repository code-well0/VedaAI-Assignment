import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PrimaryButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  /** Sidebar CTA: dark fill + orange glow border, floating: fixed bottom CTA */
  variant?: 'dark' | 'sidebar' | 'floating';
  fullWidth?: boolean;
  className?: string;
  icon?: ReactNode;
};

const baseClass =
  'veda-body inline-flex items-center justify-center gap-1 min-h-[46px] py-3 px-6 rounded-full border-[1.5px] transition-all align-middle disabled:opacity-50 disabled:pointer-events-none duration-300 ease-out';

const variants = {
  dark: 'bg-[#181818] border-[#181818] text-white hover:bg-[#2a2a2a]',
  sidebar:
    'bg-[#2C2C2C] !border-[3px] border-[#E8762A]/90 text-white shadow-sm hover:bg-[#363636] hover:border-[#E8762A]',
  floating:
    'bg-[#181818] text-white !border-t-white/20 !border-b-transparent !border-x-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:bg-[#252525] hover:-translate-y-0.5',
};

export default function PrimaryButton({
  children,
  href,
  onClick,
  type = 'button',
  disabled,
  variant = 'dark',
  fullWidth,
  className,
  icon,
}: PrimaryButtonProps) {
  const classes = cn(baseClass, variants[variant], fullWidth && 'w-full', className);

  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
