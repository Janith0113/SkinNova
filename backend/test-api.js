const http = require('http');

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  try {
    console.log('\n========== LEPROSY CARE ASSISTANT TESTS ==========\n');

    // Test 1: Knowledge Base
    console.log('✓ Test 1: Knowledge Base Info');
    let resp = await makeRequest('GET', '/api/leprosy/knowledge-base-info');
    console.log(`  - Categories loaded: ${resp.data.stats.categories}`);
    console.log(`  - Classifications: ${resp.data.stats.classifications}`);
    console.log(`  - Protocols: ${resp.data.stats.protocols}`);
    console.log(`  - FAQs: ${resp.data.stats.faqs}`);
    console.log();

    // Test 2: Signup
    console.log('✓ Test 2: User Signup');
    resp = await makeRequest('POST', '/api/auth/signup', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!'
    });
    console.log(`  - Status: ${resp.status}`);
    let token = null;
    let userId = null;
    if (resp.status === 200 || resp.status === 201) {
      if (resp.data.token) {
        token = resp.data.token;
        userId = resp.data.userId;
      }
    }
    console.log();

    // Test 3: Login if signup failed
    if (!token) {
      console.log('✓ Test 3: User Login');
      resp = await makeRequest('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'Test123!'
      });
      console.log(`  - Status: ${resp.status}`);
      if (resp.data.token) {
        token = resp.data.token;
        userId = resp.data.user?.id || resp.data.userId;
        console.log(`  - Token obtained: ${token.substring(0, 20)}...`);
        console.log(`  - UserId: ${userId}`);
      } else {
        console.log(`  - Login failed: ${JSON.stringify(resp.data)}`);
      }
    } else {
      console.log('✓ Test 3: User already signed up');
    }
    console.log();

    // Test 4-10: Chat Tests
    if (token) {
      const testQuestions = [
        'What is leprosy?',
        'How is leprosy treated?',
        'What are leprosy reactions?',
        'How long does treatment take?'
      ];

      for (let i = 0; i < testQuestions.length; i++) {
        console.log(`✓ Test ${4 + i}: Chat - "${testQuestions[i]}"`);
        resp = await makeRequest('POST', '/api/leprosy/chat/leprosy-assistant', 
          { message: testQuestions[i], userId },
          { 'Authorization': `Bearer ${token}` }
        );
        console.log(`  - Status: ${resp.status}`);
        if (resp.status !== 200) {
          console.log(`  - Error: ${resp.data.error || JSON.stringify(resp.data)}`);
        }
        if (resp.data.reply) {
          console.log(`  - Reply: ${resp.data.reply.substring(0, 60)}...`);
        }
        if (resp.data.sources) {
          console.log(`  - Sources: ${resp.data.sources.length} found`);
          resp.data.sources.slice(0, 2).forEach(src => {
            console.log(`    → ${src.organization}`);
          });
        } else {
          console.log(`  - Sources: None`);
        }
        if (resp.data.disclaimer) {
          console.log(`  - Disclaimer: Yes`);
        }
        console.log();
      }
    } else {
      console.log('❌ Could not obtain auth token');
    }

    console.log('========== TESTS COMPLETE ==========\n');
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

runTests();
