const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveProxyPath } = require('../lib/supabaseProxy');

test('allows Supabase Auth endpoints and keeps the query string', () => {
  assert.equal(resolveProxyPath('/auth/v1/token?grant_type=password'), '/auth/v1/token?grant_type=password');
  assert.equal(resolveProxyPath('/auth/v1/signup'), '/auth/v1/signup');
  assert.equal(resolveProxyPath('/auth/v1/user'), '/auth/v1/user');
  assert.equal(
    resolveProxyPath('/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fexample.com'),
    '/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fexample.com'
  );
});

test('allows server-signed photo URLs', () => {
  const signed = '/storage/v1/object/sign/wardrobe/user-1/photo.jpg?token=abc.def';
  assert.equal(resolveProxyPath(signed), signed);
});

test('blocks direct database access through PostgREST', () => {
  assert.equal(resolveProxyPath('/rest/v1/items'), null);
  assert.equal(resolveProxyPath('/rest/v1/items?select=*'), null);
  assert.equal(resolveProxyPath('/rest/v1/profiles'), null);
});

test('blocks direct storage uploads, downloads and listings', () => {
  assert.equal(resolveProxyPath('/storage/v1/object/wardrobe/user-1/photo.jpg'), null);
  assert.equal(resolveProxyPath('/storage/v1/object/upload/sign/wardrobe/user-1/photo.jpg'), null);
  assert.equal(resolveProxyPath('/storage/v1/object/list/wardrobe'), null);
  assert.equal(resolveProxyPath('/storage/v1/bucket'), null);
});

test('blocks the Studio dashboard and other gateway routes', () => {
  assert.equal(resolveProxyPath('/'), null);
  assert.equal(resolveProxyPath(''), null);
  assert.equal(resolveProxyPath('/project/default'), null);
  assert.equal(resolveProxyPath('/pg/tables'), null);
  assert.equal(resolveProxyPath('/realtime/v1/websocket'), null);
  assert.equal(resolveProxyPath('/auth/v1'), null);
});

test('blocks path traversal out of an allowed prefix', () => {
  assert.equal(resolveProxyPath('/auth/v1/../rest/v1/items'), null);
  assert.equal(resolveProxyPath('/auth/v1/%2e%2e/rest/v1/items'), null);
  assert.equal(resolveProxyPath('/auth/v1/%2E%2E/%2E%2E/rest/v1/items'), null);
  assert.equal(resolveProxyPath('/storage/v1/object/sign/../../../rest/v1/items'), null);
  assert.equal(resolveProxyPath('/auth/v1\\..\\..\\rest/v1/items'), null);
});

test('blocks encoded slashes and backslashes that an upstream could decode', () => {
  assert.equal(resolveProxyPath('/auth/v1/..%2F..%2Frest/v1/items'), null);
  assert.equal(resolveProxyPath('/auth/v1/%2f..%2frest/v1/items'), null);
  assert.equal(resolveProxyPath('/auth/v1/..%5C..%5Crest/v1/items'), null);
});

test('blocks absolute URLs and non-path input', () => {
  assert.equal(resolveProxyPath('http://evil.example/auth/v1/token'), null);
  assert.equal(resolveProxyPath('//evil.example/auth/v1/token'), null);
  assert.equal(resolveProxyPath('/\\evil.example/auth/v1/token'), null);
  assert.equal(resolveProxyPath(undefined), null);
});
