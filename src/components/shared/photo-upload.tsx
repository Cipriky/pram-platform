'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type Poza = {
  id: string
  url: string
  numeFisier: string
  descriere?: string | null
}

interface PhotoUploadProps {
  verificareId: string
  initialPoze?: Poza[]
  canEdit?: boolean
}

export function PhotoUpload({ verificareId, initialPoze = [], canEdit = true }: PhotoUploadProps) {
  const [poze, setPoze] = useState<Poza[]>(initialPoze)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const upload = async (files: FileList) => {
    if (!files.length) return
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('poze', f))

    const res = await fetch(`/api/verificari/${verificareId}/poze`, {
      method: 'POST',
      body: formData,
    })

    setUploading(false)

    if (!res.ok) {
      toast({ title: 'Eroare la upload', variant: 'destructive' })
      return
    }

    const saved: Poza[] = await res.json()
    setPoze(prev => [...prev, ...saved])
    toast({ title: `${saved.length} ${saved.length === 1 ? 'fotografie adăugată' : 'fotografii adăugate'}` })
  }

  const deletePoza = async (pozaId: string) => {
    const res = await fetch(`/api/verificari/${verificareId}/poze`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pozaId }),
    })
    if (res.ok) {
      setPoze(prev => prev.filter(p => p.id !== pozaId))
      toast({ title: 'Fotografie ștearsă' })
    }
  }

  return (
    <div className="space-y-3">
      {/* Grid poze */}
      {poze.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {poze.map(p => (
            <div key={p.id} className="relative group rounded-lg overflow-hidden border bg-gray-50 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.numeFisier}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setPreview(p.url)}
              />
              {canEdit && (
                <button
                  type="button"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  onClick={() => deletePoza(p.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {canEdit && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={e => e.target.files && upload(e.target.files)}
          />
          <div
            className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              upload(e.dataTransfer.files)
            }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Loader2 className="h-7 w-7 animate-spin" />
                <p className="text-sm">Se încarcă...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Camera className="h-7 w-7" />
                <p className="text-sm font-medium text-gray-600">Adaugă fotografii</p>
                <p className="text-xs text-gray-400">Click sau trage fișierele aici · JPG, PNG, HEIC</p>
              </div>
            )}
          </div>
        </>
      )}

      {poze.length === 0 && !canEdit && (
        <div className="flex flex-col items-center gap-2 py-6 text-gray-400">
          <ImageIcon className="h-8 w-8 opacity-30" />
          <p className="text-sm">Nicio fotografie atașată.</p>
        </div>
      )}

      {/* Lightbox simplu */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40"
            onClick={() => setPreview(null)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
