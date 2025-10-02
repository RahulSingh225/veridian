import { NextRequest,NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';  // v2.0.0 exports: list, del
import { google } from 'googleapis';

interface Feedback {
  type: string;
  description: string;
  email: string;
  timestamp: string;
}

export async function GET(req: NextRequest) {


  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
}
  const blobPath = 'feedbacks.json';

  // Google Sheets auth
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Fetch content via list + fetch
    const { blobs } = await list({ prefix: blobPath });
    if (blobs.length === 0) {
      return NextResponse.json({ message: 'No data to sync' });
    }

    const blob = blobs[0];
    const response = await fetch(blob.url);
    if (!response.ok) {
      throw new Error('Failed to fetch blob');
    }
    const content = await response.text();
    const feedbacks: Feedback[] = JSON.parse(content);

    if (feedbacks.length === 0) {
      return NextResponse.json({ message: 'No data to sync' });
    }

    // Map to rows
    const rows = feedbacks.map(f => [f.timestamp, f.type, f.description, f.email]);

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
      range: 'Sheet1!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    });

    // Clear storage
    await del(blobPath);

    return NextResponse.json({ synced: feedbacks.length });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}