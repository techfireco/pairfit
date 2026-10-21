// Permanent account deletion (App Store 5.1.1(v), Google Play account deletion).
//
// Order matters: photos first, then wardrobe rows, then the auth user. If any
// step fails we stop BEFORE deleting the auth user, so the person can sign in
// and retry instead of leaving photos behind that no account owns.

const LIST_PAGE_SIZE = 100;
const REMOVE_BATCH_SIZE = 100;

function chunk(list, size) {
  return Array.from({ length: Math.ceil(list.length / size) }, (_, i) =>
    list.slice(i * size, (i + 1) * size)
  );
}

// Photos live at {user_id}/{uuid}.jpg (+ _thumb.jpg). Sub-folders are walked too,
// because the old client-write policy allowed uploads to any path under the folder.
async function listPhotoPaths(bucketApi, folder) {
  let paths = [];
  for (let offset = 0; ; offset += LIST_PAGE_SIZE) {
    const { data, error } = await bucketApi.list(folder, { limit: LIST_PAGE_SIZE, offset });
    if (error) throw new Error(`Could not list photos: ${error.message}`);
    const page = data || [];
    // Entries without an id are sub-folders, not files.
    const files = page.filter(e => e.id).map(e => `${folder}/${e.name}`);
    let nested = [];
    for (const sub of page.filter(e => !e.id)) {
      nested = [...nested, ...(await listPhotoPaths(bucketApi, `${folder}/${sub.name}`))];
    }
    paths = [...paths, ...files, ...nested];
    if (page.length < LIST_PAGE_SIZE) return paths;
  }
}

async function deleteUserAccount(supabase, { userId, bucket }) {
  if (!userId) throw new Error('A user id is required to delete an account');

  const bucketApi = supabase.storage.from(bucket);
  const paths = await listPhotoPaths(bucketApi, userId);
  for (const batch of chunk(paths, REMOVE_BATCH_SIZE)) {
    const { error } = await bucketApi.remove(batch);
    if (error) throw new Error(`Could not remove photos: ${error.message}`);
  }

  const { error: rowsError } = await supabase.from('items').delete().eq('user_id', userId);
  if (rowsError) throw new Error(`Could not delete items: ${rowsError.message}`);

  // Cascades to public.profiles (and items, if any were left) via FK on auth.users.
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw new Error(`Could not delete auth user: ${authError.message}`);

  return { removedFiles: paths.length };
}

module.exports = { deleteUserAccount };
