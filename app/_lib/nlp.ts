import * as chrono from 'chrono-node'
import { Prioritas } from './types'

interface NLPResult {
  judul: string
  tanggal?: string // YYYY-MM-DD
  waktu?: string // HH:mm:ss
  prioritas?: Prioritas
  proyekNama?: string
}

export function parseNLP(input: string, projects: { id: string, nama: string }[] = []): NLPResult {
  let text = input
  const result: NLPResult = { judul: input }

  // 1. Parse Prioritas (!t, !m, !r atau !tinggi, !sedang, !rendah)
  const priorityMatch = text.match(/!(tinggi|t|sedang|m|rendah|r)/i)
  if (priorityMatch) {
    const p = priorityMatch[1].toLowerCase()
    if (p === 'tinggi' || p === 't') result.prioritas = 'high'
    else if (p === 'sedang' || p === 'm') result.prioritas = 'medium'
    else if (p === 'rendah' || p === 'r') result.prioritas = 'low'
    
    text = text.replace(priorityMatch[0], '').trim()
  }

  // 2. Parse Proyek (#namaproyek)
  const projectMatch = text.match(/#(\w+)/)
  if (projectMatch) {
    const pName = projectMatch[1].toLowerCase()
    const foundProject = projects.find(p => p.nama.toLowerCase().includes(pName))
    if (foundProject) {
      result.proyekNama = foundProject.nama
      // Kita kembalikan ID-nya nanti di UI
    }
    text = text.replace(projectMatch[0], '').trim()
  }

  // 3. Custom Bahasa Indonesia Date Parsing (Sederhana)
  const indonesianDates: { [key: string]: number } = {
    'besok': 1,
    'lusa': 2,
    'hari ini': 0,
    'minggu depan': 7,
  }

  for (const [key, days] of Object.entries(indonesianDates)) {
    if (text.toLowerCase().includes(key)) {
      const date = new Date()
      date.setDate(date.getDate() + days)
      result.tanggal = date.toISOString().slice(0, 10)
      text = text.replace(new RegExp(key, 'gi'), '').trim()
      break
    }
  }

  // 4. Chrono Node untuk Waktu & Tanggal Inggris (seperti "jam 10", "at 5pm")
  // Kita coba ganti jam ke "at" agar chrono bisa deteksi jam BI
  let timeText = text
    .replace(/jam (\d+)/gi, 'at $1')
    .replace(/pagi/gi, 'am')
    .replace(/siang|sore/gi, 'pm')
    .replace(/malam/gi, 'pm')

  const parsedDate = chrono.parse(timeText, new Date(), { forwardDate: true })

  if (parsedDate.length > 0) {
    const dateInfo = parsedDate[0].start
    
    if (!result.tanggal && dateInfo.isCertain('day')) {
      result.tanggal = parsedDate[0].start.date().toISOString().slice(0, 10)
    }

    if (dateInfo.isCertain('hour')) {
      const d = parsedDate[0].start.date()
      result.waktu = d.toTimeString().slice(0, 8)
    }

    // Bersihkan teks asli dari fragmen waktu yang diparsing
    // Kita bersihkan juga kata kunci BI yang mungkin tidak terdeteksi chrono tapi ada di timeText
    text = text.replace(parsedDate[0].text, '').trim()
    text = text.replace(/jam|pagi|siang|sore|malam/gi, '').trim()
  }

  // Sisa teks adalah judul
  result.judul = text.replace(/\s+/g, ' ').trim() || input
  
  return result
}
