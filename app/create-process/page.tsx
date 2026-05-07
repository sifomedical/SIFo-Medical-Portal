'use client'

import { useRouter } from 'next/navigation'
import ProcessFormWrapper from '@/components/ProcessFormWrapper'

export default function CreateProcessPage() {
  const router = useRouter()

  const handleSuccess = (processId: string) => {
    router.push(`/admin/processes/${processId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 Neuen Prozess erstellen
          </h1>
          <p className="text-lg text-gray-600">
            Dokumentiere deinen Prozess vollständig mit allen Details. Der Prozess wird
            nach Einreichung von Administratoren überprüft und genehmigt.
          </p>
        </div>

        <ProcessFormWrapper onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
