import { z } from 'zod'

export const verificareSchema = z.object({
  tip: z.enum(['VERIFICARE_INITIALA', 'VERIFICARE_PERIODICA', 'VERIFICARE_DUPA_REPARATIE', 'VERIFICARE_LA_CERERE', 'RE_VERIFICARE']),
  locatieId: z.string().min(1, 'Locația este obligatorie'),
  tehnicianId: z.string().optional().nullable(),
  dataProgramata: z.string().min(1, 'Data programată este obligatorie'),
  durataPlanificata: z.number().int().min(30).max(1440).optional().nullable(),
  observatiiProgramare: z.string().optional().nullable(),
})

// Schema pentru UPDATE — toate câmpurile opționale (se trimite doar ce se schimbă)
export const verificareUpdateSchema = z.object({
  tip: z.enum(['VERIFICARE_INITIALA', 'VERIFICARE_PERIODICA', 'VERIFICARE_DUPA_REPARATIE', 'VERIFICARE_LA_CERERE', 'RE_VERIFICARE']).optional(),
  locatieId: z.string().optional(),
  tehnicianId: z.string().optional().nullable(),
  dataProgramata: z.string().optional(),
  durataPlanificata: z.number().int().min(30).max(1440).optional().nullable(),
  observatiiProgramare: z.string().optional().nullable(),
  status: z.enum(['PROGRAMATA', 'IN_DESFASURARE', 'FINALIZATA', 'ANULATA', 'AMANATA']).optional(),
  rezultat: z.enum(['ADMIS', 'RESPINS', 'ADMIS_CU_REZERVE', 'IN_ASTEPTARE']).optional().nullable(),
  observatiiTeren: z.string().optional().nullable(),
  concluzii: z.string().optional().nullable(),
  recomandari: z.string().optional().nullable(),
  semnaturaTehnician: z.string().optional().nullable(),
  semnaturaClient: z.string().optional().nullable(),
  umiditateaSolului: z.enum(['umed', 'uscat', 'foarte_uscat']).optional().nullable(),
})

export const masuratorieSchema = z.object({
  tip: z.enum([
    'REZISTENTA_PRIZE_PAMANT',
    'REZISTENTA_IZOLATIE',
    'CONTINUITATE_CONDUCTOR_PROTECTIE',
    'CURENT_FUGA',
    'TENSIUNE_ATINGERE',
    'TENSIUNE_PAS',
    'IMPEDANTA_BUCLA_DEFECT',
    'CURENT_SCURTCIRCUIT',
    'TIMP_ACTIONARE_DDR',
    'REZISTENTA_CONTACT',
    'ALTELE',
  ]),
  denumire: z.string().min(2, 'Denumirea este obligatorie'),
  localizare: z.string().optional().nullable(),
  valoareMasurata: z.number({ required_error: 'Valoarea măsurată este obligatorie' }),
  unitateMasura: z.string().min(1, 'Unitatea de măsură este obligatorie'),
  valoareAdmisa: z.number().optional().nullable(),
  observatii: z.string().optional().nullable(),
})

export type VerificareFormValues = z.infer<typeof verificareSchema>
export type VerificareUpdateFormValues = z.infer<typeof verificareUpdateSchema>
export type MasuratorieFormValues = z.infer<typeof masuratorieSchema>
