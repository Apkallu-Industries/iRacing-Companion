import { b as createServerFn, e as createSsrRpc } from "./tanstack-Jo4b3tUQ.js";
import { r as requireSupabaseAuth } from "./auth-middleware-xZM3BZWQ.js";
const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const VOICE_ID_RE = /^[A-Za-z0-9]{20}$/;
const speakText = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => {
  const text = (data.text ?? "").toString().slice(0, 4500);
  if (!text.trim()) throw new Error("Empty text");
  let voiceId = VOICE_ID;
  if (data.voiceId) {
    if (!VOICE_ID_RE.test(data.voiceId)) {
      throw new Error("Invalid voiceId");
    }
    voiceId = data.voiceId;
  }
  const apiKey = (data.apiKey ?? "").toString().trim();
  return {
    text,
    voiceId,
    apiKey
  };
}).handler(createSsrRpc("9dccd720940020ddddd8d414e06f3d1dc3b00382f43d5d490c8e31bca82ddd8d"));
export {
  speakText as s
};
