const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.join(__dirname, 'dist');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const filename = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!filename.startsWith(root + path.sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const body = await fs.readFile(filename);
    response.writeHead(200, {
      'Content-Type': `${types[path.extname(filename)] || 'application/octet-stream'}; charset=utf-8`,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 404).end('Page not found');
  }
});

if (require.main === module) {
  const port = process.env.PORT || 4173;
  server.listen(port, '127.0.0.1', () => console.log(`Recall is ready: http://localhost:${port}`));
}

module.exports = server;
