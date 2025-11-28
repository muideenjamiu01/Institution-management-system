// Debug script to check authentication status
// Run this in the browser console on the applicant portal

console.log('=== Applicant Authentication Debug ===');

const accessToken = localStorage.getItem('applicant_access_token');
const refreshToken = localStorage.getItem('applicant_refresh_token');
const user = localStorage.getItem('applicant_user');

console.log('Access Token:', accessToken ? `Present (${accessToken.substring(0, 20)}...)` : '❌ MISSING');
console.log('Refresh Token:', refreshToken ? `Present (${refreshToken.substring(0, 20)}...)` : '❌ MISSING');
console.log('User Data:', user ? JSON.parse(user) : '❌ MISSING');

if (accessToken) {
  // Decode JWT to check expiration
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const exp = new Date(payload.exp * 1000);
    const now = new Date();
    console.log('Token Expiry:', exp.toLocaleString());
    console.log('Current Time:', now.toLocaleString());
    console.log('Token Valid:', exp > now ? '✅ YES' : '❌ EXPIRED');
    console.log('Token Payload:', payload);
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
}

// Test API call
if (accessToken) {
  fetch('http://localhost:5000/api/applicant', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(r => r.json())
  .then(data => console.log('API Test Result:', data))
  .catch(err => console.error('API Test Error:', err));
}

console.log('====================================');
