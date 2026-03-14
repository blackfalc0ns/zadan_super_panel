const fs = require('fs');
const http = require('http');
const path = require('path');

const loginResponsePath = 'd:/fullstack project/Zadana/login-response.json';
let content = fs.readFileSync(loginResponsePath);
// Check for UTF-16 LE BOM (0xFF 0xFE)
if (content[0] === 0xFF && content[1] === 0xFE) {
  content = content.slice(2);
}
const response = JSON.parse(content.toString('utf16le'));
const token = response.tokens.accessToken;

const options = {
  hostname: 'localhost',
  port: 5298,
  path: '/api/admin/catalog/brands?includeInactive=false',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, res => {
  let data = '';
  console.log(`Status: ${res.statusCode}`);
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Body:', data);
    process.exit(0);
  });
});

req.on('error', error => {
  console.error(error);
  process.exit(1);
});

req.end();
