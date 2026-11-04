require('dotenv').config();
const express=require('express'),cors=require('cors'),mongoose=require('mongoose'),bcrypt=require('bcryptjs'),
jwt=require('jsonwebtoken'),Razorpay=require('razorpay'),crypto=require('crypto'),rateLimit=require('express-rate-limit');
const {MONGODB_URI,JWT_SECRET,RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET,RAZORPAY_WEBHOOK_SECRET,FRONTEND_ORIGIN}=process.env;
if(!MONGODB_URI||!JWT_SECRET||!RAZORPAY_KEY_ID||!RAZORPAY_KEY_SECRET){console.error('Missing env vars, see .env.example');process.exit(1)}
const rzp=new Razorpay({key_id:RAZORPAY_KEY_ID,key_secret:RAZORPAY_KEY_SECRET});
const User=mongoose.model('User',new mongoose.Schema({name:String,email:{type:String,unique:true,lowercase:true},phone:String,hash:String},{timestamps:true}));
const Order=mongoose.model('Order',new mongoose.Schema({user:mongoose.Schema.Types.ObjectId,kind:String,details:Object,amount:Number,
 rzpOrderId:{type:String,index:true},rzpPaymentId:String,status:{type:String,default:'created'}},{timestamps:true}));
// Prices live on the server so the browser can never change what it pays.
const FOOD={"Kanda Poha":120,"Masala Dosa":160,"Aloo Paratha":150,"Egg Bhurji Pav":170,"Paneer Tikka":320,"Chicken 65":360,"Veg Spring Rolls":240,"Fish Amritsari":420,"Dum Biryani":380,"Dal Makhani":290,"Butter Chicken":410,"Veg Thali":340,"Gulab Jamun":140,"Shrikhand":150,"Chocolate Lava Cake":220,"Masala Chai":70,"Fresh Lime Soda":90,"Mango Lassi":150,"Cold Coffee":160};
const ROOMS={"Garden Room":3800,"Skyline Deluxe":5400,"Banyan Suite":9200};
const app=express();
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
const sign=u=>jwt.sign({id:u._id},JWT_SECRET,{expiresIn:'7d'});
const pub=u=>({id:u._id,name:u.name,email:u.email,phone:u.phone});
const auth=(req,res,next)=>{try{req.uid=jwt.verify((req.headers.authorization||'').replace('Bearer ',''),JWT_SECRET).id;next()}catch{res.status(401).json({error:'Please sign in again.'})}};
const wrap=f=>(q,s,n)=>f(q,s,n).catch(e=>{console.error(e);s.status(500).json({error:'Something went wrong. Try again.'})});
app.post('/api/signup',wrap(async(req,res)=>{
 let {name,email,phone,password}=req.body||{};email=(email||'').trim().toLowerCase();
 if(!name||!/^\S+@\S+\.\S+$/.test(email||'')||!/^[0-9+\s-]{8,15}$/.test(phone||'')||(password||'').length<8)return res.status(400).json({error:'Enter name, valid email, phone and a password of 8+ characters.'});
 if(await User.findOne({email}))return res.status(409).json({error:'This email is already registered. Sign in instead.'});
 const u=await User.create({name:name.trim(),email,phone,hash:await bcrypt.hash(password,11)});
 res.json({token:sign(u),user:pub(u)});
}));
app.post('/api/login',wrap(async(req,res)=>{
 const u=await User.findOne({email:(req.body?.email||'').toLowerCase()});
 if(!u||!await bcrypt.compare(req.body?.password||'',u.hash))return res.status(401).json({error:'Email or password is incorrect.'});
 res.json({token:sign(u),user:pub(u)});
}));
app.get('/api/me',auth,wrap(async(req,res)=>{const u=await User.findById(req.uid);u?res.json({user:pub(u)}):res.sendStatus(401)}));
app.post('/api/pay/order',auth,wrap(async(req,res)=>{
 const {kind,items,room,checkin,checkout,guests}=req.body||{};let amount=0,details;
 if(kind==='food'){
  if(!Array.isArray(items)||!items.length)return res.status(400).json({error:'Your order is empty.'});
  for(const i of items){const p=FOOD[i.name],q=Math.floor(i.q);if(!p||!(q>0&&q<=20))return res.status(400).json({error:'Invalid item in order.'});amount+=p*q}
  details={items};
 }else if(kind==='room'){
  const n=Math.round((new Date(checkout)-new Date(checkin))/864e5);
  if(!ROOMS[room]||!(n>=1&&n<=30)||new Date(checkin)<new Date(new Date().toDateString()))return res.status(400).json({error:'Check the room and dates.'});
  amount=ROOMS[room]*n;const g=Math.min(Math.max(parseInt(guests)||1,1),4);details={room,checkin:String(checkin).slice(0,10),checkout:String(checkout).slice(0,10),nights:n,guests:g};
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
app.get('/api/orders',auth,wrap(async(req,res)=>res.json(await Order.find({user:req.uid,status:'paid'}).sort('-createdAt').limit(50))));
app.use(express.static(__dirname+'/public'));

const PORT=process.env.PORT||3000;
if(require.main===module)app.listen(PORT,()=>console.log('Running on '+PORT));
module.exports=app;
