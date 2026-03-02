// Quick diagnostic for knowledge base
const fs = require('fs');
const path = require('path');

console.log('\n🔍 QUICK KNOWLEDGE BASE DIAGNOSTIC\n');

// Check if files exist
const kbPath = path.join(__dirname, 'src/knowledge-base');
const files = [
  'leprosy-classification.json',
  'treatment-protocols.json',
  'reactions-management.json',
  'faq-database.json'
];

console.log('1️⃣ Checking files exist:');
files.forEach(file => {
  const filePath = path.join(kbPath, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  
  if (exists) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`      └─ Data keys: ${Object.keys(data).join(', ')}`);
      
      // Show structure
      if (file === 'leprosy-classification.json') {
        if (data.classifications) {
          console.log(`      └─ Classifications count: ${data.classifications.length}`);
          console.log(`      └─ First classification name: ${data.classifications[0]?.name}`);
        }
      }
    } catch (e) {
      console.log(`      └─ ERROR: ${e.message}`);
    }
  }
});

console.log('\n2️⃣ Testing search algorithm manually:');

// Load knowledge base manually
const kbData = {};
files.forEach(file => {
  const filePath = path.join(kbPath, file);
  if (fs.existsSync(filePath)) {
    const category = file.replace('.json', '');
    kbData[category] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
});

// Test classification search
console.log('\n   Testing: "what is leprosy?"');
if (kbData['leprosy-classification']?.classifications) {
  const query = 'what is leprosy?';
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(' ').filter(w => w.length > 2);
  
  console.log(`   Query words: ${queryWords}`);
  
  let matchCount = 0;
  kbData['leprosy-classification'].classifications.forEach((c, i) => {
    const name = c.name || c.type || '';
    const code = c.code || c.id || '';
    const desc = c.clinical_description || c.description || '';
    const bodyText = `${name} ${code} ${desc}`.toLowerCase();
    
    console.log(`\n   Classification ${i + 1}: "${name}"`);
    console.log(`      Body text: "${bodyText.substring(0, 100)}..."`);
    
    let score = 0;
    queryWords.forEach(word => {
      if (bodyText.includes(word)) {
        score += 10;
        console.log(`      ✅ Word "${word}" found in body (+10)`);
      }
    });
    
    if (bodyText.includes(queryLower)) {
      score += 5;
      console.log(`      ✅ Query "${queryLower}" found in body (+5)`);
    }
    
    if (score > 0) {
      matchCount++;
      console.log(`      Result Score: ${score}`);
    } else {
      console.log(`      Result Score: 0 (NO MATCH)`);
    }
  });
  
  console.log(`\n   Total matches found: ${matchCount}`);
}

console.log('\n✅ Diagnostic complete!\n');
