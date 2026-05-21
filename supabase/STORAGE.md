# Creating pwlap_exports Supabase Storage bucket

Goal: create a storage bucket to hold exported .pwlap files and set appropriate access.

Dashboard (recommended):
1. Open Supabase project (Project ref in supabase/config.toml).
2. Go to Storage -> Create new bucket.
3. Name: pwlap_exports
4. Set public/private according to needs (recommended: private, use signed URLs for downloads).
5. Configure CORS and lifecycle/expiration if needed.

CLI/API (advanced):
- The Supabase REST/Storage API or CLI can create buckets, but requires a service_role key or admin access. Do not store keys in repo.

Post-creation:
- Note the storage path and update application config to write exports to the bucket.
- Ensure RBAC/Policies allow only the owning user to generate signed download links.

CLI script:
- A helper script was added at supabase/create_pwlap_bucket.js that can create the bucket using service role credentials.
- Run with environment variables:
  SUPABASE_URL="https://<project>.supabase.co" SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" node supabase/create_pwlap_bucket.js
- The script will create a private bucket named `pwlap_exports` if it doesn't exist.

Security:
- Do NOT commit service_role keys to source control. Run the script from a secure admin machine or CI with secrets stored in environment variables.
