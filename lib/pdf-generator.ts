import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ProcessData {
  title: string
  subtitle?: string
  description?: string
  category?: string
  owner?: string
  frequency?: string
  goals?: string[]
  tools?: Array<{ name: string; url?: string }>
  tags?: string[]
  mermaidDiagram?: string
  lastUpdated?: string
}

export async function generateProcessPdf(process: ProcessData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  const lineHeight = 5

  let yPosition = margin

  // Helper to add text
  const addText = (text: string, fontSize: number = 12, bold: boolean = false) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = pdf.splitTextToSize(text, pageWidth - margin * 2)
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
      pdf.text(line, margin, yPosition)
      yPosition += lineHeight
    })
  }

  // Title
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(27, 58, 107) // SIFo blue
  yPosition = margin + 5
  const titleLines = pdf.splitTextToSize(process.title, pageWidth - margin * 2)
  titleLines.forEach((line: string) => {
    pdf.text(line, margin, yPosition)
    yPosition += lineHeight + 2
  })

  yPosition += 2

  // Subtitle
  if (process.subtitle) {
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'italic')
    pdf.setTextColor(100, 100, 100)
    addText(process.subtitle, 12, false)
    yPosition += 2
  }

  // Category & Status badge
  if (process.category) {
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(27, 58, 107)
    pdf.text(`Kategorie: ${process.category}`, margin, yPosition)
    yPosition += lineHeight + 2
  }

  // Divider
  pdf.setDrawColor(200, 200, 200)
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 5

  // Description
  if (process.description) {
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Beschreibung', margin, yPosition)
    yPosition += lineHeight + 1

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const descLines = pdf.splitTextToSize(process.description, pageWidth - margin * 2)
    descLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
      pdf.text(line, margin, yPosition)
      yPosition += lineHeight - 1
    })
    yPosition += 3
  }

  // Metadata
  if (process.owner || process.frequency || process.lastUpdated) {
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Informationen', margin, yPosition)
    yPosition += lineHeight

    pdf.setFont('helvetica', 'normal')
    if (process.owner) {
      pdf.text(`Owner: ${process.owner}`, margin + 2, yPosition)
      yPosition += lineHeight
    }
    if (process.frequency) {
      pdf.text(`Frequenz: ${process.frequency}`, margin + 2, yPosition)
      yPosition += lineHeight
    }
    if (process.lastUpdated) {
      const date = new Date(process.lastUpdated).toLocaleDateString('de-AT')
      pdf.text(`Aktualisiert: ${date}`, margin + 2, yPosition)
      yPosition += lineHeight
    }
    yPosition += 3
  }

  // Goals
  if (process.goals && process.goals.length > 0) {
    if (yPosition > pageHeight - 30) {
      pdf.addPage()
      yPosition = margin
    }

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Ziele', margin, yPosition)
    yPosition += lineHeight

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    process.goals.forEach((goal) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
      const goalLines = pdf.splitTextToSize(`• ${goal}`, pageWidth - margin * 2 - 5)
      goalLines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition)
        yPosition += lineHeight - 1
      })
    })
    yPosition += 3
  }

  // Tools
  if (process.tools && process.tools.length > 0) {
    if (yPosition > pageHeight - 30) {
      pdf.addPage()
      yPosition = margin
    }

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Tools & Software', margin, yPosition)
    yPosition += lineHeight

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    process.tools.forEach((tool) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
      const toolText = tool.url ? `${tool.name} (${tool.url})` : tool.name
      const toolLines = pdf.splitTextToSize(`• ${toolText}`, pageWidth - margin * 2 - 5)
      toolLines.forEach((line: string) => {
        pdf.text(line, margin + 5, yPosition)
        yPosition += lineHeight - 1
      })
    })
    yPosition += 3
  }

  // Tags
  if (process.tags && process.tags.length > 0) {
    if (yPosition > pageHeight - 20) {
      pdf.addPage()
      yPosition = margin
    }

    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Tags', margin, yPosition)
    yPosition += lineHeight

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const tagText = process.tags.map((t) => `#${t}`).join(' ')
    const tagLines = pdf.splitTextToSize(tagText, pageWidth - margin * 2)
    tagLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }
      pdf.text(line, margin, yPosition)
      yPosition += lineHeight
    })
  }

  // Footer
  const totalPages = pdf.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(150, 150, 150)
    pdf.text(
      `Seite ${i} von ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  return pdf
}

export async function downloadProcessPdf(process: ProcessData) {
  const pdf = await generateProcessPdf(process)
  const filename = `${process.title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')}-${new Date().toISOString().split('T')[0]}.pdf`

  pdf.save(filename)
}
