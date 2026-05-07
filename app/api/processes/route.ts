import { NextResponse } from 'next/server'
import { ALL_PROCESSES } from '@/data/processes'

export async function GET() {
  const active = ALL_PROCESSES.filter((p) => p.status === 'active')
  return NextResponse.json(active)
}
