const axios = require('axios');

const testSignup = async () => {
  try {
    console.log('Testing signup API...');
    const response = await axios.post('http://localhost:5000/api/v1/auth/signup', {
      companyName: 'Test Company API',
      defaultCurrency: 'USD',
      firstName: 'John',
      lastName: 'Doe', 
      email: 'test-api@example.com',
      password: 'password123'
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    console.error('❌ Error message:', error.message);
  }
};

testSignup();