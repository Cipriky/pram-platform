'use client'

import { useState, useRef } from 'react'
import { Upload, X, CheckCircle2, AlertCircle, Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

type Rezultat = { denumire: string; status: 'creat' | 'eroare'; mesaj?: string }

export function ImportClientiButton() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [rezultate, setRezultate] = useState<Rezultat[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFile = (f: File) => {
    setFile(f)
    setRezultate(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array', cellDates: true })
      const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
      setPreview(rows.slice(0, 5))
    }
    reader.readAsArrayBuffer(f)
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/clienti/import', { method: 'POST', body: fd })
    const json = await res.json()
    setRezultate(json.rezultate)
    setLoading(false)
    router.refresh()
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Denumire', 'CUI', 'Adresa', 'Oras', 'Judet', 'Telefon', 'Email', 'Persoana contact', 'Telefon contact', 'Email contact', 'Data ultima verificare'],
      ['Exemplu SRL', 'RO12345678', 'Str. Exemplu nr. 1', 'Cluj-Napoca', 'Cluj', '0700000000', 'office@exemplu.ro', 'Ion Popescu', '0721000000', 'ion@exemplu.ro', '15.09.2024'],
    ])
    ws['!cols'] = Array(11).fill({ wch: 22 })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Clienti')
    XLSX.writeFile(wb, 'template_import_clienti.xlsx')
  }

  const reset = () => {
    setOpen(false)
    setFile(null)
    setPreview([])
    setRezultate(null)
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Import Excel
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-bold">Import clienți din Excel</h2>
            <p className="text-sm text-gray-500 mt-0.5">Importă mai mulți clienți dintr-un fișier .xlsx</p>
          </div>
          <button onClick={reset} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Download template */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div>
              <p className="text-sm font-medium text-blue-800">Descarcă șablonul Excel</p>
              <p className="text-xs text-blue-600 mt-0.5">Completează datele în formatul corect, inclusiv data ultimei verificări (dd.mm.yyyy)</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Șablon
            </Button>
          </div>

          {/* Upload area */}
          {!rezultate && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              {file ? (
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">Trage fișierul Excel aici sau apasă pentru a selecta</p>
                  <p className="text-xs text-gray-400 mt-1">Fișiere .xlsx sau .xls acceptate</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && !rezultate && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Previzualizare (primele {preview.length} rânduri):</p>
              <div className="overflow-x-auto rounded-lg border text-xs">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map(k => (
                        <th key={k} className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((v: any, j) => (
                          <td key={j} className="px-3 py-1.5 text-gray-700 whitespace-nowrap">
                            {v instanceof Date ? v.toLocaleDateString('ro-RO') : String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rezultate */}
          {rezultate && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Rezultat: <span className="text-green-600">{rezultate.filter(r => r.status === 'creat').length} creați</span>
                {rezultate.filter(r => r.status === 'eroare').length > 0 && (
                  <span className="text-red-600 ml-2">{rezultate.filter(r => r.status === 'eroare').length} erori</span>
                )}
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {rezultate.map((r, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    r.status === 'creat' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {r.status === 'creat'
                      ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
                    <span className="font-medium">{r.denumire}</span>
                    {r.mesaj && <span className="text-xs opacity-70">— {r.mesaj}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <Button variant="outline" onClick={reset}>
            {rezultate ? 'Închide' : 'Anulează'}
          </Button>
          {!rezultate && (
            <Button onClick={handleImport} disabled={!file || loading}>
              <Upload className="h-4 w-4 mr-2" />
              {loading ? 'Se importă...' : `Importă${preview.length ? ` (~${preview.length}+ clienți)` : ''}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
