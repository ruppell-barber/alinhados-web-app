import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LIMITES } from '@/contracts-local';
import { PerfilBarbeiroForm } from '@/features/perfil/perfil-barbeiro-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('Sliders de comissão e ocupação (B02)', () => {
  it('renderiza o slider de comissão limitado a 40–60% (RF14)', () => {
    render(<PerfilBarbeiroForm onSalvar={vi.fn()} />);
    const slider = screen.getByRole('slider', { name: /comissão desejada/i });
    expect(slider).toHaveAttribute('min', String(LIMITES.COMISSAO_MIN));
    expect(slider).toHaveAttribute('max', String(LIMITES.COMISSAO_MAX));
  });

  it('renderiza o slider de ocupação de 0 a 100% (RF16)', () => {
    render(<PerfilBarbeiroForm onSalvar={vi.fn()} />);
    const slider = screen.getByRole('slider', { name: /taxa de ocupação/i });
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });

  it('tem campo de faturamento mensal (RF15)', () => {
    render(<PerfilBarbeiroForm onSalvar={vi.fn()} />);
    expect(screen.getByLabelText(/faturamento mensal/i)).toBeInTheDocument();
  });

  it('tem campo de recorde de meta (RF18 — critério da B01)', () => {
    render(<PerfilBarbeiroForm onSalvar={vi.fn()} />);
    expect(screen.getByLabelText(/recorde de meta/i)).toBeInTheDocument();
  });

  it('botão (?) revela a explicação da taxa de ocupação (RF26)', async () => {
    const usuario = userEvent.setup();
    render(<PerfilBarbeiroForm onSalvar={vi.fn()} />);
    const botaoInfo = screen.getByRole('button', { name: /mais informações sobre taxa de ocupação/i });
    expect(botaoInfo).toHaveAttribute('aria-expanded', 'false');
    await usuario.click(botaoInfo);
    expect(botaoInfo).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/quanto da sua agenda está preenchida/i)).toBeInTheDocument();
  });
});
