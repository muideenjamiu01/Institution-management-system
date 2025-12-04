#!/usr/bin/env node

// Quick test to check if servers are running and payment endpoints are accessible
const axios = require('axios');

async function quickTest() {
  console.log('🔧 Quick Payment System Test...\n');
  
  const API_BASE = 'http://localhost:5000/api';
  
  try {
    // Test 1: Health check
    console.log('1. Testing server health...');
    const healthRes = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    console.log('   ✅ Backend server is running:', healthRes.data);
    
    // Test 2: Admin payment routes structure
    console.log('\n2. Testing admin payment routes (expect 401 without auth)...');
    try {
      await axios.get(`${API_BASE}/admin/payments/statistics`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Admin routes properly protected');
      } else {
        console.log('   ⚠️  Unexpected error:', error.message);
      }
    }
    
    // Test 3: Student payment routes structure  
    console.log('\n3. Testing student payment routes (expect 401 without auth)...');
    try {
      await axios.get(`${API_BASE}/student/payments/invoices`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Student routes properly protected');
      } else {
        console.log('   ⚠️  Unexpected error:', error.message);
      }
    }
    
    console.log('\n✅ Payment system backend is ready!');
    console.log('\nRecommendations:');
    console.log('1. Start frontend: cd frontend && npm run dev');
    console.log('2. Login to admin dashboard to access payment management');
    console.log('3. Test invoice creation and payment processing');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server not running. Start with: cd backend && npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

quickTest().catch(console.error);