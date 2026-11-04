/**
 * IndexNow (2026-11-04): the protocol Bing, Yandex, Seznam, Naver and Yep share to hear about new
 * URLs right away. Bing's index also feeds ChatGPT search. Google doesn't take part, and its
 * sitemap ping ended in 2023: it reads /sitemap.xml on its own.
 *
 * The key is public by design. The file public/<key>.txt, holding the key, proves the site owns it.
 */
export const INDEXNOW_KEY = "93dbdb7c382e989507fbf2c40d7771e8";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
