import { z } from 'zod'

export const clientSchema = z.object({
  denumire: z.string().min(2, 'Denumirea trebuie să aibă cel puțin 2 caractere').max(200),
  tip: z.enum(['PERSOANA_JURIDICA', 'PERSOANA_FIZICA', 'INSTITUTIE_PUBLICA']),
  cui: z.string().optional().nullable(),
  nrRegCom: z.string().optional().nullable(),
  adresa: z.string().optional().nullable(),
  oras: z.string().optional().nullable(),
  judet: z.string().optional().nullable(),
  codPostal: z.string().optional().nullable(),
  telefon: z.string().optional().nullable(),
  email: z.string().email('Email invalid').optional().nullable().or(z.literal('')),
  website: z.string().url('URL invalid').optional().nullable().or(z.literal('')),
  persoanaContact: z.string().optional().nullable(),
  telefonContact: z.string().optional().nullable(),
  emailContact: z.string().email('Email contact invalid').optional().nullable().or(z.literal('')),
  status: z.enum(['ACTIV', 'INACTIV', 'PROSPECT']).default('ACTIV'),
  observatii: z.string().optional().nullable(),
})

export type ClientFormValues = z.infer<typeof clientSchema>
