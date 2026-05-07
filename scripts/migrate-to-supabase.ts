#!/usr/bin/env node

/**
 * Migration Script: Vercel KV + JSON → Supabase PostgreSQL
 *
 * Run this script to migrate all existing processes and users from
 * Vercel KV Redis + JSON files to Supabase PostgreSQL.
 *
 * Usage:
 *   npx ts-node scripts/migrate-to-supabase.ts
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && !key.startsWith('#')) {
      const value = valueParts.join('=').replace(/^"(.*)"$/, '$1')
      if (value) process.env[key.trim()] = value.trim()
    }
  })
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface ProcessData {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  description: string
  goals?: string[]
  steps?: any[]
  tools?: any[]
  owner?: string
  frequency?: string
  lastUpdated?: string
  mermaidDiagram?: string
  tags?: string[]
  status?: string
  processVideoUrl?: string
}

async function migrateProcesses() {
  console.log('📚 Migrating processes from /data/processes/*.json...')

  const dataDir = path.join(process.cwd(), 'data', 'processes')

  if (!fs.existsSync(dataDir)) {
    console.log('⚠️  No /data/processes directory found, skipping processes')
    return
  }

  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))
  console.log(`Found ${files.length} process files`)

  const processesToInsert: any[] = []

  for (const file of files) {
    const filePath = path.join(dataDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const process: ProcessData = JSON.parse(content)

    // Map old structure to new Supabase schema
    const mapped = {
      id: randomUUID(), // Always generate new UUID
      slug: process.slug,
      title: process.title,
      subtitle: process.subtitle || '',
      category: process.category,
      description: process.description || '',
      purpose: process.description || '',
      scope: '', // Not in old data
      goals: process.goals || [],
      inputs: [],
      responsibilities: [],
      definitions: {},
      steps: process.steps || [],
      risks_and_controls: [],
      outputs: [],
      records: [],
      tools: process.tools || [],
      owner: process.owner || 'System',
      frequency: process.frequency || '',
      tags: process.tags || [],
      mermaid_diagram: process.mermaidDiagram || '',
      process_video_url: process.processVideoUrl || null,
      status: process.status || 'active',
      created_by: '00000000-0000-0000-0000-000000000000', // System user
      created_at: process.lastUpdated || new Date().toISOString(),
      updated_at: process.lastUpdated || new Date().toISOString(),
      version_number: 1,
    }

    processesToInsert.push(mapped)
  }

  if (processesToInsert.length > 0) {
    console.log(`Inserting ${processesToInsert.length} processes...`)
    const { error } = await supabase
      .from('processes')
      .insert(processesToInsert)

    if (error) {
      console.error('❌ Error inserting processes:', error)
      throw error
    }
    console.log(`✅ Migrated ${processesToInsert.length} processes`)
  }
}

async function createSystemUser() {
  console.log('👤 Creating system user...')

  const systemUserId = '00000000-0000-0000-0000-000000000000'

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', systemUserId)
    .single()

  if (existing) {
    console.log('✅ System user already exists')
    return
  }

  const { error } = await supabase.from('users').insert([
    {
      id: systemUserId,
      email: 'system@sifo-medical.local',
      name: 'System',
      status: 'approved',
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    },
  ])

  if (error) {
    console.error('❌ Error creating system user:', error)
    throw error
  }
  console.log('✅ System user created')
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...')

  const { count: processCount, error: processError } = await supabase
    .from('processes')
    .select('*', { count: 'exact', head: true })

  const { count: userCount, error: userError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  if (processError) {
    console.error('❌ Error counting processes:', processError)
    throw processError
  }

  if (userError) {
    console.error('❌ Error counting users:', userError)
    throw userError
  }

  console.log(`✅ Migration complete:`)
  console.log(`   - Processes: ${processCount || 0}`)
  console.log(`   - Users: ${userCount || 0}`)
}

async function main() {
  try {
    console.log('🚀 Starting migration to Supabase...\n')

    // 1. Create system user
    await createSystemUser()

    // 2. Migrate processes
    await migrateProcesses()

    // 3. Verify
    await verifyMigration()

    console.log('\n✨ Migration successful!')
    console.log(
      '\nNext steps:'
    )
    console.log('1. Test the app locally: npm run dev')
    console.log('2. Check the Supabase dashboard for data')
    console.log('3. Deploy to Vercel when ready')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

main()
