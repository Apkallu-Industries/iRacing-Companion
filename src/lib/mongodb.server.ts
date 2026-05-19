/**
 * MongoDB client for server-side functions.
 * Handles connections to MongoDB for telemetry storage and queries.
 */

import { MongoClient, Db, Collection } from "mongodb";

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (mongoClient) return mongoClient;

  let mongoUri = process.env.MONGODB_URI;

  // If MONGODB_URI not set, use local MongoDB (no auth)
  if (!mongoUri) {
    mongoUri = "mongodb://localhost:27017";
    console.log("MONGODB_URI not configured, using local MongoDB at", mongoUri);
  }

  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  return mongoClient;
}

export async function getDb(): Promise<Db> {
  if (db) return db;
  const client = await getMongoClient();
  db = client.db("iracing_companion");
  return db;
}

export async function getTelemetrySamplesCollection(): Promise<
  Collection<TelemetrySample>
> {
  const database = await getDb();
  return database.collection("telemetry_samples");
}

export async function getChannelsManifestCollection(): Promise<
  Collection<ChannelsManifest>
> {
  const database = await getDb();
  return database.collection("channels_manifest");
}

export async function getLapsCollection(): Promise<Collection<LapRecord>> {
  const database = await getDb();
  return database.collection("laps");
}

export async function getSessionsCollection(): Promise<
  Collection<SessionRecord>
> {
  const database = await getDb();
  return database.collection("sessions");
}

export interface TelemetrySample {
  _id?: string;
  session_id: string;
  timestamp: string;
  lap_number: number;
  channels: Record<string, ChannelValue>;
}

export interface ChannelValue {
  samples: number[];
  min: number;
  max: number;
  avg: number;
}

export interface ChannelsManifest {
  _id?: string;
  session_id: string;
  channels: Array<{
    name: string;
    unit: string;
    type: "numeric" | "boolean";
    group?: string;
  }>;
}

export interface LapRecord {
  _id?: string;
  session_id: string;
  lap_number: number;
  duration_s: number;
  fuel_remaining_l?: number;
  track_temp_c?: number;
  air_temp_c?: number;
  consumed_fuel_l?: number;
}

export interface SessionRecord {
  _id?: string;
  session_id: string;
  bridge_id: string;
  user_id: string;
  track: string;
  car: string;
  driver: string;
  session_info_yaml: string;
  channels_manifest_id?: string;
  start_time: string;
  end_time?: string;
}
