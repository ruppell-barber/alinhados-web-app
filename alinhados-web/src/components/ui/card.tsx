import { cn } from '@/lib/utils';

type Tone = 'dark' | 'lime' | 'grape' | 'tangerine' | 'paper';

const tons: Record<Tone, string> = {
  dark: 'bg-ink-soft text-paper border-paper/20',
  lime: 'bg-lime text-ink border-ink shadow-brutal-paper',
  grape: 'bg-grape text-ink border-ink shadow-brutal-paper',
  tangerine: 'bg-tangerine text-ink border-ink shadow-brutal-paper',
  paper: 'bg-paper text-ink border-ink shadow-brutal-paper',
};

export function Card({
  className,
  tone = 'dark',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div
      className={cn('rounded-card border-2 p-5', tons[tone], className)}
      {...props}
    />
  );
}
