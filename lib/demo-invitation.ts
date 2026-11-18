import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DemoAnswers } from "@/lib/demo-qualification";
function html(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export async function approveDemo(id: string, reviewer: string, notes: string) {
  const db = createSupabaseAdminClient();
  const key = process.env.SENDGRID_API_KEY;
  if (!db || !key)
    return {
      ok: false,
      error: "Invitation delivery is not configured. No approval was recorded.",
    };
  const token = randomBytes(32).toString("hex");
  const { data: row, error } = await db
    .from("demo_requests")
    .update({
      status: "approved",
      email_state: "sending",
      reviewed_by: reviewer,
      reviewed_at: new Date().toISOString(),
      notes,
      invite_token_hash: createHash("sha256").update(token).digest("hex"),
      invite_expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending")
    .eq("email_state", "not_sent")
    .select("answers")
    .maybeSingle();
  if (error || !row)
    return {
      ok: false,
      error: "This request has already been handled. Refresh the queue.",
    };
  const a = row.answers as DemoAnswers;
  // /white-glove's short form does not ask a name (app/api/white-glove/demo/route.ts)
  const greeting = a.name?.trim() ? `Hi ${a.name}` : "Hi there";
  const link = `https://pancake.ai/demo/book/${token}`;
  const text = `${greeting},\n\nThanks for telling us about your team. We’d like to walk through your GTM goals and how Pancake can help.\n\nChoose a time here: ${link}\n\nThis invitation is valid for 14 days.\n\nThanks,\nThe Pancake team`;
  let state = "unknown";
  let messageId: string | null = null;
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        personalizations: [{ to: [{ email: a.email, ...(a.name?.trim() ? { name: a.name } : {}) }] }],
        from: {
          email: process.env.DEMO_INVITATION_FROM || "hi@pancake.ai",
          name: "Pancake",
        },
        reply_to: { email: "francois@pancake.ai", name: "François" },
        subject: "Your Pancake demo invitation",
        content: [
          { type: "text/plain", value: text },
          {
            type: "text/html",
            value: `<p>${html(greeting)},</p><p>Thanks for telling us about your team. We’d like to walk through your GTM goals and how Pancake can help.</p><p><a href="${link}">Choose a time for your demo</a></p><p>This invitation is valid for 14 days.</p><p>Thanks,<br>The Pancake team</p>`,
          },
        ],
        tracking_settings: {
          click_tracking: { enable: false, enable_text: false },
          open_tracking: { enable: false },
        },
      }),
    });
    state =
      response.status === 202
        ? "sent"
        : response.status >= 500
          ? "unknown"
          : "failed";
    messageId = response.headers.get("x-message-id");
  } catch {
    /* Unknown delivery must never be retried automatically. */
  }
  const { error: saveError } = await db
    .from("demo_requests")
    .update({
      email_state: state,
      email_message_id: messageId,
      ...(state === "sent" ? { email_sent_at: new Date().toISOString() } : {}),
      ...(state === "failed"
        ? {
            status: "pending",
            invite_token_hash: null,
            invite_expires_at: null,
            email_state: "not_sent",
          }
        : {}),
    })
    .eq("id", id)
    .eq("email_state", "sending");
  if (saveError)
    return {
      ok: false,
      error:
        "Approval recorded, but delivery status could not be saved. Do not resend; check the mail provider.",
    };
  return state === "sent"
    ? { ok: true }
    : {
        ok: false,
        error:
          state === "failed"
            ? "Email was rejected by the provider. Approval reverted; correct mail configuration and retry."
            : "Delivery is uncertain. Approval is recorded; check the mail provider before resending.",
      };
}
