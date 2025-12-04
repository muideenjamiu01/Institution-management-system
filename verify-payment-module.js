#!/usr/bin/env node

// Payment Module Verification Script
console.log('🔍 Verifying Payment Module Integration...\n');

const fs = require('fs');
const path = require('path');

const frontendPath = '/Users/muhammedmuideen/Documents/institutional-management-system/frontend';

// Check if files exist
const filesToCheck = [
  'app/dashboard/layout.tsx',
  'app/dashboard/payments/page.tsx',
  'app/dashboard/page.tsx',
];

console.log('1. Checking file structure...');
let allFilesExist = true;

filesToCheck.forEach(file => {
  const fullPath = path.join(frontendPath, file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file} - EXISTS`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check navigation integration
console.log('\n2. Checking navigation integration...');
try {
  const layoutPath = path.join(frontendPath, 'app/dashboard/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes('Payments')) {
    console.log('   ✅ Payments found in navigation');
  } else {
    console.log('   ❌ Payments NOT found in navigation');
    allFilesExist = false;
  }
  
  if (layoutContent.includes('CreditCard')) {
    console.log('   ✅ CreditCard icon imported');
  } else {
    console.log('   ❌ CreditCard icon NOT imported');
    allFilesExist = false;
  }
  
  if (layoutContent.includes('/dashboard/payments')) {
    console.log('   ✅ Payments route configured');
  } else {
    console.log('   ❌ Payments route NOT configured');
    allFilesExist = false;
  }
  
} catch (error) {
  console.log('   ❌ Error reading layout file:', error.message);
  allFilesExist = false;
}

// Check dashboard stats integration
console.log('\n3. Checking dashboard statistics integration...');
try {
  const dashboardPath = path.join(frontendPath, 'app/dashboard/page.tsx');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  if (dashboardContent.includes('totalInvoices') && dashboardContent.includes('paidInvoices')) {
    console.log('   ✅ Payment statistics integrated in dashboard');
  } else {
    console.log('   ⚠️  Payment statistics not fully integrated in dashboard');
  }
  
} catch (error) {
  console.log('   ❌ Error reading dashboard file:', error.message);
}

// Summary
console.log('\n🎯 SUMMARY:');
if (allFilesExist) {
  console.log('✅ All payment module components are properly integrated!');
  console.log('\nNext steps:');
  console.log('1. Start the frontend: cd frontend && npm run dev');
  console.log('2. Navigate to /dashboard and check if "Payments" appears in sidebar');
  console.log('3. Click on "Payments" to access the payment management interface');
  console.log('4. Verify payment statistics appear on main dashboard');
} else {
  console.log('❌ Some issues found with payment module integration.');
  console.log('Please check the files and configuration above.');
}

console.log('\n📋 Payment Module Features Available:');
console.log('- Invoice creation and management');
console.log('- Payment statistics and analytics');
console.log('- Student payment history');
console.log('- Bulk invoice operations');
console.log('- Payment method tracking');
console.log('- Export capabilities');