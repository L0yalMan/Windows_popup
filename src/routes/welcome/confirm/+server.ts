import { GOOGLE_SHEETS_ID, DISCORD_WEBHOOK_URL, SERVICE_ACCOUNT_KEY } from '$env/static/private';
import { google } from 'googleapis';

let welcomeCount = 0;

export async function POST({ request }: { request: Request }) {
  // ... [your implementation]
  
  welcomeCount++;

  const now = new Date();
  const timestamp = now.toISOString();
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'Unknown';
  const country = request.headers.get('cf-ipcountry')?.toUpperCase() || 'Unknown';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  let formData: Record<string, string> = {};
  try {
    formData = await request.json();
  } catch {}

  // ✅ Discord
  if (DISCORD_WEBHOOK_URL) {
    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: '👋 Welcome Popup Confirmed',
              color: 0x00ff99,
              fields: [
                { name: 'Total Confirmed', value: `${welcomeCount}`, inline: true },
                { name: 'Time', value: `<t:${Math.floor(now.getTime() / 1000)}:F>`, inline: true },
                { name: 'IP Address', value: ip },
                { name: 'Country', value: country }
              ],
              timestamp
            }
          ]
        })
      });
    } catch (err) {
      console.error('❌ Discord webhook error:', err);
    }
  }

  // ✅ Google Sheets (using JSON file method - most reliable)
  await logsheet3({ formData, ip, timestamp, country, userAgent })

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });

  // return json({ ok: true });
}

async function logsheet3({ formData, ip, timestamp, country, userAgent }: {
  formData: Record<string, string>;
  ip: string;
  timestamp: string;
  country: string;
  userAgent: string;
}) {
  try {
    console.log('🔍 Starting Google Sheets logging (JSON file method)...');
    
    // Create auth client with JSON file
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // Get authenticated client
    const client = await auth.getClient();
    
    // Create sheets API instance
    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare data
    const extraValues = Object.entries(formData).map(([k, v]) => `${k}: ${v}`);
    const rowData = [timestamp, ip, country, userAgent, `Count: ${welcomeCount}`, ...extraValues];

    console.log('📊 Data to append:', rowData);

    // Append data to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });

    console.log('✅ Successfully logged to Google Sheets (JSON method):', response.data);
    
  } catch (error: any) {
    console.error('❌ Google Sheets error (JSON method):', error.message);
    if (error.response?.data?.error) {
      console.error('Error details:', error.response.data.error);
    }
  }
}

function strToUint8Array(pem: string): Uint8Array {
  try {
    // Remove PEM headers and whitespace
    const b64 = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .trim();
    
    // Use TextEncoder to convert base64 to Uint8Array
    const binaryString = atob(b64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  } catch (error) {
    console.error('Error processing private key:', error);
    throw new Error('Invalid private key format');
  }
}