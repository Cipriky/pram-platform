import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  const session = await getAuthSession()
  if (!session) return NextResponse.json({ count: 0 })

  const count = await prisma.notificare.count({
    where: { userId: session.user.id, citita: false },
  })

  return NextResponse.json({ count })
}
