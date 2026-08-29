import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

const variantes: Record<Variant, string> = {
  primary:
    'bg-mint text-ink border-2 border-ink shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm',
  secondary:
    'bg-lime text-ink border-2 border-ink shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm',
  outline:
    'bg-transparent text-paper border-2 border-paper hover:bg-paper/10',
  ghost: 'bg-transparent text-paper underline-offset-4 hover:underline',
};

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-display text-base font-bold transition-all disabled:pointer-events-none disabled:opacity-50',
        variantes[variant],
        className,
      )}
      {...props}
    />
  );
}
