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
        googleButton.current.replaceChildren();
        identity.renderButton(googleButton.current, {
          type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "rectangular",
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
    if (!enabled) { setError(PREVIEW_AUTH_MESSAGE); return; }
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
          <p>Open it to continue to Pancake.</p>
          <button type="button" className="brain-form__retry" onClick={() => { setSentTo(""); setError(""); }}>Use a different email or try again</button>
        </div>
      ) : (
        <>
          {origin && !enabled ? (
            <p id={previewId} className="brain-form__notice">
              {PREVIEW_AUTH_MESSAGE}{" "}
              <a href={`${APP_ORIGIN}/login`} target="_blank" rel="noopener noreferrer">Open Pancake</a>
            </p>
          ) : null}
          <div className="brain-form__google" aria-busy={enabled && !googleReady && !googleError}>
            <div ref={googleButton} hidden={!enabled || !googleReady || busy !== null} />
            {(!enabled || !googleReady || busy !== null) && !googleError ? (
              <button type="button" className="lp-btn lp-btn--outline" disabled>
                {busy === "google" ? "Signing in…" : enabled && !googleReady ? "Loading Google sign-in…" : "Continue with Google"}
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
            <label className="brain-form__label" htmlFor={emailId}>Email address</label>
            <input
              id={emailId}
              className="brain-form__input"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="Enter your email address..."
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={busy !== null}
              aria-describedby={[`${id}-email-hint`, error ? errorId : !enabled && origin ? previewId : ""].filter(Boolean).join(" ")}
            />
            <span id={`${id}-email-hint`} className="brain-form__hint">e.g. name@company.com</span>
            <LpFxPill type="submit" className="brain-form__submit" disabled={!enabled || busy !== null}>
              {busy === "email" ? "Sending…" : "Continue"}
            </LpFxPill>
          </form>
          {error ? <p id={errorId} className="brain-form__error" role="alert">{error}</p> : null}
        </>
      )}
    </div>
  );
}
