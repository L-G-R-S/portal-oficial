import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, 'Nome é obrigatório').max(100),
  role: z.enum(['executivo', 'marketing', 'comercial', 'delivery', 'coe_sap', 'coe_qa', 'people', 'financeiro', 'inovacao']),
});

export const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
