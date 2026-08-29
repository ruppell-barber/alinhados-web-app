import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContratacaoToggle } from '@/features/perfil/contratacao-toggle';

describe('Toggle "parei de contratar" (E08)', () => {
  it('mostra o estado "Contratando" com o toggle ligado', () => {
    render(<ContratacaoToggle estaContratando onChange={vi.fn()} />);
    expect(screen.getByText('Contratando')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /estamos contratando/i })).toBeChecked();
  });

  it('dispara a pausa ao desligar (RF40)', async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    render(<ContratacaoToggle estaContratando onChange={onChange} />);
    await usuario.click(screen.getByRole('switch', { name: /estamos contratando/i }));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('pausado: informa saída do feed, sobreposição das vagas e preservação das conversas', () => {
    render(<ContratacaoToggle estaContratando={false} vagasAbertas={3} onChange={vi.fn()} />);
    expect(screen.getByText('Pausado')).toBeInTheDocument();
    expect(screen.getByText(/feed pausado/i)).toBeInTheDocument();
    expect(screen.getByText(/3 vaga\(s\) aberta\(s\)/i)).toBeInTheDocument();
    expect(screen.getByText(/alinhamentos e conversas ativos não são afetados/i)).toBeInTheDocument();
  });
});
