import { z } from 'zod'

export const locatieSchema = z.object({
  denumire: z.string().min(2, 'Denumirea trebuie să aibă cel puțin 2 caractere'),
  tip: z.enum(['SEDIU_PRINCIPAL', 'PUNCT_DE_LUCRU', 'DEPOZIT', 'HALA_PRODUCTIE', 'BIROU', 'ALTELE']),
  clientId: z.string().min(1, 'Clientul este obligatoriu'),
  adresa: z.string().min(5, 'Adresa este obligatorie'),
  oras: z.string().min(2, 'Orașul este obligatoriu'),
  judet: z.string().min(2, 'Județul este obligatoriu'),
  codPostal: z.string().optional().nullable(),
  telefon: z.string().optional().nullable(),
  email: z.string().email('Email invalid').optional().nullable().or(z.literal('')),
  persoanaContact: z.string().optional().nullable(),
  telefonContact: z.string().optional().nullable(),
  status: z.enum(['ACTIVA', 'INACTIVA', 'IN_CONSTRUCTIE']).default('ACTIVA'),
  suprafata: z.number().positive().optional().nullable(),
  descriere: z.string().optional().nullable(),
  coordGPS: z.string().optional().nullable(),
})

export type LocatieFormValues = z.infer<typeof locatieSchema>
