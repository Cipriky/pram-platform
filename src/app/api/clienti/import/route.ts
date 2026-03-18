export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import * as XLSX from 'xlsx'
import { addMonths } from 'date-fns'

async function genereazaCodClient(): Promise<string> {
  const an = new Date().getFullYear()
  const prefix = `CLT-${an}-`
  const ultimul = await prisma.client.findFirst({
    where: { cod: { startsWith: prefix } },
    orderBy: { cod: 'desc' },
  })
  const nr = ultimul ? parseInt(ultimul.cod.replace(prefix, ''), 10) + 1 : 1
  return `${prefix}${String(nr).padStart(4, '0')}`
}

async function genereazaCodLocatie(): Promise<string> {
  const an = new Date().getFullYear()
  const prefix = `LOC-${an}-`
  const ultimul = await prisma.locatie.findFirst({
    where: { cod: { startsWith: prefix } },
    orderBy: { cod: 'desc' },
  })
  const nr = ultimul ? parseInt(ultimul.cod.replace(prefix, ''), 10) + 1 : 1
  return `${prefix}${String(nr).padStart(4, '0')}`
}

async function genereazaCodVerificare(): Promise<string> {
  const an = new Date().getFullYear()
  const prefix = `VRF-${an}-`
  const ultimul = await prisma.verificare.findFirst({
    where: { numar: { startsWith: prefix } },
    orderBy: { numar: 'desc' },
  })
  const nr = ultimul ? parseInt(ultimul.numar.replace(prefix, ''), 10) + 1 : 1
  return `${prefix}${String(nr).padStart(4, '0')}`
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!session || !['ADMIN', 'MANAGER', 'BACK_OFFICE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'Niciun fișier' }, { status: 400 })

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  const rezultate: { denumire: string; status: 'creat' | 'eroare'; mesaj?: string }[] = []

  for (const row of rows) {
    const denumire = String(row['Denumire'] ?? row['denumire'] ?? '').trim()
    if (!denumire) continue

    try {
      // Parsează data ultimei verificări
      let dataUltimaVerificare: Date | null = null
      const dataRaw = row['Data ultima verificare'] ?? row['data_ultima_verificare'] ?? ''
      if (dataRaw) {
        if (dataRaw instanceof Date) {
          dataUltimaVerificare = dataRaw
        } else {
          const str = String(dataRaw).trim()
          // Suportă dd.mm.yyyy și dd/mm/yyyy
          const parts = str.split(/[.\/\-]/)
          if (parts.length === 3) {
            const [zi, luna, an] = parts
            dataUltimaVerificare = new Date(Number(an), Number(luna) - 1, Number(zi))
          }
        }
      }

      const codClient = await genereazaCodClient()
      const client = await prisma.client.create({
        data: {
          cod: codClient,
          denumire,
          cui: String(row['CUI'] ?? row['cui'] ?? '').trim() || null,
          adresa: String(row['Adresa'] ?? row['adresa'] ?? '').trim() || null,
          oras: String(row['Oras'] ?? row['oras'] ?? row['Oraș'] ?? '').trim() || null,
          judet: String(row['Judet'] ?? row['judet'] ?? row['Județ'] ?? '').trim() || null,
          telefon: String(row['Telefon'] ?? row['telefon'] ?? '').trim() || null,
          email: String(row['Email'] ?? row['email'] ?? '').trim() || null,
          persoanaContact: String(row['Persoana contact'] ?? row['persoana_contact'] ?? '').trim() || null,
          telefonContact: String(row['Telefon contact'] ?? row['telefon_contact'] ?? '').trim() || null,
          emailContact: String(row['Email contact'] ?? row['email_contact'] ?? '').trim() || null,
        },
      })

      // Crează locație principală
      const codLocatie = await genereazaCodLocatie()
      const locatie = await prisma.locatie.create({
        data: {
          cod: codLocatie,
          denumire: `Sediu ${denumire}`,
          adresa: String(row['Adresa'] ?? '').trim() || 'Adresă nespecificată',
          oras: String(row['Oras'] ?? row['Oraș'] ?? '').trim() || 'Nespecificat',
          judet: String(row['Judet'] ?? row['Județ'] ?? '').trim() || 'Nespecificat',
          clientId: client.id,
        },
      })

      // Dacă are dată ultima verificare → crează verificare programată la +6 luni
      if (dataUltimaVerificare && !isNaN(dataUltimaVerificare.getTime())) {
        const dataNouaVerificare = addMonths(dataUltimaVerificare, 6)
        const numarVerificare = await genereazaCodVerificare()
        await prisma.verificare.create({
          data: {
            numar: numarVerificare,
            tip: 'VERIFICARE_PERIODICA',
            status: 'PROGRAMATA',
            dataProgramata: dataNouaVerificare,
            locatieId: locatie.id,
            creatDe: session.user.id,
            observatiiProgramare: `Importat din Excel. Ultima verificare: ${dataUltimaVerificare.toLocaleDateString('ro-RO')}`,
          },
        })
      }

      rezultate.push({ denumire, status: 'creat' })
    } catch (err: any) {
      rezultate.push({ denumire, status: 'eroare', mesaj: err?.message ?? 'Eroare necunoscută' })
    }
  }

  return NextResponse.json({ rezultate })
}
