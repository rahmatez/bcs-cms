#!/usr/bin/env node

/**
 * Setup Helper untuk BCS CMS
 * Script ini membantu setup awal project dengan Supabase
 */

const readline = require('readline');
const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  log('\n🚀 BCS CMS Setup Helper\n', 'bright');
  log('Panduan ini akan membantu Anda setup project dengan Supabase.\n', 'blue');

  // Step 1: Check if .env exists
  if (fs.existsSync('.env')) {
    log('⚠️  File .env sudah ada!', 'yellow');
    const overwrite = await question('Apakah ingin membuat ulang? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('\n✅ Setup dibatalkan. File .env yang ada tetap digunakan.', 'green');
      rl.close();
      return;
    }
  }

  log('\n📋 Langkah 1: Setup Supabase\n', 'bright');
  log('1. Buka https://app.supabase.com/', 'blue');
  log('2. Buat project baru atau pilih yang sudah ada', 'blue');
  log('3. Buka Settings → Database', 'blue');
  log('4. Copy Connection String (URI)\n', 'blue');

  const databaseUrl = await question('Paste Supabase Connection String: ');

  if (!databaseUrl || !databaseUrl.includes('postgresql://')) {
    log('\n❌ Connection string tidak valid!', 'red');
    log('Format harus: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres', 'yellow');
    rl.close();
    return;
  }

  log('\n📋 Langkah 2: Generate NextAuth Secret\n', 'bright');
  const secret = crypto.randomBytes(32).toString('hex');
  log(`Generated secret: ${secret}`, 'green');

  const useGeneratedSecret = await question('\nGunakan secret di atas? (Y/n): ');
  const nextAuthSecret = useGeneratedSecret.toLowerCase() === 'n' 
    ? await question('Masukkan custom secret: ')
    : secret;

  log('\n📋 Langkah 3: URL Aplikasi\n', 'bright');
  const defaultUrl = 'http://localhost:3000';
  const customUrl = await question(`URL aplikasi [${defaultUrl}]: `);
  const nextAuthUrl = customUrl || defaultUrl;

  // Optional: Supabase settings
  log('\n📋 Langkah 4: Supabase Storage (Opsional)\n', 'bright');
  log('Untuk upload file ke Supabase Storage.', 'blue');
  const useSupabaseStorage = await question('Setup Supabase Storage? (y/N): ');
  
  let supabaseUrl = '';
  let supabaseAnonKey = '';
  
  if (useSupabaseStorage.toLowerCase() === 'y') {
    log('\nDi Supabase Dashboard → Settings → API:', 'blue');
    supabaseUrl = await question('Project URL: ');
    supabaseAnonKey = await question('Anon/Public Key: ');
  }

  // Create .env file
  log('\n📝 Membuat file .env...', 'yellow');
  
  let envContent = `# ===========================================
# DATABASE CONFIGURATION (SUPABASE)
# ===========================================
DATABASE_URL="${databaseUrl}"

# ===========================================
# NEXTAUTH CONFIGURATION
# ===========================================
NEXTAUTH_SECRET="${nextAuthSecret}"
NEXTAUTH_URL="${nextAuthUrl}"
`;

  if (supabaseUrl && supabaseAnonKey) {
    envContent += `
# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
NEXT_PUBLIC_SUPABASE_URL="${supabaseUrl}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${supabaseAnonKey}"
`;
  }

  fs.writeFileSync('.env', envContent);
  log('✅ File .env berhasil dibuat!', 'green');

  // Run setup commands
  log('\n📦 Langkah 5: Install Dependencies & Setup Database\n', 'bright');
  const runSetup = await question('Jalankan setup sekarang? (Y/n): ');

  if (runSetup.toLowerCase() !== 'n') {
    try {
      log('\n📦 Installing dependencies...', 'yellow');
      execSync('npm install', { stdio: 'inherit' });

      log('\n🔧 Generating Prisma Client...', 'yellow');
      execSync('npx prisma generate', { stdio: 'inherit' });

      log('\n🗄️  Pushing schema to database...', 'yellow');
      execSync('npx prisma db push', { stdio: 'inherit' });

      const runSeed = await question('\n🌱 Seed data awal? (Y/n): ');
      if (runSeed.toLowerCase() !== 'n') {
        log('\n🌱 Seeding database...', 'yellow');
        execSync('npm run db:seed', { stdio: 'inherit' });
      }

      log('\n✨ Setup selesai!', 'bright');
      log('\n🚀 Untuk menjalankan project:', 'green');
      log('   npm run dev', 'blue');
      log('\n🔐 Login admin:', 'green');
      log('   Email: admin@bcs.com', 'blue');
      log('   Password: admin123', 'blue');
      log('\n⚠️  Jangan lupa ganti password setelah login!\n', 'yellow');

    } catch (error) {
      log('\n❌ Error saat setup:', 'red');
      log(error.message, 'red');
      log('\nCoba jalankan manual:', 'yellow');
      log('1. npm install', 'blue');
      log('2. npx prisma generate', 'blue');
      log('3. npx prisma db push', 'blue');
      log('4. npm run db:seed', 'blue');
    }
  } else {
    log('\n✅ File .env sudah dibuat!', 'green');
    log('\nJalankan perintah ini secara manual:', 'yellow');
    log('1. npm install', 'blue');
    log('2. npx prisma generate', 'blue');
    log('3. npx prisma db push', 'blue');
    log('4. npm run db:seed', 'blue');
    log('5. npm run dev\n', 'blue');
  }

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
