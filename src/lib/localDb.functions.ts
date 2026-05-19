import { createServerFn } from "@tanstack/react-start";
import { connectToLocalDb } from "@/lib/db.local";
import { ObjectId } from "mongodb";

export const getLocalSessions = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const db = await connectToLocalDb();
      const sessions = await db.collection("telemetry_sessions")
        .find({})
        .sort({ recorded_at: -1 })
        .toArray();
      return { 
        data: sessions.map(s => {
          const { _id, ...rest } = s;
          return { ...rest, id: _id.toString() };
        }), 
        error: null 
      };
    } catch (e: any) {
      console.error("[MongoDB] getLocalSessions failed:", e);
      return { data: [], error: { message: e.message } };
    }
  });

export const getLocalSessionById = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => String(id))
  .handler(async ({ data: id }) => {
    try {
      const db = await connectToLocalDb();
      const session = await db.collection("telemetry_sessions").findOne({ _id: new ObjectId(id) });
      if (!session) {
        return { data: null, error: { message: "Session not found" } };
      }
      const { _id, ...rest } = session;
      return { 
        data: { ...rest, id: _id.toString() }, 
        error: null 
      };
    } catch (e: any) {
      console.error("[MongoDB] getLocalSessionById failed:", e);
      return { data: null, error: { message: e.message } };
    }
  });

export const insertLocalSession = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    try {
      const db = await connectToLocalDb();
      const doc = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const res = await db.collection("telemetry_sessions").insertOne(doc);
      const { _id, ...rest } = doc as any;
      return { 
        data: { ...rest, id: res.insertedId.toString() }, 
        error: null 
      };
    } catch (e: any) {
      console.error("[MongoDB] insertLocalSession failed:", e);
      return { data: null, error: { message: e.message } };
    }
  });

export const deleteLocalSession = createServerFn({ method: "POST" })
  .inputValidator((id: unknown) => String(id))
  .handler(async ({ data: id }) => {
    try {
      const db = await connectToLocalDb();
      await db.collection("telemetry_sessions").deleteOne({ _id: new ObjectId(id) });
      return { error: null };
    } catch (e: any) {
      console.error("[MongoDB] deleteLocalSession failed:", e);
      return { error: { message: e.message } };
    }
  });

export const testLocalDbConnection = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectToLocalDb();
      // Run a simple command to verify connection works
      await db.command({ ping: 1 });
      
      // Fetch some collection stats to confirm access
      const colls = await db.listCollections().toArray();
      const names = colls.map(c => c.name);
      
      return {
        success: true,
        message: `Successfully connected to MongoDB at 127.0.0.1:27017.\nDatabase 'iracing' is active.\nActive collections: ${names.join(", ") || "none"}`
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Connection failed.\nError: ${e.message || String(e)}\n\nSuggestions:\n1. Ensure MongoDB is installed and running on port 27017.\n2. If using Docker, run: docker run -d -p 27017:27017 mongo\n3. On Windows, check if the 'MongoDB Server' service is started in task manager.`
      };
    }
  });
