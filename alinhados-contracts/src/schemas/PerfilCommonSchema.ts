import { z } from 'zod';
import { registry } from '../registry/openApi';

export const UserTypeSchema = registry.register(
  'UserTypeSchema',
  z.enum(['barbeiro', 'barbearia'])
);

export const ProfileStatusSchema = registry.register(
  'ProfileStatusSchema',
  z.enum(['disponivel', 'aberto', 'indisponivel', 'pausado', 'banido'])
);
