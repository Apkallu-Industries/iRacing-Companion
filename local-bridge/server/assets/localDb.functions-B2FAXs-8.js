import { d as createServerRpc, b as createServerFn } from "../server.js";
import { c as connectToLocalDb, r as readDbConfig, w as writeDbConfig, a as resetDbConnection } from "./db.local-BHO1WuOq.js";
import "react/jsx-runtime";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "@tanstack/react-router/ssr/server";
async function createObjectId(id) {
  const dynamicImport = new Function("s", "return import(s)");
  const {
    ObjectId
  } = await dynamicImport("mongodb");
  return new ObjectId(id);
}
const getLocalSessions_createServerFn_handler = createServerRpc({
  id: "a89391221bf6d4f3c3355bf0dfc3e706c4f9b13cc230e42657eaa76688007322",
  name: "getLocalSessions",
  filename: "src/lib/localDb.functions.ts"
}, (opts) => getLocalSessions.__executeServer(opts));
const getLocalSessions = createServerFn({
  method: "GET"
}).handler(getLocalSessions_createServerFn_handler, async () => {
  try {
    const db = await connectToLocalDb();
    const sessions = await db.collection("telemetry_sessions").find({}).sort({
      recorded_at: -1
    }).toArray();
    return {
      data: sessions.map((s) => {
        const {
          _id,
          ...rest
        } = s;
        return {
          ...rest,
          id: _id.toString()
        };
      }),
      error: null
    };
  } catch (e) {
    console.error("[MongoDB] getLocalSessions failed:", e);
    return {
      data: [],
      error: {
        message: e.message
      }
    };
  }
});
const getLocalSessionById_createServerFn_handler = createServerRpc({
  id: "fe521dc5b8ea6cac3c068abd8536973e9e6b2e73ee00f80cc9617f99f0e4e5b4",
  name: "getLocalSessionById",
  filename: "src/lib/localDb.functions.ts"
}, (opts) => getLocalSessionById.__executeServer(opts));
const getLocalSessionById = createServerFn({
  method: "POST"
}).inputValidator((id) => String(id)).handler(getLocalSessionById_createServerFn_handler, async ({
  data: id
}) => {
  try {
    const db = await connectToLocalDb();
    const objectId = await createObjectId(id);
    const session = await db.collection("telemetry_sessions").findOne({
      _id: objectId
    });
    if (!session) {
      return {
        data: null,
        error: {
          message: "Session not found"
        }
      };
    }
    const {
      _id,
      ...rest
    } = session;
    return {
      data: {
        ...rest,
        id: _id.toString()
      },
      error: null
    };
  } catch (e) {
    console.error("[MongoDB] getLocalSessionById failed:", e);
    return {
      data: null,
      error: {
        message: e.message
      }
    };
  }
});
const insertLocalSession_createServerFn_handler = createServerRpc({
  id: "e29d9c58ccb381c467fd97ec72f1e31b8c84c96077dc15cb2d778a800c642838",
  name: "insertLocalSession",
  filename: "src/lib/localDb.functions.ts"
}, (opts) => insertLocalSession.__executeServer(opts));
const insertLocalSession = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(insertLocalSession_createServerFn_handler, async ({
  data
}) => {
  try {
    const db = await connectToLocalDb();
    const doc = {
      ...data,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const res = await db.collection("telemetry_sessions").insertOne(doc);
    const {
      _id,
      ...rest
    } = doc;
    return {
      data: {
        ...rest,
        id: res.insertedId.toString()
      },
      error: null
    };
  } catch (e) {
    console.error("[MongoDB] insertLocalSession failed:", e);
    return {
      data: null,
      error: {
        message: e.message
      }
    };
  }
});
const deleteLocalSession_createServerFn_handler = createServerRpc({
  id: "be9659ec40533955d232ff49315c9aa649bd7db83b1fcfc216a660325004c844",
  name: "deleteLocalSession",
  filename: "src/lib/localDb.functions.ts"
}, (opts) => deleteLocalSession.__executeServer(opts));
const deleteLocalSession = createServerFn({
  method: "POST"
}).inputValidator((id) => String(id)).handler(deleteLocalSession_createServerFn_handler, async ({
  data: id
}) => {
  try {
    const db = await connectToLocalDb();
    const objectId = await createObjectId(id);
    await db.collection("telemetry_sessions").deleteOne({
      _id: objectId
    });
    return {
      error: null
    };
  } catch (e) {
    console.error("[MongoDB] deleteLocalSession failed:", e);
    return {
      error: {
        message: e.message
      }
    };
  }
});
const testLocalDbConnection_createServerFn_handler = createServerRpc({
  id: "6fc40750dfd6c278f7c72bfbb36ff3225675daeec7f93fc991cb7f630fa6730c",
  name: "testLocalDbConnection",
  filename: "src/lib/localDb.functions.ts"
}, (opts) => testLocalDbConnection.__executeServer(opts));
const testLocalDbConnection = createServerFn({
  method: "POST"
}).handler(testLocalDbConnection_createServerFn_handler, async () => {
  try {
    const db = await connectToLocalDb();
    await db.command({
      ping: 1
    });
    const colls = await db.listCollections().toArray();
    const names = colls.map((c) => c.name);
    return {
      success: true,
      message: `Successfully connected to MongoDB at 127.0.0.1:27017.
Database 'iracing' is active.
Active collections: ${names.join(", ") || "none"}`
    };
  } catch (e) {
    return {
      success: false,
      message: `Connection failed.
Error: ${e.message || String(e)}

Suggestions:
1. Ensure MongoDB is installed and running on port 27017.
2. If using Docker, run: docker run -d -p 27017:27017 mongo
3. On Windows, check if the 'MongoDB Server' service is started in task manager.`
    };
  }
});
const getDbConfig_createServerFn_handler = createServerRpc({
  id: "6be988dd8f4ee314ac93db05da28d1eb8f2018797e18c521292bed6c4d850965",
  name: "getDbConfig",
  filename: "src/lib/localDb.functions.ts"
}, (opts) => getDbConfig.__executeServer(opts));
const getDbConfig = createServerFn({
  method: "GET"
}).handler(getDbConfig_createServerFn_handler, async () => {
  try {
    const config = await readDbConfig();
    return {
      data: config,
      error: null
    };
  } catch (e) {
    return {
      data: {
        localUri: "mongodb://127.0.0.1:27017/",
        cloudUri: ""
      },
      error: {
        message: e.message
      }
    };
  }
});
const saveDbConfig_createServerFn_handler = createServerRpc({
  id: "992e611799973d8db599cacccf15200b19b5669290f9410c9c9e16579f533001",
  name: "saveDbConfig",
  filename: "src/lib/localDb.functions.ts"
}, (opts) => saveDbConfig.__executeServer(opts));
const saveDbConfig = createServerFn({
  method: "POST"
}).inputValidator((config) => config).handler(saveDbConfig_createServerFn_handler, async ({
  data: config
}) => {
  try {
    await writeDbConfig(config);
    resetDbConnection();
    return {
      success: true,
      error: null
    };
  } catch (e) {
    return {
      success: false,
      error: {
        message: e.message
      }
    };
  }
});
export {
  deleteLocalSession_createServerFn_handler,
  getDbConfig_createServerFn_handler,
  getLocalSessionById_createServerFn_handler,
  getLocalSessions_createServerFn_handler,
  insertLocalSession_createServerFn_handler,
  saveDbConfig_createServerFn_handler,
  testLocalDbConnection_createServerFn_handler
};
