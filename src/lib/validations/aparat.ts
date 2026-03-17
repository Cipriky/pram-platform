import { z } from 'zod'

export const aparatMasuraSchema = z.object({
  denumire: z.string().min(2, 'Denumirea este obligatorie'),
  producator: z.string().min(1, 'Producătorul este obligatoriu'),
  model: z.string().min(1, 'Modelul este obligatoriu'),
  serieNumar: z.string().min(1, 'Numărul de serie este obligatoriu'),
  anFabricatie: z.number().int().min(1990).max(new Date().getFullYear()).optional().nullable(),
  dataAchizitie: z.string().optional().nullable(),
  dataUltimaEtalonare: z.string().optional().nullable(),
  dataUrmatoareEtalonare: z.string().optional().nullable(),
  certificatEtalonare: z.string().optional().nullable(),
  status: z.enum(['ACTIV', 'IN_SERVICE', 'DEFECT', 'CASSAT']).default('ACTIV'),
  observatii: z.string().optional().nullable(),
})

export type AparatMasuraFormValues = z.infer<typeof aparatMasuraSchema>
