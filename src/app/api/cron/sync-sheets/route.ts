import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { parse as parseCSV } from 'csv-string';
import { NextResponse } from 'next/server';

// Verify the request is from Vercel Cron
const validateRequest = (request: Request) => {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return false;
  }
  return true;
};

async function syncWithGoogleSheets() {
  try {
    const CSV_FILE_PATH = path.join(process.cwd(), 'data/feedback.csv');

    // Read the CSV file
    const csvContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const rows = parseCSV(csvContent);

    // Set up Google Sheets API
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Fix escaped newlines
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Update the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A1', // Adjust range as needed
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    return { success: true, message: 'Successfully synced with Google Sheets' };
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
    return { success: false, error: 'Failed to sync with Google Sheets' };
  }
}

export async function GET(request: Request) {
  if (!validateRequest(request)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const result = await syncWithGoogleSheets();

  if (!result.success) {
    return new NextResponse(JSON.stringify(result), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new NextResponse(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Set up cron schedule to run every hour
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration
