'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface ContinuitateItem {
  id: string
  denumire: string
  nrPrize230V: number | null
  nrPrize400V: number | null
  nrTabUtilaj: string | null
  corespunde: boolean
}

interface MasuratoriAnexeProps {
  verificareId: string
  items: ContinuitateItem[]
  canEdit: boolean
}

const emptyForm = {
  denumire: '',
  nrPrize230V: '',
  nrPrize400V: '',
  nrTabUtilaj: '',
  corespunde: true,
}

export function MasuratoriAnexe({ verificareId, items, canEdit }: MasuratoriAnexeProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (item: ContinuitateItem) => {
    setEditingId(item.id)
    setForm({
      denumire: item.denumire,
      nrPrize230V: item.nrPrize230V != null ? String(item.nrPrize230V) : '',
      nrPrize400V: item.nrPrize400V != null ? String(item.nrPrize400V) : '',
      nrTabUtilaj: item.nrTabUtilaj ?? '',
      corespunde: item.corespunde,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleChange = (field: keyof typeof emptyForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.denumire.trim()) {
      toast({ title: 'Denumirea este obligatorie', variant: 'destructive' })
      return
    }

    setSaving(true)
    const url = `/api/verificari/${verificareId}/continuitate-anexe`
    const method = editingId ? 'PUT' : 'POST'
    const body = {
      ...(editingId ? { itemId: editingId } : {}),
      denumire: form.denumire,
      nrPrize230V: form.nrPrize230V !== '' ? Number(form.nrPrize230V) : null,
      nrPrize400V: form.nrPrize400V !== '' ? Number(form.nrPrize400V) : null,
      nrTabUtilaj: form.nrTabUtilaj || null,
      corespunde: form.corespunde,
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)

    if (!res.ok) {
      const err = await res.json()
      toast({ title: 'Eroare', description: err.error, variant: 'destructive' })
      return
    }

    toast({ title: editingId ? 'Rând actualizat!' : 'Rând adăugat!' })
    closeForm()
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const res = await fetch(
      `/api/verificari/${verificareId}/continuitate-anexe?itemId=${id}`,
      { method: 'DELETE' }
    )
    setDeleting(null)
    if (res.ok) {
      toast({ title: 'Rând șters' })
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-purple-500" />
            Măsurători - Anexe ({items.length})
          </CardTitle>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Adaugă
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subtitlu */}
        <p className="text-xs text-gray-500">
          Continuități nul de protecție — se includ în <strong>Anexa B1</strong> a buletinului
        </p>

        {/* Formular adăugare / editare */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-purple-800">
              {editingId ? 'Editează rând' : 'Rând nou'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Denumire — full width */}
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Denumire spațiu / Echipament *</Label>
                <Input
                  value={form.denumire}
                  onChange={e => handleChange('denumire', e.target.value)}
                  placeholder="ex: Freza AWEA, Prize birou et. 1..."
                  className="h-8 text-xs"
                />
              </div>

              {/* NR. TAB / Utilaj */}
              <div className="space-y-1">
                <Label className="text-xs">NR. TAB / Utilaj</Label>
                <Input
                  value={form.nrTabUtilaj}
                  onChange={e => handleChange('nrTabUtilaj', e.target.value)}
                  placeholder="ex: TE-01"
                  className="h-8 text-xs"
                />
              </div>

              {/* Nr. prize 230V */}
              <div className="space-y-1">
                <Label className="text-xs">Nr. prize 230V</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.nrPrize230V}
                  onChange={e => handleChange('nrPrize230V', e.target.value)}
                  placeholder="0"
                  className="h-8 text-xs"
                />
              </div>

              {/* Nr. prize 400V */}
              <div className="space-y-1">
                <Label className="text-xs">Nr. prize 400V</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.nrPrize400V}
                  onChange={e => handleChange('nrPrize400V', e.target.value)}
                  placeholder="0"
                  className="h-8 text-xs"
                />
              </div>

              {/* Corespunde */}
              <div className="space-y-1">
                <Label className="text-xs">Corespunde</Label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleChange('corespunde', true)}
                    className={`flex-1 h-8 text-xs font-semibold rounded border-2 transition-all
                      ${form.corespunde
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    ✓ DA
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('corespunde', false)}
                    className={`flex-1 h-8 text-xs font-semibold rounded border-2 transition-all
                      ${!form.corespunde
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    ✕ NU
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving} className="h-8 text-xs">
                {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                {saving ? 'Se salvează...' : 'Salvează'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={closeForm} className="h-8 text-xs">
                Anulează
              </Button>
            </div>
          </form>
        )}

        {/* Lista înregistrări */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-gray-400">
            <FileSpreadsheet className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Nicio continuitate înregistrată.</p>
            {canEdit && (
              <button onClick={openAdd} className="text-xs text-purple-600 mt-1 hover:underline">
                Adaugă primul rând →
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2 font-semibold text-gray-600 border border-gray-200">Denumire spațiu / Echipament</th>
                  <th className="text-center p-2 font-semibold text-gray-600 border border-gray-200 w-24">NR. TAB / Utilaj</th>
                  <th className="text-center p-2 font-semibold text-gray-600 border border-gray-200 w-20">Prize 230V</th>
                  <th className="text-center p-2 font-semibold text-gray-600 border border-gray-200 w-20">Prize 400V</th>
                  <th className="text-center p-2 font-semibold text-gray-600 border border-gray-200 w-24">Corespunde</th>
                  {canEdit && <th className="w-16 border border-gray-200"></th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 border border-gray-200 font-medium text-gray-800">{item.denumire}</td>
                    <td className="p-2 border border-gray-200 text-center text-gray-600">{item.nrTabUtilaj ?? '—'}</td>
                    <td className="p-2 border border-gray-200 text-center font-mono">{item.nrPrize230V ?? '—'}</td>
                    <td className="p-2 border border-gray-200 text-center font-mono">{item.nrPrize400V ?? '—'}</td>
                    <td className="p-2 border border-gray-200 text-center">
                      {item.corespunde ? (
                        <span className="inline-flex items-center gap-1 text-green-700 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> DA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                          <XCircle className="h-3.5 w-3.5" /> NU
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="p-2 border border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            title="Editează"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Șterge"
                          >
                            {deleting === item.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Trash2 className="h-3.5 w-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
