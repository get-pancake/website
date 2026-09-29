/** Encoded in booth QR — opens mail with pre-filled waitlist message. No backend. */
const DEFAULT_BOOTH_QR_MAILTO =
  "mailto:tristan@pancake.ai?subject=Waitlist%20-%20Human%20X&body=Hi%2C%20I%20want%20to%20join%20the%20Basalt%20waitlist%20and%20get%20my%20free%20credits.";

/** Payload for the booth QR (mailto or override). */
export function getBoothQrPayload(): string {
  const explicit = process.env.NEXT_PUBLIC_BOOTH_QR_URL?.trim();
  return explicit || DEFAULT_BOOTH_QR_MAILTO;
}

/** Shown under the QR so people know where the scan goes. */
export function getBoothQrEmailDisplay(): string {
  const payload = getBoothQrPayload();
  const match = /^mailto:([^?]+)/i.exec(payload);
  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  return "tristan@pancake.ai";
}
