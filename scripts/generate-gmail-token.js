const readline = require('readline');
const { google } = require('googleapis');

// Replace these with your actual credentials from Google Cloud Console
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send'
];

console.log('\n🔐 Gmail OAuth2 Token Generator\n');
console.log('Step 1: Visit this URL in your browser:\n');

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force to get refresh token
});

console.log(authUrl);
console.log('\nStep 2: Authorize the app and copy the authorization code from the URL\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the authorization code: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Success! Your refresh token is:\n');
    console.log(tokens.refresh_token);
    console.log('\nCopy this token to Vercel environment variable: GMAIL_REFRESH_TOKEN\n');
  } catch (error) {
    console.error('\n❌ Error getting token:', error.message);
  }
  rl.close();
});
