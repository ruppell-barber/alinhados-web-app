import type { Metadata } from 'next';
import { LoginForm } from '@/features/identidade/login-form';

export const metadata: Metadata = { title: 'Entrar' };

export default function PaginaLogin() {
  return <LoginForm />;
}
