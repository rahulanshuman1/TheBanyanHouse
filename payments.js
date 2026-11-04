(()=>{
const API=window.API_BASE||'';
let token=localStorage.getItem('bh_token'),user=null;
const $=s=>document.querySelector(s);
const css=document.createElement('style');
css.textContent=`.am{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.6);display:none;place-items:center;padding:16px}.am.open{display:grid}
.ab{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;width:min(400px,100%);display:grid;gap:12px}
.ab h3{font-size:32px}.ab .sw{display:flex;gap:8px}.ab .err{color:var(--rose);min-height:20px;font-size:14px}
.toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:70;background:var(--ink);color:var(--bg);padding:12px 22px;border-radius:99px;font-weight:500;max-width:90vw;text-align:center}
.nb{background:none;border:1px solid var(--line);color:var(--ink);border-radius:99px;padding:8px 16px;font:500 14px Outfit,sans-serif;cursor:pointer;margin-right:10px}
#opanel{align-items:center;padding:16px}
.od{background:var(--card);color:var(--ink);width:min(680px,100%);max-height:90vh;display:flex;flex-direction:column;border-radius:20px;border:1px solid var(--line);box-shadow:0 30px 80px rgba(0,0,0,.45);overflow:hidden;animation:up .3s ease-out}
.od-h{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 22px;border-bottom:1px solid var(--line)}
.od-h h3{font-size:30px}
.od-x{background:none;border:0;color:var(--mute);width:38px;height:38px;border-radius:50%;cursor:pointer;display:grid;place-items:center}.od-x:hover{background:var(--bg2);color:var(--ink)}
.od-b{overflow:auto;padding:18px 22px 24px}
.od-tabs{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.od-tab{border:1px solid var(--line);background:none;color:var(--mute);border-radius:99px;padding:7px 16px;font:500 14px Outfit,sans-serif;cursor:pointer}
.od-tab[aria-selected=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.od-card{display:flex;gap:14px;align-items:center;width:100%;text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin-bottom:12px;cursor:pointer;color:var(--ink);font:inherit;transition:.2s}
.od-card:hover{transform:translateY(-2px);border-color:var(--gold)}
.od-ic{flex:none;width:46px;height:46px;border-radius:14px;display:grid;place-items:center;color:#fff}
.od-ic.stay{background:linear-gradient(135deg,#1f6f5c,#2fa388)}.od-ic.food{background:linear-gradient(135deg,#c98a10,#f2a900)}
.od-main{flex:1;min-width:0;display:grid;gap:2px}.od-main small{color:var(--mute);font-size:13.5px}
.od-side{display:grid;gap:6px;justify-items:end}.od-side b{font:600 20px 'Cormorant Garamond',serif;color:var(--gold)}
.od-pill{font-size:12px;font-weight:600;color:var(--jade);background:rgba(47,163,136,.14);border-radius:99px;padding:3px 10px}
.od-back{background:none;border:0;color:var(--gold);font:500 14px Outfit,sans-serif;cursor:pointer;padding:0 0 12px}
.od-hero{text-align:center;padding:4px 0 18px}
.od-tick{width:64px;height:64px;border-radius:50%;background:var(--jade);color:#fff;display:grid;place-items:center;margin:0 auto 10px;animation:pop2 .5s cubic-bezier(.2,1.4,.4,1)}
@keyframes pop2{from{transform:scale(0)}}
.od-sec{border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:12px}
.od-sec h4{margin:0 0 8px;font:600 13px Outfit,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
.od-r{display:flex;justify-content:space-between;gap:12px;padding:5px 0;font-size:15px}.od-r span{color:var(--mute)}.od-r b{font-weight:500;text-align:right}
.od-r.t{border-top:1px dashed var(--line);margin-top:6px;padding-top:10px;font-size:17px}.od-r.t b{color:var(--gold);font-weight:600}
.od-g{display:grid;grid-template-columns:1fr auto;gap:2px 12px;padding:8px 0;border-bottom:1px solid var(--line)}.od-g:last-child{border:0}.od-g small,.od-g span{color:var(--mute)}
.od-act{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
.od-note{color:var(--mute);font-size:14px;margin:0 0 12px}
.od-empty{text-align:center;color:var(--mute);padding:30px 0}
.vb{position:fixed;top:calc(60px + env(safe-area-inset-top,0px));left:0;right:0;z-index:19;background:#f2a900;color:#201500;padding:8px 14px;font-size:14px;display:flex;gap:14px;justify-content:center;align-items:center;flex-wrap:wrap}.vb[hidden]{display:none}
.lk{background:none;border:0;color:var(--gold);cursor:pointer;font:600 14px Outfit,sans-serif;text-decoration:underline;padding:4px;text-align:left}.vb .lk{color:#201500}
@media(max-width:560px){.nb{padding:7px 10px;margin-right:6px;font-size:13px}.logo{font-size:20px}nav .btn{display:none}}`;
document.head.appendChild(css);
const EYE='position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:var(--gold);cursor:pointer;font:600 13px Outfit,sans-serif;padding:6px 8px';
const modal=document.createElement('div');modal.className='am';modal.innerHTML=`<div class="ab" role="dialog" aria-modal="true" aria-label="Account">
<h3 id="at">Sign in</h3><div class="sw" id="sw"><button class="btn" id="tl">Sign in</button><button class="btn ghost" id="ts">Create account</button></div>
<label id="ln">Name<input id="an" autocomplete="name"></label><label id="lp">Phone<input id="ap" type="tel" autocomplete="tel"></label>
<label>Email<input id="ae" type="email" autocomplete="email"></label><label id="lw">Password<span style="position:relative;display:block"><input id="aw" type="password" autocomplete="current-password" placeholder="8+ characters" style="padding-right:72px"><button type="button" id="pw" aria-label="Show password" style="${EYE}">Show</button></span></label>
<button type="button" class="lk" id="fg">Forgot password?</button>
<div class="err" id="ae2" role="alert"></div><button class="btn" id="ag">Sign in</button><button class="btn ghost" id="ac">Cancel</button></div>`;
document.body.appendChild(modal);
let mode='login',after=null;
const msg=(t,ok)=>{const e=$('#ae2');e.textContent=t||'';e.style.color=ok?'var(--jade)':'var(--rose)'};
function setMode(m){mode=m;const s=m==='signup',f=m==='forgot';
 $('#at').textContent=s?'Create account':f?'Reset password':'Sign in';$('#ag').textContent=s?'Create account':f?'Send reset link':'Sign in';
 $('#sw').style.display=f?'none':'';$('#ln').style.display=$('#lp').style.display=s?'':'none';$('#lw').style.display=f?'none':'';
 $('#fg').style.display=s?'none':'';$('#fg').textContent=f?'← Back to sign in':'Forgot password?';
 $('#tl').className='btn'+(m==='login'?'':' ghost');$('#ts').className='btn'+(s?'':' ghost');msg('');$('#aw').autocomplete=s?'new-password':'current-password'}
$('#fg').onclick=()=>setMode(mode==='forgot'?'login':'forgot');
$('#pw').onclick=()=>{const i=$('#aw'),show=i.type==='password';i.type=show?'text':'password';$('#pw').textContent=show?'Hide':'Show';$('#pw').setAttribute('aria-label',show?'Hide password':'Show password')};
modal.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();$('#ag').click()}if(e.key==='Escape')modal.classList.remove('open')});
$('#tl').onclick=()=>setMode('login');$('#ts').onclick=()=>setMode('signup');
$('#ac').onclick=()=>modal.classList.remove('open');
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;e.setAttribute('role','status');document.body.appendChild(e);setTimeout(()=>e.remove(),5500)}
async function api(path,opt={}){
 const r=await fetch(API+path,{...opt,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:opt.body?JSON.stringify(opt.body):undefined});
 const d=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(d.error||'Request failed');e.status=r.status;e.code=d.code;throw e}return d;
}
$('#ag').onclick=async()=>{
 const email=$('#ae').value.trim();$('#ag').disabled=true;msg('');
 try{
  if(mode==='forgot'){await api('/api/forgot-password',{method:'POST',body:{email}});msg('If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.',true)}
  else{
   const b={email,password:$('#aw').value};if(mode==='signup'){b.name=$('#an').value;b.phone=$('#ap').value}
   const d=await api('/api/'+mode,{method:'POST',body:b});token=d.token;user=d.user;localStorage.setItem('bh_token',token);
   modal.classList.remove('open');navUI();
   toast(mode==='signup'?(d.emailSent===false?'Account created. We could not send the verification email. Use Resend email.':'Account created. Check your email to verify your address.'):'Welcome, '+user.name.split(' ')[0]);
   const f=after;after=null;f&&f();
  }
 }catch(e){msg(e.message)}finally{$('#ag').disabled=false}
};
function needAuth(cb){if(user)return cb();after=cb;setMode('login');modal.classList.add('open');$('#ae').focus()}
// ---- email verification: banner + gate before ordering ----
const bn=document.createElement('div');bn.className='vb';bn.hidden=true;bn.innerHTML='<span id="vbt"></span><button class="lk" id="vbr">Resend email</button><button class="lk" id="vbc">I have verified</button>';
document.body.appendChild(bn);
function vbUpdate(){const show=!!user&&!user.emailVerified;bn.hidden=!show;if(show)$('#vbt').textContent='Verify '+user.email+' to place orders.'}
async function refreshMe(){try{const d=await api('/api/me');user=d.user;navUI();return !!user.emailVerified}catch{return false}}
async function resend(){try{const d=await api('/api/resend-verification',{method:'POST'});if(d.verified){user.emailVerified=true;navUI();toast('Your email is already verified.')}else toast('Verification email sent to '+user.email)}catch(e){toast(e.message)}}
$('#vbr').onclick=resend;
$('#vbc').onclick=async()=>toast(await refreshMe()?'Email verified. You can place orders now.':'Not verified yet. Open the link in your email first.');
const vm=document.createElement('div');vm.className='am';vm.innerHTML='<div class="ab" role="dialog" aria-modal="true" aria-label="Verify email"><h3>Verify your email</h3><p id="vmt" style="margin:0;color:var(--mute)"></p><div class="err" id="vme" role="alert"></div><button class="btn" id="vmc">I have verified, continue</button><button class="btn ghost" id="vmr">Resend email</button><button class="btn ghost" id="vmx">Close</button></div>';
document.body.appendChild(vm);
let vafter=null;
function showVerify(cb){vafter=cb;$('#vmt').textContent='We sent a verification link to '+user.email+'. Open it, then come back here to place your order. Check your spam folder if you cannot find it.';$('#vme').textContent='';vm.classList.add('open')}
$('#vmx').onclick=()=>{vm.classList.remove('open');vafter=null};$('#vmr').onclick=resend;
$('#vmc').onclick=async()=>{if(await refreshMe()){vm.classList.remove('open');const f=vafter;vafter=null;f&&f()}else $('#vme').textContent='We could not confirm yet. Open the link in your email first, then try again.'};
function needVerified(cb){needAuth(()=>{if(user.emailVerified)return cb();showVerify(cb)})}
// ---- reset password (opened from the email link) ----
const rm=document.createElement('div');rm.className='am';rm.innerHTML=`<div class="ab" role="dialog" aria-modal="true" aria-label="Set a new password"><h3>Set a new password</h3><label>New password<span style="position:relative;display:block"><input id="rp1" type="password" autocomplete="new-password" placeholder="8+ characters" style="padding-right:72px"><button type="button" id="rpw" aria-label="Show password" style="${EYE}">Show</button></span></label><label>Confirm password<input id="rp2" type="password" autocomplete="new-password"></label><div class="err" id="rpe" role="alert"></div><button class="btn" id="rpg">Update password</button><button class="btn ghost" id="rpx">Cancel</button></div>`;
document.body.appendChild(rm);
let rtoken=null;
$('#rpw').onclick=()=>{const show=$('#rp1').type==='password';$('#rp1').type=$('#rp2').type=show?'text':'password';$('#rpw').textContent=show?'Hide':'Show'};
$('#rpx').onclick=()=>rm.classList.remove('open');
$('#rpg').onclick=async()=>{
 const a=$('#rp1').value,b=$('#rp2').value,e=$('#rpe');e.textContent='';
 if(a.length<8)return e.textContent='Password must be at least 8 characters.';
 if(a!==b)return e.textContent='Passwords do not match.';
 $('#rpg').disabled=true;
 try{await api('/api/reset-password',{method:'POST',body:{token:rtoken,password:a}});rm.classList.remove('open');token=null;user=null;localStorage.removeItem('bh_token');navUI();toast('Password updated. Please sign in.');setMode('login');modal.classList.add('open')}
 catch(x){e.textContent=x.message}finally{$('#rpg').disabled=false}
};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){vm.classList.remove('open');rm.classList.remove('open')}});
// nav button
const nb=document.createElement('button');nb.className='nb';nb.id='nb';document.querySelector('nav .wrap>a.btn').before(nb);
const mo=document.createElement('button');mo.className='nb';mo.id='mo';mo.textContent='My orders';mo.style.display='none';nb.before(mo);mo.onclick=()=>openOrders();
function navUI(){vbUpdate();mo.style.display=user?'':'none';prefill();nb.textContent=user?'Sign out ('+user.name.split(' ')[0]+')':'Sign in';nb.onclick=()=>{if(user){user=null;token=null;localStorage.removeItem('bh_token');navUI();toast('Signed out')}else needAuth(()=>{})}}
navUI();
if(token)api('/api/me').then(d=>{user=d.user;navUI()}).catch(()=>{token=null;localStorage.removeItem('bh_token')});
function prefill(){(window.BH?BH.hooks:[]).forEach(f=>f(user))}
// ---------- My orders: list, detail, receipt ----------
const P={};Object.values(MENU).flat().forEach(d=>P[d[0]]=d[3]);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rs=n=>'₹'+Number(n).toLocaleString('en-IN');
const fd=d=>{const x=new Date(/^\d{4}-\d{2}-\d{2}$/.test(d)?d+'T00:00:00':d);return isNaN(x)?esc(d):x.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})};
const fdt=d=>new Date(d).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
const IDN={aadhaar:'Aadhaar',passport:'Passport',dl:'Driving Licence',voter:'Voter ID'};
const maskId=(t,l)=>(t==='aadhaar'?'XXXX XXXX ':'••••')+esc(l);
const I=q=>'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+q+'</svg>';
const IC={x:I('<path d="M6 6l12 12M18 6L6 18"/>'),stay:I('<path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="1.6"/>'),food:I('<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 21V3c-2.5 1.5-3.5 4-3.5 7 0 2 1 3 3.5 3"/>'),ok:I('<path d="M5 12.5l4.5 4.5L19 7.5"/>')};
let OL=[],tab='all';
const op=document.createElement('div');op.className='panel';op.id='opanel';
op.innerHTML='<div class="od" role="dialog" aria-modal="true" aria-labelledby="odt"><div class="od-h"><h3 id="odt">My orders</h3><button class="od-x" id="ox" aria-label="Close">'+IC.x+'</button></div><div class="od-b" id="ol" aria-live="polite"></div></div>';
document.body.appendChild(op);
const closeO=()=>op.classList.remove('open');
$('#ox').onclick=closeO;op.onclick=e=>{if(e.target===op)closeO()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeO()});
const guestsTxt=d=>{const a=Array.isArray(d.adults)?d.adults.length:(d.guests||0),c=Array.isArray(d.children)?d.children.length:0;return a+' adult'+(a===1?'':'s')+(c?', '+c+' child'+(c===1?'':'ren'):'')};
const oid=o=>'BH-'+String(o._id).slice(-6).toUpperCase();
const items=d=>d.items||[];
function listHTML(){
 const inTab=(o,k)=>k==='all'||(k==='stay'?o.kind==='room':o.kind==='food');
 const tabs=[['all','All'],['stay','Stays'],['food','Food']].map(([k,l])=>'<button class="od-tab" data-tab="'+k+'" aria-selected="'+(tab===k)+'">'+l+' ('+OL.filter(o=>inTab(o,k)).length+')</button>').join('');
 const cards=OL.map((o,i)=>[o,i]).filter(([o])=>inTab(o,tab)).map(([o,i])=>{
  const d=o.details||{},room=o.kind==='room',it=items(d);
  const t=room?esc(d.room)+' · '+esc(d.nights)+' night'+(d.nights>1?'s':''):esc(it.map(x=>x.name).slice(0,2).join(', '))+(it.length>2?' +'+(it.length-2)+' more':'');
  const s=room?fd(d.checkin)+' → '+fd(d.checkout)+' · '+guestsTxt(d):it.reduce((a,x)=>a+x.q,0)+' item(s) · Table order';
  return '<button class="od-card" data-i="'+i+'"><span class="od-ic '+(room?'stay':'food')+'">'+(room?IC.stay:IC.food)+'</span><span class="od-main"><b>'+t+'</b><small>'+s+'</small><small>'+oid(o)+' · Booked '+esc(fdt(o.createdAt))+'</small></span><span class="od-side"><span class="od-pill">'+(room?'Confirmed':'Paid')+'</span><b>'+rs(o.amount)+'</b></span></button>';
 }).join('');
 return '<div class="od-tabs" role="tablist">'+tabs+'</div>'+(cards||'<p class="od-empty">Nothing here yet.</p>');
}
function detailHTML(o,isNew,i){
 const d=o.details||{},room=o.kind==='room';let body='';
 if(room){
  body+=`<section class="od-sec"><h4>Stay</h4><div class="od-r"><span>Room</span><b>${esc(d.room)}</b></div><div class="od-r"><span>Check-in</span><b>${fd(d.checkin)}, from 2:00 pm</b></div><div class="od-r"><span>Check-out</span><b>${fd(d.checkout)}, by 11:00 am</b></div><div class="od-r"><span>Duration</span><b>${esc(d.nights)} night${d.nights>1?'s':''}</b></div><div class="od-r"><span>Guests</span><b>${guestsTxt(d)}</b></div></section>`;
  if(Array.isArray(d.adults)){
   const g=d.adults.map((a,k)=>`<div class="od-g"><b>${esc(a.title)} ${esc(a.first)} ${esc(a.last)}${k?'':' (primary)'}</b><span>Adult</span><small>${esc(IDN[a.idType]||'ID')}: ${maskId(a.idType,a.idLast4)}</small><span></span></div>`).join('')+(d.children||[]).map(c=>`<div class="od-g"><b>${esc(c.first)} ${esc(c.last)}</b><span>Child</span><small>Age ${esc(c.age)}</small><span></span></div>`).join('');
   body+=`<section class="od-sec"><h4>Guest details</h4>${g}</section>`;
   if(d.contact)body+=`<section class="od-sec"><h4>Contact</h4><div class="od-r"><span>Email</span><b>${esc(d.contact.email)}</b></div><div class="od-r"><span>Phone</span><b>${esc(d.contact.phone)}</b></div></section>`;
  }
  body+='<p class="od-note">Please carry the original ID proof of every adult guest at check-in.</p>';
 }else{
  body+=`<section class="od-sec"><h4>Items</h4>${items(d).map(x=>`<div class="od-r"><span>${esc(x.name)} × ${esc(x.q)}</span><b>${P[x.name]?rs(P[x.name]*x.q):''}</b></div>`).join('')}</section>`;
 }
 body+=`<section class="od-sec"><h4>Payment</h4><div class="od-r"><span>Status</span><b style="color:var(--jade)">Paid</b></div><div class="od-r"><span>Paid on</span><b>${esc(fdt(o.updatedAt||o.createdAt))}</b></div><div class="od-r"><span>Payment ID</span><b>${esc(o.rzpPaymentId||'')}</b></div><div class="od-r t"><span>Total paid</span><b>${rs(o.amount)}</b></div></section>`;
 const head=isNew
  ?`<div class="od-hero"><div class="od-tick">${IC.ok}</div><h3 style="font-size:30px">${room?'Booking confirmed':'Order placed'}</h3><p class="od-note" style="margin:6px 0 0">${oid(o)} · ${rs(o.amount)} paid</p></div>`
  :`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px"><div><b style="font:600 26px 'Cormorant Garamond',serif">${room?'Room booking':'Food order'}</b><div class="od-note" style="margin:0">${oid(o)} · Booked ${esc(fdt(o.createdAt))}</div></div><span class="od-pill">${room?'Confirmed':'Paid'}</span></div>`;
 return `<button class="od-back" data-back>← All orders</button>${head}${body}<div class="od-act"><button class="btn" data-print="${i}">Print receipt</button><button class="btn ghost" data-back>Back to orders</button></div>`;
}
function show(v,i,isNew){const b=$('#ol');b.innerHTML=v==='d'?detailHTML(OL[i],isNew,i):listHTML();b.scrollTop=0}
$('#ol').onclick=e=>{
 const t=e.target.closest('[data-tab],[data-i],[data-back],[data-print]');if(!t)return;
 if(t.dataset.tab){tab=t.dataset.tab;show('l')}
 else if(t.dataset.i!==undefined)show('d',+t.dataset.i)
 else if(t.dataset.print!==undefined)printReceipt(OL[+t.dataset.print])
 else show('l');
};
function printReceipt(o){
 const d=o.details||{},room=o.kind==='room';
 const rows=room
  ?`<tr><td>Room</td><td>${esc(d.room)}</td></tr><tr><td>Check-in</td><td>${fd(d.checkin)}</td></tr><tr><td>Check-out</td><td>${fd(d.checkout)}</td></tr><tr><td>Nights</td><td>${esc(d.nights)}</td></tr><tr><td>Guests</td><td>${guestsTxt(d)}</td></tr>`+(Array.isArray(d.adults)?d.adults.map(a=>`<tr><td>Guest</td><td>${esc(a.title)} ${esc(a.first)} ${esc(a.last)} (${esc(IDN[a.idType]||'ID')} ${maskId(a.idType,a.idLast4)})</td></tr>`).join('')+(d.children||[]).map(c=>`<tr><td>Child</td><td>${esc(c.first)} ${esc(c.last)}, age ${esc(c.age)}</td></tr>`).join(''):'')
  :items(d).map(x=>`<tr><td>${esc(x.name)} × ${esc(x.q)}</td><td>${P[x.name]?rs(P[x.name]*x.q):''}</td></tr>`).join('');
 const w=window.open('','_blank');if(!w)return toast('Allow pop-ups to print your receipt');
 w.document.write(`<!doctype html><title>Receipt ${oid(o)}</title><style>body{font:15px/1.6 Arial,sans-serif;max-width:640px;margin:30px auto;padding:0 20px;color:#16233a}h1{margin:0}table{width:100%;border-collapse:collapse;margin:18px 0}td{padding:8px 0;border-bottom:1px solid #ddd}td:last-child{text-align:right}.t td{font-weight:700;font-size:18px}small{color:#666}</style><h1>The Banyan House</h1><small>12 Temple Road, Ambad, Nashik 422010</small><h2>${room?'Booking confirmation':'Order receipt'} ${oid(o)}</h2><small>Booked on ${esc(fdt(o.createdAt))}</small><table>${rows}<tr class="t"><td>Total paid</td><td>${rs(o.amount)}</td></tr></table><small>Payment ID: ${esc(o.rzpPaymentId||'')}</small>`);
 w.document.close();w.focus();setTimeout(()=>w.print(),400);
}
async function openOrders(hl){
 if(!user)return needAuth(()=>openOrders(hl));
 op.classList.add('open');$('#ol').innerHTML='<p class="od-empty">Loading your orders…</p>';
 try{
  OL=await api('/api/orders');tab='all';
  if(hl){const i=OL.findIndex(o=>o.rzpPaymentId===hl);if(i>-1)return show('d',i,true)}
  show('l');
 }catch(e){
  if(e.status===401){closeO();token=null;user=null;localStorage.removeItem('bh_token');navUI();needAuth(()=>openOrders(hl))}
  else $('#ol').innerHTML='<p class="od-empty" style="color:var(--rose)">'+esc(e.message)+'</p>';
 }
}
// Razorpay
function loadRzp(){return new Promise((ok,no)=>{if(window.Razorpay)return ok();const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=ok;s.onerror=()=>no(new Error('Could not load Razorpay. Check your connection.'));document.head.appendChild(s)})}
async function pay(body,done){
 try{
  await loadRzp();const o=await api('/api/pay/order',{method:'POST',body});
  new Razorpay({key:o.keyId,amount:o.amount,currency:o.currency,order_id:o.orderId,name:'The Banyan House',description:body.kind==='food'?'Table order':'Room booking',
   prefill:{name:user.name,email:user.email,contact:user.phone},theme:{color:'#f2a900'},
   handler:async r=>{try{const v=await api('/api/pay/verify',{method:'POST',body:r});done&&done();openOrders(v.ref)}catch(e){toast(e.message+' If money was deducted, it will be refunded or confirmed automatically.')}},
   modal:{ondismiss:()=>toast('Payment cancelled')}}).open();
 }catch(e){if(e.status===401){token=null;user=null;navUI();needAuth(()=>pay(body,done))}else if(e.code==='EMAIL_NOT_VERIFIED'){user.emailVerified=false;navUI();showVerify(()=>pay(body,done))}else toast(e.message)}
}
// Food order: add Pay button to the order sheet
const payBtn=document.createElement('button');payBtn.className='btn';payBtn.textContent='Pay now';
$('#clr').before(payBtn);
payBtn.onclick=()=>{
 const items=Object.entries(order).map(([name,v])=>({name,q:v.q}));if(!items.length)return;
 needVerified(()=>pay({kind:'food',items},()=>{order={};upd();$('#panel').classList.remove('open')}));
};
// links from emails: ?verify=TOKEN and ?reset=TOKEN
const qp=new URLSearchParams(location.search);
if(qp.get('verify')||qp.get('reset'))history.replaceState(null,'',location.pathname+location.hash);
if(qp.get('verify'))api('/api/verify-email',{method:'POST',body:{token:qp.get('verify')}}).then(()=>{toast('Email verified. You can place orders now.');if(token)refreshMe()}).catch(e=>toast(e.message));
if(qp.get('reset')){rtoken=qp.get('reset');rm.classList.add('open');$('#rp1').focus()}
window.BH={needAuth,needVerified,pay,api,toast,esc,rs,fd,openOrders,getUser:()=>user,hooks:[]};
})();
