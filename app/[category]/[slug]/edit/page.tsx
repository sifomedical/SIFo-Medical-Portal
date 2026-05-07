import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { CategoryId } from '@/types/process'
import { getProcessBySlug } from '@/data/processes'
import ProcessFormWrapper from '@/components/ProcessFormWrapper'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export default async function EditProcessPage({ params }: Props) {
  const { category, slug } = await params

  const session = await getServerSession()
  const adminEmail = process.env.ADMIN_EMAIL

  if (!session?.user?.email) {
    redirect('/login')
  }

  if (session.user.email !== adminEmail) {
    redirect(`/${category}/${slug}`)
  }

  const proc = getProcessBySlug(category as CategoryId, slug)
  if (!proc) notFound()

  // Map process fields to form data shape
  const initialData = {
    title: proc.title,
    subtitle: proc.subtitle,
    category: proc.category,
    description: proc.description,
    purpose: proc.purpose || '',
    scope: proc.scope || '',
    responsibilities: proc.responsibilities || [],
    definitions: proc.definitions || {},
    inputs: proc.inputs || [],
    steps: proc.steps || [],
    risksAndControls: proc.risksAndControls || [],
    outputs: proc.outputs || [],
    records: proc.records || [],
    tools: proc.tools || [],
    goals: proc.goals || [],
    tags: proc.tags || [],
    owner: proc.owner,
    frequency: proc.frequency,
    processVideoUrl: proc.processVideoUrl || '',
    mermaidDiagram: proc.mermaidDiagram || '',
  }

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/${category}/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zum Prozess
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-[#1B3A6B]">
            ✏️ Prozess bearbeiten: <strong>{proc.title}</strong>
          </span>
        </div>

        <ProcessFormWrapper
          initialData={initialData}
          mode="edit"
          processSlug={slug}
        />
      </div>
    </div>
  )
}
