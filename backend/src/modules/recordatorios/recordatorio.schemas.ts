import { z } from 'zod';

export const createRecordatorioSchema = z
  .object({
    eventoId: z.string().uuid('El evento debe tener un UUID válido.'),
  })
  .strict();

export type CreateRecordatorioInput = z.infer<typeof createRecordatorioSchema>;
