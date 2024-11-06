import http from 'http';

const ports = [3000, 3001, 3002];
const servers = [];

// Create test servers
ports.forEach(port => {
  const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Test server running on port ${port}`);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Test server started on port ${port}`);
  });

  servers.push(server);
});

// Handle cleanup
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Closing servers...');
  servers.forEach(server => server.close());
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Closing servers...');
  servers.forEach(server => server.close());
}); 