async function loadNodeFs() {
  const dynamicImport = new Function("s", "return import(s)");
  return await dynamicImport("fs");
}
async function loadNodePath() {
  const dynamicImport = new Function("s", "return import(s)");
  return await dynamicImport("path");
}
async function readDbConfig() {
  try {
    const fs = await loadNodeFs();
    const path = await loadNodePath();
    const configPath = path.resolve(process.cwd(), "db-config.json");
    const data = await fs.promises.readFile(configPath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return {
      localUri: "mongodb://127.0.0.1:27017/",
      cloudUri: "",
    };
  }
}
async function writeDbConfig(config) {
  const fs = await loadNodeFs();
  const path = await loadNodePath();
  const configPath = path.resolve(process.cwd(), "db-config.json");
  await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}
let cachedClient = null;
let cachedDb = null;
function resetDbConnection() {
  if (cachedClient) {
    try {
      cachedClient.close();
      console.log("[MongoDB] Closed cached MongoDB connection.");
    } catch (e) {
      console.error("[MongoDB] Error closing cached client:", e);
    }
  }
  cachedClient = null;
  cachedDb = null;
}
async function loadMongo() {
  const dynamicImport = new Function("s", "return import(s)");
  return await dynamicImport("mongodb");
}
async function connectToLocalDb() {
  if (cachedDb) {
    return cachedDb;
  }
  const { MongoClient, ServerApiVersion } = await loadMongo();
  const config = await readDbConfig();
  const connectionUri = config.localUri || "mongodb://127.0.0.1:27017/";
  const client = new MongoClient(connectionUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Failsafe timeouts so the app doesn't hang if MongoDB isn't running
    serverSelectionTimeoutMS: 2e3,
    connectTimeoutMS: 2e3,
  });
  try {
    await client.connect();
    const db = client.db("iracing");
    cachedClient = client;
    cachedDb = db;
    console.log(`[MongoDB] Connected to database successfully at: ${connectionUri}`);
    setupIndexes(db).catch(console.error);
    return db;
  } catch (error) {
    console.error(`[MongoDB] Connection failed at ${connectionUri}.`, error);
    throw error;
  }
}
async function setupIndexes(db) {
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
        duration_s: { bsonType: ["number", "null"] },
      },
    },
  };
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);
  if (!collectionNames.includes("telemetry_sessions")) {
    await db.createCollection("telemetry_sessions", { validator: sessionValidator });
  } else {
    await db.command({ collMod: "telemetry_sessions", validator: sessionValidator });
  }
  const sessions = db.collection("telemetry_sessions");
  await sessions.createIndex({ track: 1, car: 1 });
  await sessions.createIndex({ recorded_at: -1 });
  const liveLapValidator = {
    $jsonSchema: {
      bsonType: "object",
      required: ["track", "car", "lap_time_s", "user_id"],
      properties: {
        track: { bsonType: "string" },
        car: { bsonType: "string" },
        lap_time_s: { bsonType: "number" },
        user_id: { bsonType: "string" },
        is_valid: { bsonType: "bool" },
      },
    },
  };
  if (!collectionNames.includes("live_lap_records")) {
    await db.createCollection("live_lap_records", { validator: liveLapValidator });
  } else {
    await db.command({ collMod: "live_lap_records", validator: liveLapValidator });
  }
  const lapRecords = db.collection("live_lap_records");
  await lapRecords.createIndex({ track: 1, car: 1, lap_time_s: 1 });
  await lapRecords.createIndex({ recorded_at: -1 });
  if (!collectionNames.includes("user_settings")) {
    await db.createCollection("user_settings");
  }
  const settings = db.collection("user_settings");
  await settings.createIndex({ user_id: 1 }, { unique: true });
}
export { resetDbConnection as a, connectToLocalDb as c, readDbConfig as r, writeDbConfig as w };
