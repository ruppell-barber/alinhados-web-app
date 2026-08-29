import type { Metadata } from 'next';
import { CadastroForm } from '@/features/identidade/cadastro-form';

export const metadata: Metadata = { title: 'Criar conta' };

export default function PaginaCadastro() {
  return <CadastroForm />;
}
