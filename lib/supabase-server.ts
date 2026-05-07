// @ts-nocheck
// Supabase Server Client for API routes and server operations
// Uses service role key for administrative operations

import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return supabaseClient
}

// Common Query Helpers for Processes
export const db = {
  // Processes
  async getActiveProcesses() {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('processes')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getProcessBySlug(slug: string) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('processes')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async getProcessesByCategory(category: string) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('processes')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async searchProcesses(query: string) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('processes')
      .select('*')
      .eq('status', 'active')
      .or(
        `title.ilike.%${query}%,subtitle.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{"${query}"}`
      )
      .order('updated_at', { ascending: false })
      .limit(20)
    if (error) throw error
    return data || []
  },

  async filterProcesses(filters: {
    category?: string
    tags?: string[]
    owner?: string
    status?: string
  }) {
    const client = getSupabaseClient()
    let query = client.from('processes').select('*')

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }
    if (filters.owner) {
      query = query.ilike('owner', `%${filters.owner}%`)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      query = query.eq('status', 'active')
    }

    const { data, error } = await query.order('updated_at', {
      ascending: false,
    })
    if (error) throw error
    return data || []
  },

  // Draft Processes
  async getDraftProcesses() {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('processes')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async createDraftProcess(process: any) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('processes')
      .insert([{ ...process, status: 'draft' }] as any)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async approveDraftProcess(processId: string, approvedBy: string) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('processes')
      .update({
        status: 'active',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', processId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async rejectDraftProcess(processId: string) {
    const client = getSupabaseClient()
    const { error } = await client
      .from('processes')
      .delete()
      .eq('id', processId)
    if (error) throw error
  },

  // Users
  async getUserByEmail(email: string) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async createUser(user: any) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('users')
      .insert([user])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getPendingUsers() {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async approveUser(userId: string, approvedBy: string) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('users')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Attachments
  async getProcessAttachments(processId: string) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('attachments')
      .select('*')
      .eq('process_id', processId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async createAttachment(attachment: any) {
    const client = getSupabaseClient()
    const { data, error } = await client
      .from('attachments')
      .insert([attachment])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteAttachment(attachmentId: string) {
    const client = getSupabaseClient()
    const { error } = await client
      .from('attachments')
      .delete()
      .eq('id', attachmentId)
    if (error) throw error
  },
}
