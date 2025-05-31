console.log('Starting test server...');

try {
  require('dotenv').config();
  console.log('✅ dotenv loaded');
  
  const express = require('express');
  console.log('✅ express loaded');
  
  const app = express();
  console.log('✅ express app created');
  
  app.get('/', (req, res) => {
    res.json({ message: 'Test server working!' });
  });
  
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
  });
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
