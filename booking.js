(()=>{
const B=window.BH,$=s=>document.querySelector(s),root=$('#bk');
if(!B||!root){if(root)root.innerHTML='<p style="color:var(--rose)">The booking form could not start because payments.js is outdated. Please deploy the latest payments.js and refresh.</p>';console.error('booking.js: window.BH is missing. Deploy the latest payments.js.');return}
const ROOMS={"Garden Room":{p:3800,a:2,c:1,d:'28 m² · queen bed · courtyard balcony'},"Skyline Deluxe":{p:5400,a:3,c:2,d:'34 m² · king bed · city view'},"Banyan Suite":{p:9200,a:4,c:3,d:'58 m² · lounge · bathtub'}};
const IDT={aadhaar:{n:'Aadhaar Card',re:/^[2-9]\d{11}$/,ph:'12-digit Aadhaar number',h:'12 digits'},passport:{n:'Passport',re:/^[A-Z0-9]{6,9}$/,ph:'Passport number',h:'6 to 9 letters or digits'},dl:{n:'Driving Licence',re:/^[A-Z0-9]{8,20}$/,ph:'Licence number',h:'8 to 20 letters or digits'},voter:{n:'Voter ID (EPIC)',re:/^[A-Z]{3}\d{7}$/,ph:'e.g. ABC1234567',h:'3 letters followed by 7 digits'}};
const NM=/^[A-Za-z][A-Za-z .'-]{0,39}$/;
const today=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const S={step:1,room:'Garden Room',cin:'',cout:'',adults:2,kids:[],email:'',phone:'',A:[],C:[],agree:false};
const e$=B.esc,nights=()=>S.cin&&S.cout?Math.max(0,Math.round((new Date(S.cout)-new Date(S.cin))/864e5)):0;
const normId=v=>v.replace(/[\s-]/g,'').toUpperCase();
const plural=(n,w,p)=>n+' '+(n===1?w:(p||w+'s'));
const gtxt=()=>plural(S.adults,'adult')+(S.kids.length?', '+plural(S.kids.length,'child','children'):'');

const css=document.createElement('style');
css.textContent=`.bk-steps{display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap}
.bk-st{display:flex;align-items:center;gap:8px;color:var(--mute);font-weight:500;font-size:14px}
.bk-st i{font-style:normal;width:26px;height:26px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;font-size:13px}
.bk-st.on{color:var(--ink)}.bk-st.on i{background:var(--gold);border-color:var(--gold);color:#201500;font-weight:600}.bk-st.done i{background:var(--jade);border-color:var(--jade);color:#fff}
.bk-st:not(:last-child)::after{content:'';width:34px;height:1px;background:var(--line);margin-left:6px}
.bk-grid{display:grid;grid-template-columns:1fr 330px;gap:24px;align-items:start}
@media(max-width:900px){.bk-grid{grid-template-columns:1fr}.bk-sum{order:-1;position:static!important}}
.bk-main{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:24px;display:grid;gap:16px;min-width:0}
.bk-main h3{font-size:28px}
.bk-rooms{display:grid;gap:10px}
.bk-room{display:flex!important;align-items:center;gap:12px;border:1px solid var(--line);border-radius:14px;padding:14px;cursor:pointer;color:var(--ink)!important}
.bk-room input{width:auto;accent-color:var(--gold)}
.bk-room.sel{border-color:var(--gold);background:rgba(242,169,0,.08)}
.bk-room span{flex:1;display:grid;gap:2px}.bk-room small,.bk-sp small{color:var(--mute);font-size:13.5px}
.bk-room em{font:600 22px 'Cormorant Garamond',serif;font-style:normal;color:var(--gold);text-align:right}.bk-room em small{display:block;font:400 12px Outfit,sans-serif}
.bk-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.bk-row3{display:grid;grid-template-columns:90px 1fr 1fr;gap:14px}
@media(max-width:520px){.bk-row,.bk-row3{grid-template-columns:1fr}}
.bk-sp{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}.bk-sp>div:first-child{display:grid}
.bk-ctl{display:flex;align-items:center;gap:14px}.bk-ctl button{width:36px;height:36px;border-radius:50%;border:1px solid var(--gold);background:none;color:var(--gold);font-size:20px;cursor:pointer}.bk-ctl button:disabled{opacity:.35;cursor:not-allowed}.bk-ctl output{min-width:18px;text-align:center;font-weight:600}
.bk-age{max-width:260px}
.bk-g{border:1px solid var(--line);border-radius:14px;padding:16px;display:grid;gap:14px;margin:0;min-width:0}.bk-g legend{padding:0 8px;font-weight:600}
.bk-note{color:var(--mute);font-size:14px;margin:0}
.bk-err{color:var(--rose);min-height:20px;font-size:14px}
.bk-sum{position:sticky;top:80px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;display:grid;gap:8px}
.bk-sum h4{margin:0;font:600 13px Outfit,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
.bk-rn{font:600 26px 'Cormorant Garamond',serif}.bk-sum small{color:var(--mute)}
.bk-sr{display:flex;justify-content:space-between;gap:10px;font-size:15px}.bk-sr span{color:var(--mute)}.bk-sr b{font-weight:500;text-align:right}
.bk-sr.t{border-top:1px dashed var(--line);padding-top:10px;margin-top:4px;font-size:18px}.bk-sr.t b{color:var(--gold);font-weight:600}
.bk-acts{display:flex;gap:10px;flex-wrap:wrap}
.bk-chk{display:flex!important;gap:10px;align-items:flex-start;color:var(--ink)!important}.bk-chk input{width:auto;margin-top:5px;accent-color:var(--gold)}
.bk-rv{display:grid;gap:4px;border:1px solid var(--line);border-radius:14px;padding:14px 16px}.bk-rv h4{margin:0 0 4px;font:600 13px Outfit,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}`;
document.head.appendChild(css);

const err=m=>{const x=root.querySelector('#err');if(x)x.textContent=m;return false};
const stepper=(l,sub,key,v,min,max)=>`<div class="bk-sp"><div><b>${l}</b><small>${sub}</small></div><div class="bk-ctl"><button type="button" data-st="${key}" data-d="-1" aria-label="Fewer ${l}"${v<=min?' disabled':''}>−</button><output aria-live="polite">${v}</output><button type="button" data-st="${key}" data-d="1" aria-label="More ${l}"${v>=max?' disabled':''}>+</button></div></div>`;

function s1(){
 const cap=ROOMS[S.room];
 const R=Object.entries(ROOMS).map(([n,r])=>`<label class="bk-room${S.room===n?' sel':''}"><input type="radio" name="room" value="${n}"${S.room===n?' checked':''}><span><b>${n}</b><small>${r.d}</small><small>Up to ${plural(r.a,'adult')}, ${plural(r.c,'child','children')}</small></span><em>${B.rs(r.p)}<small>per night</small></em></label>`).join('');
 const ages=S.kids.map((a,i)=>`<label class="bk-age">Child ${i+1} age<select data-age="${i}">${Array.from({length:13},(_,k)=>`<option value="${k}"${k===a?' selected':''}>${k===0?'Under 1 year':plural(k,'year')}</option>`).join('')}</select></label>`).join('');
 return `<h3>Choose your room</h3><div class="bk-rooms">${R}</div>
<h3>Dates</h3><div class="bk-row"><label>Check-in<input type="date" id="cin" min="${today}" value="${S.cin}"></label><label>Check-out<input type="date" id="cout" min="${S.cin||today}" value="${S.cout}"></label></div>
<h3>Guests</h3>${stepper('Adults','Age 13 and above','adults',S.adults,1,cap.a)}${stepper('Children','Age 0 to 12','kids',S.kids.length,0,cap.c)}${ages}
<div class="bk-err" id="err" role="alert"></div><div class="bk-acts"><button class="btn" id="n1" type="button">Continue to guest details</button></div>`;
}
function s2(){
 const A=S.A.map((a,i)=>`<fieldset class="bk-g"><legend>${i?'Adult '+(i+1):'Adult 1 (primary guest)'}</legend>
<div class="bk-row3"><label>Title<select data-a="${i}" data-f="title">${['Mr','Ms','Mrs'].map(t=>`<option${a.title===t?' selected':''}>${t}</option>`).join('')}</select></label><label>First name<input data-a="${i}" data-f="first" value="${e$(a.first)}" autocomplete="${i?'off':'given-name'}"></label><label>Last name<input data-a="${i}" data-f="last" value="${e$(a.last)}" autocomplete="${i?'off':'family-name'}"></label></div>
<div class="bk-row"><label>ID proof type<select data-a="${i}" data-f="idType">${Object.entries(IDT).map(([k,v])=>`<option value="${k}"${a.idType===k?' selected':''}>${v.n}</option>`).join('')}</select></label><label>ID proof number<input data-a="${i}" data-f="idNumber" value="${e$(a.idNumber)}" placeholder="${IDT[a.idType].ph}" autocomplete="off"></label></div></fieldset>`).join('');
 const C=S.C.map((c,i)=>`<fieldset class="bk-g"><legend>Child ${i+1} · ${plural(S.kids[i],'year')}</legend><div class="bk-row"><label>First name<input data-c="${i}" data-f="first" value="${e$(c.first)}" autocomplete="off"></label><label>Last name<input data-c="${i}" data-f="last" value="${e$(c.last)}" autocomplete="off"></label></div></fieldset>`).join('');
 return `<h3>Guest details</h3>${A}${C}
<fieldset class="bk-g"><legend>Contact details</legend><div class="bk-row"><label>Email<input type="email" data-k="email" value="${e$(S.email)}" autocomplete="email"></label><label>Phone<input type="tel" data-k="phone" value="${e$(S.phone)}" autocomplete="tel"></label></div></fieldset>
<p class="bk-note">Every adult needs a valid government ID at check-in. ID numbers are stored encrypted, and only the last 4 digits are shown after booking.</p>
<div class="bk-err" id="err" role="alert"></div><div class="bk-acts"><button class="btn ghost" id="b2" type="button">Back</button><button class="btn" id="n2" type="button">Review booking</button></div>`;
}
function s3(){
 const n=nights(),r=ROOMS[S.room];
 const g=S.A.map((a,i)=>`<div class="bk-sr"><span>${a.title} ${e$(a.first)} ${e$(a.last)}${i?'':' (primary)'}</span><b>${IDT[a.idType].n} ${'••••'+e$(normId(a.idNumber).slice(-4))}</b></div>`).join('')+S.C.map((c,i)=>`<div class="bk-sr"><span>${e$(c.first)} ${e$(c.last)} (child)</span><b>Age ${S.kids[i]}</b></div>`).join('');
 return `<h3>Review and pay</h3>
<div class="bk-rv"><h4>Stay</h4><div class="bk-sr"><span>${S.room}</span><b>${plural(n,'night')}</b></div><div class="bk-sr"><span>Check-in</span><b>${B.fd(S.cin)}, from 2 pm</b></div><div class="bk-sr"><span>Check-out</span><b>${B.fd(S.cout)}, by 11 am</b></div></div>
<div class="bk-rv"><h4>Guests</h4>${g}</div>
<div class="bk-rv"><h4>Contact</h4><div class="bk-sr"><span>Email</span><b>${e$(S.email)}</b></div><div class="bk-sr"><span>Phone</span><b>${e$(S.phone)}</b></div></div>
<label class="bk-chk"><input type="checkbox" id="agree"${S.agree?' checked':''}><span>I confirm the guest details are correct and every adult will carry a valid ID proof at check-in.</span></label>
<div class="bk-err" id="err" role="alert"></div><div class="bk-acts"><button class="btn ghost" id="b3" type="button">Back</button><button class="btn" id="pay" type="button">Pay ${B.rs(r.p*n)} securely</button></div>`;
}
function summary(){
 const n=nights(),r=ROOMS[S.room];
 return `<aside class="bk-sum" aria-label="Booking summary"><h4>Booking summary</h4><b class="bk-rn">${S.room}</b><small>${r.d}</small>
<div class="bk-sr"><span>Check-in</span><b>${S.cin?B.fd(S.cin):'Select date'}</b></div><div class="bk-sr"><span>Check-out</span><b>${S.cout?B.fd(S.cout):'Select date'}</b></div><div class="bk-sr"><span>Guests</span><b>${gtxt()}</b></div>
<div class="bk-sr"><span>${B.rs(r.p)} × ${plural(n,'night')}</span><b>${B.rs(r.p*n)}</b></div><div class="bk-sr t"><span>Total</span><b>${B.rs(r.p*n)}</b></div></aside>`;
}
function render(){
 root.innerHTML=`<div class="bk-steps">${['Stay','Guests','Review & pay'].map((t,i)=>`<div class="bk-st${S.step===i+1?' on':''}${S.step>i+1?' done':''}"><i>${S.step>i+1?'✓':i+1}</i>${t}</div>`).join('')}</div><div class="bk-grid"><div class="bk-main">${[s1,s2,s3][S.step-1]()}</div>${summary()}</div>`;
}
function go(step){S.step=step;render();root.scrollIntoView({behavior:'smooth',block:'start'})}
function go1(){
 const n=nights();
 if(!S.cin||!S.cout)return err('Select check-in and check-out dates.');
 if(S.cin<today)return err('Check-in cannot be in the past.');
 if(n<1)return err('Check-out must be after check-in.');
 if(n>30)return err('You can book up to 30 nights at a time.');
 while(S.A.length<S.adults)S.A.push({title:'Mr',first:'',last:'',idType:'aadhaar',idNumber:''});S.A.length=S.adults;
 while(S.C.length<S.kids.length)S.C.push({first:'',last:''});S.C.length=S.kids.length;
 fillUser(B.getUser());go(2);
}
function go2(){
 const seen=new Set();
 for(let i=0;i<S.A.length;i++){
  const a=S.A[i],w='Adult '+(i+1),id=normId(a.idNumber),t=IDT[a.idType];
  if(!NM.test(a.first.trim())||!NM.test(a.last.trim()))return err(w+': enter first and last name using letters only.');
  if(!t.re.test(id))return err(w+': enter a valid '+t.n+' number ('+t.h+').');
  if(seen.has(a.idType+id))return err(w+': this ID is already used for another guest.');
  seen.add(a.idType+id);
 }
 for(let i=0;i<S.C.length;i++)if(!NM.test(S.C[i].first.trim())||!NM.test(S.C[i].last.trim()))return err('Child '+(i+1)+': enter first and last name using letters only.');
 if(!/^\S+@\S+\.\S+$/.test(S.email.trim()))return err('Enter a valid email address.');
 if(!/^[0-9+\s-]{8,15}$/.test(S.phone.trim()))return err('Enter a valid phone number.');
 go(3);
}
function reset(){Object.assign(S,{step:1,cin:'',cout:'',adults:2,kids:[],A:[],C:[],agree:false});render()}
function payNow(){
 if(!S.agree)return err('Please tick the confirmation box to continue.');
 const body={kind:'room',room:S.room,checkin:S.cin,checkout:S.cout,
  adults:S.A.map(a=>({title:a.title,first:a.first.trim(),last:a.last.trim(),idType:a.idType,idNumber:a.idNumber})),
  children:S.C.map((c,i)=>({first:c.first.trim(),last:c.last.trim(),age:S.kids[i]})),
  contact:{email:S.email.trim(),phone:S.phone.trim()}};
 B.needVerified(()=>B.pay(body,reset));
}
function fillUser(u){
 if(!u)return;
 if(!S.email)S.email=u.email||'';if(!S.phone)S.phone=u.phone||'';
 const a=S.A[0];if(a&&!a.first&&u.name){const p=u.name.trim().split(/\s+/);a.first=p[0];a.last=p.slice(1).join(' ')}
}
B.hooks.push(u=>{fillUser(u);if(S.step===2)render()});

root.addEventListener('input',e=>{
 const t=e.target;
 if(t.dataset.a!==undefined)S.A[+t.dataset.a][t.dataset.f]=t.value;
 else if(t.dataset.c!==undefined)S.C[+t.dataset.c][t.dataset.f]=t.value;
 else if(t.dataset.k)S[t.dataset.k]=t.value;
});
root.addEventListener('change',e=>{
 const t=e.target;
 if(t.name==='room'){S.room=t.value;const r=ROOMS[S.room];S.adults=Math.min(S.adults,r.a);S.kids=S.kids.slice(0,r.c);render()}
 else if(t.id==='cin'){S.cin=t.value;if(S.cout&&S.cout<=S.cin)S.cout='';render()}
 else if(t.id==='cout'){S.cout=t.value;render()}
 else if(t.dataset.age!==undefined)S.kids[+t.dataset.age]=+t.value;
 else if(t.dataset.f==='idType'&&t.dataset.a!==undefined){S.A[+t.dataset.a].idType=t.value;const n=root.querySelector('[data-a="'+t.dataset.a+'"][data-f="idNumber"]');if(n)n.placeholder=IDT[t.value].ph}
 else if(t.id==='agree')S.agree=t.checked;
});
root.addEventListener('click',e=>{
 const t=e.target.closest('button');if(!t)return;
 if(t.dataset.st){const d=+t.dataset.d;if(t.dataset.st==='adults')S.adults+=d;else if(d>0)S.kids.push(0);else S.kids.pop();return render()}
 if(t.id==='n1')go1();else if(t.id==='n2')go2();else if(t.id==='b2')go(1);else if(t.id==='b3')go(2);else if(t.id==='pay')payNow();
});
render();
})();
