const http = require('http');
const url = 'http://localhost:4000/api/products/92';
console.log('GET', url);
http.get(url, (res) => {
  console.log('STATUS', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('BODY', data);
  });
}).on('error', (err) => {
  console.error('ERROR', err.message);
});
