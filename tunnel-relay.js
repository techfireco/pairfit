// Localtunnel relay that works behind an HTTP CONNECT proxy.
//
// The stock `lt` client opens raw TCP sockets, which this sandbox blocks.
// This script tunnels those sockets through the egress proxy via HTTP CONNECT,
// then speaks the exact localtunnel data-plane protocol (bridge remote<->local,
// one request per connection, maintain a pool of max_conn_count).
//
// Usage: node tunnel-relay.js [/tmp/lt-info.json]
//   1. First grab tunnel info: curl -s "https://localtunnel.me/?new" -o /tmp/lt-info.json
//   2. node tunnel-relay.js   (prints the public URL)

const net = require('net');
const fs = require('fs');

const info = JSON.parse(fs.readFileSync(process.argv[2] || '/tmp/lt-info.json', 'utf8'));
const LOCAL_PORT = Number(process.env.LOCAL_PORT || 3000);

const proxy = new URL(process.env.https_proxy || process.env.HTTPS_PROXY || '');
if (!proxy.hostname) {
  console.error('[relay] no proxy found in https_proxy/HTTPS_PROXY env');
  process.exit(1);
}
// NOTE: credentials are used for Proxy-Authorization only, never logged.
const proxyAuth =
  'Basic ' +
  Buffer.from(decodeURIComponent(proxy.username) + ':' + decodeURIComponent(proxy.password)).toString(
    'base64'
  );

const REMOTE_HOST = 'localtunnel.me';
const REMOTE_PORT = info.port;
const POOL = info.max_conn_count || 2;

let shuttingDown = false;
let liveCount = 0;

function openDataConn() {
  if (shuttingDown) return;
  let bridged = false;
  const sock = net.connect({ host: proxy.hostname, port: Number(proxy.port) || 3128 });

  sock.on('connect', () => {
    sock.write(
      `CONNECT ${REMOTE_HOST}:${REMOTE_PORT} HTTP/1.1\r\n` +
        `Host: ${REMOTE_HOST}:${REMOTE_PORT}\r\n` +
        `Proxy-Authorization: ${proxyAuth}\r\n` +
        `Proxy-Connection: keep-alive\r\n\r\n`
    );
  });

  let head = '';
  const onHead = (chunk) => {
    head += chunk.toString('latin1');
    const end = head.indexOf('\r\n\r\n');
    if (end === -1) return;
    const statusLine = head.slice(0, head.indexOf('\r\n'));
    const leftover = Buffer.from(head.slice(end + 4), 'latin1');
    sock.removeListener('data', onHead);
    if (!/^HTTP\/1\.[01] 200/.test(statusLine)) {
      console.error('[relay] CONNECT rejected:', statusLine);
      sock.destroy();
      setTimeout(openDataConn, 3000);
      return;
    }
    bridged = true;
    liveCount++;
    console.log(`[relay] data connection up (${liveCount}/${POOL}) -> ${info.url}`);
    sock.pause();
    const local = net.connect({ host: '127.0.0.1', port: LOCAL_PORT });
    local.on('connect', () => {
      if (leftover.length) sock.unshift(leftover);
      sock.resume();
      sock.pipe(local).pipe(sock);
    });
    local.on('error', () => sock.destroy());
    sock.once('close', () => {
      liveCount = Math.max(0, liveCount - 1);
      local.destroy();
      if (!shuttingDown) setTimeout(openDataConn, 1500);
    });
  };
  sock.on('data', onHead);
  sock.on('error', () => {
    if (!bridged) setTimeout(openDataConn, 3000);
  });
}

process.on('SIGTERM', () => {
  shuttingDown = true;
  process.exit(0);
});
process.on('SIGINT', () => {
  shuttingDown = true;
  process.exit(0);
});

for (let i = 0; i < POOL; i++) setTimeout(openDataConn, i * 700);
console.log(`[relay] public url: ${info.url}  (pool=${POOL}, local=:${LOCAL_PORT})`);
