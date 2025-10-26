const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testGeocoding() {
  const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
  const CLIENT_SECRET = process.env.NAVER_MAPS_CLIENT_SECRET;
  const address = '경기도 용인시 수지구 신수로 767';

  console.log('🔍 Testing Naver Maps Geocoding API');
  console.log('Client ID:', CLIENT_ID);
  console.log('Client Secret:', CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 5)}...` : 'NOT_SET');
  console.log('Address:', address);
  console.log('');

  try {
    const response = await axios.get('https://maps.apigw.ntruss.com/map-geocode/v2/geocode', {
      params: {
        query: address,
      },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
        'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
      },
    });

    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error!');
    console.log('Status:', error.response?.status);
    console.log('StatusText:', error.response?.statusText);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Message:', error.message);
  }
}

testGeocoding();
