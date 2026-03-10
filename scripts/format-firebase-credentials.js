const fs = require('fs');
const path = require('path');

console.log('\n🔥 Firebase Credentials Formatter for Vercel\n');

// Check if file path is provided
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node format-firebase-credentials.js <path-to-service-account.json>');
  console.log('\nExample:');
  console.log('  node format-firebase-credentials.js ./firebase-service-account.json\n');
  process.exit(1);
}

const serviceAccountPath = args[0];

// Check if file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Error: File not found: ${serviceAccountPath}\n`);
  process.exit(1);
}

try {
  // Read and parse the service account JSON
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  console.log('✅ Service account file loaded successfully!\n');
  console.log('📋 Copy these values to Vercel Environment Variables:\n');
  console.log('━'.repeat(80));
  console.log('\n# Firebase Admin (Server-side)\n');
  
  console.log('FIREBASE_ADMIN_CLIENT_EMAIL=');
  console.log(serviceAccount.client_email);
  console.log('');
  
  console.log('FIREBASE_ADMIN_PRIVATE_KEY=');
  console.log(serviceAccount.private_key);
  console.log('');

  console.log('━'.repeat(80));
  console.log('\n# Firebase Public Config (Client-side)\n');
  console.log('# Get these from Firebase Console > Project Settings > General\n');
  
  console.log(`NEXT_PUBLIC_FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY=<get-from-firebase-console>');
  console.log(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${serviceAccount.project_id}.firebaseapp.com`);
  console.log(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${serviceAccount.project_id}.appspot.com`);
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<get-from-firebase-console>');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID=<get-from-firebase-console>');
  
  console.log('\n━'.repeat(80));
  console.log('\n⚠️  IMPORTANT NOTES:\n');
  console.log('1. Copy FIREBASE_ADMIN_PRIVATE_KEY exactly as shown (with \\n characters)');
  console.log('2. In Vercel, paste the private key value WITHOUT quotes');
  console.log('3. Get the NEXT_PUBLIC_* values from Firebase Console > Project Settings');
  console.log('4. After updating Vercel env vars, redeploy your app');
  console.log('5. Test with: https://command-desk-ai.vercel.app/api/debug/test-connections\n');

  // Also save to a file
  const outputPath = path.join(path.dirname(serviceAccountPath), 'firebase-env-vars.txt');
  const output = `# Firebase Environment Variables for Vercel
# Generated: ${new Date().toISOString()}

# ========================
# Firebase Admin (Server-side)
# ========================

FIREBASE_ADMIN_CLIENT_EMAIL=${serviceAccount.client_email}

FIREBASE_ADMIN_PRIVATE_KEY=${serviceAccount.private_key}

# ========================
# Firebase Public Config (Client-side)
# Get these from Firebase Console > Project Settings > General
# ========================

NEXT_PUBLIC_FIREBASE_PROJECT_ID=${serviceAccount.project_id}
NEXT_PUBLIC_FIREBASE_API_KEY=<get-from-firebase-console>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${serviceAccount.project_id}.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${serviceAccount.project_id}.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<get-from-firebase-console>
NEXT_PUBLIC_FIREBASE_APP_ID=<get-from-firebase-console>
`;

  fs.writeFileSync(outputPath, output);
  console.log(`✅ Environment variables also saved to: ${outputPath}\n`);

} catch (error) {
  console.error('❌ Error processing service account file:', error.message);
  console.error('\nMake sure the file is a valid Firebase service account JSON file.\n');
  process.exit(1);
}
