import { env } from '$env/dynamic/private';

const GOOGLE_CLIENT_EMAIL = env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = env.GOOGLE_PRIVATE_KEY;
const GOOGLE_SHEETS_ID = env.GOOGLE_SHEETS_ID;
const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;

import { SignJWT } from 'jose';

let welcomeCount = 0;

export async function POST({ request }: { request: Request }) {
  // ... [your implementation]
  // Double-check all required variables are set
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEETS_ID) {
    console.error('Missing Google Sheets configuration');
    // Handle error appropriately
  }
  
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
  try {

    // More robust private key processing
    let privateKey = GOOGLE_PRIVATE_KEY;
    
    // Handle different private key formats
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // Already in PEM format
      privateKey = privateKey.trim();
    } else {
      // Convert from environment variable format
      privateKey = privateKey
        .replace(/\\n/g, '\n')  // For environment variables
        .replace(/"/g, '')      // In case quotes are added
        .trim();
      
          // Add PEM headers if missing
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }
    
    console.log('Private key format check:', {
      hasHeaders: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
      length: privateKey.length,
      firstChars: privateKey.substring(0, 50),
      lastChars: privateKey.substring(privateKey.length - 50)
    });
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'pkcs8',
      strToUint8Array(privateKey),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const jwt = await new SignJWT({
      scope: 'https://www.googleapis.com/auth/spreadsheets'
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .setIssuer(GOOGLE_CLIENT_EMAIL)
      .setAudience('https://oauth2.googleapis.com/token')
      .sign(key);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const { access_token } = await tokenRes.json();
    if (!access_token) throw new Error('❌ Failed to get Google token');

    const extraValues = Object.entries(formData).map(([k, v]) => `${k}: ${v}`);

    try {
      console.log(`----access_token---\n ${access_token} \n`);
      console.log(`----timestamp------>>>>${timestamp}<<<<`);
      console.log(`----ip------>>>>${ip}<<<<`);
      console.log(`----country------>>>>${country}<<<<`);
      console.log(`----userAgent------>>>>${userAgent}<<<<`);
      console.log(`----welcomeCount------>>>>${welcomeCount}<<<<`);
      console.log(`----extraValues------>>>>${extraValues}<<<<`);

      // Try with the default sheet name first
      const postResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/Sheet1!A1:append?valueInputOption=RAW`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [[timestamp, ip, country, userAgent, `Count: ${welcomeCount}`, ...extraValues]]
          })
        }
      );
      
      console.log("Post test", await postResponse.json());
      console.log('✅ Logged to Google Sheets via fetch+jose.');
    }
    catch(error) {
      console.log(error);
    }
  } catch (err) {
    console.error('❌ Google Sheets log error:', err);
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });

  // return json({ ok: true });
}

async function logsheet1({ formData, ip, timestamp, country, userAgent }: {
  formData: Record<string, string>;
  ip: string;
  timestamp: string;
  country: string;
  userAgent: string;
}) {
  try {

    // More robust private key processing
    let privateKey = GOOGLE_PRIVATE_KEY;
    
    // Handle different private key formats
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // Already in PEM format
      privateKey = privateKey.trim();
    } else {
      // Convert from environment variable format
      privateKey = privateKey
        .replace(/\\n/g, '\n')  // For environment variables
        .replace(/"/g, '')      // In case quotes are added
        .trim();
      
          // Add PEM headers if missing
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }
    
    console.log('Private key format check:', {
      hasHeaders: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
      length: privateKey.length,
      firstChars: privateKey.substring(0, 50),
      lastChars: privateKey.substring(privateKey.length - 50)
    });
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'pkcs8',
      strToUint8Array(privateKey),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const jwt = await new SignJWT({
      scope: 'https://www.googleapis.com/auth/spreadsheets'
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .setIssuer(GOOGLE_CLIENT_EMAIL)
      .setAudience('https://oauth2.googleapis.com/token')
      .sign(key);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const { access_token } = await tokenRes.json();
    if (!access_token) throw new Error('❌ Failed to get Google token');

    const extraValues = Object.entries(formData).map(([k, v]) => `${k}: ${v}`);

    try {
      if (ip === undefined || ip === null) ip = '192.193.194.195';
      if (country === undefined || country === null) country = "France";
      console.log(`----access_token---\n ${access_token} \n`);
      console.log(`----timestamp------>>>>${timestamp}<<<<`);
      console.log(`----ip------>>>>${ip}<<<<`);
      console.log(`----country------>>>>${country}<<<<`);
      console.log(`----userAgent------>>>>${userAgent}<<<<`);
      console.log(`----welcomeCount------>>>>${welcomeCount}<<<<`);
      console.log(`----extraValues------>>>>${extraValues}<<<<`);

      // Try with the default sheet name first
      const postResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/Sheet1!A1:append?valueInputOption=RAW`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [[timestamp, ip, country, userAgent, `Count: ${welcomeCount}`, ...extraValues]]
          })
        }
      );
      
      console.log("Post test", await postResponse.json());
      console.log('✅ Logged to Google Sheets via fetch+jose.');
    }
    catch(error) {
      console.log(error);
    }
  } catch (err) {
    console.error('❌ Google Sheets log error:', err);
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