/** Browser-only integration with Pancake's existing auth API (PAN-844/845).
 * No server proxy: the shared .getpancake.ai cookies must reach the app directly.
 */
export const APP_ORIGIN = "https://app.getpancake.ai";
export const BRAIN_ORIGIN = "https://brain.getpancake.ai";
export const GOOGLE_CLIENT_ID =
  "1000959441723-8uq5ck0pr6rjslhsnerdlnqnmjb5q4ot.apps.googleusercontent.com";
export const PREVIEW_AUTH_MESSAGE =
  "This is a preview. Sign-up is available on the live Pancake site.";

export interface AuthEnvironment {
  origin: string;
  deploymentEnvironment?: string;
  /** Exact, explicitly approved origins; the API/OAuth settings must also allow them. */
  allowedOrigins?: string;
}

function exactOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isAuthEnabled(environment: AuthEnvironment): boolean {
  const origin = exactOrigin(environment.origin);
  if (!origin) return false;
  if (environment.deploymentEnvironment === "production" && origin === BRAIN_ORIGIN) return true;
  return (environment.allowedOrigins ?? "").split(",").some((entry) => exactOrigin(entry.trim()) === origin);
}

export class AuthError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function authErrorMessage(error: unknown): string {
  return error instanceof AuthError
    ? error.message
    : "We couldn’t connect. Please check your connection and try again.";
}

function responseError(status: number): AuthError {
  if (status === 429) return new AuthError("Too many attempts. Please wait a few minutes and try again.", status);
  if (status === 403) return new AuthError("The security check didn’t go through. Please try again.", status);
  if (status === 401) return new AuthError("Google sign-in didn’t go through. Please try again.", status);
  if (status === 400 || status === 422) return new AuthError("Please check your email address and try again.", status);
  return new AuthError("We couldn’t complete sign-up. Please try again in a moment.", status);
}

export function createAuthClient(environment: AuthEnvironment, fetcher: typeof fetch = fetch) {
  async function request(path: string, body?: Record<string, string>) {
    if (!isAuthEnabled(environment)) throw new AuthError(PREVIEW_AUTH_MESSAGE);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetcher(`${APP_ORIGIN}${path}`, {
        method: body === undefined ? "GET" : "POST",
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
        ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
      });
      if (!response.ok) throw responseError(response.status);
      return response;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError(controller.signal.aborted
        ? "This is taking longer than expected. Please try again."
        : "We couldn’t connect. Please check your connection and try again.");
    } finally {
      clearTimeout(timeout);
    }
  }

  async function readJson(response: Response): Promise<Record<string, unknown>> {
    try {
      const value: unknown = await response.json();
      if (typeof value === "object" && value !== null && !Array.isArray(value)) return value as Record<string, unknown>;
    } catch { /* A successful HTTP response still needs the expected payload. */ }
    throw new AuthError("We couldn’t prepare sign-up. Please try again.");
  }

  return {
    async captchaSiteKey(): Promise<string | null> {
      const data = await readJson(await request("/auth/captcha"));
      if (data.siteKey === null) return null;
      if (typeof data.siteKey === "string" && data.siteKey.trim()) return data.siteKey;
      throw new AuthError("We couldn’t prepare the security check. Please try again.");
    },
    async requestMagicLink(email: string, captchaToken?: string): Promise<void> {
      // PAN-844: success is 204 No Content. Do not attempt to read a JSON body.
      await request("/auth/magic-link/request", { email: email.trim(), ...(captchaToken ? { captchaToken } : {}) });
    },
    async googleNonce(): Promise<string> {
      const data = await readJson(await request("/auth/google/one-tap/start", {}));
      if (typeof data.nonce === "string" && data.nonce.trim()) return data.nonce;
      throw new AuthError("We couldn’t prepare Google sign-in. Please try again.");
    },
    async googleLogin(credential: string): Promise<void> {
      if (!credential.trim()) throw new AuthError("Google sign-in didn’t go through. Please try again.");
      await request("/auth/login", { _tag: "GoogleIdToken", credential });
    },
  };
}

type GoogleCredential = { credential: string };
export interface GoogleIdentity {
  initialize(options: { client_id: string; nonce: string; callback: (response: GoogleCredential) => void; auto_select: boolean }): void;
  renderButton(element: HTMLElement, options: { type: "standard"; theme: "outline"; size: "large"; text: "continue_with"; shape: "rectangular" }): void;
}

type CaptchaEnterprise = {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: "magic_link_request" }): Promise<string>;
};

type AuthWindow = Window & {
  google?: { accounts?: { id?: GoogleIdentity } };
  grecaptcha?: { enterprise?: CaptchaEnterprise };
};

const scriptLoads = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const prior = scriptLoads.get(src);
  if (prior) return prior;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    const timeout = setTimeout(() => fail(), 15_000);
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      reject(new AuthError("We couldn’t load the sign-in service. Please try again."));
    };
    script.onload = () => { clearTimeout(timeout); resolve(); };
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    scriptLoads.delete(src);
    throw error;
  });
  scriptLoads.set(src, promise);
  return promise;
}

export async function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (!(window as AuthWindow).google?.accounts?.id) await loadScript("https://accounts.google.com/gsi/client");
  const identity = (window as AuthWindow).google?.accounts?.id;
  if (!identity) throw new AuthError("We couldn’t load Google sign-in. Please try again.");
  return identity;
}

export async function getCaptchaToken(siteKey: string): Promise<string> {
  if (!(window as AuthWindow).grecaptcha?.enterprise) {
    await loadScript(`https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`);
  }
  const enterprise = (window as AuthWindow).grecaptcha?.enterprise;
  if (!enterprise) throw new AuthError("We couldn’t load the security check. Please try again.");
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new AuthError("The security check timed out. Please try again.")), 15_000);
    const fail = () => { clearTimeout(timeout); reject(new AuthError("The security check didn’t go through. Please try again.")); };
    enterprise.ready(() => {
      try {
        enterprise.execute(siteKey, { action: "magic_link_request" }).then((token) => {
          clearTimeout(timeout);
          if (token) resolve(token);
          else fail();
        }, fail);
      } catch { fail(); }
    });
  });
}
