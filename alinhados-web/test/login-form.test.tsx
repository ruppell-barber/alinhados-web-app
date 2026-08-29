import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '@/features/identidade/login-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function renderizar() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe('LoginForm (U01)', () => {
  it('renderiza e-mail, senha e os links de cadastro e recuperação (B10)', () => {
    renderizar();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /esqueci minha senha/i })).toHaveAttribute(
      'href',
      '/recuperar-senha',
    );
    expect(screen.getByRole('link', { name: /criar conta/i })).toHaveAttribute('href', '/cadastro');
  });

  it('mostra erros claros com campos vazios/inválidos (RF09)', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await usuario.type(screen.getByLabelText(/e-mail/i), 'invalido');
    await usuario.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/informe sua senha/i)).toBeInTheDocument();
    });
  });

  it('mostra credenciais incorretas vindas do gateway (mock)', async () => {
    localStorage.clear();
    const usuario = userEvent.setup();
    renderizar();
    await usuario.type(screen.getByLabelText(/e-mail/i), 'ninguem@x.com');
    await usuario.type(screen.getByLabelText(/senha/i), 'senha123');
    await usuario.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(
      () => expect(screen.getByText(/e-mail ou senha incorretos/i)).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
