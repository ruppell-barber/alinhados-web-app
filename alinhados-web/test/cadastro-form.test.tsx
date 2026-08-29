import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CadastroForm } from '@/features/identidade/cadastro-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function renderizar() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CadastroForm />
    </QueryClientProvider>,
  );
}

describe('CadastroForm (U01)', () => {
  it('renderiza os campos exigidos pelo RF09', () => {
    renderizar();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /sou barbeiro/i })).toBeChecked();
  });

  it('troca o documento de CPF para CNPJ ao selecionar barbearia', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await usuario.click(screen.getByRole('radio', { name: /sou barbearia/i }));
    expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
  });

  it('mostra mensagens de erro claras com dados inválidos (RF09)', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await usuario.type(screen.getByLabelText(/e-mail/i), 'email-invalido');
    await usuario.type(screen.getByLabelText(/cpf/i), '111.111.111-11');
    await usuario.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/a senha precisa ter pelo menos 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('aplica máscara de CPF enquanto digita', async () => {
    const usuario = userEvent.setup();
    renderizar();
    const campo = screen.getByLabelText(/cpf/i);
    await usuario.type(campo, '52998224725');
    expect(campo).toHaveValue('529.982.247-25');
  });
});
