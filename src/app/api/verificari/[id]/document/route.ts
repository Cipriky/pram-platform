export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { addMonths } from 'date-fns'

const FIRMA_NUME = 'T.A.T.A. CONSULT EX S.R.L.'
const FIRMA_ANRE = 'NR. 12299/2017'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })

  const v = await prisma.verificare.findUnique({
    where: { id: params.id },
    include: {
      locatie: { include: { client: true } },
      tehnician: { select: { prenume: true, nume: true, email: true, telefon: true } },
      masuratori: { orderBy: { createdAt: 'asc' } },
      continuitateAnexe: { orderBy: { createdAt: 'asc' } },
      aparate: { include: { aparat: true } },
    },
  })

  if (!v) return NextResponse.json({ error: 'Nu există' }, { status: 404 })

  const fmt = (d: Date | null | undefined) => {
    if (!d) return '_______________'
    return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const dataEfectuare = fmt(v.dataFinalizare ?? v.dataProgramata)
  const dataExpirare = fmt(addMonths(v.dataFinalizare ?? v.dataProgramata, 6))

  // Extrage umiditate din observatiiTeren ([Umiditate: X])
  let umiditateaSolului = ''
  let observatiiTeren = v.observatiiTeren ?? ''
  const umiditateMatch = observatiiTeren.match(/^\[Umiditate: ([^\]]+)\]\n?/)
  if (umiditateMatch) {
    umiditateaSolului = umiditateMatch[1]
    observatiiTeren = observatiiTeren.replace(umiditateMatch[0], '').trim()
  }

  const umidCheck = (val: string) =>
    umiditateaSolului === val
      ? '&#10003;'  // ✓
      : '&#9633;'   // □

  // Aparatul principal folosit
  const aparat = v.aparate[0]?.aparat
  const aparatText = aparat
    ? `${aparat.producator} ${aparat.model}, nr. serie: ${aparat.serieNumar}`
    : '_______________'

  // Măsurători buletin (toate tipurile din secțiunea Măsurători - Buletin)
  const masuratoriPrizePamant = v.masuratori.filter(m =>
    ['REZISTENTA_PRIZE_PAMANT', 'REZISTENTA_IZOLATIE', 'IMPEDANTA_BUCLA_DEFECT'].includes(m.tip)
  )
  const masuratoriAltele = v.masuratori.filter(m =>
    !['REZISTENTA_PRIZE_PAMANT', 'REZISTENTA_IZOLATIE', 'IMPEDANTA_BUCLA_DEFECT'].includes(m.tip)
  )
  // Anexa B1 — date din secțiunea dedicată Măsurători - Anexe
  const continuitateAnexe = v.continuitateAnexe

  const TIP_MAS: Record<string, string> = {
    REZISTENTA_PRIZE_PAMANT: 'Rezistență priză pământ',
    REZISTENTA_IZOLATIE: 'Rezistență izolație',
    CONTINUITATE_CONDUCTOR_PROTECTIE: 'Continuitate conductor protecție',
    CURENT_FUGA: 'Curent de fugă',
    TENSIUNE_ATINGERE: 'Tensiune de atingere',
    TENSIUNE_PAS: 'Tensiune de pas',
    IMPEDANTA_BUCLA_DEFECT: 'Impedanță buclă defect',
    CURENT_SCURTCIRCUIT: 'Curent scurtcircuit',
    TIMP_ACTIONARE_DDR: 'Timp acționare DDR',
    REZISTENTA_CONTACT: 'Rezistență contact',
    ALTELE: 'Altele',
  }

  const REZ_MAP: Record<string, string> = {
    ADMIS: 'ADMIS',
    RESPINS: 'RESPINS',
    ADMIS_CU_REZERVE: 'ADMIS CU REZERVE',
    IN_ASTEPTARE: 'ÎN AȘTEPTARE',
  }
  const REZ_COLOR: Record<string, string> = {
    ADMIS: '#16a34a',
    RESPINS: '#dc2626',
    ADMIS_CU_REZERVE: '#d97706',
    IN_ASTEPTARE: '#6b7280',
  }

  const rezultatText = v.rezultat ? (REZ_MAP[v.rezultat] ?? v.rezultat) : '—'
  const rezultatColor = v.rezultat ? (REZ_COLOR[v.rezultat] ?? '#6b7280') : '#6b7280'

  const rowsPrizePamant = masuratoriPrizePamant.map(m => `
    <tr>
      <td>${m.denumire}${m.localizare ? ' <span style="color:#888;font-size:9px">(${m.localizare})</span>' : ''}</td>
      <td style="text-align:center;font-weight:700;">${m.valoareMasurata} ${m.unitateMasura}</td>
      <td style="text-align:center;">${m.valoareAdmisa != null ? `${m.valoareAdmisa} ${m.unitateMasura}` : '—'}</td>
      <td style="text-align:center;font-weight:700;color:${m.conformitate === true ? '#16a34a' : m.conformitate === false ? '#dc2626' : '#555'}">
        ${m.conformitate === true ? 'CONFORM' : m.conformitate === false ? 'NECONFORM' : '—'}
      </td>
    </tr>`).join('')

  const rowsAltele = masuratoriAltele.map(m => `
    <tr>
      <td>${TIP_MAS[m.tip] ?? m.tip} — ${m.denumire}</td>
      <td style="text-align:center;font-weight:700;">${m.valoareMasurata} ${m.unitateMasura}</td>
      <td style="text-align:center;">${m.valoareAdmisa != null ? `${m.valoareAdmisa} ${m.unitateMasura}` : '—'}</td>
      <td style="text-align:center;font-weight:700;color:${m.conformitate === true ? '#16a34a' : m.conformitate === false ? '#dc2626' : '#555'}">
        ${m.conformitate === true ? 'CONFORM' : m.conformitate === false ? 'NECONFORM' : '—'}
      </td>
    </tr>`).join('')

  const sigTehnician = v.semnaturaTehnician
    ? `<img src="${v.semnaturaTehnician}" style="max-height:70px;display:block;margin:0 auto;" />`
    : '<div style="height:55px;"></div>'
  const sigClient = v.semnaturaClient
    ? `<img src="${v.semnaturaClient}" style="max-height:70px;display:block;margin:0 auto;" />`
    : '<div style="height:55px;"></div>'

  const html = `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<title>Buletin PRAM ${v.numar}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size:11px; color:#111; background:#fff; padding:20px 28px; max-width:780px; margin:0 auto; }
  @media print {
    body { padding:0; max-width:none; }
    .no-print { display:none !important; }
    @page { margin:1.2cm 1.5cm; size:A4 portrait; }
  }

  /* Header firmă */
  .antet { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px double #1e3a5f; padding-bottom:10px; margin-bottom:14px; }
  .antet-stanga .firma { font-size:15px; font-weight:900; color:#1e3a5f; letter-spacing:0.5px; }
  .antet-stanga .anre { font-size:10px; color:#555; margin-top:3px; }
  .antet-dreapta { text-align:right; }
  .antet-dreapta .titlu-doc { font-size:17px; font-weight:900; color:#1e3a5f; text-transform:uppercase; letter-spacing:1px; }
  .antet-dreapta .nr-doc { font-size:13px; font-weight:700; color:#333; margin-top:3px; }

  /* Câmpuri date */
  .section { margin-bottom:10px; }
  .field-row { display:flex; align-items:baseline; gap:4px; margin-bottom:5px; border-bottom:1px dotted #bbb; padding-bottom:3px; }
  .field-label { font-weight:700; white-space:nowrap; min-width:200px; font-size:10.5px; }
  .field-value { font-size:10.5px; color:#111; flex:1; }

  /* Umiditate */
  .umiditate-row { display:flex; align-items:center; gap:6px; margin-bottom:5px; font-size:10.5px; }
  .umiditate-row .field-label { min-width:200px; font-weight:700; }
  .umiditate-opts { display:flex; gap:14px; }
  .umiditate-opts span { display:flex; align-items:center; gap:4px; }
  .umiditate-opts .check { font-size:14px; font-weight:700; }

  /* Tabele măsurători */
  table { width:100%; border-collapse:collapse; font-size:10px; margin:6px 0; }
  th { background:#1e3a5f; color:#fff; padding:5px 6px; text-align:left; font-size:10px; font-weight:700; }
  td { padding:4px 6px; border:1px solid #ccc; vertical-align:middle; }
  tr:nth-child(even) td { background:#f5f7fa; }

  /* Valori admise */
  .valori-admise { border:1px solid #1e3a5f; border-radius:4px; padding:8px 12px; margin:10px 0; background:#f0f4fa; }
  .valori-admise table { margin:0; font-size:10.5px; }
  .valori-admise td { border:none; padding:2px 6px; background:transparent !important; }
  .valori-admise td:first-child { font-weight:600; }
  .valori-admise td:last-child { font-weight:900; color:#1e3a5f; text-align:right; }

  /* Rezultat */
  .rezultat-box { display:inline-block; padding:5px 14px; border-radius:4px; font-size:13px; font-weight:900; color:#fff; background:${rezultatColor}; letter-spacing:0.5px; }

  /* Semnături */
  .sig-grid { display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-top:20px; }
  .sig-box { text-align:center; }
  .sig-box .sig-label { font-size:9.5px; color:#555; margin-bottom:6px; font-weight:700; text-transform:uppercase; letter-spacing:0.3px; }
  .sig-box .sig-linie { border-bottom:1px solid #333; min-height:60px; margin-bottom:4px; display:flex; align-items:flex-end; justify-content:center; padding-bottom:3px; }
  .sig-box .sig-name { font-size:10px; font-weight:600; }

  /* Nota continuitate */
  .nota-continuitate { font-size:10px; color:#333; border:1px solid #ccc; border-radius:3px; padding:6px 10px; margin:10px 0; background:#fffbf0; }

  /* Footer */
  .footer { margin-top:14px; padding-top:8px; border-top:1px solid #ccc; display:flex; justify-content:space-between; font-size:9px; color:#888; }

  /* Print button */
  .print-btn { position:fixed; bottom:20px; right:20px; background:#1e3a5f; color:#fff; border:none; padding:10px 22px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:700; box-shadow:0 2px 8px rgba(0,0,0,0.2); }
  .print-btn:hover { background:#2d5080; }
</style>
</head>
<body>

<!-- ANTET FIRMĂ -->
<div class="antet">
  <div class="antet-stanga">
    <div class="firma">${FIRMA_NUME}</div>
    <div class="anre">Atestat ANRE ${FIRMA_ANRE}</div>
  </div>
  <div class="antet-dreapta">
    <div class="titlu-doc">Buletin de verificare</div>
    <div class="nr-doc">nr. ${v.numar}</div>
  </div>
</div>

<!-- DATE PRINCIPALE -->
<div class="section">
  <div class="field-row">
    <span class="field-label">Data efectuării măsurătorilor:</span>
    <span class="field-value">${dataEfectuare}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Beneficiar:</span>
    <span class="field-value">${v.locatie.client.denumire}${v.locatie.client.cui ? ` — CUI: ${v.locatie.client.cui}` : ''}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Adresa:</span>
    <span class="field-value">${v.locatie.adresa}, ${v.locatie.oras}, jud. ${v.locatie.judet}</span>
  </div>
  ${v.locatie.persoanaContact ? `
  <div class="field-row">
    <span class="field-label">Persoană contact la locație:</span>
    <span class="field-value">${v.locatie.persoanaContact}${v.locatie.telefonContact ? ' · ' + v.locatie.telefonContact : ''}</span>
  </div>` : ''}
  <div class="field-row">
    <span class="field-label">Metoda folosită la măsurare:</span>
    <span class="field-value">Măsurare cu telurmetrul / megaohmmetrul conform SR EN 62305 și normativul I7</span>
  </div>
  <div class="field-row">
    <span class="field-label">Fabricant, tipul și nr. aparatului:</span>
    <span class="field-value">${aparatText}</span>
  </div>
</div>

<!-- UMIDITATE SOL -->
<div class="umiditate-row">
  <span class="field-label">Aprecierea gradului de umiditate a solului:</span>
  <div class="umiditate-opts">
    <span><span class="check">${umidCheck('umed')}</span> umed</span>
    <span><span class="check">${umidCheck('uscat')}</span> uscat</span>
    <span><span class="check">${umidCheck('foarte_uscat')}</span> foarte uscat</span>
  </div>
</div>

<!-- VALORI MĂSURATE -->
<div style="margin:12px 0 6px;">
  <div style="font-weight:700;font-size:11px;margin-bottom:4px;">Valoarea măsurată a rezistenței de dispersie a instalației de împământare:</div>
  ${masuratoriPrizePamant.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Denumire / Punct de măsurare</th>
        <th style="text-align:center;width:130px;">Valoare măsurată</th>
        <th style="text-align:center;width:110px;">Valoare admisă</th>
        <th style="text-align:center;width:100px;">Conformitate</th>
      </tr>
    </thead>
    <tbody>${rowsPrizePamant}</tbody>
  </table>` : '<p style="font-size:10px;color:#888;padding:6px;">— Nicio măsurătoare de rezistență înregistrată —</p>'}
</div>

${masuratoriAltele.length > 0 ? `
<div style="margin:10px 0 6px;">
  <div style="font-weight:700;font-size:10.5px;margin-bottom:4px;">Alte măsurători efectuate:</div>
  <table>
    <thead>
      <tr>
        <th>Tip / Denumire</th>
        <th style="text-align:center;width:130px;">Valoare măsurată</th>
        <th style="text-align:center;width:110px;">Valoare admisă</th>
        <th style="text-align:center;width:100px;">Conformitate</th>
      </tr>
    </thead>
    <tbody>${rowsAltele}</tbody>
  </table>
</div>` : ''}

<!-- CONCLUZII -->
<div class="section" style="margin-top:10px;">
  <div style="font-weight:700;font-size:11px;margin-bottom:4px;">Concluzii asupra măsurătorii:</div>
  <div style="border:1px solid #ccc;border-radius:3px;padding:7px 10px;min-height:38px;font-size:10.5px;line-height:1.5;background:#fafafa;">
    ${v.concluzii ?? '&nbsp;'}
  </div>
  ${observatiiTeren ? `<div style="margin-top:5px;font-size:10px;color:#555;font-style:italic;padding:4px 8px;background:#f5f5f5;border-radius:3px;">Observații teren: ${observatiiTeren}</div>` : ''}
  ${v.recomandari ? `<div style="margin-top:5px;font-size:10px;padding:5px 8px;background:#fffbf0;border:1px solid #e8d8a0;border-radius:3px;"><strong>Recomandări:</strong> ${v.recomandari}</div>` : ''}
</div>

<!-- REZULTAT FINAL -->
<div style="margin:10px 0;display:flex;align-items:center;gap:12px;">
  <span style="font-weight:700;font-size:11px;">Rezultat verificare:</span>
  <span class="rezultat-box">${rezultatText}</span>
</div>

<!-- VALORI MAXIME ADMISE -->
<div class="valori-admise">
  <div style="font-weight:700;font-size:10.5px;margin-bottom:5px;color:#1e3a5f;">Valori maxime admise conform normativelor în vigoare:</div>
  <table>
    <tr>
      <td>valoare maxim admisă priză de împământare</td>
      <td>= <strong>4 ohmi</strong></td>
    </tr>
    <tr>
      <td>valoare maxim admisă priză paratrăsnet</td>
      <td>= <strong>10 ohmi</strong></td>
    </tr>
    <tr>
      <td>valoare maxim admisă priză împământare comună cu priză paratrăsnet</td>
      <td>= <strong>1 ohm</strong></td>
    </tr>
  </table>
</div>

<!-- TERMEN VALABILITATE -->
<div style="margin:8px 0;padding:6px 10px;background:#e8f4e8;border:1px solid #a5d6a7;border-radius:4px;display:flex;gap:16px;align-items:center;">
  <span style="font-weight:700;font-size:11px;">Termen de valabilitate:</span>
  <span style="font-size:12px;font-weight:900;color:#1a7a1a;">6 LUNI</span>
  <span style="font-size:10px;color:#555;">| Data expirare: <strong>${dataExpirare}</strong></span>
</div>

<!-- NOTA CONTINUITATE -->
<div class="nota-continuitate">
  Au fost efectuate măsurători ale continuității nulului de protecție la prize și tablouri electrice
  conform <strong>ANEXA</strong> la prezenta.
</div>

<!-- SEMNĂTURI -->
<div class="sig-grid">
  <div class="sig-box">
    <div class="sig-label">Electrician executant</div>
    <div class="sig-linie">${sigTehnician}</div>
    <div class="sig-name">${v.tehnician ? v.tehnician.prenume + ' ' + v.tehnician.nume : '_______________'}</div>
    <div style="font-size:9px;color:#888;margin-top:2px;">${FIRMA_NUME}</div>
  </div>
  <div class="sig-box">
    <div class="sig-label">Beneficiar / Reprezentant</div>
    <div class="sig-linie">${sigClient}</div>
    <div class="sig-name">${v.locatie.persoanaContact ?? '_______________'}</div>
    <div style="font-size:9px;color:#888;margin-top:2px;">${v.locatie.client.denumire}</div>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  <span>${FIRMA_NUME} · Atestat ANRE ${FIRMA_ANRE}</span>
  <span>Document generat: ${new Date().toLocaleString('ro-RO')}</span>
</div>

<button class="print-btn no-print" onclick="window.print()">&#128438; Tipărește / Salvează PDF</button>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- PAGINA 2 — ANEXA B1: CONTINUITATI NUL DE PROTECTIE             -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<div style="page-break-before:always; padding-top:8px;">

<!-- ANTET ANEXĂ -->
<div class="antet">
  <div class="antet-stanga">
    <div class="firma">${FIRMA_NUME}</div>
    <div class="anre">Atestat ANRE ${FIRMA_ANRE}</div>
  </div>
  <div class="antet-dreapta">
    <div class="titlu-doc">Anexa buletin de verificare</div>
    <div class="nr-doc">TIP B1 · nr. ${v.numar}</div>
  </div>
</div>

<!-- DATE BENEFICIAR -->
<div class="section">
  <div class="field-row">
    <span class="field-label">Data efectuării măsurătorilor:</span>
    <span class="field-value">${dataEfectuare}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Beneficiar:</span>
    <span class="field-value">${v.locatie.client.denumire}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Adresa:</span>
    <span class="field-value">${v.locatie.adresa}, ${v.locatie.oras}, jud. ${v.locatie.judet}</span>
  </div>
</div>

<!-- TITLU TABEL -->
<div style="font-weight:700;font-size:11px;text-transform:uppercase;margin:10px 0 6px;text-align:center;border:1px solid #1e3a5f;padding:5px;background:#f0f4fa;color:#1e3a5f;border-radius:3px;">
  Au fost verificate următoarele continuități ale nulului de protecție cu centura de împământare / tabloul electric
</div>

<!-- TABEL CONTINUITĂȚI -->
${continuitateAnexe.length > 0 ? `
<table>
  <thead>
    <tr>
      <th style="width:40px;text-align:center;">Nr.</th>
      <th>Denumire spațiu / Echipament</th>
      <th style="text-align:center;width:100px;">NR. TAB / Utilaj</th>
      <th style="text-align:center;width:80px;">Prize 230V</th>
      <th style="text-align:center;width:80px;">Prize 400V</th>
      <th style="text-align:center;width:90px;">Corespunde</th>
    </tr>
  </thead>
  <tbody>
    ${continuitateAnexe.map((c, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${c.denumire}</td>
      <td style="text-align:center;">${c.nrTabUtilaj ?? '—'}</td>
      <td style="text-align:center;font-family:monospace;">${c.nrPrize230V ?? '—'}</td>
      <td style="text-align:center;font-family:monospace;">${c.nrPrize400V ?? '—'}</td>
      <td style="text-align:center;font-weight:700;color:${c.corespunde ? '#16a34a' : '#dc2626'}">
        ${c.corespunde ? 'DA' : 'NU'}
      </td>
    </tr>`).join('')}
  </tbody>
</table>` : `
<div style="border:1px solid #ccc;border-radius:3px;padding:20px;text-align:center;color:#888;font-size:10.5px;margin:8px 0;">
  — Nu au fost înregistrate continuități în secțiunea Măsurători - Anexe —
</div>`}

<!-- NOTA METODĂ -->
<div style="margin:10px 0;font-size:9.5px;color:#555;border-left:3px solid #1e3a5f;padding:4px 8px;background:#f5f7fa;">
  Metoda de măsurare: continuitate conductor de protecție PE conform SR HD 60364-6 și normativul I7.
  Valoarea rezistenței de continuitate admisă ≤ 1 Ω.
</div>

<!-- SEMNĂTURI ANEXĂ -->
<div class="sig-grid" style="margin-top:30px;">
  <div class="sig-box">
    <div class="sig-label">Electrician executant</div>
    <div class="sig-linie">${sigTehnician}</div>
    <div class="sig-name">${v.tehnician ? v.tehnician.prenume + ' ' + v.tehnician.nume : '_______________'}</div>
    <div style="font-size:9px;color:#888;margin-top:2px;">${FIRMA_NUME}</div>
  </div>
  <div class="sig-box">
    <div class="sig-label">Beneficiar / Reprezentant</div>
    <div class="sig-linie">${sigClient}</div>
    <div class="sig-name">${v.locatie.persoanaContact ?? '_______________'}</div>
    <div style="font-size:9px;color:#888;margin-top:2px;">${v.locatie.client.denumire}</div>
  </div>
</div>

<!-- FOOTER ANEXĂ -->
<div class="footer">
  <span>${FIRMA_NUME} · Atestat ANRE ${FIRMA_ANRE} · Anexa B1 — Continuități nul de protecție</span>
  <span>Pagina 2 / 2</span>
</div>

</div>

</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
