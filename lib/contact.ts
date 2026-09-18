/** Shared support mailbox, verified against current customer support correspondence. */
export const SUPPORT_EMAIL = "support@getpancake.ai";
export const SUPPORT_PATH = "/support";
export const SUPPORT_EMAIL_URL = `mailto:${SUPPORT_EMAIL}`;
export const PRIVACY_EMAIL_URL = `${SUPPORT_EMAIL_URL}?subject=Privacy%20request`;
export const SECURITY_EMAIL_URL = `${SUPPORT_EMAIL_URL}?subject=Security%20report`;
export const SUPPORT_GMAIL_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SUPPORT_EMAIL)}`;
