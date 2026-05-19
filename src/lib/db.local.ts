import { MongoClient, ServerApiVersion, type Db } from "mongodb";

// Use a consistent connection URI prioritizing localhost explicitly for Windows/Docker stability.
const uri = "mongodb://127.0.0.1:27017/";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToLocalDb(): Promise<Db> {
    if (cachedDb) {
        return cachedDb;
    }

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
        // Failsafe timeouts so the app doesn't hang if MongoDB isn't running
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
    });

    try {
        await client.connect();
        cachedClient = client;
        cachedDb = client.db("iracing");
        console.log("[MongoDB] Connected to local database successfully.");

        // Ensure essential indexes exist (fire and forget)
        setupIndexes(cachedDb).catch(console.error);

        return cachedDb;
    } catch (error) {
        console.error("[MongoDB] Connection failed. Ensure the MongoDB instance is running on port 27017.", error);
        throw error;
    }
}

async function setupIndexes(db: Db) {
    // 1. Establish strict JSON Schema validation for 'telemetry_sessions'
    const sessionValidator = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "storage_path", "user_id", "track", "car"],
            properties: {
                name: { bsonType: "string" },
                storage_path: { bsonType: "string" },
                user_id: { bsonType: "string" },
                track: { bsonType: ["string", "null"] },
                car: { bsonType: ["string", "null"] },
                best_lap_s: { bsonType: ["number", "null"] },
                duration_s: { bsonType: ["number", "null"] }
            }
        }
    };

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes("telemetry_sessions")) {
        await db.createCollection("telemetry_sessions", { validator: sessionValidator });
    } else {
        await db.command({ collMod: "telemetry_sessions", validator: sessionValidator });
    }

    const sessions = db.collection("telemetry_sessions");
    await sessions.createIndex({ track: 1, car: 1 });
    await sessions.createIndex({ recorded_at: -1 });

    // 2. Establish validation for 'live_lap_records'
    const liveLapValidator = {
        $jsonSchema: {
            bsonType: "object",
            required: ["track", "car", "lap_time_s", "user_id"],
            properties: {
                track: { bsonType: "string" },
                car: { bsonType: "string" },
                lap_time_s: { bsonType: "number" },
                user_id: { bsonType: "string" },
                is_valid: { bsonType: "bool" }
            }
        }
    };

    if (!collectionNames.includes("live_lap_records")) {
        await db.createCollection("live_lap_records", { validator: liveLapValidator });
    } else {
        await db.command({ collMod: "live_lap_records", validator: liveLapValidator });
    }

    const lapRecords = db.collection("live_lap_records");
    await lapRecords.createIndex({ track: 1, car: 1, lap_time_s: 1 });
    await lapRecords.createIndex({ recorded_at: -1 });

    // Settings
    if (!collectionNames.includes("user_settings")) {
        await db.createCollection("user_settings");
    }
    const settings = db.collection("user_settings");
    await settings.createIndex({ user_id: 1 }, { unique: true });
}
