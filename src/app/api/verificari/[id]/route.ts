export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { verificareUpdateSchema } from '@/lib/validations/verificare'
import { hasPermission } from '@/lib/permissions'
import { addMonths, subDays, format } from 'date-fns'
import { sendNotificationEmails, sendEmail, emailHtml } from '@/lib/email'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const verificare = await prisma.verificare.findUnique({
    where: { id: params.id },
    include: {
      locatie: { include: { client: true } },
      tehnician: { select: { id: true, prenume: true, nume: true, email: true, telefon: true } },
      creator: { select: { prenume: true, nume: true } },
      masuratori: { orderBy: { createdAt: 'asc' } },
      poze: { orderBy: { pozitie: 'asc' } },
      aparate: { include: { aparat: true } },
      documente: true,
    },
  })

  if (!verificare) return NextResponse.json({ error: 'Verificare negăsită' }, { status: 404 })

  if (session.user.role === 'TEHNICIAN' && verificare.tehnicianId !== session.user.id) {
    return NextResponse.json({ error: 'Acces interzis' }, { status: 403 })
  }

  return NextResponse.json(verificare)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'verifications:write')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  const body = await req.json()
  const validation = verificareUpdateSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ error: 'Date invalide', details: validation.error.flatten() }, { status: 400 })
  }

  const verificareExistenta = await prisma.verificare.findUnique({
    where: { id: params.id },
    include: {
      locatie: { include: { client: true } },
      tehnician: { select: { id: true, prenume: true, nume: true } },
    },
  })

  if (!verificareExistenta) {
    return NextResponse.json({ error: 'Verificare negăsită' }, { status: 404 })
  }

  // Actualizăm DOAR câmpurile prezente în body (permite update parțial)
  const updateData: any = {}
  const d = validation.data
  if (d.tip !== undefined) updateData.tip = d.tip
  if (d.locatieId !== undefined) updateData.locatieId = d.locatieId
  if ('tehnicianId' in d) updateData.tehnicianId = d.tehnicianId ?? null
  if (d.dataProgramata !== undefined) updateData.dataProgramata = new Date(d.dataProgramata)
  if ('durataPlanificata' in d) updateData.durataPlanificata = d.durataPlanificata ?? null
  if ('observatiiProgramare' in d) updateData.observatiiProgramare = d.observatiiProgramare ?? null
  if (d.status !== undefined) updateData.status = d.status
  if ('rezultat' in d) updateData.rezultat = d.rezultat
  if ('observatiiTeren' in d) updateData.observatiiTeren = d.observatiiTeren
  if ('concluzii' in d) updateData.concluzii = d.concluzii
  if ('recomandari' in d) updateData.recomandari = d.recomandari
  if ('semnaturaTehnician' in d) updateData.semnaturaTehnician = d.semnaturaTehnician
  if ('semnaturaClient' in d) updateData.semnaturaClient = d.semnaturaClient

  const eraFinalizata = verificareExistenta.status === 'FINALIZATA'
  const devineFINALIZATA = validation.data.status === 'FINALIZATA' && !eraFinalizata

  if (devineFINALIZATA) {
    updateData.dataFinalizare = new Date()
  }

  if (validation.data.status === 'IN_DESFASURARE' && verificareExistenta.status !== 'IN_DESFASURARE') {
    updateData.dataStartEfectiva = new Date()
  }

  const verificare = await prisma.verificare.update({
    where: { id: params.id },
    data: updateData,
    include: {
      locatie: { include: { client: true } },
      tehnician: { select: { id: true, prenume: true, nume: true } },
    },
  })

  await prisma.logActivitate.create({
    data: {
      userId: session.user.id,
      actiune: 'UPDATE_VERIFICARE',
      entitate: 'Verificare',
      entitateId: verificare.id,
      detalii: JSON.stringify({ status: updateData.status, rezultat: updateData.rezultat }),
    },
  })

  // ─── FINALIZARE: buletin + auto-programare + notificări ──────────────────────
  if (devineFINALIZATA) {
    // Crează automat înregistrarea documentului (buletin PRAM)
    const numarDoc = await genereazaNumarDocument(verificare.numar)
    await prisma.document.create({
      data: {
        numar: numarDoc,
        denumire: `Buletin verificare ${verificare.numar}`,
        tip: 'BULETIN_VERIFICARE',
        status: 'FINAL',
        url: `/api/verificari/${params.id}/document`,
        verificareId: params.id,
        clientId: verificare.locatie.clientId,
        creatDe: session.user.id,
      },
    })

    const dataNouaVerificare = addMonths(new Date(), 6)
    const dataReminder = subDays(dataNouaVerificare, 10)
    const numarNou = await genereazaNumarVerificare()

    // Crează noua verificare periodică la 6 luni
    const verificareNoua = await prisma.verificare.create({
      data: {
        numar: numarNou,
        tip: 'VERIFICARE_PERIODICA',
        status: 'PROGRAMATA',
        dataProgramata: dataNouaVerificare,
        locatieId: verificare.locatieId,
        tehnicianId: verificare.tehnicianId ?? null,
        creatDe: session.user.id,
        observatiiProgramare: `Verificare periodică generată automat din ${verificare.numar}`,
      },
    })

    // Crează reminder cu 10 zile înainte
    await prisma.reminder.create({
      data: {
        tip: 'VERIFICARE_PERIODICA',
        titlu: `Verificare periodică — ${verificare.locatie.denumire}`,
        mesaj: `Verificarea periodică pentru ${verificare.locatie.client.denumire} (${verificare.locatie.denumire}) este programată în 10 zile, pe ${format(dataNouaVerificare, 'dd.MM.yyyy')}.`,
        dataTrigger: dataReminder,
        locatieId: verificare.locatieId,
        verificareId: verificareNoua.id,
      },
    })

    // Găsește toți adminii și managerii activi pentru notificări
    const adminManageri = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER'] }, status: 'ACTIV' },
      select: { id: true },
    })

    const destinatariNotificari = new Set<string>(adminManageri.map(u => u.id))
    // Adaugă și tehnicianul asignat (dacă există)
    if (verificare.tehnicianId) {
      destinatariNotificari.add(verificare.tehnicianId)
    }

    const mesajNotif = `Verificarea ${verificare.numar} a fost finalizată (${verificare.locatie.client.denumire}). Următoarea verificare periodică este programată pe ${format(dataNouaVerificare, 'dd.MM.yyyy')} — număr ${numarNou}.`

    // Notificare finalizare (imediat) pentru toți
    const notificariFinalizare = Array.from(destinatariNotificari).map(userId => ({
      userId,
      tip: 'VERIFICARE_FINALIZATA' as const,
      titlu: `Verificare finalizată: ${verificare.numar}`,
      mesaj: mesajNotif,
      url: `/verificari/${verificare.id}`,
      verificareId: verificare.id,
    }))

    if (notificariFinalizare.length > 0) {
      await prisma.notificare.createMany({ data: notificariFinalizare })
    }

    // Trimite email pentru finalizare
    const userIdsFinalizare = Array.from(destinatariNotificari)
    await sendNotificationEmails(
      userIdsFinalizare,
      `Verificare finalizată: ${verificare.numar}`,
      emailHtml(mesajNotif, `/verificari/${verificare.id}`)
    )

    // Notificare reminder (10 zile înainte) pentru tehnician + firmă
    // Se creează acum dar cu conținut avertizator — sistemul le va marca ca reminder
    const notificariReminder = Array.from(destinatariNotificari).map(userId => ({
      userId,
      tip: 'REMINDER' as const,
      titlu: `Verificare periodică în 10 zile — ${verificare.locatie.denumire}`,
      mesaj: `Verificarea periodică pentru ${verificare.locatie.client.denumire} (${verificare.locatie.denumire}) este programată pe ${format(dataNouaVerificare, 'dd.MM.yyyy')}. Număr verificare: ${numarNou}.`,
      url: `/verificari/${verificareNoua.id}`,
      verificareId: verificareNoua.id,
    }))

    // Salvăm notificările de reminder pentru a fi trimise la data trigger
    // (în MVP le stocăm ca necitite cu data de creare = dataTrigger - se pot procesa cu un cron)
    // Creăm separate în tabelul de remindere, notificările vor fi generate la data trigger
    // Pentru MVP: le creăm direct ca notificări cu citita=false — vor apărea în bell icon
    // Le vom marca cu created_at = data reminder pentru filtrare ulterioară
    // Actual: în MVP fără cron job, le creăm imediat ca notificări "viitoare" necitite
    if (notificariReminder.length > 0) {
      await prisma.notificare.createMany({ data: notificariReminder })
    }

    // Trimite email reminder către admini + tehnician (prin userId)
    const mesajReminderEmail = `Verificarea periodică pentru ${verificare.locatie.client.denumire} (${verificare.locatie.denumire}) este programată pe ${format(dataNouaVerificare, 'dd.MM.yyyy')}. Număr verificare: ${numarNou}.`
    const subiectReminder = `Verificare periodică în 10 zile — ${verificare.locatie.denumire}`
    const htmlReminder = emailHtml(mesajReminderEmail, `/verificari/${verificareNoua.id}`)

    await sendNotificationEmails(Array.from(destinatariNotificari), subiectReminder, htmlReminder)

    // Trimite și către persoana de contact a clientului (email direct, nu user în sistem)
    const emailContact = verificare.locatie.client.emailContact
    if (emailContact) {
      await sendEmail(emailContact, subiectReminder, htmlReminder)
    }
  }

  return NextResponse.json(verificare)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  if (!hasPermission(session.user.role, 'verifications:delete')) {
    return NextResponse.json({ error: 'Permisiune insuficientă' }, { status: 403 })
  }

  await prisma.verificare.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Verificare ștearsă' })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function genereazaNumarVerificare(): Promise<string> {
  const an = new Date().getFullYear()
  const prefix = `VRF-${an}-`
  const ultima = await prisma.verificare.findFirst({
    where: { numar: { startsWith: prefix } },
    orderBy: { numar: 'desc' },
  })
  const numarCurent = ultima
    ? parseInt(ultima.numar.replace(prefix, ''), 10) + 1
    : 1
  return `${prefix}${String(numarCurent).padStart(4, '0')}`
}

async function genereazaNumarDocument(numarVerificare: string): Promise<string> {
  return `DOC-${numarVerificare}`
}
