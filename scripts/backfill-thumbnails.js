// scripts/backfill-thumbnails.js
// Backfills 240px thumbnails for existing wardrobe photos in Supabase Storage.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-thumbnails.js

const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'wardrobe';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function backfill() {
  console.log('Fetching items from database...');
  const { data: items, error } = await supabase.from('items').select('id, user_id, photo_path, name');
  if (error) {
    console.error('Error fetching items:', error);
    process.exit(1);
  }

  console.log(`Found ${items.length} items to process.`);
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    const thumbPath = item.photo_path.replace(/\.jpg$/, '_thumb.jpg');
    try {
      // Check if thumbnail already exists
      const { data: existingThumb } = await supabase.storage.from(BUCKET).download(thumbPath);
      if (existingThumb) {
        skipped++;
        continue;
      }

      // Download original photo
      const { data: origBlob, error: dlErr } = await supabase.storage.from(BUCKET).download(item.photo_path);
      if (dlErr || !origBlob) {
        console.warn(`[Skip] Could not download original for item ${item.id} (${item.name}):`, dlErr?.message);
        failed++;
        continue;
      }

      const origBuffer = Buffer.from(await origBlob.arrayBuffer());
      const thumbBuffer = await sharp(origBuffer)
        .resize(240, 240, { fit: 'cover' })
        .jpeg({ quality: 75 })
        .toBuffer();

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(thumbPath, thumbBuffer, { contentType: 'image/jpeg', upsert: true });

      if (upErr) {
        console.warn(`[Fail] Could not upload thumbnail for item ${item.id}:`, upErr.message);
        failed++;
      } else {
        processed++;
        console.log(`[Success] Created thumbnail for item ${item.id} (${item.name}) -> ${thumbPath}`);
      }
    } catch (err) {
      console.error(`[Error] Processing item ${item.id}:`, err.message);
      failed++;
    }
  }

  console.log(`\nBackfill complete: ${processed} created, ${skipped} already existed, ${failed} failed.`);
}

backfill();
