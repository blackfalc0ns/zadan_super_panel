const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  email: 'admin@system.com',
  password: 'Admin@123'
});

const options = {
  hostname: 'localhost',
  port: 5298,
  path: '/api/identity/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    console.log(body);
    if (res.statusCode === 200) {
      // Save it back to login-response.json for subsequent tests
      // Note: We need to save it in UTF-16LE if the other tools expect it, 
      // but let's just save it as UTF-8 for our node scripts.
      fs.writeFileSync('d:/fullstack project/Zadana/login-response.json', body, { encoding: 'utf8' });
      console.log('Token updated successfully.');
    }
    process.exit(0);
  });
});

req.on('error', error => {
  console.error(error);
  process.exit(1);
});

req.write(data);
req.end();
