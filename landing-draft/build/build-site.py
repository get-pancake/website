import re, json, os, shutil, glob, hashlib
W = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(W, "..", "site")

# fonts and avatars ship under content-hashed names so the one-year immutable cache can never serve a stale file
def fingerprint(src_glob, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    for old in glob.glob(os.path.join(out_dir, "*")):
        os.remove(old)
    names = {}
    for f in sorted(glob.glob(src_glob)):
        base, ext = os.path.splitext(os.path.basename(f))
        h = hashlib.sha256(open(f, "rb").read()).hexdigest()[:8]
        names[base] = f"{base}.{h}{ext}"
        shutil.copy(f, os.path.join(out_dir, names[base]))
    return names
FONT = fingerprint(os.path.join(W, "fonts", "*.woff2"), os.path.join(S, "fonts"))
AVATAR = fingerprint(os.path.join(W, "avatars", "*-160.png"), os.path.join(S, "avatars"))
shutil.copy(os.path.join(W, "pancake-monster.png"), os.path.join(S, "pancake-monster.png"))
src = open(W + "/FullPage.dc.html").read()
style = re.search(r'<helmet>\s*<style>(.*?)</style>\s*</helmet>', src, flags=re.S).group(1)
body = src[src.index("</helmet>") + 9:src.index("</x-dc>")]
rings = open(W + "/rings.json").read()

# fonts: external WOFF2 instead of inline OTF (the artboards keep the inline copy)
FONTS = f"""
@font-face{{font-family:"Aeonik Condensed Pro";font-weight:500;font-display:swap;src:url(/fonts/{FONT["AeonikCondensedPro-Medium"]}) format("woff2");}}
@font-face{{font-family:"Aeonik Condensed Pro";font-weight:600;font-display:swap;src:url(/fonts/{FONT["AeonikCondensedPro-SemiBold"]}) format("woff2");}}
@font-face{{font-family:"Aeonik Fono";font-weight:400;font-display:swap;src:url(/fonts/{FONT["AeonikFono-Regular"]}) format("woff2");}}
@font-face{{font-family:"Aeonik Fono";font-weight:500;font-display:swap;src:url(/fonts/{FONT["AeonikFono-Medium"]}) format("woff2");}}
@font-face{{font-family:"Aeonik Fono";font-weight:600;font-display:swap;src:url(/fonts/{FONT["AeonikFono-SemiBold"]}) format("woff2");}}
"""
style = re.sub(r'/\*FONTS\*/.*?/\*/FONTS\*/', FONTS, style, flags=re.S)
assert "base64" not in style, "inline font survived"
# avatars: files instead of data URIs
body, n_av = re.subn(r'(<img alt="" data-av="([^"]+)" width="160" height="160") src="data:image/png;base64,[^"]+"', lambda m: f'{m.group(1)} loading="lazy" decoding="async" src="/avatars/{AVATAR[m.group(2) + "-160"]}"', body)
body = body.replace('src="pancake-monster.png"', 'src="/pancake-monster.png"')
assert n_av == 16, n_av
assert body.count("data:image/png;base64") <= 6, "avatar data URI survived"  # the two bitmap agent marks (Codex, Hermes) stay inline
# nesting check: every closing tag must match the innermost open element
VOID = {"img", "br", "hr", "wbr", "input", "meta", "link"}  # HTML void elements; SVG children are always closed explicitly
stack = []
for m in re.finditer(r'<(/?)([a-zA-Z][\w-]*)[^>]*?(/?)>', body):
    closing, tag, selfclose = m.group(1), m.group(2), m.group(3)
    if closing:
        assert stack and stack[-1] == tag, f"mis-nested </{tag}> (open: {stack[-4:]}) at {m.start()}"
        stack.pop()
    elif not selfclose and tag not in VOID:
        stack.append(tag)
assert not stack, f"unclosed tags: {stack}"

desc = "Pancake gives your AI agent access to 50+ datasources, sending infrastructure, and a GTM brain that can orchestrate any GTM play."
head = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#fbf6f1">
<title>Pancake — Give your AI agent GTM superpowers</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Pancake">
<meta property="og:title" content="Give your AI agent GTM superpowers"><meta property="og:description" content="{desc}">
<meta property="og:url" content="https://pancake-landing-draft.vercel.app/"><meta property="og:image" content="https://pancake-landing-draft.vercel.app/og-v2.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Give your AI agent GTM superpowers — Pancake">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Give your AI agent GTM superpowers"><meta name="twitter:description" content="{desc}"><meta name="twitter:image" content="https://pancake-landing-draft.vercel.app/og-v2.png"><meta name="twitter:image:alt" content="Give your AI agent GTM superpowers — Pancake">
<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/{FONT["AeonikCondensedPro-SemiBold"]}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/{FONT["AeonikFono-Regular"]}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/{FONT["AeonikFono-Medium"]}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/{FONT["AeonikFono-SemiBold"]}" as="font" type="font/woff2" crossorigin>
<style>{style}
html,body{{overflow-x:clip;}}
.lp-hero-art.gl .lp-anim-box{{display:none;}}.lp-hero-art canvas{{position:absolute;left:0;top:0;width:1654px;height:878px;display:block;}}
.crow{{display:none;}}.crow.on{{display:block;}}.crow.me.on{{display:flex;}}
.js-rot .rw{{animation:none!important;opacity:0;transform:translateY(6px);transition:opacity .28s ease,transform .28s ease;}}.js-rot .rw.rw-on{{opacity:1;transform:none;}}
</style>
<noscript><style>.crow{{display:block;}}.crow.me{{display:flex;}}</style></noscript>
</head>
<body>
<span id="sr-live" class="sr-only" aria-live="polite"></span>
'''

JS = r'''<script>
var REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* viewport fit factor for the hero art (CSS falls back to tan(atan2()) without JS) */
(function(){var d=document.documentElement;function fit(){d.style.setProperty('--vwfit',(d.clientWidth/1654).toFixed(4));}addEventListener('resize',fit);fit();})();

/* rotating agent name: JS-timed so exactly one name is visible (CSS keyframes only drive the static artboards) */
(function(){var groups=[];document.querySelectorAll('.rw').forEach(function(el){var p=el.parentNode;if(groups.indexOf(p)<0)groups.push(p);});if(!groups.length)return;document.documentElement.classList.add('js-rot');var i=0,n=5;function show(k){groups.forEach(function(g){var kids=g.querySelectorAll('.rw');kids.forEach(function(el,j){el.classList.toggle('rw-on',j===k);});});}show(0);if(REDUCE)return;setInterval(function(){i=(i+1)%n;show(i);},2500);})();

/* copy button */
(function(){var CHECK='<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#68cea7" stroke-width="2" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>',live=document.getElementById('sr-live');
document.querySelectorAll('.term').forEach(function(t){var btn=t.querySelector('.copy'),cmdEl=t.querySelector('.cmd');if(!btn||!cmdEl)return;var orig=btn.innerHTML,t1=null,t2=null;
function done(){clearTimeout(t1);clearTimeout(t2);btn.innerHTML=CHECK;btn.style.borderColor='#68cea7';if(live){live.textContent='';t1=setTimeout(function(){live.textContent='Install command copied';},50);}t2=setTimeout(function(){btn.innerHTML=orig;btn.style.borderColor='';if(live)live.textContent='';},1500);}
function fallback(cmd){var ta=document.createElement('textarea');ta.value=cmd;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);btn.focus();}
btn.addEventListener('click',function(){var cmd=cmdEl.textContent.trim();if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(cmd).then(done,function(){fallback(cmd);done();});}else{fallback(cmd);done();}});});})();

/* hero rainbow on a 2D canvas (the DOM rings tear while scrolling); ≤767 uses the mobile composition (rotate 15°, mirrored) */
(function(){var art=document.querySelector('.lp-hero-art');if(!art||!window.Path2D||REDUCE)return;var R=__RINGS__;var cv=document.createElement('canvas');var dpr=Math.min(2,window.devicePixelRatio||1);cv.width=1654*dpr;cv.height=878*dpr;art.appendChild(cv);art.classList.add('gl');var ctx=cv.getContext('2d'),mq=matchMedia('(max-width: 767px)');
var arcs=R.ARCS.map(function(a){var r=R.RING[a.ring];var d=r.d;if(a.hole){var cx=r.iw/2,cy=r.ih/2,h=a.hole;d+=' M'+(cx+h)+' '+cy+'A'+h+' '+h+' 0 1 0 '+(cx-h)+' '+cy+'A'+h+' '+h+' 0 1 0 '+(cx+h)+' '+cy+'Z';}return{p:new Path2D(d),fill:r.fill,iw:r.iw,ih:r.ih,s:r.s,cx:-435+a.x+a.w/2,cy:-61.65+a.y+a.h/2,dir:a.spin==='cw'?1:-1,hole:!!a.hole,pop:!!a.pop};});
var t0=null,running=false,raf=0;function draw(now){if(!running)return;if(t0===null)t0=now;var t=(now-t0)/1000;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,1654,878);
if(mq.matches){ctx.translate(875.785,1456.5);ctx.rotate(Math.PI/12);ctx.scale(-1,1);ctx.translate(-875.785,-1456.5);}
for(var i=0;i<arcs.length;i++){var a=arcs[i];var ang=a.dir*(t/20)*Math.PI*2;var sc=1;if(a.pop){var ph=t%20;sc=1+0.0209*(1-Math.min(1,ph/0.5));}ctx.save();ctx.translate(a.cx,a.cy);ctx.transform(-1,0,-a.s,1,0,0);ctx.rotate(ang);ctx.scale(sc,sc);ctx.translate(-a.iw/2,-a.ih/2);ctx.fillStyle=a.fill;ctx.fill(a.p,a.hole?'evenodd':'nonzero');ctx.restore();}
raf=requestAnimationFrame(draw);}
function start(){if(running)return;running=true;raf=requestAnimationFrame(draw);}function stop(){running=false;cancelAnimationFrame(raf);}
if(window.IntersectionObserver){new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?start():stop();});}).observe(art.parentNode);}else start();
document.addEventListener('visibilitychange',function(){document.hidden?stop():(art.parentNode.getBoundingClientRect().bottom>0&&start());});})();

/* chat: plays at reading pace when it scrolls into view, grows with the conversation, replays on demand */
(function(){var c=document.getElementById('chat');if(!c)return;var rows=[].slice.call(c.querySelectorAll('.crow')),typing=c.querySelector('.chat-typing'),btn=c.querySelector('.chat-replay'),timers=[];
function clear(){timers.forEach(clearTimeout);timers=[];}
function showAll(){rows.forEach(function(r){r.classList.add('on');});}
function play(){clear();rows.forEach(function(r){r.classList.remove('on');});btn.classList.remove('on');typing.classList.remove('on');
timers.push(setTimeout(function(){typing.classList.add('on');},700));
rows.forEach(function(r,k){timers.push(setTimeout(function(){r.classList.add('on');if(k===rows.length-1){typing.classList.remove('on');btn.classList.add('on');}},parseFloat(r.dataset.t)*1000));});}
if(REDUCE){showAll();return;}
btn.addEventListener('click',function(){play();c.focus();});
if(!window.IntersectionObserver){play();return;}
var out=true;new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>=.3){if(out){out=false;play();}}else if(!e.isIntersecting){out=true;clear();}});},{threshold:[0,.3]}).observe(c.closest('.chat-card'));})();

/* data-type cards: one stagger wave when they enter, then still (hover bobs) */
(function(){if(!window.IntersectionObserver||REDUCE)return;document.querySelectorAll('.tgrid,#org').forEach(function(g){new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){g.classList.add('wave');o.disconnect();}});},{threshold:.2}).observe(g);});})();

/* superpowers carousel: starts on slide 1 when visible, pauses on hover/focus/hidden tab, keyboard arrows, replays each demo on arrival */
(function(){var root=document.getElementById('prims');if(!root)return;var track=root.querySelector('.prim-track'),vp=root.querySelector('.prim-viewport'),slides=[].slice.call(root.querySelectorAll('.prim-slide')),dots=[].slice.call(root.querySelectorAll('.prim-dots button')),i=0,n=slides.length,timer=null,G=24,visible=false,hover=false,focus=false,held=false,seen=false;
function w(){return slides[0].offsetWidth;}
function place(){var W=w();track.style.transform='translateX(calc(50% - '+(W/2)+'px - '+(i*(W+G))+'px))';vp.style.height=slides[i].offsetHeight+'px';}
function replay(k){var d=slides[k].querySelector('.prim-demo');if(d)d.replaceWith(d.cloneNode(true));}
function go(k,force){var prev=i;i=(k+n)%n;place();slides.forEach(function(s,j){s.classList.toggle('is-on',j===i);s.setAttribute('aria-hidden',j===i?'false':'true');});dots.forEach(function(d,j){d.classList.remove('is-on','paused');if(j===i){void d.offsetWidth;d.classList.add('is-on');if(held)d.classList.add('paused');}d.setAttribute('aria-current',j===i?'true':'false');});if(prev!==i||force)replay(i);arm();}
function arm(){clearInterval(timer);timer=null;track.setAttribute('aria-live',held?'polite':'off');if(REDUCE||!visible||held||document.hidden)return;timer=setInterval(function(){go(i+1);},11000);}
function sync(){var was=held;held=hover||focus;if(held&&!was){clearInterval(timer);timer=null;dots[i].classList.add('paused');track.setAttribute('aria-live','polite');}else if(!held&&was){go(i);}}
root.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'){hover=true;sync();}});root.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'){hover=false;sync();}});
root.addEventListener('focusin',function(){focus=true;sync();});root.addEventListener('focusout',function(e){if(!root.contains(e.relatedTarget)){focus=false;sync();}});
document.addEventListener('visibilitychange',function(){document.hidden?(clearInterval(timer),timer=null):(visible&&go(i));});
root.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(i+1,true);}else if(e.key==='ArrowLeft'){e.preventDefault();go(i-1,true);}});
root.querySelector('.prim-next').addEventListener('click',function(){go(i+1,true);});root.querySelector('.prim-prev').addEventListener('click',function(){go(i-1,true);});
dots.forEach(function(d){d.addEventListener('click',function(){go(+d.dataset.i,true);});});
slides.forEach(function(s,j){s.addEventListener('click',function(){if(j!==i)go(j,true);});});
var x0=null;track.addEventListener('pointerdown',function(e){x0=e.clientX;});track.addEventListener('pointercancel',function(){x0=null;});track.addEventListener('pointerup',function(e){if(x0===null)return;var dx=e.clientX-x0;x0=null;if(Math.abs(dx)>40)go(dx<0?i+1:i-1,true);});
addEventListener('resize',place);addEventListener('load',place);if(window.ResizeObserver){var ro=new ResizeObserver(function(){vp.style.height=slides[i].offsetHeight+'px';});slides.forEach(function(s){ro.observe(s);});}if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);
slides.forEach(function(s,j){s.setAttribute('aria-hidden',j===i?'false':'true');});place();
if(window.IntersectionObserver){new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){visible=true;if(!seen){seen=true;go(0,true);}else go(i);}else{visible=false;clearInterval(timer);timer=null;}});},{threshold:.25}).observe(root);}else{visible=true;go(0,true);}})();

/* plays org chart: one play at a time drifts green → amber → red, then retires and a fresh one takes the same seat */
(function(){var org=document.getElementById('org');if(!org)return;if(REDUCE){[].slice.call(org.querySelectorAll('animateMotion')).forEach(function(a){a.parentNode.remove();});return;}
var pool=[["Pricing-page visitors","Demo-request follow-up","Newsletter replies","Inbound lead scoring","Webinar attendees","Free-trial nudges","Churn-risk check-ins","Partner referrals"],["Hiring-signal outbound","Funding-round play","Competitor mentions","Job-change nudge","Tech-stack switchers","Event attendee outreach","Podcast guest outreach","G2 reviewers"],["Weekly SEO article","LinkedIn posts","Reddit answers","GEO citations check","Customer story drafts","Changelog posts","Newsletter issue","YouTube shorts"]];
var G='#037d48',O='#f38f43',R='#e5002e',cur=null,stage=0,timer=null,running=false,first=true;
function rand(a,b){return a+Math.random()*(b-a);}
function set(p,s){p.dataset.s=s;p.querySelector('.pdot').style.background=s==='g'?G:s==='o'?O:R;p.classList.toggle('fail',s==='r');p.classList.remove('warn');if(s==='o'){void p.offsetWidth;p.classList.add('warn');}}
function step(){var plays=[].slice.call(org.querySelectorAll('.play:not(.swap)'));
if(!cur){var off=plays.filter(function(p){return p.dataset.s!=='g';});if(off.length){cur=off[0];stage=cur.dataset.s==='o'?1:2;}else{var g=plays.filter(function(p){return p.dataset.s==='g';});cur=g[Math.floor(Math.random()*g.length)];set(cur,'o');stage=1;}}
else if(stage===1){set(cur,'r');stage=2;}
else{var p=cur,col=p.closest('.org-col'),ci=+col.dataset.col;var mo=document.getElementById('mo'+ci);if(mo&&mo.beginElement)try{mo.beginElement();}catch(e){}var boss=org.querySelector('.bob');if(boss){boss.classList.remove('bob-once');void boss.offsetWidth;boss.classList.add('bob-once');}p.classList.add('swap');setTimeout(function(){var names=[].slice.call(col.querySelectorAll('.pname')).map(function(e){return e.textContent;});var fresh=pool[ci].filter(function(x){return names.indexOf(x)<0;});p.querySelector('.pname').textContent=fresh.length?fresh[Math.floor(Math.random()*fresh.length)]:pool[ci][0];set(p,'g');p.classList.remove('swap');p.classList.add('in');setTimeout(function(){p.classList.remove('in');},340);},260);cur=null;stage=0;}
sched();}
function sched(){clearTimeout(timer);if(!running)return;timer=setTimeout(step,stage===0?rand(3000,6000):stage===1?rand(3000,5000):rand(2000,3000));}
function start(){if(running)return;running=true;if(first){first=false;step();}else sched();}function stop(){running=false;clearTimeout(timer);timer=null;}
if(window.IntersectionObserver){new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?start():stop();});}).observe(org);}else start();})();

/* living GTM brain: hubs rest on a fixed ring, leaves settle, and every ~4s one write-back travels from Pancake to a hub and grows the graph (capped at 45 nodes) */
(function(){var svg=document.getElementById('brain');if(!svg||!window.requestAnimationFrame||REDUCE)return;
var NS='http://www.w3.org/2000/svg',el=function(t,a){var n=document.createElementNS(NS,t);for(var k in a)n.setAttribute(k,a[k]);return n;};
svg.innerHTML='';var PHONE=matchMedia('(max-width: 767px)').matches;if(PHONE)svg.setAttribute('viewBox','80 40 720 520');var gE=el('g',{stroke:'#2c002a','stroke-opacity':'.14','stroke-width':'1.1',fill:'none'}),gR=el('g',{fill:'none'}),gN=el('g',{}),gS=el('g',{}),gL=el('g',{'font-family':'Aeonik Fono, monospace','font-size':PHONE?'22':'15',fill:'#2c002a'});[gE,gR,gN,gS,gL].forEach(function(g){svg.appendChild(g);});
var CX=430,CY=300,DEF=[['ICP','#ff7aa0',4],['Personas','#8d43fd',2],['Competitors','#d43900',3],['Positioning','#4660e7',3],['Voice','#037d48',4],['Plays','#ffbd7a',3],['Objections','#6a8fff',3],['Keywords','#f38f43',4]];
var seed=11,rnd=function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
var nodes=[],edges=[],hubs=[],E=[],N=[],L=[];
function mountNode(n){var c=el('circle',{r:n.born?0:n.r,fill:n.c,'fill-opacity':n.leaf?.75:1});gN.appendChild(c);N.push(c);if(n.label){var tx=el('text',{'dominant-baseline':'middle'});if(n.bold)tx.setAttribute('font-weight','600');tx.textContent=n.label;gL.appendChild(tx);L.push(tx);}else L.push(null);}
function mountEdge(){var l=el('line',{});gE.appendChild(l);E.push(l);}
var root={x:CX,y:CY,vx:0,vy:0,r:16,c:'#2c002a',label:'Pancake',fixed:true,bold:true};nodes.push(root);
DEF.forEach(function(h,i){var ang=-Math.PI/2+i*(Math.PI*2/DEF.length),d=i%2?190:165;var hub={x:CX+Math.cos(ang)*d*1.3,y:CY+Math.sin(ang)*d,vx:0,vy:0,r:12,c:h[1],label:h[0],hub:true,fixed:true,leaves:0};nodes.push(hub);hubs.push(hub);edges.push({a:root,b:hub,len:d});for(var k=0;k<h[2];k++)addLeaf(hub,0);});
function addLeaf(hub,born){var base=Math.atan2(hub.y-CY,hub.x-CX),a2=base+(rnd()-.5)*2.4,dd=46+rnd()*30;var leaf={x:hub.x+Math.cos(a2)*(born?12:dd),y:hub.y+Math.sin(a2)*(born?12:dd),vx:0,vy:0,r:4+rnd()*2.5,c:hub.c,leaf:true,born:born};nodes.push(leaf);edges.push({a:hub,b:leaf,len:dd});hub.leaves++;if(born){mountNode(leaf);mountEdge();}return leaf;}
function step(alpha){for(var i=0;i<nodes.length;i++){var n=nodes[i];if(n.fixed)continue;for(var j=0;j<nodes.length;j++){if(i===j)continue;var m=nodes[j],dx=n.x-m.x,dy=n.y-m.y,d2=dx*dx+dy*dy+30,kf=(m.hub||m.fixed?1400:520)/d2,d=Math.sqrt(d2);n.vx+=dx/d*kf*alpha;n.vy+=dy/d*kf*alpha;}if(n.x<30)n.vx+=(30-n.x)*.05;if(n.x>830)n.vx-=(n.x-830)*.05;if(n.y<24)n.vy+=(24-n.y)*.05;if(n.y>576)n.vy-=(n.y-576)*.05;}
edges.forEach(function(e){var dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,d=Math.sqrt(dx*dx+dy*dy)||1,f=(d-e.len)*.03*alpha,fx=dx/d*f,fy=dy/d*f;if(!e.a.fixed){e.a.vx+=fx;e.a.vy+=fy;}if(!e.b.fixed){e.b.vx-=fx;e.b.vy-=fy;}});
nodes.forEach(function(n){if(n.fixed)return;n.vx*=.78;n.vy*=.78;var sp=Math.hypot(n.vx,n.vy);if(sp>3){n.vx*=3/sp;n.vy*=3/sp;}n.x+=n.vx;n.y+=n.vy;});}
for(var i=0;i<400;i++)step(1);
nodes.forEach(mountNode);edges.forEach(mountEdge);
function paint(now){E.forEach(function(l,i){var e=edges[i];l.setAttribute('x1',e.a.x);l.setAttribute('y1',e.a.y);l.setAttribute('x2',e.b.x);l.setAttribute('y2',e.b.y);});
N.forEach(function(c,i){var n=nodes[i];c.setAttribute('cx',n.x);c.setAttribute('cy',n.y);var r=n.r;if(n.born&&now){var k=Math.min(1,(now-n.born)/700);r=n.r*(1-Math.pow(1-k,3));if(k>=1)n.born=0;}if(n.flash&&now){var q=Math.min(1,(now-n.flash)/900);r=n.r*(1+.7*Math.sin(q*Math.PI));if(q>=1)n.flash=0;}c.setAttribute('r',r);});
L.forEach(function(tx,i){if(!tx)return;var n=nodes[i];tx.setAttribute('x',n.x+n.r+8);tx.setAttribute('y',n.y);});}
paint();
var sig=null,ripples=[],hubIdx=0,active=false,last=0,acc=2600,raf=0;
function fire(now){var hub=hubs[hubIdx=(hubIdx+1)%hubs.length];sig={hub:hub,t:0,el:el('circle',{r:3.2,fill:hub.c,cx:CX,cy:CY})};gS.appendChild(sig.el);}
function arrive(now){var hub=sig.hub;sig.el.remove();sig=null;var rp=el('circle',{r:12,stroke:hub.c,'stroke-width':1.5,'stroke-opacity':.8});gR.appendChild(rp);ripples.push({el:rp,n:hub,t:0});hub.flash=now;
if(nodes.length<45){addLeaf(hub,now);}else{var ls=nodes.filter(function(n){return n.leaf&&n.c===hub.c;});if(ls.length)ls[Math.floor(rnd()*ls.length)].flash=now;}}
function frame(now){if(!active)return;var dt=Math.min(40,now-last||16);last=now;acc+=dt;step(.6);
if(sig){sig.t=Math.min(1,sig.t+dt/800);var k=sig.t<.5?2*sig.t*sig.t:1-Math.pow(-2*sig.t+2,2)/2;sig.el.setAttribute('cx',CX+(sig.hub.x-CX)*k);sig.el.setAttribute('cy',CY+(sig.hub.y-CY)*k);if(sig.t>=1)arrive(now);}
else if(acc>4000){acc=0;fire(now);}
for(var i=ripples.length-1;i>=0;i--){var rp=ripples[i];rp.t+=dt/900;rp.el.setAttribute('cx',rp.n.x);rp.el.setAttribute('cy',rp.n.y);rp.el.setAttribute('r',12+rp.t*30);rp.el.setAttribute('stroke-opacity',Math.max(0,.8*(1-rp.t)));if(rp.t>=1){rp.el.remove();ripples.splice(i,1);}}
paint(now);raf=requestAnimationFrame(frame);}
if(window.IntersectionObserver){new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!active){active=true;last=0;raf=requestAnimationFrame(frame);}else if(!e.isIntersecting){active=false;cancelAnimationFrame(raf);}});},{rootMargin:'100px'}).observe(svg);}else{active=true;raf=requestAnimationFrame(frame);}})();
</script>
</body>
</html>'''

html = head + body + JS.replace('__RINGS__', rings)
open(S + "/index.html", "w").write(html)
json.dump({"cleanUrls": True, "headers": [
    {"source": "/(.*)", "headers": [
        {"key": "X-Robots-Tag", "value": "noindex"},
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"}]},
    {"source": "/([^/]+)\\.png", "headers": [{"key": "Cache-Control", "value": "public, max-age=86400"}]},
    {"source": "/(fonts|avatars)/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]},
]}, open(S + "/vercel.json", "w"), indent=1)
print("site written", len(html) // 1024, "KB")
