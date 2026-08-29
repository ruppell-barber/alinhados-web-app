import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LIMITES } from '@/contracts-local';
import { PerfilBarbeariaForm } from '@/features/perfil/perfil-barbearia-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('Campos de comissão, fixo e modelo (E02)', () => {
  it('renderiza o slider de comissão paga limitado a 40–60% (RF34)', () => {
    render(<PerfilBarbeariaForm onSalvar={vi.fn()} />);
    const slider = screen.getByRole('slider', { name: /comissão paga/i });
    expect(slider).toHaveAttribute('min', String(LIMITES.COMISSAO_MIN));
    expect(slider).toHaveAttribute('max', String(LIMITES.COMISSAO_MAX));
  });

  it('mostra o campo de valor só quando "tem fixo" está ligado (RF35)', async () => {
    const usuario = userEvent.setup();
    render(<PerfilBarbeariaForm onSalvar={vi.fn()} />);

    expect(screen.queryByLabelText(/valor do fixo/i)).not.toBeInTheDocument();
    await usuario.click(screen.getByRole('switch', { name: /fixo de segurança/i }));
    expect(screen.getByLabelText(/valor do fixo/i)).toBeInTheDocument();
  });

  it('mostra a descrição do clube só quando o toggle está ligado (RF33)', async () => {
    const usuario = userEvent.setup();
    render(<PerfilBarbeariaForm onSalvar={vi.fn()} />);

    expect(screen.queryByLabelText(/como funciona o clube/i)).not.toBeInTheDocument();
    await usuario.click(screen.getByRole('switch', { name: /clube de assinatura/i }));
    expect(screen.getByLabelText(/como funciona o clube/i)).toBeInTheDocument();
  });

  it('tem toggle de POPs (RF36)', () => {
    render(<PerfilBarbeariaForm onSalvar={vi.fn()} />);
    expect(screen.getByRole('switch', { name: /pops/i })).toBeInTheDocument();
  });
});
