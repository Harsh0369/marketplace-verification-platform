process.env.NODE_ENV = 'test';

import { randomBytes } from 'crypto';
import app from '../src/app';
import { sequelize } from '../src/db/database';

const PORT = 3001;
const API_URL = `http://localhost:${PORT}`;

async function runTest() {
  console.log('--- Starting API End-to-End Tests ---');
  
  // Start the server
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); // ensure tables exist and schema is updated
  
  const server = app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });

  try {
    // 1. Register a user
    const userEmail = `test-${randomBytes(4).toString('hex')}@example.com`;
    const password = 'Password123!';
    
    console.log(`\n[1] Registering user: ${userEmail}`);
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password, name: 'Test User' })
    });
    const registerData = await registerRes.json();
    
    if (!registerRes.ok) throw new Error(JSON.stringify(registerData));
    const token = registerData.data.token;
    console.log(`[1] Success! Token acquired.`);

    // 2. Create a "Good" Product
    console.log(`\n[2] Creating a valid product...`);
    const goodProductRes = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Sony Alpha A7 III Camera',
        description: 'Barely used mirrorless camera. Great condition.',
        category: 'Electronics',
        price: 1500,
        condition: 'USED'
      })
    });
    const goodProductData = await goodProductRes.json();
    if (!goodProductRes.ok) throw new Error(JSON.stringify(goodProductData));
    const goodProductId = goodProductData.data.id;
    console.log(`[2] Success! Product ID: ${goodProductId}`);

    // 3. Create a "Bad" Product (Spam Keyword)
    console.log(`\n[3] Creating a spam product...`);
    const badProductRes = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Fake Rolex Watch',
        description: 'Whatsapp me at 555-555-5555 to buy directly! Cash app only.',
        category: 'Jewelry',
        price: 50,
        condition: 'NEW'
      })
    });
    const badProductData = await badProductRes.json();
    if (!badProductRes.ok) throw new Error(JSON.stringify(badProductData));
    const badProductId = badProductData.data.id;
    console.log(`[3] Success! Spam Product ID: ${badProductId}`);

    // 4. Download a sample image and upload it to the Good Product
    console.log(`\n[4] Downloading sample image for testing...`);
    const imageUrl = 'https://picsum.photos/600/600.jpg';
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error("Failed to download image: " + imageRes.status);
    const imageBuffer = await imageRes.arrayBuffer();
    
    console.log(`[4] Uploading image to Product ${goodProductId}... (this will trigger the full AI pipeline)`);
    
    const formData = new FormData();
    formData.append('title', 'Authentic Vintage Rolex');
    formData.append('description', 'Great condition, verifiable serial.');
    formData.append('category', 'watches');
    formData.append('price', '5000');
    formData.append('condition', 'Excellent');
    formData.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }), 'camera.jpg');

    const uploadRes = await fetch(`${API_URL}/products/${goodProductId}/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const uploadData = await uploadRes.json();
    
    if (!uploadRes.ok) throw new Error(JSON.stringify(uploadData));
    console.log(`[4] Success! Upload response Verification Result:`);
    console.dir(uploadData.data.verification, { depth: null });
    
    // 5. Upload image to Bad Product (to trigger Business Analyzer failure)
    console.log(`\n[5] Uploading image to Spam Product ${badProductId}... (Expecting FAILED)`);
    const formData2 = new FormData();
    formData2.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }), 'camera2.jpg');

    const uploadBadRes = await fetch(`${API_URL}/products/${badProductId}/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData2
    });
    const uploadBadData = await uploadBadRes.json();
    if (!uploadBadRes.ok) throw new Error(JSON.stringify(uploadBadData));
    console.log(`[5] Success! Spam Upload response Verification Result:`);
    console.dir(uploadBadData.data.verification, { depth: null });

    console.log('\n--- API Testing Complete ---');
  } catch (err) {
    console.error('\n--- TEST FAILED ---');
    console.error(err);
  } finally {
    server.close();
    await sequelize.close();
  }
}

runTest();
