import { createClient } from '@supabase/supabase-js';

// Usage:
// SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... node supabase/create_pwlap_bucket.js

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'pwlap_exports';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function run() {
  try {
    console.log('Checking existing buckets...');
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) throw listErr;

    const exists = (buckets || []).some((b) => b.name === BUCKET_NAME);
    if (exists) {
      console.log(`Bucket "${BUCKET_NAME}" already exists.`);
      process.exit(0);
    }

    console.log(`Creating bucket "${BUCKET_NAME}" (private)...`);
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, { public: false });
    if (error) throw error;
    console.log('Bucket created:', data);

    console.log('\nRecommendation: use signed URLs for downloads and avoid public buckets.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create bucket:', err instanceof Error ? err.message : err);
    process.exit(3);
  }
}

run();