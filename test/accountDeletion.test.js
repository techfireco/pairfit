const test = require('node:test');
const assert = require('node:assert/strict');
const { deleteUserAccount } = require('../lib/accountDeletion');

const USER_ID = '11111111-2222-3333-4444-555555555555';
const BUCKET = 'wardrobe';

// Minimal stand-in for the supabase-js client: records every call in order so
// tests can assert both what was deleted and the order it happened in.
// `tree` maps a folder path to its entries; sub-folders have `id: null`, like Supabase Storage.
function fakeSupabase({ fileCount = 0, tree, failRemove = false, failRows = false, failAuth = false } = {}) {
  const calls = [];
  const files = Array.from({ length: fileCount }, (_, i) => ({ id: `id-${i}`, name: `photo-${i}.jpg` }));
  const folders = tree || { [USER_ID]: files };

  const storageApi = {
    async list(folder, { limit, offset }) {
      calls.push({ op: 'list', folder, limit, offset });
      return { data: (folders[folder] || []).slice(offset, offset + limit), error: null };
    },
    async remove(paths) {
      calls.push({ op: 'remove', paths });
      return failRemove ? { data: null, error: { message: 'storage down' } } : { data: [], error: null };
    },
  };

  return {
    calls,
    storage: {
      from(bucket) {
        calls.push({ op: 'bucket', bucket });
        return storageApi;
      },
    },
    from(table) {
      return {
        delete() {
          return {
            async eq(column, value) {
              calls.push({ op: 'deleteRows', table, column, value });
              return { error: failRows ? { message: 'db down' } : null };
            },
          };
        },
      };
    },
    auth: {
      admin: {
        async deleteUser(id) {
          calls.push({ op: 'deleteUser', id });
          return { data: null, error: failAuth ? { message: 'auth down' } : null };
        },
      },
    },
  };
}

const opsOf = (calls) => calls.map((c) => c.op);

test('removes every photo, then the items rows, then the auth user', async () => {
  // Arrange
  const sb = fakeSupabase({ fileCount: 3 });

  // Act
  const result = await deleteUserAccount(sb, { userId: USER_ID, bucket: BUCKET });

  // Assert
  assert.deepEqual(result, { removedFiles: 3 });
  assert.deepEqual(opsOf(sb.calls), ['bucket', 'list', 'remove', 'deleteRows', 'deleteUser']);
  const remove = sb.calls.find((c) => c.op === 'remove');
  assert.deepEqual(remove.paths, [
    `${USER_ID}/photo-0.jpg`,
    `${USER_ID}/photo-1.jpg`,
    `${USER_ID}/photo-2.jpg`,
  ]);
  assert.deepEqual(sb.calls.find((c) => c.op === 'deleteRows'), {
    op: 'deleteRows', table: 'items', column: 'user_id', value: USER_ID,
  });
  assert.deepEqual(sb.calls.find((c) => c.op === 'deleteUser'), { op: 'deleteUser', id: USER_ID });
});

test('only lists the user\'s own folder in the wardrobe bucket', async () => {
  const sb = fakeSupabase({ fileCount: 1 });

  await deleteUserAccount(sb, { userId: USER_ID, bucket: BUCKET });

  assert.equal(sb.calls.find((c) => c.op === 'bucket').bucket, BUCKET);
  assert.ok(sb.calls.filter((c) => c.op === 'list').every((c) => c.folder === USER_ID));
});

test('also removes photos stored in sub-folders of the user\'s folder', async () => {
  // Arrange: the old client-write policy let users upload to any path under their folder.
  const sb = fakeSupabase({
    tree: {
      [USER_ID]: [{ id: 'f1', name: 'top.jpg' }, { id: null, name: 'extra' }],
      [`${USER_ID}/extra`]: [{ id: 'f2', name: 'nested.jpg' }, { id: null, name: 'deeper' }],
      [`${USER_ID}/extra/deeper`]: [{ id: 'f3', name: 'deep.jpg' }],
    },
  });

  // Act
  const result = await deleteUserAccount(sb, { userId: USER_ID, bucket: BUCKET });

  // Assert
  assert.equal(result.removedFiles, 3);
  const removed = sb.calls.filter((c) => c.op === 'remove').flatMap((c) => c.paths);
  assert.deepEqual(removed.sort(), [
    `${USER_ID}/extra/deeper/deep.jpg`,
    `${USER_ID}/extra/nested.jpg`,
    `${USER_ID}/top.jpg`,
  ]);
  assert.ok(sb.calls.filter((c) => c.op === 'list').every((c) => c.folder.startsWith(USER_ID)));
});

test('handles a closet of exactly one full page without skipping or repeating photos', async () => {
  const sb = fakeSupabase({ fileCount: 100 });

  const result = await deleteUserAccount(sb, { userId: USER_ID, bucket: BUCKET });

  assert.equal(result.removedFiles, 100);
  // A full first page means one more (empty) page must be checked.
  assert.deepEqual(sb.calls.filter((c) => c.op === 'list').map((c) => c.offset), [0, 100]);
  const removed = sb.calls.filter((c) => c.op === 'remove').flatMap((c) => c.paths);
  assert.equal(new Set(removed).size, 100);
});

test('pages through large closets and removes photos in batches of at most 100', async () => {
  const sb = fakeSupabase({ fileCount: 250 });

  const result = await deleteUserAccount(sb, { userId: USER_ID, bucket: BUCKET });

  assert.equal(result.removedFiles, 250);
  const removes = sb.calls.filter((c) => c.op === 'remove');
  assert.deepEqual(removes.map((r) => r.paths.length), [100, 100, 50]);
  const removedPaths = new Set(removes.flatMap((r) => r.paths));
  assert.equal(removedPaths.size, 250);
});

test('skips the storage remove call when the user has no photos', async () => {
  const sb = fakeSupabase({ fileCount: 0 });

  const result = await deleteUserAccount(sb, { userId: USER_ID, bucket: BUCKET });

  assert.deepEqual(result, { removedFiles: 0 });
  assert.ok(!opsOf(sb.calls).includes('remove'));
  assert.ok(opsOf(sb.calls).includes('deleteUser'));
});

test('keeps the auth user when removing photos fails, so the user can retry', async () => {
  const sb = fakeSupabase({ fileCount: 2, failRemove: true });

  await assert.rejects(
    deleteUserAccount(sb, { userId: USER_ID, bucket: BUCKET }),
    /photos/i
  );
  assert.ok(!opsOf(sb.calls).includes('deleteRows'));
  assert.ok(!opsOf(sb.calls).includes('deleteUser'));
});

test('keeps the auth user when deleting the items rows fails', async () => {
  const sb = fakeSupabase({ fileCount: 1, failRows: true });

  await assert.rejects(
    deleteUserAccount(sb, { userId: USER_ID, bucket: BUCKET }),
    /items/i
  );
  assert.ok(!opsOf(sb.calls).includes('deleteUser'));
});

test('throws when the auth user cannot be deleted', async () => {
  const sb = fakeSupabase({ fileCount: 1, failAuth: true });

  await assert.rejects(
    deleteUserAccount(sb, { userId: USER_ID, bucket: BUCKET }),
    /auth user/i
  );
});

test('rejects a missing user id without touching storage or the database', async () => {
  const sb = fakeSupabase({ fileCount: 1 });

  await assert.rejects(deleteUserAccount(sb, { userId: '', bucket: BUCKET }), /user id/i);
  assert.deepEqual(sb.calls, []);
});
