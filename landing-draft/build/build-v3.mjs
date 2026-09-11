import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
process.chdir(HERE);
const SITE = path.resolve(HERE, "../..");   // the website repo root: fonts and lp/*.svg are read from it
const LIVE = "https://getpancake.ai";
const otf = (dir, name) => fs.readFileSync(`${SITE}/app/fonts/${dir}/${name}.otf`).toString("base64");
const svgFile = (f, style) => fs.readFileSync(`${SITE}/public/lp/${f}`, "utf8").replace(/<\?xml[^>]*>/, "").replace(/id="([^"]+)"/g, (m, id) => `id="${f.replace(/\W/g, "")}-${id}"`).replace(/url\(#([^)]+)\)/g, (m, id) => `url(#${f.replace(/\W/g, "")}-${id})`).replace(/\s(width|height)="[^"]*"/, "").replace(/\s(width|height)="[^"]*"/, "").replace("<svg", `<svg style="${style}" aria-hidden="true"`);
/* agent marks (snapshot in agents.html): give each mark an accessible name */
const agents = fs.readFileSync("agents.html", "utf8").replace(/<span title="([^"]+)">/g, (m, t) => `<span title="${t === "GrokBot" ? "Grok Bot" : t}" role="img" aria-label="${t === "GrokBot" ? "Grok Bot" : t}">`);
const { RING, ARCS } = JSON.parse(fs.readFileSync("rings.json", "utf8"));

/* ── v3 foundation (landing-v3/foundation.css values) + responsive rules ── */
const fonts = `/*FONTS*/
@font-face{font-family:"Aeonik Condensed Pro";font-weight:500;font-display:swap;src:url(data:font/otf;base64,${otf("aeonik-condensed", "AeonikCondensedProTRIAL-Medium")}) format("opentype");}
@font-face{font-family:"Aeonik Condensed Pro";font-weight:600;font-display:swap;src:url(data:font/otf;base64,${otf("aeonik-condensed", "AeonikCondensedProTRIAL-SemiBold")}) format("opentype");}
@font-face{font-family:"Aeonik Fono";font-weight:400;font-display:swap;src:url(data:font/otf;base64,${otf("aeonik-fono", "AeonikFonoTRIAL-Regular")}) format("opentype");}
@font-face{font-family:"Aeonik Fono";font-weight:500;font-display:swap;src:url(data:font/otf;base64,${otf("aeonik-fono", "AeonikFonoTRIAL-Medium")}) format("opentype");}
@font-face{font-family:"Aeonik Fono";font-weight:600;font-display:swap;src:url(data:font/otf;base64,${otf("aeonik-fono", "AeonikFonoTRIAL-SemiBold")}) format("opentype");}
/*/FONTS*/`;
const css = `${fonts}
:root{--lp-pink-30:#ff7aa0;--lp-pink-40:#e33a6a;--lp-purple-30:#ba8bff;--lp-purple-40:#8d43fd;--lp-yellow-30:#ffbd7a;--lp-yellow-40:#f38f43;--lp-blue-30:#6a8fff;--lp-blue-40:#4660e7;--lp-green-20:#68cea7;--lp-green-30:#037d48;--lp-ink-0:#ffffff;--lp-ink-10:#fffbf6;--lp-ink-20:#fff7ec;--lp-ink-30:#f7ede5;--lp-ink-40:#efe4dc;--lp-ink-50:#ddcfcd;--lp-ink-60:#bba8ae;--lp-ink-70:#9a818f;--lp-ink-80:#85687c;--lp-ink-100:#2c002a;--lp-page-bg:#fbf6f1;--lp-card-cream:#fffbf6;--lp-terminal-bg:#000;
--lp-font-fono:"Aeonik Fono",ui-monospace,"SF Mono",monospace;--lp-font-cond:"Aeonik Condensed Pro",system-ui,-apple-system,sans-serif;
--gut:max(48px,calc(50% - 568px));--vwfit:tan(atan2(100vw,1654px));--sw:1120px;}
body{margin:0;background:var(--lp-page-bg);color:var(--lp-ink-100);font-family:var(--lp-font-fono);font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-x:clip;}
a{color:inherit;text-decoration:none;}p{margin:0;}img{display:block;max-width:100%;}button{font:inherit;color:inherit;}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
h1,h2,h3{text-wrap:balance;}
.lp-display{font-family:var(--lp-font-cond);font-weight:600;}
.lp-title-section{font-family:var(--lp-font-cond);font-size:57.336px;font-weight:600;letter-spacing:-1.7201px;line-height:1.2;margin:0;}
.lp-title-card{font-family:var(--lp-font-cond);font-size:48px;font-weight:600;letter-spacing:-1.44px;line-height:1;margin:0;}
.lp-title-step{font-family:var(--lp-font-cond);font-size:39.816px;font-weight:600;letter-spacing:-1.1945px;line-height:1.2;margin:0;}
.lp-title-sm{font-family:var(--lp-font-cond);font-size:27.648px;font-weight:600;letter-spacing:-.83px;line-height:1.2;margin:0;}
.split-title{font-size:48px;line-height:1.1;letter-spacing:-1.44px;}
.lp-kicker{font-family:var(--lp-font-cond);font-size:24px;font-weight:500;line-height:32px;}
.lp-btn{align-items:center;background:var(--lp-ink-100);border:0;border-radius:12px;color:var(--lp-ink-20);cursor:pointer;display:inline-flex;font-family:var(--lp-font-fono);font-size:16px;font-weight:600;justify-content:center;line-height:1.5;padding:12px 20px;white-space:nowrap;box-sizing:border-box;height:48px;min-width:136px;}
.lp-btn[data-size="sm"]{border-radius:9px;font-size:13.333px;padding:9px 15px;height:38px;min-width:110px;}
.lp-btn--tinted{background:#f5e5d6;color:var(--lp-ink-100);}
.lp-btn:focus-visible,.copy:focus-visible,.prim-dots button:focus-visible,.prim-prev:focus-visible,.prim-next:focus-visible,.chat-replay:focus-visible{outline:2px solid var(--lp-purple-30);outline-offset:2px;}
.lp-nav{height:120px;position:relative;z-index:2;}
.lp-nav-logo{position:absolute;left:var(--gut);top:50%;transform:translateY(-50%);width:114.956px;height:56px;}
.lp-nav-logo svg{width:114.956px;height:56px;display:block;}
.lp-nav-links{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:34px;white-space:nowrap;}
.lp-nav-links a{font-size:13.333px;font-weight:500;letter-spacing:.1333px;line-height:1.5;}
.lp-nav-ctas{position:absolute;right:var(--gut);top:41px;display:flex;gap:8px;}
.sec{padding:128px var(--gut);position:relative;}
.sec-head{display:flex;flex-direction:column;gap:8px;text-align:center;align-items:center;}
.lede{max-width:720px;margin-top:8px;text-wrap:pretty;}
.lp-sep{border:0;border-top:1px solid color-mix(in srgb,var(--lp-ink-50) 55%,transparent);width:min(1136px,calc(100% - 48px));margin:0 auto;height:0;}
.ccard{background:var(--lp-card-cream);border-radius:30px;box-sizing:border-box;}
.body-muted{color:var(--lp-ink-80);}
.split{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:64px;align-items:center;}
.split-text{display:flex;flex-direction:column;gap:16px;}
/* install command: one component everywhere */
.term{display:flex;align-items:center;gap:12px;box-sizing:border-box;width:min(560px,100%);padding:16px 16px 16px 22px;background:var(--lp-terminal-bg);color:var(--lp-page-bg);border-radius:12px;font-size:16px;line-height:24px;text-align:left;}
.term .ps{color:var(--lp-pink-30);flex-shrink:0;}
.term .cmd{font-family:inherit;color:var(--lp-yellow-30);flex:1;min-width:0;white-space:nowrap;}
.copy{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:1px solid rgba(251,246,241,.3);border-radius:9px;background:transparent;color:var(--lp-page-bg);cursor:pointer;flex-shrink:0;transition:border-color .15s ease;}
.copy:hover{border-color:rgba(251,246,241,.75);}
.agent{width:28px;height:28px;display:block;object-fit:contain;}.agents{display:inline-flex;align-items:center;gap:22px;}
/* ── hero + rainbow (landing-v3/hero.css + anim.css) ── */
@keyframes lp-anim-spin-cw{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes lp-anim-spin-ccw{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes lp-anim-pop{0%{animation-timing-function:cubic-bezier(0,0,.58,1);height:2381.047px;width:2440.574px}2.5%{height:2331.047px;width:2390.574px}100%{height:2331.047px;width:2390.574px}}
.lp-hero{position:relative;height:860px;}
.lp-hero-art{position:absolute;left:50%;top:-120px;width:1654px;height:1417px;transform:translateX(-50%) scaleX(max(1,var(--vwfit)));transform-origin:50% 0;clip-path:inset(0 0 38.04% 0);pointer-events:none;z-index:0;}
.lp-anim-canvas--hero{position:absolute;left:0;top:0;width:1654px;height:1417px;transform-origin:0 0;}
.lp-anim-box{overflow:clip;position:absolute;}
.lp-anim-box--hero{height:1478px;left:-435px;top:-61.65px;width:2622px;}
.lp-anim-arc{align-items:center;display:flex;justify-content:center;pointer-events:none;position:absolute;}
.lp-anim-pose{flex:none;position:relative;}
.lp-anim-spin{height:100%;width:100%;}
.lp-anim-spin--cw{animation:lp-anim-spin-cw 20s linear infinite;}
.lp-anim-spin--ccw{animation:lp-anim-spin-ccw 20s linear infinite;}
.lp-anim-spin svg{display:block;width:100%;height:100%;overflow:visible;}
.lp-anim-spin--pop svg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);animation:lp-anim-pop 20s linear infinite;width:2390.574px;height:2331.047px;}
.lp-hero-inner{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:244px var(--gut) 56px;}
.lp-hero-title{font-size:69.014px;line-height:normal;letter-spacing:-2.0704px;margin:0;white-space:pre-line;}
.hero-line{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:12px 18px;font-size:19.2px;line-height:1.5;}
.hero-line.give{margin-top:56px;}.hero-line.watch{margin-top:24px;}
.lp-hero .term{margin-top:24px;}
.hero-mascot{width:112px;height:auto;margin-top:40px;}
/* ── motion (calm by default) ── */
@keyframes rw{0%{opacity:0;transform:translateY(6px)}2.4%{opacity:1;transform:none}18.5%{opacity:1;transform:none}21%{opacity:0;transform:translateY(-6px)}100%{opacity:0}}.rw{opacity:0;animation:rw 12.5s linear infinite;white-space:nowrap;}
@keyframes riseIn{to{opacity:1;transform:none}}
@keyframes bob{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-3px) rotate(-2deg)}50%{transform:translateY(-6px) rotate(0)}75%{transform:translateY(-3px) rotate(2deg)}}@keyframes bob-loop{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-3px) rotate(-2deg)}50%{transform:translateY(-6px) rotate(0)}75%{transform:translateY(-3px) rotate(2deg)}}
.bob{transform-origin:50% 100%;}
#org.wave .bob{animation:bob 1.2s ease-in-out 2;}#org .bob.bob-once{animation:bob-loop 1s ease-in-out 1;}
.tgrid.wave .bob{animation:bob .9s ease-in-out 1;animation-delay:calc(var(--i) * .05s);}
@media (hover:hover){.tcard:hover .bob{animation:bob-loop 1.4s ease-in-out infinite;}}
@keyframes animIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.anim-in{opacity:0;animation:animIn .5s ease forwards;}
@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}.pop-in{opacity:0;animation:popIn .4s cubic-bezier(.2,.9,.2,1.2) forwards;}
@keyframes warm{from{width:0}}.warm{animation:warm 1.6s ease-out .4s backwards;}
@keyframes wfPop{0%{opacity:0;transform:translateY(8px) scale(.96)}100%{opacity:1;transform:none}}.wf-row{opacity:0;animation:wfPop .5s cubic-bezier(.2,.9,.2,1.2) forwards;}
@keyframes wfDrop{0%{top:18px}100%{top:calc(100% - 30px)}}.wf-drop{animation:wfDrop 3.2s cubic-bezier(.4,0,.2,1) .2s forwards;}
@keyframes centerIn{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}.center-in{transform-origin:center;transform-box:fill-box;animation:centerIn .6s cubic-bezier(.2,.9,.2,1.2) .1s backwards;}
@keyframes edgeIn{from{opacity:0}to{opacity:1}}.edge-in{animation:edgeIn .6s ease .4s backwards;}
/* chat */
.chat{display:flex;flex-direction:column;gap:14px;font-size:15px;line-height:24px;}
.crow{display:flex;}
.crow.me{justify-content:flex-end;}
.crow.me>div{max-width:80%;background:#f0e9e3;border-radius:16px;padding:12px 16px;}
.crow.on{animation:riseIn .4s cubic-bezier(.2,.7,.2,1) both;opacity:0;transform:translateY(8px);}
.chat-typing{display:none;gap:5px;align-items:center;height:24px;padding-left:2px;}
.chat-typing.on{display:inline-flex;}
.chat-typing i{width:6px;height:6px;border-radius:50%;background:#bba8ae;animation:tdot 1.2s ease-in-out infinite;}
.chat-typing i:nth-child(2){animation-delay:.2s}.chat-typing i:nth-child(3){animation-delay:.4s}
@keyframes tdot{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
.chat-replay{display:none;align-self:flex-end;margin-top:2px;background:none;border:0;padding:6px 0;font-size:13.333px;color:#85687c;cursor:pointer;text-decoration:underline;text-underline-offset:3px;}
.chat-replay.on{display:inline-block;}
.tool{display:inline-flex;align-items:center;gap:8px;padding:5px 12px 5px 8px;border-radius:999px;border:1px solid rgba(44,0,42,.14);background:#fff;font-size:13.333px;line-height:18px;color:#6c4b65;}
/* data types */
.tgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:56px;--avh:96px;}
.tcard{padding:24px 24px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;border-radius:24px;}
.tcard img{height:var(--avh);width:auto;display:block;}
.tcard .lp-title-sm{font-size:23.04px;text-align:center;}
/* carousel */
.prim-wrap{position:relative;margin-top:56px;}
.prim-viewport{overflow:hidden;transition:height .5s cubic-bezier(.22,1,.36,1);}
.prim-track{display:flex;gap:24px;transition:transform .65s cubic-bezier(.22,1,.36,1);}
.prim-slide{flex:0 0 var(--sw);align-self:flex-start;box-sizing:border-box;opacity:.45;transform:scale(.96);transition:opacity .5s ease,transform .65s cubic-bezier(.22,1,.36,1);cursor:pointer;}
.prim-slide.is-on{opacity:1;transform:none;cursor:default;}
.prim-card{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:40px;align-items:center;padding:48px 56px;min-height:440px;}
.prim-text{display:flex;flex-direction:column;gap:14px;}
.prim-demo{background:#fbf6f1;border-radius:24px;padding:24px;min-height:340px;box-sizing:border-box;display:flex;}
.prim-nav{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:28px;}
.prim-prev,.prim-next{width:44px;height:44px;border-radius:50%;border:1px solid rgba(44,0,42,.16);background:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;}
.prim-dots{display:flex;gap:4px;}
.prim-dots button{position:relative;width:24px;height:24px;padding:0;border:0;background:none;cursor:pointer;}
.prim-dots button::before{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:4px;background:rgba(44,0,42,.2);transition:width .3s ease,margin .3s ease;}
.prim-dots button.is-on::before{width:28px;margin-left:-14px;}
.prim-dots button.is-on::after{content:"";position:absolute;left:50%;top:50%;height:8px;margin:-4px 0 0 -14px;width:0;border-radius:4px;background:#2c002a;animation:dotfill 11s linear forwards;}
.prim-dots button.is-on.paused::after{animation-play-state:paused;}
@keyframes dotfill{to{width:28px}}
.prompt{align-self:flex-end;background:#2c002a;color:#fff7ec;border-radius:16px 16px 4px 16px;padding:10px 14px;font-size:13.333px;line-height:20px;max-width:88%;}
.chip{display:inline-flex;align-items:center;height:34px;padding:0 14px;border-radius:17px;background:#fff;border:1px solid rgba(44,0,42,.12);font-size:13.333px;}
/* org chart */
.org-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;align-items:start;}
.org-col{border-radius:30px;padding:28px 24px;display:flex;flex-direction:column;gap:12px;}
.org-svg{display:block;width:100%;max-width:1136px;height:auto;margin:0 auto;overflow:visible;}
.play{display:flex;align-items:center;gap:12px;background:#fffbf6;border-radius:12px;padding:12px 16px;font-size:14px;line-height:20px;transition:box-shadow .3s ease;}
.play .pname{transition:opacity .25s ease;}
.play.swap .pname{opacity:0;}
.play.fail{box-shadow:0 0 0 2px rgba(229,0,46,.2);}
@keyframes warnTint{0%{background:#fffbf6}40%{background:#fdebd8}100%{background:#fffbf6}}.play.warn{animation:warnTint .7s ease;}
.play.in{animation:animIn .32s cubic-bezier(.2,.9,.2,1.2);}
.pdot{width:9px;height:9px;border-radius:50%;display:inline-block;flex-shrink:0;transition:background .4s ease;}
/* vs + cta + works + footer */
.vs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:48px;}
.vs-card{padding:48px;display:flex;flex-direction:column;gap:16px;border-radius:30px;}
.cta-wrap{display:flex;flex-direction:column;align-items:center;padding:96px 16px;}
.cta-card{position:relative;width:100%;max-width:1296px;background:var(--lp-card-cream);border-radius:48px;overflow:hidden;padding:80px;box-sizing:border-box;min-height:432px;display:flex;flex-direction:column;align-items:center;}
.cta-inner{position:relative;display:flex;flex-direction:column;align-items:center;gap:32px;max-width:640px;width:100%;text-align:center;}
.cta-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
.works{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px 24px;font-size:13.333px;font-weight:500;color:#85687c;}
.works-any{border:1px dashed #ddcfcd;border-radius:9px;padding:6px 12px;}
.lp-foot{background:#000;color:#fff;}
.lp-foot-frame{position:relative;max-width:1654px;height:467px;margin:0 auto;}
.lp-foot-brand{position:absolute;left:var(--gut);top:56.43px;width:241px;}
.lp-foot-logo svg{display:block;}
.lp-foot-lines{margin-top:82px;font-size:13.333px;line-height:1.5;white-space:nowrap;}
.lp-foot-legal{margin-top:14px;font-size:13.333px;line-height:1.5;white-space:nowrap;}
.lp-foot-col{position:absolute;top:76.75px;width:176px;text-align:right;font-size:16px;line-height:1.5;}
.lp-foot-col[data-col="0"]{right:calc(var(--gut) + 384px);}.lp-foot-col[data-col="1"]{right:calc(var(--gut) + 192px);}.lp-foot-col[data-col="2"]{right:var(--gut);}
.lp-foot-head{font-weight:600;}
.lp-foot-links{margin-top:17.43px;display:flex;flex-direction:column;gap:13px;align-items:flex-end;}
/* ── breakpoints ── */
@media (max-width:1216px){:root{--sw:calc(100vw - 96px);}.split-title{font-size:clamp(40px,4.4vw,48px);}}
@media (max-width:1100px){.cta-art{display:none;}.cta-card{padding:64px 32px;}}
@media (max-width:1024px){
  :root{--gut:48px;}
  .lp-nav{display:flex;align-items:center;box-sizing:border-box;padding:0 48px;}
  .lp-nav-logo,.lp-nav-links,.lp-nav-ctas{position:static;transform:none;}
  .lp-nav-links{gap:24px;margin-left:40px;}
  .lp-nav-ctas{margin-left:auto;}
  .lp-hero{height:auto;}
  .lp-hero-art{top:-11.7vw;transform:translateX(-50%) scale(calc(var(--vwfit) * 1.6152));}
  .lp-hero-inner{padding:calc(21.7vw + 22px) 48px 88px;}
  .lp-hero-title{font-size:clamp(40px,6.4vw,62px);letter-spacing:-.03em;}
  .sec{padding:96px 48px;}
  .lp-title-section{font-size:44px;letter-spacing:-.03em;}.split-title{font-size:40px;}
  .lp-title-card{font-size:40px;}.lp-title-step{font-size:32px;letter-spacing:-.03em;}.lp-title-sm{font-size:24px;}
  .split{grid-template-columns:minmax(0,1fr);gap:40px;}
  .tgrid{--avh:72px;gap:12px;}.tcard{padding:18px 12px 16px;}.tcard .lp-title-sm{font-size:19px;}
  .prim-card{padding:32px;min-height:0;}
  .org-col{padding:20px 16px;}
  .vs-card{padding:36px 32px;}
  .lp-foot-frame{height:auto;display:flex;flex-direction:column;gap:56px;padding:64px 48px;box-sizing:border-box;}
  .lp-foot-brand{position:static;width:auto;}
  .lp-foot-lines{margin-top:32px;}.lp-foot-legal{margin-top:12px;}
  .lp-foot-cols{display:flex;flex-wrap:wrap;gap:48px 64px;}
  .lp-foot-col{position:static;text-align:left;width:auto;}
  .lp-foot-links{align-items:flex-start;}
}
@media (max-width:900px){
  .prim-card{grid-template-columns:minmax(0,1fr);gap:24px;}
  .vs{grid-template-columns:minmax(0,1fr);}
}
@media (max-width:767px){
  :root{--gut:24px;--sw:calc(100vw - 48px);}
  body{font-size:15px;}
  .lp-nav{height:104px;padding:16px 24px 0 32px;}
  .lp-nav-links{display:none;}
  .lp-nav-ctas .lp-btn--tinted{display:none;}
  .lp-hero-art{left:0;top:.3vw;margin-left:-36.49vw;transform:scale(calc(var(--vwfit) * 1.6333));transform-origin:0 0;}
  .lp-hero-art:not(.gl) .lp-anim-canvas--hero{transform:translate(875.785px,1456.5px) rotate(15deg) scaleX(-1) translate(-875.785px,-1456.5px);}
  .lp-hero-inner{padding:calc(46vw + 16px) 32px 64px;}
  .lp-hero-title{font-size:clamp(30px,8.846vw,35.559px);letter-spacing:-.03em;line-height:1.15;}
  .hero-line{font-size:16px;}.hero-line.give{margin-top:28px;flex-direction:column;gap:12px;}
  .agents{gap:18px;}
  .hero-mascot{width:88px;margin-top:28px;}
  .term{font-size:13.333px;line-height:20px;padding:12px 12px 12px 16px;gap:10px;}
  .term .ps{display:none;}.term .cmd{white-space:normal;overflow-wrap:anywhere;}
  .sec{padding:72px 24px;}
  .lp-title-section{font-size:34px;}.split-title{font-size:32px;}
  .lp-title-card{font-size:32px;}.lp-title-step{font-size:27px;}.lp-title-sm{font-size:22px;}
  .lp-kicker{font-size:20px;line-height:28px;}
  .chat{font-size:14px;line-height:22px;}
  .tgrid{grid-template-columns:repeat(2,minmax(0,1fr));--avh:64px;margin-top:40px;}.tcard .lp-title-sm{font-size:17px;}
  .prim-wrap{margin-top:40px;}.prim-card{padding:24px 20px;}.prim-demo{padding:16px;min-height:0;}
  .org-svg{display:none;}.org-grid{grid-template-columns:minmax(0,1fr);gap:16px;margin-top:20px;}
  .vs-card{padding:28px 24px;}
  .cta-wrap{padding:64px 16px;}.cta-card{padding:48px 20px;border-radius:32px;min-height:0;}.cta-inner{gap:24px;}
  .lp-foot-frame{gap:24px;padding:40px 24px 28px;}
  .lp-foot-logo svg{width:140px;height:auto;}
  .lp-foot-cols{display:grid;gap:20px 16px;grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
  .lp-foot-col[data-col="2"]{grid-column:1 / -1;}
  .lp-foot-col[data-col="2"] .lp-foot-links{flex-direction:row;flex-wrap:wrap;gap:8px 20px;}
  .lp-foot-head{color:var(--lp-ink-60);font-size:13.333px;}
  .lp-foot-links{margin-top:6px;gap:0;}.lp-foot-links a{padding:10px 0;display:inline-block;}
  .lp-foot-lines{margin-top:24px;}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important;}
  .rw{opacity:1!important;animation:none!important;}.rw:not(:first-child){display:none!important;}
  .anim-in,.pop-in,.wf-row,.center-in,.edge-in,.crow{opacity:1!important;transform:none!important;}
  .prim-track{transition:none!important;}
}
`;

/* ── rainbow rings (LpPancakes.tsx, hero variant) ── */
const withHole = (r, hole) => { const cx = r.iw / 2, cy = r.ih / 2; return `${r.d} M${cx + hole} ${cy}A${hole} ${hole} 0 1 0 ${cx - hole} ${cy}A${hole} ${hole} 0 1 0 ${cx + hole} ${cy}Z`; };
const rainbow = () => `<div class="lp-hero-art"><div class="lp-anim-canvas--hero"><div class="lp-anim-box lp-anim-box--hero">${ARCS.map(a => { const r = RING[a.ring]; const d = a.hole ? withHole(r, a.hole) : r.d; return `<div class="lp-anim-arc" style="left:${a.x}px;top:${a.y}px;width:${a.w}px;height:${a.h}px;"><div class="lp-anim-pose" style="width:${r.iw}px;height:${r.ih}px;transform:matrix(-1, 0, ${-r.s}, 1, 0, 0);"><div class="lp-anim-spin lp-anim-spin--${a.spin}${a.pop ? " lp-anim-spin--pop" : ""}"><svg viewBox="0 0 ${r.iw} ${r.ih}" preserveAspectRatio="none"><path d="${d}" fill="${r.fill}"${a.hole ? ' fill-rule="evenodd"' : ""}></path></svg></div></div></div>`; }).join("")}</div></div></div>`;

/* ── shared bits ── */
const navLogo = svgFile("lp-nav-logo.svg", "width:114.956px;height:56px;display:block;");
const footLogo = fs.readFileSync(`${SITE}/public/lp/lp-footer-logo.svg`, "utf8").replace(/<\?xml[^>]*>/, "").replace(/id="([^"]+)"/g, 'id="foot-$1"').replace(/url\(#([^)]+)\)/g, "url(#foot-$1)").replace("<svg", '<svg aria-hidden="true" style="display:block;"');
const ctaLeft = svgFile("lp-cta-rainbow-left.svg", "position:absolute;left:0;top:0;width:560px;height:432px;").replace("<svg", '<svg class="cta-art"');
const ctaRight = svgFile("lp-cta-rainbow-right.svg", "position:absolute;right:0;top:0;width:529px;height:432px;").replace("<svg", '<svg class="cta-art"');
const copyIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"></rect><path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"></path></svg>`;
const install = () => `<div class="term"><span class="ps" aria-hidden="true">$</span><code class="cmd">curl -fsSL <wbr>https://getpancake.ai/install.md</code><button type="button" class="copy" aria-label="Copy install command" title="Copy">${copyIcon}</button></div>`;
const nav = `<header class="lp-nav"><a class="lp-nav-logo" href="${LIVE}/" aria-label="Pancake home">${navLogo}</a><nav class="lp-nav-links" aria-label="Main"><a href="${LIVE}/#how-it-works">Product</a><a href="${LIVE}/#why">Company</a><a href="${LIVE}/blog">Blog</a></nav><div class="lp-nav-ctas"><a class="lp-btn" data-size="sm" href="https://app.getpancake.ai">Start free</a><a class="lp-btn lp-btn--tinted" data-size="sm" href="https://zcal.co/i/ZEHl48rv" target="_blank" rel="noopener noreferrer">Book a demo</a></div></header>`;
const doc = (body) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>${css}</style>
</helmet>
${body}
</x-dc>
</body>
</html>
`;

/* ── hero ── */
const heroInner = `
<div class="lp-hero-inner">
  <h1 class="lp-display lp-hero-title">Give <span style="color:#e33a6a;">your AI agent</span>
GTM superpowers.</h1>
  <p class="hero-line give">Give this to your agent ${agents}</p>
  ${install()}
  <p class="hero-line watch">and watch it become a GTM super hero</p>
  <img src="pancake-monster.png" alt="" class="hero-mascot" width="112" height="112">
</div>`;
const hero = `<section class="lp-hero" aria-labelledby="h-hero">${rainbow()}${heroInner.replace('class="lp-display lp-hero-title"', 'class="lp-display lp-hero-title" id="h-hero"')}</section>`;

/* ── 1. conversation ── */
const AV = `${HERE}/avatars`;
const av = (slug) => `<img alt="" data-av="${slug}" width="160" height="160" src="data:image/png;base64,${fs.readFileSync(`${AV}/${slug}-160.png`).toString("base64")}">`;
const NAMES = ["Claude", "Codex", "OpenClaw", "Hermes", "Grok Bot"];
const rot = (items, extra = "") => `<span style="display:inline-grid;justify-items:start;${extra}">${items.map((h, i) => `<span class="rw" style="grid-area:1/1;animation-delay:${(i * 2.5).toFixed(1)}s;"${i ? ' aria-hidden="true"' : ""}>${h}</span>`).join("")}</span>`;
const rotWord = () => rot(NAMES.map(n => `${n}.`), "color:#e33a6a;vertical-align:baseline;");
const marks = Object.fromEntries([...agents.matchAll(/<span title="([^"]+)"[^>]*>([\s\S]*?)<\/span>/g)].map(m => [m[1], m[2]]));
const rotAvatar = () => `<span style="display:inline-grid;width:22px;height:22px;" aria-hidden="true">${NAMES.map((n, i) => `<span class="rw" style="grid-area:1/1;animation-delay:${(i * 2.5).toFixed(1)}s;display:flex;">${marks[n].replace(/class="agent"/g, 'class="agent" style="width:22px;height:22px;display:block;object-fit:contain;"')}</span>`).join("")}</span>`;
const rotName = () => rot(NAMES);
const row = (html, t, cls = "") => `<div class="crow${cls ? " " + cls : ""}" data-t="${t}">${html}</div>`;
const tool = (label, t) => row(`<span class="tool"><img alt="" src="pancake-monster.png" style="width:16px;height:auto;"><span>Used <b style="font-weight:600;color:#2c002a;">Pancake</b> · ${label}</span><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#037d48" stroke-width="2" aria-hidden="true"><path d="M3 8.5l3 3 7-7"></path></svg></span>`, t);
const s1 = `
<section class="sec" aria-labelledby="h-s1">
  <div class="split">
    <div class="split-text">
      <span class="lp-kicker">Super sidekick</span>
      <h2 class="lp-title-section split-title" id="h-s1" aria-label="Find new customers. From Claude, Codex, OpenClaw, Hermes or Grok Bot.">Find new customers. From ${rotWord()}</h2>
      <p class="body-muted" style="margin-top:8px;text-wrap:pretty;">Ask your agent in plain words. It uses Pancake like any other tool and tells you what it did.</p>
    </div>
    <div class="ccard chat-card" style="padding:20px 28px 28px;display:flex;flex-direction:column;gap:20px;">
      <div style="display:flex;align-items:center;gap:10px;font-size:13.333px;color:#6c4b65;padding-bottom:14px;border-bottom:1px solid rgba(44,0,42,.08);">${rotAvatar()}<span style="font-weight:600;color:#2c002a;">${rotName()}</span><span>· new chat</span></div>
      <div id="chat" class="chat">
        ${row(`<div>Find companies hiring SDRs and reach out to 10 hot leads a day.</div>`, 0.2, "me")}
        ${row("Setting this up as a daily play. Checking your GTM brain first.", 1.6)}
        ${tool("brain.read", 3.2)}
        ${row("Series A–B SaaS, sold to Heads of Sales. Direct, short, no fluff.", 4.8)}
        ${tool("signals.connect · hiring", 6.6)}
        ${row("38 companies posted an SDR role this week, 41 decision makers.", 8.2)}
        ${tool("sequence.create · 3 touches", 10.0)}
        ${row("Three touches drafted in your voice. First sends go out tomorrow.", 11.6)}
        ${row(`Done. You'll get 10 new hiring-intent leads a day. <span style="color:#8d43fd;text-decoration:underline;">See the play</span>`, 13.6)}
        <div class="chat-typing" aria-hidden="true"><i></i><i></i><i></i></div>
        <button type="button" class="chat-replay">Replay</button>
      </div>
    </div>
  </div>
</section>`;

/* ── 2. data types ── */
const types = [
  ["Email addresses", "mailcarrier", "#ffe9d1"], ["Phone numbers", "receptionist", "#ffd9da"], ["LinkedIn data", "sales", "#efddf1"], ["X data", "influencer", "#d9e9ff"],
  ["Web search", "detective", "#ceead5"], ["SEO analytics", "data-scientist", "#ffe9d1"], ["GEO ranking", "robot", "#ffd9da"], ["Hiring signals", "graduate", "#efddf1"],
  ["Stack signals", "coder", "#d9e9ff"], ["Fundraising signals", "banker", "#ceead5"], ["Competitor search", "ninja", "#ffe9d1"], ["Influencer signals", "streamer", "#ffd9da"],
  ["Job changes", "delivery", "#efddf1"], ["Website visitors", "photographer", "#d9e9ff"], ["Company news", "writer", "#ceead5"], ["Reviews & intent", "sommelier", "#ffe9d1"],
];
const s2 = `
<section class="sec" aria-labelledby="h-s2">
  <div class="sec-head">
    <span class="lp-kicker">Super knowledge</span>
    <h2 class="lp-title-section" id="h-s2">Pancake can find anything and anyone.</h2>
    <p class="body-muted lede">50+ data providers and tools behind one call, always routed to the cheapest source that has the answer. Think OpenRouter, for GTM.</p>
  </div>
  <div class="tgrid">
    ${types.map(([n, slug, tint], i) => `<div class="tcard" style="background:${tint};"><div class="bob" style="--i:${i};">${av(slug)}</div><span class="lp-title-sm">${n}</span></div>`).join("")}
  </div>
</section>`;

/* ── 3. primitives carousel (catalog) ── */
const prompt = (t) => `<div class="prompt">${t}</div>`;
const brainHubs = [["ICP", 110, 60, "#ff7aa0"], ["Personas", 300, 50, "#8d43fd"], ["Voice", 320, 170, "#037d48"], ["Competitors", 90, 170, "#d43900"], ["Positioning", 316, 110, "#4660e7"]];
const animBrain = `<div style="display:flex;flex-direction:column;gap:14px;height:100%;">${prompt("Is this lead ICP? Write a message in my tone.")}<svg viewBox="0 0 420 220" style="width:100%;height:auto;display:block;" aria-hidden="true">${brainHubs.map(h => `<line class="edge-in" x1="210" y1="110" x2="${h[1]}" y2="${h[2]}" stroke="#2c002a" stroke-opacity=".15"></line>`).join("")}${brainHubs.map((h, i) => `<g class="pop-in" style="animation-delay:${(.5 + i * .12).toFixed(2)}s;transform-origin:${h[1]}px ${h[2]}px;"><circle cx="${h[1]}" cy="${h[2]}" r="10" fill="${h[3]}"></circle><text x="${h[1] + 15}" y="${h[2] + 5}" font-family="Aeonik Fono, monospace" font-size="12" fill="#2c002a">${h[0]}</text></g>`).join("")}<circle cx="210" cy="110" r="14" fill="#2c002a" class="center-in"></circle></svg></div>`;
const animData = `<div style="display:flex;flex-direction:column;gap:14px;height:100%;">${prompt("Get me everything on Jane at Acme.")}<div style="display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start;">${["jane@acme.com", "+1 415 555 0142", "linkedin.com/in/jane", "Head of Sales · Acme", "Hiring: 2 SDRs", "Raised $8M · Series A", "Stack: HubSpot, Segment", "Visited /pricing twice"].map((t, i) => `<span class="chip pop-in" style="animation-delay:${(.4 + i * .28).toFixed(2)}s;">${t}</span>`).join("")}</div></div>`;
const animSend = `<div style="display:flex;flex-direction:column;gap:14px;height:100%;">${prompt("Set up 3 sending domains with 3 inboxes each and warm them up.")}<div style="display:flex;flex-direction:column;gap:8px;">${[["acme-mail.com", "warm-up 100%", "#68cea7", 100, 0], ["try-acme.io", "warm-up 64%", "#ffbd7a", 64, .6], ["acme-outreach.com", "warm-up 18%", "#ff7aa0", 18, 1.2]].map(([d, l, c, p, dl]) => `<div class="anim-in" style="animation-delay:${dl}s;background:#fff;border:1px solid rgba(44,0,42,.12);border-radius:12px;padding:10px 14px;display:flex;flex-direction:column;gap:6px;font-size:13.333px;"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;"><span style="font-weight:600;">${d}</span><span class="body-muted">3 inboxes · ${l}</span></div><div style="height:4px;background:rgba(44,0,42,.08);border-radius:2px;"><div class="warm" style="height:100%;width:${p}%;background:${c};border-radius:2px;"></div></div></div>`).join("")}</div><span class="body-muted" style="font-size:13.333px;">Bought, configured, DKIM and SPF set. Ready to send in 14 days.</span></div>`;
const ico = {
  mail: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="M3 8l9 6 9-6"></path></svg>`,
  li: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3.5a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92zM20.45 20h-3.37v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.15 1.46-2.15 2.96V20H9.7V8.5h3.24v1.57h.05c.45-.85 1.55-1.75 3.19-1.75 3.42 0 4.05 2.25 4.05 5.17V20h.22z"></path></svg>`,
  reply: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"></path><path d="M4 9h10a6 6 0 0 1 6 6v4"></path></svg>`,
};
const step = (day, title, meta, tile, icon, d) => `<div class="wf-row" style="animation-delay:${d}s;display:flex;align-items:center;gap:14px;">
  <span style="width:36px;height:36px;border-radius:50%;background:${tile[0]};color:${tile[1]};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;z-index:1;">${ico[icon]}</span>
  <div style="flex-grow:1;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff;border:1px solid rgba(44,0,42,.1);border-radius:12px;padding:10px 14px;min-width:0;">
    <span style="font-size:13.333px;line-height:18px;"><b style="font-weight:600;">${title}</b><span class="body-muted"> · ${meta}</span></span>
    <span style="font-size:12px;line-height:16px;font-weight:600;letter-spacing:.4px;text-transform:uppercase;color:${tile[1]};background:${tile[0]};border-radius:6px;padding:2px 8px;white-space:nowrap;">${day}</span>
  </div></div>`;
const branch = (t, d) => `<div class="wf-row" style="animation-delay:${d}s;padding-left:50px;font-size:13.333px;line-height:18px;color:#9a818f;font-style:italic;">${t}</div>`;
const animSeq = `<div style="display:flex;flex-direction:column;gap:12px;width:100%;">${prompt("Reach out to these 41 leads: email, LinkedIn if no reply, then one follow-up.")}
<div style="position:relative;display:flex;flex-direction:column;gap:8px;margin-top:4px;">
  <div style="position:absolute;left:17px;top:18px;bottom:18px;border-left:2px dashed rgba(44,0,42,.18);"></div>
  <div class="wf-drop" style="position:absolute;left:12px;top:18px;width:12px;height:12px;border-radius:50%;background:#8d43fd;box-shadow:0 0 0 4px rgba(141,67,253,.18);z-index:2;"></div>
  ${step("Day 1", "Email", "intro, in your voice", ["#ffe9d1", "#f38f43"], "mail", 0.2)}
  ${branch("no reply after 3 days →", 0.8)}
  ${step("Day 4", "LinkedIn", "connect + short note", ["#d9e9ff", "#4660e7"], "li", 1.1)}
  ${branch("still nothing →", 1.7)}
  ${step("Day 9", "Email", "follow-up, new angle", ["#efddf1", "#8d43fd"], "mail", 2.0)}
  <div class="wf-row" style="animation-delay:2.9s;display:flex;align-items:center;gap:14px;">
    <span style="width:36px;height:36px;border-radius:50%;background:#ceead5;color:#037d48;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;z-index:1;">${ico.reply}</span>
    <span style="font-size:13.333px;line-height:18px;color:#037d48;font-weight:600;">Reply from Jane · sequence stops, meeting booked</span>
  </div>
</div>
<span class="body-muted" style="font-size:13.333px;margin-top:auto;">41 leads enrolled · each one stops the moment they answer.</span></div>`;
const prims = [
  ["A GTM brain that knows what you sell, and who you sell to.", "ICP, personas, competitors, voice. Your agent reads it before every play and writes back what it learned.", animBrain],
  ["Every phone number, email and signal.", "50+ providers behind one call. Your agent asks for a person or a signal, Pancake finds the cheapest source that has it.", animData],
  ["Sending infrastructure, as a prompt.", "Domains bought, inboxes created, DNS set, warm-up handled. Your agent asks for sending capacity, Pancake builds it.", animSend],
  ["Campaign creation and sequencing.", "Describe the outreach in a sentence. Pancake turns it into a workflow, runs it, and stops when someone replies.", animSeq],
];
const s3 = `
<section class="sec" id="prims" style="padding-left:0;padding-right:0;" aria-labelledby="h-s3" aria-roledescription="carousel">
  <div class="sec-head" style="padding:0 var(--gut);">
    <span class="lp-kicker">Superpowers</span>
    <h2 class="lp-title-section" id="h-s3">What if your agent could <span style="color:#e33a6a;">download</span> GTM?</h2>
  </div>
  <div class="prim-wrap">
    <div class="prim-viewport"><div class="prim-track" aria-live="off">
      ${prims.map(([t, p, anim], i) => `<div class="prim-slide${i === 0 ? " is-on" : ""}" data-i="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of 4"><div class="ccard prim-card"><div class="prim-text"><span class="lp-kicker" style="color:#85687c;">0${i + 1} / 04</span><h3 class="lp-title-step">${t}</h3><p class="body-muted" style="text-wrap:pretty;">${p}</p></div><div class="prim-demo">${anim}</div></div></div>`).join("")}
    </div></div>
    <div class="prim-nav">
      <button type="button" class="prim-prev" aria-label="Previous"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#2c002a" stroke-width="1.6" aria-hidden="true"><path d="M10 3L5 8l5 5"></path></svg></button>
      <div class="prim-dots">${prims.map((_, i) => `<button type="button" data-i="${i}" class="${i === 0 ? "is-on" : ""}"${i === 0 ? ' aria-current="true"' : ""} aria-label="Go to slide ${i + 1}"></button>`).join("")}</div>
      <button type="button" class="prim-next" aria-label="Next"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#2c002a" stroke-width="1.6" aria-hidden="true"><path d="M6 3l5 5-5 5"></path></svg></button>
    </div>
  </div>
</section>`;

/* ── 4. plays: org chart ── */
const orgCols = [
  ["Inbound plays", "#ffe9d1", ["Pricing-page visitors", "Demo-request follow-up", "Newsletter replies", "Inbound lead scoring"]],
  ["Outbound plays", "#efddf1", ["Hiring-signal outbound", "Funding-round play", "Competitor mentions", "Job-change nudge"]],
  ["Content plays", "#ffd9da", ["Weekly SEO article", "LinkedIn posts", "Reddit answers", "GEO citations check"]],
];
const s4 = `
<section class="sec" id="org" aria-labelledby="h-s4">
  <div class="sec-head">
    <span class="lp-kicker">Super plays</span>
    <h2 class="lp-title-section" id="h-s4">Put your GTM on autopilot.</h2>
    <p class="body-muted lede">Pancake runs a squad of sub-agents. Each Play watches a signal, finds the leads, and hands them to a campaign. When one stops working, it retires and a fresh one takes its seat.</p>
  </div>
  <div style="position:relative;margin-top:56px;">
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
      <div class="bob"><img alt="" src="pancake-monster.png" style="width:104px;height:auto;display:block;" width="104" height="104"></div>
      <span style="background:#2c002a;color:#fff7ec;border-radius:12px;padding:8px 14px;font-size:13.333px;line-height:18px;text-align:center;"><b style="display:block;font-weight:600;">Pancake</b><span style="opacity:.75;">runs the squad</span></span>
    </div>
    <svg class="org-svg" viewBox="0 0 1136 130" fill="none" aria-hidden="true">
      ${[190, 568, 946].map((x, i) => `<path d="M 568 0 C 568 70 ${x} 60 ${x} 130" stroke="#9a818f" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"></path><circle r="0" fill="#9a818f"><animateMotion id="mo${i}" begin="indefinite" dur="1.1s" fill="remove" path="M 568 0 C 568 70 ${x} 60 ${x} 130"></animateMotion><set attributeName="r" to="5" begin="mo${i}.begin" end="mo${i}.end"></set></circle>`).join("")}
    </svg>
    <div class="org-grid">
      ${orgCols.map(([t, tint, plays], ci) => `<div class="org-col" data-col="${ci}" style="background:${tint};"><span class="lp-title-sm" style="text-align:center;margin-bottom:8px;">${t}</span>${plays.map((p, i) => { const s = ci === 1 && i === 1 ? "o" : "g"; return `<div class="play" data-s="${s}"><span class="pdot" style="background:${s === "o" ? "#f38f43" : "#037d48"};"></span><span class="pname">${p}</span></div>`; }).join("")}</div>`).join("")}
    </div>
  </div>
</section>`;

/* ── 5. GTM brain ── */
const hubs = [["ICP", 300, 170, "#ff7aa0"], ["Personas", 470, 120, "#8d43fd"], ["Competitors", 640, 150, "#d43900"], ["Positioning", 700, 300, "#4660e7"], ["Voice", 640, 440, "#037d48"], ["Plays", 300, 430, "#ffbd7a"], ["Objections", 160, 300, "#6a8fff"], ["Keywords", 470, 470, "#f38f43"]];
const graph = `<svg id="brain" viewBox="0 0 860 600" aria-hidden="true" style="display:block;width:100%;height:auto;"><g stroke="#2c002a" stroke-opacity=".13" fill="none">${hubs.map(h => `<line x1="430" y1="300" x2="${h[1]}" y2="${h[2]}"></line>`).join("")}${hubs.map(h => [0, 1, 2].map(k => { const a = (k * 2.1) + h[1] * .01; const x = h[1] + Math.cos(a) * 70, y = h[2] + Math.sin(a) * 60; return `<line x1="${h[1]}" y1="${h[2]}" x2="${x.toFixed(0)}" y2="${y.toFixed(0)}"></line>`; }).join("")).join("")}</g><g>${hubs.map(h => `<g>${[0, 1, 2].map(k => { const a = (k * 2.1) + h[1] * .01; const x = h[1] + Math.cos(a) * 70, y = h[2] + Math.sin(a) * 60; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="6" fill="${h[3]}" fill-opacity=".7"></circle>`; }).join("")}<circle cx="${h[1]}" cy="${h[2]}" r="13" fill="${h[3]}"></circle><text x="${h[1] + 20}" y="${h[2] + 5}" font-family="Aeonik Fono, monospace" font-size="15" fill="#2c002a">${h[0]}</text></g>`).join("")}<circle cx="430" cy="300" r="16" fill="#2c002a"></circle><text x="454" y="305" font-family="Aeonik Fono, monospace" font-size="15" font-weight="600" fill="#2c002a">Pancake</text></g></svg>`;
const s5 = `
<section class="sec" aria-labelledby="h-s5">
  <div class="split" style="gap:56px;">
    <div class="split-text">
      <span class="lp-kicker">Super smart</span>
      <h2 class="lp-title-section split-title" id="h-s5">A GTM brain that remembers every play.</h2>
      <p class="body-muted" style="margin-top:8px;text-wrap:pretty;">ICP, personas, competitors, positioning, and every experiment your agent ran: what worked and what didn't. Your agent reads the brain before a play and writes back after. An audit trail that makes the next play smarter.</p>
    </div>
    <div class="ccard" id="brain-host" style="padding:16px;overflow:hidden;">${graph}</div>
  </div>
</section>`;

/* ── 6. agent alone vs agent + Pancake ── */
const s6 = `
<section class="sec" aria-labelledby="h-s6">
  <div class="sec-head">
    <span class="lp-kicker">Super addictive</span>
    <h2 class="lp-title-section" id="h-s6">Your agent alone vs. your agent with Pancake.</h2>
  </div>
  <div class="vs">
    <div class="ccard vs-card"><span class="lp-kicker" style="color:#e33a6a;">Agent alone</span><span class="lp-title-step">Guesses the ICP<br>Scrapes what it can<br>Can't send anything<br>Forgets by tomorrow</span></div>
    <div class="vs-card" style="background:var(--lp-terminal-bg);color:var(--lp-page-bg);"><span class="lp-kicker" style="color:#ba8bff;">Agent + Pancake</span><span class="lp-title-step">50+ sources behind one API<br>Warmed inboxes and LinkedIn<br>Sequence management<br>A brain that remembers</span></div>
  </div>
</section>`;

/* ── 8. CTA card (lp-cta) ── */
const s8 = `
<section class="cta-wrap" aria-labelledby="h-cta">
  <div class="cta-card">
    ${ctaLeft}${ctaRight}
    <div class="cta-inner">
      <h2 class="lp-title-card" id="h-cta">Give your AI agent GTM superpowers.</h2>
      <p style="text-wrap:pretty;">Give this to your agent, and it starts finding customers today.</p>
      ${install()}
      <div class="cta-btns"><a class="lp-btn" href="https://app.getpancake.ai">Start free</a><a class="lp-btn lp-btn--tinted" href="https://zcal.co/i/ZEHl48rv" target="_blank" rel="noopener noreferrer">Book a demo</a></div>
    </div>
  </div>
</section>`;

/* ── 9. works with ── */
const s9 = `
<section class="sec" style="padding-top:32px;padding-bottom:64px;" aria-label="Works with">
  <div class="works">Works with ${agents}<span class="works-any">any MCP client</span></div>
</section>`;

/* ── 10. footer (LpFooter) ── */
const cols = [
  ["Product", [["How it works", `${LIVE}/#how-it-works`], ["Pricing", `${LIVE}/pricing`], ["Open the app", "https://app.getpancake.ai"]]],
  ["Company", [["About", `${LIVE}/#why`], ["Careers", `${LIVE}/careers`], ["Affiliate program", "https://partners.dub.co/pancake-ai"], ["Book a demo", "https://zcal.co/i/ZEHl48rv"], ["Contact", "mailto:hey@pancake.ai"]]],
  ["Social", [["X", "https://x.com/getpancake_ai"], ["LinkedIn", "https://www.linkedin.com/company/get-pancake"], ["Discord", "https://discord.gg/brJ99Up6ym"], ["YouTube", "https://www.youtube.com/@trypancake"], ["TikTok", "https://www.tiktok.com/@getpancake"], ["Instagram", "https://www.instagram.com/get.pancake"]]],
];
const s10 = `
<footer class="lp-foot">
  <div class="lp-foot-frame">
    <div class="lp-foot-brand">
      <div class="lp-foot-logo">${footLogo}</div>
      <p class="lp-foot-lines">© 2026 Pancake<br>San Francisco, CA</p>
      <p class="lp-foot-legal"><a href="${LIVE}/privacy">Privacy</a> • <a href="${LIVE}/terms">Terms</a></p>
    </div>
    <div class="lp-foot-cols">
    ${cols.map(([t, ls], i) => `<div class="lp-foot-col" data-col="${i}"><p class="lp-foot-head">${t}</p><div class="lp-foot-links">${ls.map(([l, h]) => `<a href="${h}"${/^https?:/.test(h) && !h.startsWith(LIVE) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${l}</a>`).join("")}</div></div>`).join("")}
    </div>
  </div>
</footer>`;

const main = `<main>${hero}${s1}<hr class="lp-sep">${s2}<hr class="lp-sep">${s3}<hr class="lp-sep">${s4}<hr class="lp-sep">${s5}<hr class="lp-sep">${s6}${s8}${s9}</main>`;
const page = doc(nav + main + s10);
/* tag balance check: the generator must fail rather than ship unbalanced markup */
for (const tag of ["div", "section", "span", "main", "footer", "header", "svg", "g", "p", "h2"]) {
  const open = (page.match(new RegExp(`<${tag}\\b`, "g")) || []).length, close = (page.match(new RegExp(`</${tag}>`, "g")) || []).length;
  if (open !== close) throw new Error(`unbalanced <${tag}>: ${open} open, ${close} close`);
}
fs.writeFileSync("FullPage.dc.html", page);
fs.writeFileSync("Main.dc.html", doc(nav + `<main>${hero}</main>`));
fs.writeFileSync("MainMobile.dc.html", doc(nav + `<main>${hero}</main>`));
const c = JSON.parse(fs.readFileSync("canvas.json", "utf8"));
c.artboards = c.artboards.map(a => a.file === "Main.dc.html" ? { ...a, h: 980 } : a.file === "FullPage.dc.html" ? { ...a, h: 8300 } : a.file === "MainMobile.dc.html" ? { ...a, w: 390, h: 1004 } : a);
fs.writeFileSync("canvas.json", JSON.stringify(c, null, 2));
console.log("built v3", (page.length / 1024).toFixed(0), "KB");
