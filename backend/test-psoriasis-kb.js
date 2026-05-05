// Quick test for psoriasis chatbot endpoints
const BASE_URL = 'http://localhost:4000/api/psoriasis';

async function testKB() {
  console.log('\n🧪 Testing Psoriasis Knowledge Base Integration\n');

  try {
    // Test 1: Get KB info
    console.log('📚 Test 1: Get knowledge base info...');
    const infoRes = await fetch(`${BASE_URL}/knowledge-base-info`);
    const infoData = await infoRes.json();
    console.log('✅ KB Info:', infoData);

    // Test 2: Search knowledge base
    console.log('\n🔍 Test 2: Search knowledge base for "triggers"...');
    const searchRes = await fetch(`${BASE_URL}/search-knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'triggers' })
    });
    const searchData = await searchRes.json();
    console.log('✅ Search Results:', searchData);

    // Test 3: Chat endpoint
    console.log('\n💬 Test 3: Chat about psoriasis...');
    const chatRes = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What are psoriasis triggers?' })
    });
    const chatData = await chatRes.json();
    console.log('✅ Chat Response:', chatData);

    // Test 4: Another chat question
    console.log('\n💬 Test 4: Chat about treatment...');
    const chat2Res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How is psoriasis treated?' })
    });
    const chat2Data = await chat2Res.json();
    console.log('✅ Chat Response:', chat2Data);

    // Test 5: Chat with greeting
    console.log('\n💬 Test 5: Chat greeting...');
    const chat3Res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello!' })
    });
    const chat3Data = await chat3Res.json();
    console.log('✅ Chat Response:', chat3Data);

    console.log('\n✨ All tests completed successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testKB();
