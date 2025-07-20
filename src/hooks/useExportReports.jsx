import { useCallback } from 'react'
import { jsPDF } from 'jspdf'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'
import { saveAs } from 'file-saver'

export function useExportReports() {
  const exportCSV = useCallback(async () => {
    const snap = await getDocs(collection(db, 'sessions'))
    const rows = snap.docs.map((d) => d.data())
    const header = Object.keys(rows[0] || {})
    const csv = [header.join(','), ...rows.map((r) => header.map((h) => r[h]).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    saveAs(blob, 'relatorio.csv')
  }, [])

  const exportPDF = useCallback(() => {
    const doc = new jsPDF()
    doc.text('Relatório Geral', 10, 10)
    doc.save('relatorio.pdf')
  }, [])

  return { exportCSV, exportPDF }
}
