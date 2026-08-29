import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from '@/components/ui/tag-input';

describe('TagInput (chips de serviços/valores — RN07)', () => {
  it('adiciona tag com Enter e ignora duplicada (case-insensitive)', async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<TagInput valores={[]} onChange={onChange} />);

    await usuario.type(screen.getByRole('textbox'), 'Degradê{Enter}');
    expect(onChange).toHaveBeenCalledWith(['Degradê']);

    rerender(<TagInput valores={['Degradê']} onChange={onChange} />);
    await usuario.type(screen.getByRole('textbox'), 'degradê{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1); // duplicada não entra
  });

  it('remove tag pelo botão ×', async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput valores={['Barba', 'Navalhado']} onChange={onChange} />);

    await usuario.click(screen.getByRole('button', { name: /remover barba/i }));
    expect(onChange).toHaveBeenCalledWith(['Navalhado']);
  });

  it('bloqueia o campo ao atingir o máximo (RN07)', () => {
    render(<TagInput valores={['a', 'b', 'c']} onChange={vi.fn()} maximo={3} />);
    const campo = screen.getByRole('textbox');
    expect(campo).toBeDisabled();
    expect(campo).toHaveAttribute('placeholder', expect.stringContaining('Máximo de 3'));
  });

  it('adiciona pela sugestão clicável', async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput valores={[]} onChange={onChange} sugestoes={['Pontualidade']} />);

    await usuario.click(screen.getByRole('button', { name: /\+ pontualidade/i }));
    expect(onChange).toHaveBeenCalledWith(['Pontualidade']);
  });
});
