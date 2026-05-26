/**
 * Client-side TTS utility.
 *
 * Wraps the `speakText` server function and routes the returned audio
 * through the user's selected output device (via HTMLMediaElement.setSinkId).
 *
 * Usage:
 *   import { speak } from "@/lib/tts-client";
 *   await speak("Box this lap, box box.");
 */

import { speakText } from "./tts.functions";
import { useWorkbench } from "./store";

/**
 * Play audio data through the user-selected output device.
 * Falls back to the default device if setSinkId is unsupported or the
 * device is no longer available.
 */
export async function playOnSelectedDevice(
  audioBase64: string,
  mime: string,
  deviceId: string,
): Promise<void> {
  const audio = new Audio(`data:${mime};base64,${audioBase64}`);
  if (deviceId && typeof (audio as any).setSinkId === "function") {
    try {
      await (audio as any).setSinkId(deviceId);
    } catch (err) {
      console.warn("[tts-client] setSinkId failed, falling back to default device:", err);
    }
  }
  await audio.play();
}

/**
 * Speak text using ElevenLabs TTS, routing audio to the user's
 * preferred output device from the Workbench store.
 *
 * Returns an error string if TTS fails, otherwise null.
 */
export async function speak(
  text: string,
  overrideDeviceId?: string,
): Promise<null | string> {
  const { elevenLabsApiKey, elevenLabsVoiceId, audioOutputDeviceId } =
    useWorkbench.getState();

  const resp = (await speakText({
    data: {
      text,
      apiKey: elevenLabsApiKey,
      voiceId: elevenLabsVoiceId,
    },
  })) as { audioBase64?: string; mime?: string; error?: string };

  if (resp.error) return resp.error;
  if (!resp.audioBase64) return "No audio data returned.";

  const deviceId = overrideDeviceId ?? audioOutputDeviceId;
  await playOnSelectedDevice(resp.audioBase64, resp.mime ?? "audio/mpeg", deviceId);
  return null;
}
