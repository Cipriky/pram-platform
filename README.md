# PRAM Platform — Platformă Management Verificări Prize de Pământ

Platformă SaaS production-ready pentru managementul verificărilor PRAM (Prize de pământ și Rezistența de izolație a instalațiilor electrice).

## Stack Tehnic

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js (JWT)
- **Forms**: React Hook Form + Zod
- **UI**: Componente custom (shadcn-style)

## Flux de Business

```
Client → Locație → Programare Verificare → Alocare Tehnician
  → Verificare în teren → Măsurători + Poze + Semnătură
  → Finalizare + Generare Documente → Arhivare
  → Reminder verificare periodică (automată)
```

## Roluri și Permisiuni

| Rol | Capabilități |
|-----|-------------|
| **Admin** | Acces complet, configurare sistem, gestionare utilizatori |
| **Manager** | CRUD clienți/locații/verificări, alocare tehnicieni, rapoarte |
| **Tehnician** | Vizualizare verificări alocate, completare măsurători |
| **Back-office** | CRUD clienți/locații, gestionare documente |
| **Client** | Portal client: vizualizare locații și verificări proprii |

## Instalare și Rulare

### 1. Instalare dependențe

```bash
npm install
```

### 2. Configurare bază de date

Asigurați-vă că aveți PostgreSQL instalat și rulând.

Creați baza de date:
```sql
CREATE DATABASE pram_platform;
```

### 3. Configurare variabile de mediu

Fișierul `.env` a fost creat automat. Modificați:
- `DATABASE_URL` — connection string PostgreSQL
- `NEXTAUTH_SECRET` — cheie secretă (generați cu `openssl rand -base64 32`)

### 4. Migrare bază de date

```bash
# Generați client Prisma
npm run db:generate

# Aplicați schema (development)
npm run db:push

# SAU cu migrări (recomandat pentru producție)
npm run db:migrate
```

### 5. Date demo (seed)

```bash
npm run db:seed
```

Aceasta creează:
- 4 utilizatori test (admin, manager, 2 tehnicieni)
- 3 clienți (ELECTROMOTOR SRL, TEHNOCONST SA, Primărie)
- 4 locații
- 3 aparate de măsură calibrate
- 4 verificări în diverse stări
- Măsurători tehnice realiste
- Remindere și notificări

### 6. Pornire server development

```bash
npm run dev
```

Aplicația rulează la: **http://localhost:3000**

## Conturi Demo

| Rol | Email | Parolă |
|-----|-------|--------|
| Admin | admin@pram.ro | Password123! |
| Manager | manager@pram.ro | Password123! |
| Tehnician | tehnician1@pram.ro | Password123! |
| Back-office | office@pram.ro | Password123! |

## Structura Proiectului

```
src/
├── app/
│   ├── (auth)/              # Login, register
│   │   └── login/
│   ├── (dashboard)/         # Dashboard intern (autentificat)
│   │   ├── dashboard/       # Pagina principală + statistici
│   │   ├── clienti/         # CRUD clienți
│   │   ├── locatii/         # CRUD locații
│   │   ├── verificari/      # CRUD verificări PRAM
│   │   │   └── [id]/
│   │   │       └── finalizeaza/  # Completare teren
│   │   ├── tehnicieni/      # Gestionare echipă
│   │   ├── aparate/         # CRUD aparate de măsură
│   │   ├── documente/       # Registru documente
│   │   ├── setari/          # Configurare (admin only)
│   │   └── profil/          # Profil utilizator
│   ├── portal/              # Portal client
│   └── api/                 # Route handlers REST
│       ├── auth/
│       ├── clienti/
│       ├── locatii/
│       ├── verificari/
│       │   └── [id]/masuratori/
│       ├── aparate/
│       └── utilizatori/
├── components/
│   ├── ui/                  # Componente de bază (Button, Input, Card...)
│   ├── layout/              # Sidebar, Header, PageHeader
│   ├── shared/              # DataTable, StatCard, StatusBadge
│   ├── forms/               # Formulare CRUD
│   └── verificari/          # Componente specifice verificărilor
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── db.ts                # Prisma client singleton
│   ├── permissions.ts       # RBAC
│   ├── utils.ts             # Utilități
│   └── validations/         # Scheme Zod
├── types/                   # TypeScript types
└── middleware.ts             # Auth + rol middleware
prisma/
├── schema.prisma            # Schema DB completă
└── seed.ts                  # Date demo
```

## Modele Bază de Date

- **User** — Utilizatori cu roluri
- **Client** — Clienți (PJ, PF, instituții publice)
- **Locatie** — Locații asociate clienților
- **Verificare** — Verificarea PRAM (entitate centrală)
- **Masuratore** — Măsurători tehnice per verificare
- **AparatMasura** — Aparate de măsură cu etalonare
- **VerificareAparatMasura** — Aparate folosite la verificare
- **PozaVerificare** — Fotografii din teren
- **Document** — Buletine, rapoarte, certificate
- **Contract** — Contracte cu clienții
- **Reminder** — Sistem alerte automate
- **Notificare** — Notificări utilizatori
- **LogActivitate** — Audit trail

## Comenzi Utile

```bash
npm run dev          # Development server
npm run build        # Build producție
npm run db:studio    # Prisma Studio (UI bază de date)
npm run db:seed      # Re-populare date demo
npm run db:reset     # Reset complet bază de date
```

## Producție

1. Setați `NEXTAUTH_SECRET` cu o valoare sigură (`openssl rand -base64 32`)
2. Actualizați `NEXTAUTH_URL` și `NEXT_PUBLIC_APP_URL`
3. Rulați `npm run db:migrate` (nu `db:push`)
4. Build și deploy: `npm run build && npm start`
