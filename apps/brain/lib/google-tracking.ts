/** Public routing identifier shared with the main landing and app. */
export const GOOGLE_TAG_MANAGER_ID = "GTM-P3Z79WKD";

/** Only the canonical production page may start a Google session. */
export function googleTagManagerBootstrap(deploymentEnvironment: string | undefined) {
  return `(function(){
if(${JSON.stringify(deploymentEnvironment === "production")}!==true||location.origin!=='https://brain.getpancake.ai')return;
var p=new URLSearchParams(location.search);if(p.has('token')||p.has('code'))return;
if(window.pancakeBrainGtmLoaded)return;window.pancakeBrainGtmLoaded=true;
window.dataLayer=window.dataLayer||[];
window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
var s=document.createElement('script');s.async=true;
s.src='https://www.googletagmanager.com/gtm.js?id=${GOOGLE_TAG_MANAGER_ID}';
document.head.appendChild(s);
})();`;
}
