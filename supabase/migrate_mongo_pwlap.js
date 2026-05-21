/* Migration script to create MongoDB collections and indexes for pwlap features.

Usage: set MONGODB_URI and optionally MONGODB_DB, then run:
  node supabase\migrate_mongo_pwlap.js

This script is safe to re-run: it checks for existing collections and indexes.
*/

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'iracing';

async function ensureCollection(db, name, validator) {
  const exists = await db.listCollections({ name }).toArray();
  if (exists.length === 0) {
    await db.createCollection(name, { validator });
    console.log(`Created collection: ${name}`);
  } else {
    console.log(`Collection already exists: ${name}`);
  }
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    // user_signing_keys
    await ensureCollection(db, 'user_signing_keys', {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user_id', 'public_key', 'created_at'],
        properties: {
          user_id: { bsonType: 'string' },
          public_key: { bsonType: 'string' },
          private_key: { bsonType: ['string', 'null'] },
          created_at: { bsonType: 'date' },
          updated_at: { bsonType: 'date' }
        }
      }
    });
    await db.collection('user_signing_keys').createIndex({ user_id: 1 }, { unique: true });

    // pwlap_imports
    await ensureCollection(db, 'pwlap_imports', {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user_id', 'created_at'],
        properties: {
          user_id: { bsonType: 'string' },
          session_id: { bsonType: ['string', 'null'] },
          filename: { bsonType: ['string', 'null'] },
          granularity: { enum: ['metadata', 'setup', 'full'] },
          imported_from_user_id: { bsonType: ['string', 'null'] },
          encrypted: { bsonType: 'bool' },
          signed: { bsonType: 'bool' },
          file_hash: { bsonType: ['string', 'null'] },
          file_size_bytes: { bsonType: ['int', 'long', 'double', 'null'] },
          created_at: { bsonType: 'date' }
        }
      }
    });
    await db.collection('pwlap_imports').createIndex({ user_id: 1 });
    await db.collection('pwlap_imports').createIndex({ session_id: 1 });
    await db.collection('pwlap_imports').createIndex({ created_at: -1 });

    // pwlap_exports
    await ensureCollection(db, 'pwlap_exports', {
      $jsonSchema: {
        bsonType: 'object',
        required: ['user_id', 'session_id', 'filename', 'created_at'],
        properties: {
          user_id: { bsonType: 'string' },
          session_id: { bsonType: 'string' },
          filename: { bsonType: 'string' },
          granularity: { enum: ['metadata', 'setup', 'full'] },
          encrypted: { bsonType: 'bool' },
          signed: { bsonType: 'bool' },
          file_size_bytes: { bsonType: ['int', 'long', 'double', 'null'] },
          storage_path: { bsonType: ['string', 'null'] },
          download_count: { bsonType: 'int' },
          last_downloaded_at: { bsonType: ['date', 'null'] },
          expires_at: { bsonType: ['date', 'null'] },
          created_at: { bsonType: 'date' }
        }
      }
    });
    await db.collection('pwlap_exports').createIndex({ user_id: 1 });
    await db.collection('pwlap_exports').createIndex({ session_id: 1 });
    await db.collection('pwlap_exports').createIndex({ created_at: -1 });

    console.log('MongoDB pwlap schema migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

run();
