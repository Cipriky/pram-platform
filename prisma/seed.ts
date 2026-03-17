import { PrismaClient, UserRole, TipClient, TipLocatie, TipVerificare, StatusVerificare, RezultatVerificare, TipMasuratore, StatusAparatMasura } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding PRAM Platform database...')

  // ============================================================
  // UTILIZATORI
  // ============================================================
  const passwordHash = await bcrypt.hash('Password123!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pram.ro' },
    update: {},
    create: {
      email: 'admin@pram.ro',
      password: passwordHash,
      nume: 'Ionescu',
      prenume: 'Alexandru',
      telefon: '0721 000 001',
      role: UserRole.ADMIN,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@pram.ro' },
    update: {},
    create: {
      email: 'manager@pram.ro',
      password: passwordHash,
      nume: 'Popescu',
      prenume: 'Maria',
      telefon: '0721 000 002',
      role: UserRole.MANAGER,
    },
  })

  const teh1 = await prisma.user.upsert({
    where: { email: 'tehnician1@pram.ro' },
    update: {},
    create: {
      email: 'tehnician1@pram.ro',
      password: passwordHash,
      nume: 'Dumitrescu',
      prenume: 'Mihai',
      telefon: '0721 000 003',
      role: UserRole.TEHNICIAN,
    },
  })

  const teh2 = await prisma.user.upsert({
    where: { email: 'tehnician2@pram.ro' },
    update: {},
    create: {
      email: 'tehnician2@pram.ro',
      password: passwordHash,
      nume: 'Constantin',
      prenume: 'Andrei',
      telefon: '0721 000 004',
      role: UserRole.TEHNICIAN,
    },
  })

  const backOffice = await prisma.user.upsert({
    where: { email: 'office@pram.ro' },
    update: {},
    create: {
      email: 'office@pram.ro',
      password: passwordHash,
      nume: 'Marinescu',
      prenume: 'Elena',
      telefon: '0721 000 005',
      role: UserRole.BACK_OFFICE,
    },
  })

  console.log('✅ Utilizatori creați')

  // ============================================================
  // CLIENȚI
  // ============================================================
  const client1 = await prisma.client.upsert({
    where: { cod: 'CLT-2024-0001' },
    update: {},
    create: {
      cod: 'CLT-2024-0001',
      denumire: 'ELECTROMOTOR SRL',
      tip: TipClient.PERSOANA_JURIDICA,
      cui: 'RO12345678',
      nrRegCom: 'J40/1234/2010',
      adresa: 'Str. Industriilor nr. 15',
      oras: 'București',
      judet: 'Ilfov',
      codPostal: '077040',
      telefon: '021 300 1001',
      email: 'office@electromotor.ro',
      persoanaContact: 'Gheorghe Popa',
      telefonContact: '0722 100 001',
      emailContact: 'g.popa@electromotor.ro',
    },
  })

  const client2 = await prisma.client.upsert({
    where: { cod: 'CLT-2024-0002' },
    update: {},
    create: {
      cod: 'CLT-2024-0002',
      denumire: 'TEHNOCONST SA',
      tip: TipClient.PERSOANA_JURIDICA,
      cui: 'RO23456789',
      nrRegCom: 'J12/567/2008',
      adresa: 'Bulevardul Muncii nr. 42',
      oras: 'Cluj-Napoca',
      judet: 'Cluj',
      codPostal: '400641',
      telefon: '0264 400 200',
      email: 'contact@tehnoconst.ro',
      persoanaContact: 'Ioana Mureșan',
      telefonContact: '0740 200 002',
      emailContact: 'i.muresan@tehnoconst.ro',
    },
  })

  const client3 = await prisma.client.upsert({
    where: { cod: 'CLT-2024-0003' },
    update: {},
    create: {
      cod: 'CLT-2024-0003',
      denumire: 'PRIMĂRIA ORAȘULUI CÂMPINA',
      tip: TipClient.INSTITUTIE_PUBLICA,
      cui: '2842571',
      adresa: 'B-dul Carol I nr. 12',
      oras: 'Câmpina',
      judet: 'Prahova',
      codPostal: '105600',
      telefon: '0244 336 001',
      email: 'secretariat@campina.ro',
      persoanaContact: 'Vasile Niculescu',
      telefonContact: '0724 300 003',
    },
  })

  console.log('✅ Clienți creați')

  // ============================================================
  // LOCAȚII
  // ============================================================
  const loc1 = await prisma.locatie.upsert({
    where: { cod: 'LOC-2024-0001' },
    update: {},
    create: {
      cod: 'LOC-2024-0001',
      denumire: 'Hală Producție Nord',
      tip: TipLocatie.HALA_PRODUCTIE,
      adresa: 'Str. Industriilor nr. 15, Hala A',
      oras: 'București',
      judet: 'Ilfov',
      codPostal: '077040',
      telefon: '021 300 1002',
      persoanaContact: 'Ion Badea',
      telefonContact: '0722 100 010',
      suprafata: 2500,
      clientId: client1.id,
    },
  })

  const loc2 = await prisma.locatie.upsert({
    where: { cod: 'LOC-2024-0002' },
    update: {},
    create: {
      cod: 'LOC-2024-0002',
      denumire: 'Depozit Central',
      tip: TipLocatie.DEPOZIT,
      adresa: 'Str. Industriilor nr. 15, Depozit B',
      oras: 'București',
      judet: 'Ilfov',
      codPostal: '077040',
      persoanaContact: 'Nicolae Stoica',
      telefonContact: '0722 100 011',
      suprafata: 800,
      clientId: client1.id,
    },
  })

  const loc3 = await prisma.locatie.upsert({
    where: { cod: 'LOC-2024-0003' },
    update: {},
    create: {
      cod: 'LOC-2024-0003',
      denumire: 'Sediu Administrativ Cluj',
      tip: TipLocatie.SEDIU_PRINCIPAL,
      adresa: 'Bulevardul Muncii nr. 42, et. 3',
      oras: 'Cluj-Napoca',
      judet: 'Cluj',
      codPostal: '400641',
      telefon: '0264 400 201',
      persoanaContact: 'Radu Pop',
      telefonContact: '0742 200 020',
      suprafata: 450,
      clientId: client2.id,
    },
  })

  const loc4 = await prisma.locatie.upsert({
    where: { cod: 'LOC-2024-0004' },
    update: {},
    create: {
      cod: 'LOC-2024-0004',
      denumire: 'Sediu Primărie',
      tip: TipLocatie.SEDIU_PRINCIPAL,
      adresa: 'B-dul Carol I nr. 12',
      oras: 'Câmpina',
      judet: 'Prahova',
      codPostal: '105600',
      telefon: '0244 336 001',
      persoanaContact: 'Vasile Niculescu',
      telefonContact: '0724 300 003',
      suprafata: 1200,
      clientId: client3.id,
    },
  })

  console.log('✅ Locații create')

  // ============================================================
  // APARATE DE MĂSURĂ
  // ============================================================
  const aparat1 = await prisma.aparatMasura.upsert({
    where: { cod: 'APM-2024-0001' },
    update: {},
    create: {
      cod: 'APM-2024-0001',
      denumire: 'Telurmetru digital',
      producator: 'METREL',
      model: 'MI 2124',
      serieNumar: 'MI2124-00123',
      anFabricatie: 2020,
      dataAchizitie: new Date('2020-06-15'),
      dataUltimaEtalonare: new Date('2024-01-10'),
      dataUrmatoareEtalonare: new Date('2025-01-10'),
      certificatEtalonare: 'CET-2024-0045',
      status: StatusAparatMasura.ACTIV,
    },
  })

  const aparat2 = await prisma.aparatMasura.upsert({
    where: { cod: 'APM-2024-0002' },
    update: {},
    create: {
      cod: 'APM-2024-0002',
      denumire: 'Megohmetru 5kV',
      producator: 'FLUKE',
      model: '1550C',
      serieNumar: 'FLK1550C-00456',
      anFabricatie: 2021,
      dataAchizitie: new Date('2021-03-20'),
      dataUltimaEtalonare: new Date('2024-03-15'),
      dataUrmatoareEtalonare: new Date('2025-03-15'),
      certificatEtalonare: 'CET-2024-0102',
      status: StatusAparatMasura.ACTIV,
    },
  })

  const aparat3 = await prisma.aparatMasura.upsert({
    where: { cod: 'APM-2024-0003' },
    update: {},
    create: {
      cod: 'APM-2024-0003',
      denumire: 'Tester instalații electrice',
      producator: 'SONEL',
      model: 'MPI-530',
      serieNumar: 'SNL530-00789',
      anFabricatie: 2022,
      dataAchizitie: new Date('2022-09-01'),
      dataUltimaEtalonare: new Date('2024-09-05'),
      dataUrmatoareEtalonare: new Date('2025-09-05'),
      certificatEtalonare: 'CET-2024-0287',
      status: StatusAparatMasura.ACTIV,
    },
  })

  console.log('✅ Aparate de măsură create')

  // ============================================================
  // VERIFICĂRI
  // ============================================================
  const verf1 = await prisma.verificare.upsert({
    where: { numar: 'VRF-2024-0001' },
    update: {},
    create: {
      numar: 'VRF-2024-0001',
      tip: TipVerificare.VERIFICARE_PERIODICA,
      status: StatusVerificare.FINALIZATA,
      rezultat: RezultatVerificare.ADMIS,
      dataProgramata: new Date('2024-03-15 09:00'),
      dataStartEfectiva: new Date('2024-03-15 09:15'),
      dataFinalizare: new Date('2024-03-15 12:30'),
      durataPlanificata: 180,
      durataEfectiva: 195,
      locatieId: loc1.id,
      tehnicianId: teh1.id,
      creatDe: manager.id,
      observatiiProgramare: 'Verificare periodică conform contract nr. CTR-2023-0001',
      observatiiTeren: 'Instalație în stare bună. S-au identificat 2 prize de pământ cu rezistență ușor ridicată.',
      concluzii: 'Instalația electrică ADMISĂ. Priza de pământ PT01 necesită refacere parțială.',
      recomandari: 'Se recomandă refacerea prizei de pământ PT01 în maxim 30 de zile.',
    },
  })

  // Măsurători pentru verificarea 1
  await prisma.masuratore.createMany({
    data: [
      {
        verificareId: verf1.id,
        tip: TipMasuratore.REZISTENTA_PRIZE_PAMANT,
        denumire: 'Priză pământ tablou principal PT01',
        localizare: 'Tablou electric principal, Hala A',
        valoareMasurata: 3.8,
        unitateMasura: 'Ω',
        valoareAdmisa: 4.0,
        conformitate: true,
        observatii: 'Valoare apropiată de limită, se recomandă îmbunătățire',
      },
      {
        verificareId: verf1.id,
        tip: TipMasuratore.REZISTENTA_PRIZE_PAMANT,
        denumire: 'Priză pământ tablou secundar PT02',
        localizare: 'Tablou electric secundar, zona 2',
        valoareMasurata: 1.2,
        unitateMasura: 'Ω',
        valoareAdmisa: 4.0,
        conformitate: true,
      },
      {
        verificareId: verf1.id,
        tip: TipMasuratore.REZISTENTA_IZOLATIE,
        denumire: 'Izolație circuit iluminat',
        localizare: 'Tablou principal - circuit 1',
        valoareMasurata: 520,
        unitateMasura: 'MΩ',
        valoareAdmisa: 1,
        conformitate: true,
      },
      {
        verificareId: verf1.id,
        tip: TipMasuratore.CONTINUITATE_CONDUCTOR_PROTECTIE,
        denumire: 'Continuitate PE tablou principal',
        localizare: 'Tablou principal',
        valoareMasurata: 0.08,
        unitateMasura: 'Ω',
        valoareAdmisa: 1.0,
        conformitate: true,
      },
    ],
    skipDuplicates: true,
  })

  // Aparate folosite la verificare 1
  await prisma.verificareAparatMasura.createMany({
    data: [
      { verificareId: verf1.id, aparatId: aparat1.id },
      { verificareId: verf1.id, aparatId: aparat2.id },
    ],
    skipDuplicates: true,
  })

  const verf2 = await prisma.verificare.upsert({
    where: { numar: 'VRF-2024-0002' },
    update: {},
    create: {
      numar: 'VRF-2024-0002',
      tip: TipVerificare.VERIFICARE_PERIODICA,
      status: StatusVerificare.FINALIZATA,
      rezultat: RezultatVerificare.ADMIS_CU_REZERVE,
      dataProgramata: new Date('2024-05-20 10:00'),
      dataStartEfectiva: new Date('2024-05-20 10:30'),
      dataFinalizare: new Date('2024-05-20 14:00'),
      durataPlanificata: 210,
      durataEfectiva: 210,
      locatieId: loc3.id,
      tehnicianId: teh2.id,
      creatDe: manager.id,
      concluzii: 'Instalația electrică ADMISĂ CU REZERVE. Există circuit cu rezistență de izolație sub normativ.',
      recomandari: 'Circuitul 5 (prize forță) necesită verificare cablu și înlocuire dacă este degradat.',
    },
  })

  const verf3 = await prisma.verificare.upsert({
    where: { numar: 'VRF-2024-0003' },
    update: {},
    create: {
      numar: 'VRF-2024-0003',
      tip: TipVerificare.VERIFICARE_PERIODICA,
      status: StatusVerificare.PROGRAMATA,
      dataProgramata: new Date('2025-01-15 09:00'),
      durataPlanificata: 240,
      locatieId: loc4.id,
      tehnicianId: teh1.id,
      creatDe: manager.id,
      observatiiProgramare: 'Verificare periodică anuală sediu primărie.',
    },
  })

  const verf4 = await prisma.verificare.upsert({
    where: { numar: 'VRF-2024-0004' },
    update: {},
    create: {
      numar: 'VRF-2024-0004',
      tip: TipVerificare.VERIFICARE_PERIODICA,
      status: StatusVerificare.IN_DESFASURARE,
      dataProgramata: new Date('2024-12-10 08:00'),
      dataStartEfectiva: new Date('2024-12-10 08:15'),
      durataPlanificata: 180,
      locatieId: loc2.id,
      tehnicianId: teh1.id,
      creatDe: manager.id,
    },
  })

  console.log('✅ Verificări create')

  // ============================================================
  // REMINDERE
  // ============================================================
  await prisma.reminder.createMany({
    data: [
      {
        tip: 'VERIFICARE_PERIODICA',
        titlu: 'Verificare periodică - Hală Producție Nord',
        mesaj: 'Locația Hală Producție Nord (ELECTROMOTOR SRL) necesită verificare periodică în 30 de zile.',
        dataTrigger: new Date('2025-02-15'),
        locatieId: loc1.id,
        verificareId: verf1.id,
      },
      {
        tip: 'ETALONARE_APARAT',
        titlu: 'Etalonare Telurmetru METREL MI2124',
        mesaj: 'Aparatul de măsură APM-2024-0001 necesită etalonare periodică.',
        dataTrigger: new Date('2024-12-10'),
      },
      {
        tip: 'VERIFICARE_PERIODICA',
        titlu: 'Verificare periodică - Sediu Primărie Câmpina',
        mesaj: 'Locația Sediu Primărie necesită verificare periodică.',
        dataTrigger: new Date('2025-01-01'),
        locatieId: loc4.id,
        verificareId: verf3.id,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Remindere create')

  // ============================================================
  // NOTIFICĂRI
  // ============================================================
  await prisma.notificare.createMany({
    data: [
      {
        userId: manager.id,
        tip: 'VERIFICARE_FINALIZATA',
        titlu: 'Verificare finalizată',
        mesaj: 'Verificarea VRF-2024-0001 la Hală Producție Nord a fost finalizată cu rezultat ADMIS.',
        verificareId: verf1.id,
        url: `/verificari/${verf1.id}`,
      },
      {
        userId: manager.id,
        tip: 'REMINDER',
        titlu: 'Etalonare aparat necesară',
        mesaj: 'Telurmetrul METREL MI2124 are etalonarea expirată în 30 zile.',
        url: '/aparate',
      },
      {
        userId: teh1.id,
        tip: 'VERIFICARE_PROGRAMATA',
        titlu: 'Verificare programată mâine',
        mesaj: 'Aveți o verificare programată la Sediu Primărie Câmpina pe 15 ianuarie 2025.',
        verificareId: verf3.id,
        url: `/verificari/${verf3.id}`,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Notificări create')
  console.log('')
  console.log('🎉 Seed completat cu succes!')
  console.log('')
  console.log('📋 Credențiale test:')
  console.log('  Admin:      admin@pram.ro / Password123!')
  console.log('  Manager:    manager@pram.ro / Password123!')
  console.log('  Tehnician:  tehnician1@pram.ro / Password123!')
  console.log('  Back-office: office@pram.ro / Password123!')
}

main()
  .catch((e) => {
    console.error('❌ Eroare la seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
