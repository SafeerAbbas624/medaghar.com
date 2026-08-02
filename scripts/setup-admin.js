#!/usr/bin/env node

/**
 * Admin Dashboard Setup Script
 * 
 * This script helps set up the admin dashboard by:
 * 1. Checking if all dependencies are installed
 * 2. Running database migrations
 * 3. Seeding admin data
 * 4. Verifying the setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Admin Dashboard Setup Script\n');

// Step 1: Check dependencies
console.log('📦 Step 1: Checking dependencies...');
try {
  const packageJson = require('../package.json');
  const requiredDeps = [
    '@tanstack/react-table',
    '@tanstack/react-query',
    'react-hot-toast',
    'ua-parser-js',
    'rate-limiter-flexible'
  ];

  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
    console.log('Installing missing dependencies...');
    execSync('npm install @tanstack/react-table @tanstack/react-query react-hot-toast next-themes clsx tailwind-merge ua-parser-js bcrypt rate-limiter-flexible', { stdio: 'inherit' });
    execSync('npm install --save-dev @types/ua-parser-js', { stdio: 'inherit' });
  } else {
    console.log('✅ All dependencies are installed');
  }
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message);
  process.exit(1);
}

// Step 2: Check environment variables
console.log('\n🔐 Step 2: Checking environment variables...');
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('Creating .env file...');
  const envContent = `DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="${require('crypto').randomBytes(32).toString('hex')}"
NEXTAUTH_URL="http://localhost:3000"
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file exists');
}

// Step 3: Run database migrations
console.log('\n🗄️  Step 3: Running database migrations...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  console.log('Attempting to reset database...');
  try {
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Database reset and Prisma client generated');
  } catch (resetError) {
    console.error('❌ Error resetting database:', resetError.message);
    process.exit(1);
  }
}

// Step 4: Seed admin data
console.log('\n🌱 Step 4: Seeding admin data...');
try {
  execSync('npx tsx prisma/seed-admin.ts', { stdio: 'inherit' });
  console.log('✅ Admin data seeded successfully');
} catch (error) {
  console.error('❌ Error seeding admin data:', error.message);
  console.log('You may need to run this manually: npx tsx prisma/seed-admin.ts');
}

// Step 5: Verify setup
console.log('\n✅ Step 5: Verifying setup...');
const requiredFiles = [
  'app/admin/login/page.tsx',
  'app/admin/dashboard/page.tsx',
  'components/admin/TrafficAnalyticsTab.tsx',
  'components/admin/DatabaseManagementTab.tsx',
  'components/admin/UserManagementTab.tsx',
  'components/admin/AdminUserManagementTab.tsx',
  'components/admin/EmailManagementTab.tsx',
  'lib/admin-auth.ts',
  'lib/analytics.ts',
  'lib/audit-log.ts',
  'lib/rate-limiter.ts',
  'middleware.ts',
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Missing file: ${file}`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('✅ All required files are present');
}

// Final message
console.log('\n🎉 Admin Dashboard Setup Complete!\n');
console.log('📝 Next steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Navigate to: http://localhost:3000/admin/login');
console.log('3. Login with:');
console.log('   Email: info@medaghar.com');
console.log('   Password: (the value of ADMIN_SEED_PASSWORD in your .env)');
console.log('\n📖 For more information, see ADMIN_DASHBOARD_GUIDE.md\n');

