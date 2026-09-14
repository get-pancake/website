"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import {
  APP_ORIGIN,
  GOOGLE_CLIENT_ID,
  PREVIEW_AUTH_MESSAGE,
  authErrorMessage,
  createAuthClient,
  getCaptchaToken,
  isAuthEnabled,
  loadGoogleIdentity,
} from "../lib/auth";

// Google renders its own pill button on production (max 400px wide). The
// placeholder below mirrors it, so previews and the loading state look the same.
const GOOGLE_BUTTON_MAX_WIDTH = 400;
const GOOGLE_BUTTON_MIN_WIDTH = 200;

/** Google's "G" mark, as drawn on the provider button. */
function GoogleLogo() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function SignupForm({ id = "signup", className = "" }: { id?: string; className?: string }) {
  const [origin, setOrigin] = useState("");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googleAttempt, setGoogleAttempt] = useState(0);
  const [googleReady, setGoogleReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  // Off production the form looks exactly like the live one; the notice only
  // appears once someone actually tries to sign up.
  const [previewBlocked, setPreviewBlocked] = useState(false);
  const googleButton = useRef<HTMLDivElement>(null);
  const operationInFlight = useRef(false);
  const mounted = useRef(false);
  const clientEnvironment = useMemo(() => ({
    origin,
    deploymentEnvironment: process.env.NEXT_PUBLIC_BRAIN_DEPLOYMENT_ENV,
    allowedOrigins: process.env.NEXT_PUBLIC_BRAIN_AUTH_ALLOWED_ORIGINS,
  }), [origin]);
  const client = useMemo(() => createAuthClient(clientEnvironment), [clientEnvironment]);
  const enabled = isAuthEnabled(clientEnvironment);
  const emailId = `${id}-email`;
  const errorId = `${id}-error`;
  const previewId = `${id}-preview`;

  useEffect(() => {
    mounted.current = true;
    setOrigin(window.location.origin);
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!enabled || sentTo || signedIn) return;
    let cancelled = false;
    setGoogleReady(false);
    setGoogleError("");

    async function prepareGoogle() {
      try {
        const [identity, nonce] = await Promise.all([loadGoogleIdentity(), client.googleNonce()]);
        if (cancelled || !googleButton.current) return;
        identity.initialize({
          client_id: process.env.NEXT_PUBLIC_BRAIN_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID,
          nonce,
          auto_select: false,
          callback: ({ credential }) => {
            if (cancelled || operationInFlight.current) return;
            operationInFlight.current = true;
            setBusy("google");
            setError("");
            // Open in the callback before awaiting the API; provide a real link if blocked.
            const destination = window.open("about:blank", "_blank");
            if (destination) destination.opener = null;
            void client.googleLogin(credential).then(() => {
              if (destination && !destination.closed) destination.location.href = `${APP_ORIGIN}/onboarding`;
              if (mounted.current) setSignedIn(true);
            }).catch((reason: unknown) => {
              destination?.close();
              if (mounted.current) {
                setError(authErrorMessage(reason));
                // The nonce is consumed per attempt. A retry always receives a fresh one.
                setGoogleAttempt((attempt) => attempt + 1);
              }
            }).finally(() => {
              operationInFlight.current = false;
              if (mounted.current) setBusy(null);
            });
          },
        });
        // The host is hidden until Google is ready; measure the visible form column.
        const column = googleButton.current.parentElement?.clientWidth || GOOGLE_BUTTON_MAX_WIDTH;
        const width = Math.round(Math.min(GOOGLE_BUTTON_MAX_WIDTH, Math.max(GOOGLE_BUTTON_MIN_WIDTH, column)));
        googleButton.current.replaceChildren();
        identity.renderButton(googleButton.current, {
          type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "pill", logo_alignment: "center", width,
        });
        setGoogleReady(true);
      } catch (reason) {
        if (!cancelled) setGoogleError(authErrorMessage(reason));
      }
    }
    void prepareGoogle();
    return () => { cancelled = true; };
  }, [client, enabled, googleAttempt, sentTo, signedIn]);

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (operationInFlight.current) return;
    if (!enabled) { setPreviewBlocked(true); return; }
    operationInFlight.current = true;
    setBusy("email");
    setError("");
    try {
      const siteKey = await client.captchaSiteKey();
      const captchaToken = siteKey === null ? undefined : await getCaptchaToken(siteKey);
      await client.requestMagicLink(email, captchaToken);
      if (mounted.current) setSentTo(email.trim());
    } catch (reason) {
      if (mounted.current) setError(authErrorMessage(reason));
    } finally {
      operationInFlight.current = false;
      if (mounted.current) setBusy(null);
    }
  }

  const googlePlaceholder = !enabled || !googleReady || busy !== null;
  const describedBy = [error ? errorId : "", previewBlocked ? previewId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <div id={id} className={`brain-form ${className}`.trim()} aria-busy={busy !== null}>
      {signedIn ? (
        <div className="brain-form__success" role="status">
          <h3 className="brain-form__success-title">You’re signed in.</h3>
          <p>Continue to Pancake to get started.</p>
          <a className="lp-btn brain-form__submit" href={`${APP_ORIGIN}/onboarding`} target="_blank" rel="noopener noreferrer">Open Pancake</a>
        </div>
      ) : sentTo ? (
        <div className="brain-form__success" role="status">
          <h3 className="brain-form__success-title">Check your inbox</h3>
          <p>We sent a sign-in link to <strong className="brain-form__success-email">{sentTo}</strong>.</p>
          <p>Open it to start your setup.</p>
          <button type="button" className="brain-form__retry" onClick={() => { setSentTo(""); setError(""); }}>Use a different email or try again</button>
        </div>
      ) : (
        <>
          <div className="brain-form__google" aria-busy={enabled && !googleReady && !googleError}>
            <div ref={googleButton} className="brain-form__google-host" hidden={googlePlaceholder} />
            {googlePlaceholder && !googleError ? (
              <button
                type="button"
                className="brain-google-btn"
                disabled={enabled}
                onClick={enabled ? undefined : () => setPreviewBlocked(true)}
              >
                <GoogleLogo />
                <span>{busy === "google" ? "Signing in…" : "Continue with Google"}</span>
              </button>
            ) : null}
            {googleError ? (
              <>
                <p className="brain-form__error" role="status">{googleError}</p>
                <button type="button" className="brain-form__retry" disabled={busy !== null} onClick={() => setGoogleAttempt((attempt) => attempt + 1)}>Retry Google sign-in</button>
              </>
            ) : null}
          </div>
          <div className="brain-form__divider"><span>or</span></div>
          <form className="brain-form__fields" onSubmit={submitEmail}>
            <label className="brain-form__label" htmlFor={emailId}>Work email</label>
            <input
              id={emailId}
              className="brain-form__input"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              placeholder="name@company.com"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={busy !== null}
              aria-describedby={describedBy}
            />
            <LpFxPill type="submit" className="brain-form__submit" disabled={busy !== null}>
              {busy === "email" ? "Sending…" : "Continue"}
            </LpFxPill>
          </form>
          {error ? <p id={errorId} className="brain-form__error" role="alert">{error}</p> : null}
          {previewBlocked ? (
            <p id={previewId} className="brain-form__notice" role="status">
              {PREVIEW_AUTH_MESSAGE}{" "}
              <a href={`${APP_ORIGIN}/login`} target="_blank" rel="noopener noreferrer">Open Pancake</a>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
