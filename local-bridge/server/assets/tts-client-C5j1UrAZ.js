import { s as speakText } from "./tts.functions-C1mSSPGY.js";
import { N as useWorkbench } from "./router-BaRGcILm.js";
import "./tanstack-Jo4b3tUQ.js";
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
import "./auth-middleware-xZM3BZWQ.js";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "sonner";
import "zustand";
import "zustand/middleware";
import "zod";
import "./schema-BU1MXGgz.js";
import "lucide-react";
import "@radix-ui/react-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./client.server-Y-0AANJ4.js";
async function playOnSelectedDevice(audioBase64, mime, deviceId) {
  const audio = new Audio(`data:${mime};base64,${audioBase64}`);
  if (deviceId && typeof audio.setSinkId === "function") {
    try {
      await audio.setSinkId(deviceId);
    } catch (err) {
      console.warn("[tts-client] setSinkId failed, falling back to default device:", err);
    }
  }
  await audio.play();
}
async function speak(text, overrideDeviceId) {
  const { elevenLabsApiKey, elevenLabsVoiceId, audioOutputDeviceId } = useWorkbench.getState();
  const resp = await speakText({
    data: {
      text,
      apiKey: elevenLabsApiKey,
      voiceId: elevenLabsVoiceId
    }
  });
  if (resp.error) return resp.error;
  if (!resp.audioBase64) return "No audio data returned.";
  const deviceId = overrideDeviceId ?? audioOutputDeviceId;
  await playOnSelectedDevice(resp.audioBase64, resp.mime ?? "audio/mpeg", deviceId);
  return null;
}
export {
  playOnSelectedDevice,
  speak
};
