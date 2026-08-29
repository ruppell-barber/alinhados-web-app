import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  apareceNoFeed,
  carregarStatusLocal,
  salvarStatusLocal,
  STATUS_BARBEIRO,
} from '@/features/perfil/status';
import { StatusSelector } from '@/features/perfil/status-selector';

describe('status de disponibilidade (B09)', () => {
  beforeEach(() => localStorage.clear());

  it('oferece os três status do barbeiro (RF24) e nunca o "pausado" da barbearia', () => {
    const valores = STATUS_BARBEIRO.map((s) => s.valor);
    expect(valores).toEqual(['disponivel', 'aberto', 'indisponivel']);
  });

  it('aplica a regra de feed RN05/RN06', () => {
    expect(apareceNoFeed('disponivel')).toBe(true);
    expect(apareceNoFeed('aberto')).toBe(true);
    expect(apareceNoFeed('indisponivel')).toBe(false);
    expect(apareceNoFeed('pausado')).toBe(false);
  });

  it('persiste e recarrega o status, com default "disponivel"', () => {
    expect(carregarStatusLocal('u1')).toBe('disponivel');
    salvarStatusLocal('u1', 'aberto');
    expect(carregarStatusLocal('u1')).toBe('aberto');
  });

  it('mostra o aviso de saída do feed ao marcar "Não disponível" (RN05)', async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <StatusSelector status="disponivel" onChange={onChange} estaDesempregado={false} />,
    );

    await usuario.click(screen.getByRole('radio', { name: /não disponível/i }));
    expect(onChange).toHaveBeenCalledWith('indisponivel');

    rerender(<StatusSelector status="indisponivel" onChange={onChange} estaDesempregado={false} />);
    expect(screen.getByText(/saiu do feed/i)).toBeInTheDocument();
    expect(screen.getByText(/fora do feed/i)).toBeInTheDocument();
    // Seção 6.3 — fluxo pós-contratação
    expect(screen.getByText(/conseguiu contratação/i)).toBeInTheDocument();
  });

  it('exibe o vínculo atual (RF25)', () => {
    render(
      <StatusSelector
        status="aberto"
        onChange={vi.fn()}
        barbeariaAtual="Brutal Cuts"
        estaDesempregado={false}
      />,
    );
    expect(screen.getByText(/vínculo atual: brutal cuts/i)).toBeInTheDocument();
  });
});
