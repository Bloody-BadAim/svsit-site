import { NextRequest, NextResponse } from 'next/server'
import { handleError, requireAdmin } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

const MAX_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
}

// POST - Recap-foto's uploaden naar de 'recaps' bucket (admin only).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const { id } = await params
    const form = await req.formData()
    const files = form.getAll('files').filter((f): f is File => f instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ data: null, error: 'Geen bestanden ontvangen', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()
    const urls: string[] = []

    for (const file of files) {
      if (!ALLOWED_MIME.includes(file.type)) {
        return NextResponse.json(
          { data: null, error: `Bestandstype niet toegestaan: ${file.type || 'onbekend'}`, meta: null },
          { status: 400 }
        )
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { data: null, error: `Bestand te groot (max 10MB): ${file.name}`, meta: null },
          { status: 400 }
        )
      }

      const ext = EXT_BY_MIME[file.type]
      const path = `${id}/${Date.now()}-${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('recaps')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (uploadError) throw uploadError

      const { data: pub } = supabase.storage.from('recaps').getPublicUrl(path)
      urls.push(pub.publicUrl)
    }

    return NextResponse.json({ data: { urls }, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}
