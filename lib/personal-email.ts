/**
 * Personal email providers, refused on /demo (François, 2026-09-21: "Make it
 * so that it's impossible to book a meeting with a personal email address,
 * has to be professionnal"). Browser-safe: lib/demo-request.ts checks it in
 * the form, in the voice agent's browser tool and in /api/demo-request, so
 * a personal address never reaches the calendar.
 *
 * Free and consumer ISP mailboxes only, never a company's own domain. The
 * Calendly routing form "Pancake discovery call" (still linked from Loops
 * emails) blocks the same list with its own route; keep the two in step.
 */

/** Exact domains. */
const PERSONAL_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  // Global webmail
  "gmail.com",
  "googlemail.com",
  "ymail.com",
  "rocketmail.com",
  "msn.com",
  "passport.com",
  "live.com",
  "live.fr",
  "live.co.uk",
  "live.de",
  "live.it",
  "live.nl",
  "live.be",
  "live.ca",
  "live.com.au",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "aim.com",
  "proton.me",
  "protonmail.com",
  "protonmail.ch",
  "pm.me",
  "web.de",
  "mail.com",
  "email.com",
  "usa.com",
  "zoho.com",
  "zohomail.com",
  "ya.ru",
  "mail.ru",
  "inbox.ru",
  "bk.ru",
  "list.ru",
  "rambler.ru",
  "hey.com",
  "fastmail.com",
  "fastmail.fm",
  "tutanota.com",
  "tutanota.de",
  "tuta.io",
  "tuta.com",
  "duck.com",
  "hushmail.com",
  "lycos.com",
  "qq.com",
  "163.com",
  "126.com",
  "yeah.net",
  "sina.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "rediffmail.com",
  // France
  "free.fr",
  "orange.fr",
  "wanadoo.fr",
  "laposte.net",
  "sfr.fr",
  "neuf.fr",
  "bbox.fr",
  "numericable.fr",
  "aliceadsl.fr",
  "club-internet.fr",
  // UK
  "btinternet.com",
  "sky.com",
  "virginmedia.com",
  "ntlworld.com",
  "talktalk.net",
  // Italy, Germany
  "libero.it",
  "virgilio.it",
  "alice.it",
  "tiscali.it",
  "t-online.de",
  "freenet.de",
  "arcor.de",
  // North America, Australia
  "comcast.net",
  "verizon.net",
  "att.net",
  "sbcglobal.net",
  "bellsouth.net",
  "cox.net",
  "charter.net",
  "earthlink.net",
  "shaw.ca",
  "rogers.com",
  "sympatico.ca",
  "bigpond.com",
  "optusnet.com.au",
  // Elsewhere
  "seznam.cz",
  "wp.pl",
  "o2.pl",
  "interia.pl",
  "ukr.net",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
]);

/** Providers with one domain per country: yahoo.fr, hotmail.co.uk, outlook.com.br… */
const PERSONAL_EMAIL_FAMILIES = /^(?:yahoo|hotmail|outlook|gmx|yandex)\.(?:[a-z]{2,3})(?:\.[a-z]{2})?$/;

/** True when the address is at a personal email provider. Takes any string; pure. */
export function isPersonalEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
  return PERSONAL_EMAIL_DOMAINS.has(domain) || PERSONAL_EMAIL_FAMILIES.test(domain);
}
