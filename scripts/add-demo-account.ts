import { UsersDB } from '../src/lib/database';
import { hashPassword } from '../src/lib/auth';

async function addDemoAccount() {
  try {
    console.log('🔧 Adding new demo account...');

    const passwordHash = await hashPassword('demo1234');

    const newUser = await UsersDB.create({
      email: 'demo2@example.com',
      passwordHash,
      storeName: '행복한 카페',
      storeCategory: '음식점',
      storeAddress: '경기도 용인시 수지구 풍덕천로 147',
      storeLatLng: '', // Geocoding API가 자동으로 변환
      marketingConsent: true,
    });

    console.log('✅ Demo account created successfully!');
    console.log('📧 Email:', newUser.email);
    console.log('🔑 Password: demo1234');
    console.log('🏪 Store:', newUser.storeName);
    console.log('📍 Address:', newUser.storeAddress);
    console.log('👤 User ID:', newUser.userId);

  } catch (error) {
    console.error('❌ Error creating demo account:', error);
    process.exit(1);
  }
}

addDemoAccount();
