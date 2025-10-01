'use server'

import fs from 'fs/promises'
import path from 'path'
import { parse as parseCSV, stringify } from 'csv-string'

type FeedbackType = 'suggestion' | 'bug'

interface Feedback {
  type: FeedbackType
  description: string
  email: string
  timestamp: string
}

const CSV_FILE_PATH = path.join(process.cwd(), 'data/feedback.csv')

// Ensure the data directory exists
async function ensureDirectory() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  } catch (error) {
    console.error('Error creating directory:', error)
  }
}

// Initialize CSV file if it doesn't exist
async function initializeCSV() {
  try {
    await fs.access(CSV_FILE_PATH)
  } catch {
    const headers = ['type', 'description', 'email', 'timestamp']
    await fs.writeFile(CSV_FILE_PATH, stringify(headers))
  }
}

export async function submitFeedback(type: FeedbackType, description: string, email: string) {
  try {
    await ensureDirectory()
    await initializeCSV()

    const feedback: Feedback = {
      type,
      description,
      email,
      timestamp: new Date().toISOString(),
    }

    const row = stringify([
      [feedback.type, feedback.description, feedback.email, feedback.timestamp]
    ])

    await fs.appendFile(CSV_FILE_PATH, row)

    // If you want to sync with Google Sheets, you would add the integration here
    // For now, we'll just save to CSV

    return { success: true }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return { success: false, error: 'Failed to submit feedback' }
  }
}
