import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { parse as parseCSV } from 'csv-string';

// You'll need to set up these environment variables
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

const CSV_FILE_PATH = path.join(process.cwd(), 'data/feedback.csv');

async function syncWithGoogleSheets() {
  try {
    // Read the CSV file
    const csvContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const rows = parseCSV(csvContent);

    // Set up Google Sheets API
    const auth = new google.auth.JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Update the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Sheet1!A1', // Adjust range as needed
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    console.log('Successfully synced with Google Sheets');
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
  }
}

// You can call this function manually or set up a cron job
syncWithGoogleSheets();
