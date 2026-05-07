export async function sendNotification(
  type: 'draft_created' | 'process_approved' | 'process_rejected',
  data: {
    to: string
    processTitle: string
    processUrl: string
    authorName?: string
    approverName?: string
    rejectionReason?: string
  }
) {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        ...data,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send notification')
    }

    const result = await response.json()
    console.log('Notification sent:', result.id)
    return { success: true, id: result.id }
  } catch (error) {
    console.error('Error sending notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Helper: Get process URL
export function getProcessUrl(slug: string, category: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/${category}/${slug}`
}
