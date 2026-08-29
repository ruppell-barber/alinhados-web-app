import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ResumoAlinhamento } from '@/contracts-local';
import { OverlayAlinhamento } from '@/features/matching/overlay-alinhamento';

const RESUMO: ResumoAlinhamento = {
  id: 'a1',
  contraparte: {
    id: 'c1',
    nome: 'Barbearia do Zé',
    avatar_url: null,
    cidade: 'São Paulo',
    estado: 'SP',
    tipo: 'barbearia',
  },
  status: 'ativo',
  deu_certo: false,
  created_at: new Date().toISOString(),
};

describe('OverlayAlinhamento (B06/E06)', () => {
  it('mostra a contraparte e os dois botões (RF67/RF68)', () => {
    render(
      <OverlayAlinhamento
        alinhamento={RESUMO}
        onIrParaConversa={() => {}}
        onContinuar={() => {}}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Alinhamento encontrado/i)).toBeInTheDocument();
    expect(screen.getByText(/Barbearia do Zé/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir para a conversa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar navegando/i })).toBeInTheDocument();
  });

  it('"Continuar navegando" só dispensa o overlay (não bloqueia a navegação)', async () => {
    const onContinuar = vi.fn();
    render(
      <OverlayAlinhamento
        alinhamento={RESUMO}
        onIrParaConversa={() => {}}
        onContinuar={onContinuar}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Continuar navegando/i }));
    expect(onContinuar).toHaveBeenCalledOnce();
  });
});
