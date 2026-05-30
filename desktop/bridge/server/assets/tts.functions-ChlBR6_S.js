import { d as createServerRpc, b as createServerFn } from "../server.js";
import { r as requireSupabaseAuth } from "./auth-middleware-Cz-8T2yV.js";
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
const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const VOICE_ID_RE = /^[A-Za-z0-9]{20}$/;
const speakText_createServerFn_handler = createServerRpc({
  id: "9dccd720940020ddddd8d414e06f3d1dc3b00382f43d5d490c8e31bca82ddd8d",
  name: "speakText",
  filename: "src/lib/tts.functions.ts"
}, (opts) => speakText.__executeServer(opts));
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
}).handler(speakText_createServerFn_handler, async ({
  data
}) => {
  const apiKey = data.apiKey || process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      error: "Voice coaching is not configured. Add your ElevenLabs API key in Settings."
    };
  }
  const voice = data.voiceId;
  try {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: data.text,
        model_id: "eleven_turbo_v2_5"
      })
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("[tts] elevenlabs error", resp.status, t);
      if (resp.status === 401) return {
        error: "Invalid ElevenLabs API key."
      };
      if (resp.status === 429) return {
        error: "ElevenLabs rate limit hit."
      };
      return {
        error: `Voice service error (${resp.status}).`
      };
    }
    const buf = await resp.arrayBuffer();
    const audioBase64 = Buffer.from(buf).toString("base64");
    return {
      audioBase64,
      mime: "audio/mpeg"
    };
  } catch (e) {
    console.error("[tts] failed", e);
    return {
      error: e instanceof Error ? e.message : "TTS failed"
    };
  }
});
export {
  speakText_createServerFn_handler
};
