require('dotenv').config();
const express=require('express'),cors=require('cors'),mongoose=require('mongoose'),bcrypt=require('bcryptjs'),
jwt=require('jsonwebtoken'),Razorpay=require('razorpay'),crypto=require('crypto'),rateLimit=require('express-rate-limit'),nodemailer=require('nodemailer');
const {MONGODB_URI,JWT_SECRET,RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET,RAZORPAY_WEBHOOK_SECRET,FRONTEND_ORIGIN}=process.env;
if(!MONGODB_URI||!JWT_SECRET||!RAZORPAY_KEY_ID||!RAZORPAY_KEY_SECRET){console.error('Missing env vars, see .env.example');process.exit(1)}
const rzp=new Razorpay({key_id:RAZORPAY_KEY_ID,key_secret:RAZORPAY_KEY_SECRET});
const User=mongoose.model('User',new mongoose.Schema({name:String,email:{type:String,unique:true,lowercase:true},phone:String,hash:String,
 emailVerified:{type:Boolean,default:false},verifyHash:String,verifyExpires:Date,verifySentAt:Date,
 resetHash:String,resetExpires:Date,resetSentAt:Date,tokenVersion:{type:Number,default:0}},{timestamps:true}));
const Order=mongoose.model('Order',new mongoose.Schema({user:mongoose.Schema.Types.ObjectId,kind:String,details:Object,amount:Number,
 rzpOrderId:{type:String,index:true},rzpPaymentId:String,status:{type:String,default:'created'}},{timestamps:true}));
// Prices live on the server so the browser can never change what it pays.
const FOOD={"Kanda Poha":120,"Masala Dosa":160,"Aloo Paratha":150,"Egg Bhurji Pav":170,"Paneer Tikka":320,"Chicken 65":360,"Veg Spring Rolls":240,"Fish Amritsari":420,"Dum Biryani":380,"Dal Makhani":290,"Butter Chicken":410,"Veg Thali":340,"Gulab Jamun":140,"Shrikhand":150,"Chocolate Lava Cake":220,"Masala Chai":70,"Fresh Lime Soda":90,"Mango Lassi":150,"Cold Coffee":160};
const ROOMS={"Garden Room":3800,"Skyline Deluxe":5400,"Banyan Suite":9200};
const CAP={"Garden Room":[2,1],"Skyline Deluxe":[3,2],"Banyan Suite":[4,3]}; // [max adults, max children]
const IDS={aadhaar:/^[2-9]\d{11}$/,passport:/^[A-Z0-9]{6,9}$/,dl:/^[A-Z0-9]{8,20}$/,voter:/^[A-Z]{3}\d{7}$/};
const NAME=/^[A-Za-z][A-Za-z .'-]{0,39}$/;
// ID numbers are stored encrypted (AES-256-GCM). Set ID_ENC_KEY to a separate secret; falls back to JWT_SECRET.
const KEY=crypto.createHash('sha256').update(process.env.ID_ENC_KEY||JWT_SECRET).digest();
const enc=t=>{const iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',KEY,iv),ct=Buffer.concat([c.update(t,'utf8'),c.final()]);return Buffer.concat([iv,c.getAuthTag(),ct]).toString('base64')};
function buildRoom(b){
 const room=b.room,cap=CAP[room];if(!cap)return {error:'Choose a room.'};
 const n=Math.round((new Date(b.checkout)-new Date(b.checkin))/864e5);
 if(!(n>=1&&n<=30)||new Date(b.checkin)<new Date(new Date().toDateString()))return {error:'Check your dates.'};
 const adults=b.adults,children=b.children||[],contact=b.contact||{};
 if(!Array.isArray(adults)||adults.length<1||adults.length>cap[0]||!Array.isArray(children)||children.length>cap[1])return {error:room+' allows up to '+cap[0]+' adults and '+cap[1]+' children.'};
 const A=[],C=[],seen=new Set();
 for(const a of adults){
  const first=String(a.first||'').trim(),last=String(a.last||'').trim(),id=String(a.idNumber||'').replace(/[\s-]/g,'').toUpperCase();
  if(!['Mr','Ms','Mrs'].includes(a.title)||!NAME.test(first)||!NAME.test(last)||!IDS[a.idType]||!IDS[a.idType].test(id)||seen.has(a.idType+id))return {error:'Check guest names and ID proof details.'};
  seen.add(a.idType+id);A.push({title:a.title,first,last,idType:a.idType,idEnc:enc(id),idLast4:id.slice(-4)});
 }
 for(const c of children){
  const first=String(c.first||'').trim(),last=String(c.last||'').trim(),age=Number(c.age);
  if(!NAME.test(first)||!NAME.test(last)||!Number.isInteger(age)||age<0||age>12)return {error:'Check the children details (age 0 to 12).'};
  C.push({first,last,age});
 }
 const email=String(contact.email||'').trim(),phone=String(contact.phone||'').trim();
 if(!/^\S+@\S+\.\S+$/.test(email)||!/^[0-9+\s-]{8,15}$/.test(phone))return {error:'Enter a valid contact email and phone.'};
 return {amount:ROOMS[room]*n,details:{room,checkin:String(b.checkin).slice(0,10),checkout:String(b.checkout).slice(0,10),nights:n,adults:A,children:C,contact:{email,phone}}};
}
const app=express();
app.set('trust proxy',1);
app.use(cors({origin:FRONTEND_ORIGIN||true}));
// Serverless-safe DB connection: connect once per instance and wait for it before any API route runs.
let dbPromise=null;
async function db(){
 if(mongoose.connection.readyState===1)return;
 if(!dbPromise)dbPromise=mongoose.connect(MONGODB_URI,{serverSelectionTimeoutMS:8000,bufferCommands:false}).catch(e=>{dbPromise=null;throw e});
 await dbPromise;
}
app.use('/api',async(req,res,next)=>{try{await db();next()}catch(e){console.error('DB connection failed:',e.message);res.status(503).json({error:'Database is unavailable. Please try again in a moment.'})}});
app.get('/api/health',(req,res)=>res.json({ok:true,db:'connected'}));
// Webhook needs the raw body for signature check, so it is registered before express.json()
app.post('/api/webhook',express.raw({type:'application/json'}),async(req,res)=>{
 const sig=req.headers['x-razorpay-signature'];
 const exp=crypto.createHmac('sha256',RAZORPAY_WEBHOOK_SECRET||'').update(req.body).digest('hex');
 if(!sig||sig.length!==exp.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(exp)))return res.sendStatus(400);
 const ev=JSON.parse(req.body),p=ev.payload?.payment?.entity;
 if(ev.event==='payment.captured'&&p)await Order.updateOne({rzpOrderId:p.order_id},{status:'paid',rzpPaymentId:p.id});
 if(ev.event==='payment.failed'&&p)await Order.updateOne({rzpOrderId:p.order_id,status:'created'},{status:'failed'});
 res.sendStatus(200);
});
app.use(express.json({limit:'20kb'}));
app.use('/api/signup',rateLimit({windowMs:15*60e3,max:20}));app.use('/api/login',rateLimit({windowMs:15*60e3,max:30}));
['forgot-password','resend-verification','verify-email','reset-password'].forEach(r=>app.use('/api/'+r,rateLimit({windowMs:15*60e3,max:15})));
const sign=u=>jwt.sign({id:u._id,tv:u.tokenVersion||0},JWT_SECRET,{expiresIn:'7d'});
const pub=u=>({id:u._id,name:u.name,email:u.email,phone:u.phone,emailVerified:!!u.emailVerified});
// auth also loads the user so a password reset (tokenVersion bump) signs out older sessions
const auth=async(req,res,next)=>{try{
 const p=jwt.verify((req.headers.authorization||'').replace('Bearer ',''),JWT_SECRET);
 const u=await User.findById(p.id).select('tokenVersion emailVerified');
 if(!u||(u.tokenVersion||0)!==(p.tv||0))throw new Error('stale');
 req.uid=p.id;req.verified=!!u.emailVerified;next();
}catch{res.status(401).json({error:'Please sign in again.'})}};
const wrap=f=>(q,s,n)=>f(q,s,n).catch(e=>{console.error(e);s.status(500).json({error:'Something went wrong. Try again.'})});

// ---------- Email (SMTP via nodemailer) ----------
const APP_URL=(process.env.APP_URL||FRONTEND_ORIGIN||'').replace(/\/$/,'');
const SMTP_PORT=+(process.env.SMTP_PORT||465);
const mailer=process.env.SMTP_HOST?nodemailer.createTransport({host:process.env.SMTP_HOST,port:SMTP_PORT,secure:SMTP_PORT===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}):null;
const h=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function sendMail(to,subject,heading,lines,btn,url){
 if(!mailer||!APP_URL){if(process.env.NODE_ENV!=='production')console.log('[mail not configured] '+subject+' -> '+to+'\n'+url);else console.error('Email not configured: set SMTP_* and APP_URL');return false}
 const html='<div style="font-family:Arial,sans-serif;background:#f4f1ea;padding:24px"><div style="max-width:480px;margin:auto;background:#fff;border-radius:14px;padding:28px;color:#16233a"><div style="font:700 22px Georgia,serif;margin-bottom:16px">The Banyan <span style="color:#c98a10">House</span></div><h2 style="margin:0 0 12px;font-size:22px">'+h(heading)+'</h2>'+lines.map(l=>'<p style="line-height:1.6;margin:0 0 12px">'+h(l)+'</p>').join('')+'<p style="margin:22px 0"><a href="'+url+'" style="background:#f2a900;color:#201500;text-decoration:none;font-weight:700;padding:12px 26px;border-radius:99px;display:inline-block">'+h(btn)+'</a></p><p style="color:#6b7487;font-size:13px;margin:0">If the button does not work, copy this link into your browser:<br>'+url+'</p></div></div>';
 try{await mailer.sendMail({from:process.env.MAIL_FROM||process.env.SMTP_USER,to,subject,text:lines.join('\n\n')+'\n\n'+btn+': '+url,html});return true}
 catch(e){console.error('Email send failed:',e.message);return false}
}
const mk=()=>{const t=crypto.randomBytes(32).toString('hex');return [t,crypto.createHash('sha256').update(t).digest('hex')]};
const hs=t=>crypto.createHash('sha256').update(String(t||'')).digest('hex');
async function sendVerify(u){
 const [t,hh]=mk();u.verifyHash=hh;u.verifyExpires=new Date(Date.now()+24*36e5);u.verifySentAt=new Date();await u.save();
 return sendMail(u.email,'Verify your email - The Banyan House','Confirm your email',['Hi '+u.name.split(' ')[0]+',','Please confirm your email address so you can place food orders and room bookings. This link works for 24 hours.'],'Verify email',APP_URL+'/?verify='+t);
}
async function sendReset(u){
 const [t,hh]=mk();u.resetHash=hh;u.resetExpires=new Date(Date.now()+36e5);u.resetSentAt=new Date();await u.save();
 return sendMail(u.email,'Reset your password - The Banyan House','Reset your password',['Hi '+u.name.split(' ')[0]+',','We received a request to reset your password. This link works for 1 hour. If you did not ask for this, you can ignore this email and your password will stay the same.'],'Reset password',APP_URL+'/?reset='+t);
}

app.post('/api/signup',wrap(async(req,res)=>{
 let {name,email,phone,password}=req.body||{};email=(email||'').trim().toLowerCase();
 if(!name||!/^\S+@\S+\.\S+$/.test(email||'')||!/^[0-9+\s-]{8,15}$/.test(phone||'')||(password||'').length<8)return res.status(400).json({error:'Enter name, valid email, phone and a password of 8+ characters.'});
 if(await User.findOne({email}))return res.status(409).json({error:'This email is already registered. Sign in instead.'});
 const u=await User.create({name:name.trim(),email,phone,hash:await bcrypt.hash(password,11)});
 const emailSent=await sendVerify(u);
 res.json({token:sign(u),user:pub(u),emailSent});
}));
app.post('/api/login',wrap(async(req,res)=>{
 const u=await User.findOne({email:(req.body?.email||'').toLowerCase()});
 if(!u||!await bcrypt.compare(req.body?.password||'',u.hash))return res.status(401).json({error:'Email or password is incorrect.'});
 res.json({token:sign(u),user:pub(u)});
}));
app.get('/api/me',auth,wrap(async(req,res)=>{const u=await User.findById(req.uid);u?res.json({user:pub(u)}):res.sendStatus(401)}));
app.post('/api/verify-email',wrap(async(req,res)=>{
 const u=await User.findOne({verifyHash:hs(req.body?.token),verifyExpires:{$gt:new Date()}});
 if(!u)return res.status(400).json({error:'This verification link is invalid or has expired. Sign in and request a new one.'});
 u.emailVerified=true;u.verifyHash=undefined;u.verifyExpires=undefined;await u.save();
 res.json({ok:true});
}));
app.post('/api/resend-verification',auth,wrap(async(req,res)=>{
 const u=await User.findById(req.uid);if(!u)return res.sendStatus(401);
 if(u.emailVerified)return res.json({ok:true,verified:true});
 if(u.verifySentAt&&Date.now()-u.verifySentAt<60e3)return res.status(429).json({error:'Please wait a minute before requesting another email.'});
 (await sendVerify(u))?res.json({ok:true}):res.status(503).json({error:'We could not send the email right now. Please try again later.'});
}));
app.post('/api/forgot-password',wrap(async(req,res)=>{
 const email=String(req.body?.email||'').trim().toLowerCase();
 const u=/^\S+@\S+\.\S+$/.test(email)&&await User.findOne({email});
 if(u&&!(u.resetSentAt&&Date.now()-u.resetSentAt<60e3))await sendReset(u);
 res.json({ok:true}); // same reply whether or not the account exists
}));
app.post('/api/reset-password',wrap(async(req,res)=>{
 const {token,password}=req.body||{};
 if(String(password||'').length<8)return res.status(400).json({error:'Password must be at least 8 characters.'});
 const u=await User.findOne({resetHash:hs(token),resetExpires:{$gt:new Date()}});
 if(!u)return res.status(400).json({error:'This reset link is invalid or has expired. Request a new one.'});
 u.hash=await bcrypt.hash(password,11);u.resetHash=undefined;u.resetExpires=undefined;
 u.tokenVersion=(u.tokenVersion||0)+1;u.emailVerified=true;await u.save();
 res.json({ok:true});
}));
app.post('/api/pay/order',auth,wrap(async(req,res)=>{
 if(!req.verified)return res.status(403).json({error:'Please verify your email before placing an order.',code:'EMAIL_NOT_VERIFIED'});
 const {kind,items}=req.body||{};let amount=0,details;
 if(kind==='food'){
  if(!Array.isArray(items)||!items.length)return res.status(400).json({error:'Your order is empty.'});
  for(const i of items){const p=FOOD[i.name],q=Math.floor(i.q);if(!p||!(q>0&&q<=20))return res.status(400).json({error:'Invalid item in order.'});amount+=p*q}
  details={items};
 }else if(kind==='room'){
  const r=buildRoom(req.body);if(r.error)return res.status(400).json({error:r.error});amount=r.amount;details=r.details;
 }else return res.status(400).json({error:'Unknown order type.'});
 const ro=await rzp.orders.create({amount:amount*100,currency:'INR',receipt:'bh_'+Date.now()});
 await Order.create({user:req.uid,kind,details,amount,rzpOrderId:ro.id});
 res.json({orderId:ro.id,amount:amount*100,currency:'INR',keyId:RAZORPAY_KEY_ID});
}));
app.post('/api/pay/verify',auth,wrap(async(req,res)=>{
 const {razorpay_order_id:o,razorpay_payment_id:p,razorpay_signature:s}=req.body||{};
 const exp=crypto.createHmac('sha256',RAZORPAY_KEY_SECRET).update(o+'|'+p).digest('hex');
 if(!s||s.length!==exp.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(exp)))return res.status(400).json({error:'Payment could not be verified.'});
 const d=await Order.findOneAndUpdate({rzpOrderId:o,user:req.uid},{status:'paid',rzpPaymentId:p},{new:true});
 d?res.json({ok:true,amount:d.amount,ref:p}):res.status(404).json({error:'Order not found.'});
}));
app.get('/api/orders',auth,wrap(async(req,res)=>{const l=await Order.find({user:req.uid,status:'paid'}).sort('-createdAt').limit(50).lean();l.forEach(o=>((o.details&&o.details.adults)||[]).forEach(a=>delete a.idEnc));res.json(l)}));
app.use(express.static(__dirname+'/public'));

const PORT=process.env.PORT||3000;
if(require.main===module)app.listen(PORT,()=>console.log('Running on '+PORT));
module.exports=app;
