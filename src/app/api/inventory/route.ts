import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { equipAccessory, unequipAccessory, updateStickerPosition } from '@/lib/inventoryEngine'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

    const body = await req.json()
    const { accessoryId, position } = body

    if (!accessoryId) {
      return NextResponse.json({ error: 'accessoryId is verplicht' }, { status: 400 })
    }

    const success = await equipAccessory(session.user.id, accessoryId, position)
    return NextResponse.json({ success })
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

    const { accessoryId } = await req.json()

    if (!accessoryId) {
      return NextResponse.json({ error: 'accessoryId is verplicht' }, { status: 400 })
    }

    const success = await unequipAccessory(session.user.id, accessoryId)
    return NextResponse.json({ success })
  } catch (err) {
    return handleError(err)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })

    const { accessoryId, position } = await req.json()

    if (!accessoryId || !position) {
      return NextResponse.json({ error: 'accessoryId en position zijn verplicht' }, { status: 400 })
    }

    const success = await updateStickerPosition(session.user.id, accessoryId, position)
    return NextResponse.json({ success })
  } catch (err) {
    return handleError(err)
  }
}
