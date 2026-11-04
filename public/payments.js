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
.oh{display:flex;justify-content:space-between;align-items:center;gap:10px}
.oc{border:1px solid var(--line);border-radius:16px;padding:16px;margin:14px 0;display:grid;gap:8px}
.oc.new{border-color:var(--jade);box-shadow:0 0 0 2px rgba(47,163,136,.25)}
.oc header{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.oc header small{display:block;color:var(--mute)}
.pd{color:var(--jade);border:1px solid var(--jade);border-radius:99px;padding:2px 12px;font-size:13px;font-weight:600}
.oc .r{display:flex;justify-content:space-between;gap:12px;font-size:15px}.oc .r span{color:var(--mute)}.oc .r b{font-weight:500;text-align:right}
.oc .tot{border-top:1px solid var(--line);padding-top:8px;font-size:17px}.oc .tot span{color:var(--ink)}.oc .tot b{color:var(--gold);font-weight:600}
.om{color:var(--mute);font-size:14px}
.ok2{background:rgba(47,163,136,.15);color:var(--jade);border-radius:12px;padding:10px 14px;font-weight:500}
@media(max-width:560px){.nb{padding:7px 10px;margin-right:6px;font-size:13px}.logo{font-size:20px}nav .btn{display:none}}`;
document.head.appendChild(css);
const modal=document.createElement('div');modal.className='am';modal.innerHTML=`<div class="ab" role="dialog" aria-modal="true" aria-label="Account">
<h3 id="at">Sign in</h3><div class="sw"><button class="btn" id="tl">Sign in</button><button class="btn ghost" id="ts">Create account</button></div>
<label id="ln">Name<input id="an" autocomplete="name"></label><label id="lp">Phone<input id="ap" type="tel" autocomplete="tel"></label>
<label>Email<input id="ae" type="email" autocomplete="email"></label><label>Password<span style="position:relative;display:block"><input id="aw" type="password" autocomplete="current-password" placeholder="8+ characters" style="padding-right:72px"><button type="button" id="pw" aria-label="Show password" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:var(--gold);cursor:pointer;font:600 13px Outfit,sans-serif;padding:6px 8px">Show</button></span></label>
<div class="err" id="ae2" role="alert"></div><button class="btn" id="ag">Sign in</button><button class="btn ghost" id="ac">Cancel</button></div>`;
document.body.appendChild(modal);
let mode='login',after=null;
function setMode(m){mode=m;const s=m==='signup';$('#at').textContent=s?'Create account':'Sign in';$('#ag').textContent=s?'Create account':'Sign in';$('#ln').style.display=$('#lp').style.display=s?'':'none';$('#tl').className='btn'+(s?' ghost':'');$('#ts').className='btn'+(s?'':' ghost');$('#ae2').textContent='';$('#aw').autocomplete=s?'new-password':'current-password'}
$('#pw').onclick=()=>{const i=$('#aw'),show=i.type==='password';i.type=show?'text':'password';$('#pw').textContent=show?'Hide':'Show';$('#pw').setAttribute('aria-label',show?'Hide password':'Show password')};
modal.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();$('#ag').click()}if(e.key==='Escape')modal.classList.remove('open')});
$('#tl').onclick=()=>setMode('login');$('#ts').onclick=()=>setMode('signup');
$('#ac').onclick=()=>modal.classList.remove('open');
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;e.setAttribute('role','status');document.body.appendChild(e);setTimeout(()=>e.remove(),4500)}
async function api(path,opt={}){
 const r=await fetch(API+path,{...opt,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:opt.body?JSON.stringify(opt.body):undefined});
 const d=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(d.error||'Request failed');e.status=r.status;throw e}return d;
}
$('#ag').onclick=async()=>{
 const b={email:$('#ae').value.trim(),password:$('#aw').value};if(mode==='signup'){b.name=$('#an').value;b.phone=$('#ap').value}
 $('#ag').disabled=true;
 try{const d=await api('/api/'+mode,{method:'POST',body:b});token=d.token;user=d.user;localStorage.setItem('bh_token',token);
  modal.classList.remove('open');navUI();toast('Welcome, '+user.name.split(' ')[0]);const f=after;after=null;f&&f()}
 catch(e){$('#ae2').textContent=e.message}finally{$('#ag').disabled=false}
};
function needAuth(cb){if(user)return cb();after=cb;setMode('login');modal.classList.add('open');$('#ae').focus()}
// nav button
const nb=document.createElement('button');nb.className='nb';nb.id='nb';document.querySelector('nav .wrap>a.btn').before(nb);
const mo=document.createElement('button');mo.className='nb';mo.id='mo';mo.textContent='My orders';mo.style.display='none';nb.before(mo);mo.onclick=()=>openOrders();
function navUI(){mo.style.display=user?'':'none';prefill();nb.textContent=user?'Sign out ('+user.name.split(' ')[0]+')':'Sign in';nb.onclick=()=>{if(user){user=null;token=null;localStorage.removeItem('bh_token');navUI();toast('Signed out')}else needAuth(()=>{})}}
navUI();
if(token)api('/api/me').then(d=>{user=d.user;navUI()}).catch(()=>{token=null;localStorage.removeItem('bh_token')});
// Prefill booking form from the account
function prefill(){const el=$('#bf')&&$('#bf').elements;if(!el||!user)return;if(!el.name.value)el.name.value=user.name||'';if(!el.phone.value)el.phone.value=user.phone||''}
// My orders
const P={};Object.values(MENU).flat().forEach(d=>P[d[0]]=d[3]);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rs=n=>'₹'+Number(n).toLocaleString('en-IN');
const fd=d=>{const x=new Date(d);return isNaN(x)?esc(d):x.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})};
const op=document.createElement('div');op.className='panel';op.id='opanel';
op.innerHTML='<div class="sheet" role="dialog" aria-modal="true" aria-label="My orders" style="width:min(620px,100%);max-height:88vh"><div class="oh"><h3 style="font-size:32px">My orders</h3><button class="nb" id="oc" style="margin:0">Close</button></div><div id="ol" aria-live="polite"></div></div>';
document.body.appendChild(op);
$('#oc').onclick=()=>op.classList.remove('open');
op.onclick=e=>{if(e.target===op)op.classList.remove('open')};
document.addEventListener('keydown',e=>{if(e.key==='Escape')op.classList.remove('open')});
function card(o,isNew){
 const d=o.details||{},id='BH-'+String(o._id).slice(-6).toUpperCase();let body='';
 if(o.kind==='room'){
  body=`<div class="r"><span>Room</span><b>${esc(d.room)}</b></div><div class="r"><span>Check-in</span><b>${fd(d.checkin)} · from 2 pm</b></div><div class="r"><span>Check-out</span><b>${fd(d.checkout)} · by 11 am</b></div><div class="r"><span>Stay</span><b>${esc(d.nights)} night${d.nights>1?'s':''}${d.guests?' · '+esc(d.guests)+' guest'+(d.guests>1?'s':''):''}</b></div>`;
 }else{
  body=(d.items||[]).map(i=>`<div class="r"><span>${esc(i.name)} × ${esc(i.q)}</span><b>${P[i.name]?rs(P[i.name]*i.q):''}</b></div>`).join('');
 }
 return `<article class="oc${isNew?' new':''}"><header><div><strong>${o.kind==='room'?'🛏️ Room booking':'🍽️ Food order'}</strong><small>${id} · ${esc(new Date(o.createdAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}))}</small></div><span class="pd">Paid</span></header>${body}<div class="r tot"><span>Total paid</span><b>${rs(o.amount)}</b></div><small class="om">Payment ref: ${esc(o.rzpPaymentId||'')}</small></article>`;
}
async function openOrders(hl){
 if(!user)return needAuth(()=>openOrders(hl));
 op.classList.add('open');const box=$('#ol');box.innerHTML='<p class="om">Loading your orders...</p>';
 try{
  const list=await api('/api/orders');
  box.innerHTML=list.length?(hl?'<div class="ok2">Payment successful. Your details are below.</div>':'')+list.map(o=>card(o,o.rzpPaymentId===hl)).join(''):'<p class="om">No paid orders yet. Your food orders and room bookings will appear here.</p>';
 }catch(e){
  if(e.status===401){op.classList.remove('open');token=null;user=null;localStorage.removeItem('bh_token');navUI();needAuth(()=>openOrders(hl))}
  else box.innerHTML='<p style="color:var(--rose)">'+esc(e.message)+'</p>';
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
 }catch(e){if(e.status===401){token=null;user=null;navUI();needAuth(()=>pay(body,done))}else toast(e.message)}
}
// Food order: add Pay button to the order sheet
const payBtn=document.createElement('button');payBtn.className='btn';payBtn.textContent='Pay now';
$('#clr').before(payBtn);
payBtn.onclick=()=>{
 const items=Object.entries(order).map(([name,v])=>({name,q:v.q}));if(!items.length)return;
 needAuth(()=>pay({kind:'food',items},()=>{order={};upd();$('#panel').classList.remove('open')}));
};
// Room booking: replace the old submit handler
$('#bf').onsubmit=e=>{
 e.preventDefault();const f=e.target,ok=$('#ok');ok.style.color='var(--rose)';
 if(!f.in.value||!f.out.value||f.out.value<=f.in.value){ok.textContent='Check-out must be after check-in.';return}
 ok.textContent='';
 needAuth(()=>pay({kind:'room',room:f.room.value,checkin:f.in.value,checkout:f.out.value,guests:f.g.value},()=>{ok.style.color='var(--jade)';ok.textContent='Booking confirmed. Find the details under My orders.';f.reset()}));
};
$('#bf button[type=submit]').textContent='Pay and book';
})();
