import { NextRequest, NextResponse } from 'next/server'
import { handleError, requireAdmin } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

// POST - Bedrijfslogo uploaden naar de 'vacature-logos' bucket (admin only).
// Retourneert de publieke URL die in vacature.company_logo wordt opgeslagen.
export async function POST(req: NextRequest) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const form = await req.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ data: null, error: 'Geen bestand ontvangen', meta: null }, { status: 400 })
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { data: null, error: `Bestandstype niet toegestaan: ${file.type || 'onbekend'}`, meta: null },
        { status: 400 }
      )
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { data: null, error: `Bestand te groot (max 5MB): ${file.name}`, meta: null },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const ext = EXT_BY_MIME[file.type]
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('vacature-logos')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError

    const { data: pub } = supabase.storage.from('vacature-logos').getPublicUrl(path)

    return NextResponse.json({ data: { url: pub.publicUrl }, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}
