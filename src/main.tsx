import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Radio, Vote, CheckCircle2, Inbox, ArrowLeft, Trash2, Trophy, Users } from 'lucide-react'
import './styles.css'
import ScorePage from './ScorePage'

type Lang = 'en'|'ta'|'hi'|'te'|'bn'|'es'|'fr'|'ar'|'id'
const copy: Record<Lang, Record<string,string>> = {
 en:{watch:'Watch cricket live',live:'LIVE',loading:'Loading live match…',offline:'No live match is scheduled right now.',poll:'Match poll',vote:'Submit vote',voted:'Your vote is recorded',results:'Live results',ad:'Advertisement',about:'About',contact:'Contact',privacy:'Privacy',language:'Language',watchOn:'Watch on YouTube',admin:'Admin',login:'Admin sign in',email:'Email',password:'Password',signIn:'Sign in',save:'Save changes',match:'Match title',video:'YouTube video ID or URL',question:'Poll question',option1:'Option 1',option2:'Option 2',option3:'Option 3',signOut:'Sign out',saved:'Changes saved',setup:'The live page is being prepared. Please check back soon.',invalid:'Please enter a valid YouTube video ID or URL.',noPoll:'No poll is active right now.',votes:'votes',footer:'A simple place to follow cricket live.'},
 ta:{watch:'நேரலை கிரிக்கெட்டைப் பாருங்கள்',live:'நேரலை',loading:'நேரலைப் போட்டி ஏற்றப்படுகிறது…',offline:'இப்போது நேரலைப் போட்டி இல்லை.',poll:'போட்டி வாக்கெடுப்பு',vote:'வாக்களிக்கவும்',voted:'உங்கள் வாக்கு பதிவு செய்யப்பட்டது',results:'நேரலை முடிவுகள்',ad:'விளம்பரம்',about:'எங்களைப் பற்றி',contact:'தொடர்பு',privacy:'தனியுரிமை',language:'மொழி',watchOn:'YouTube-ல் பார்க்கவும்',admin:'நிர்வாகம்',login:'நிர்வாக உள்நுழைவு',email:'மின்னஞ்சல்',password:'கடவுச்சொல்',signIn:'உள்நுழை',save:'மாற்றங்களைச் சேமி',match:'போட்டியின் பெயர்',video:'YouTube வீடியோ ID அல்லது URL',question:'வாக்கெடுப்பு கேள்வி',option1:'விருப்பம் 1',option2:'விருப்பம் 2',option3:'விருப்பம் 3',signOut:'வெளியேறு',saved:'மாற்றங்கள் சேமிக்கப்பட்டன',setup:'நேரலைப் பக்கம் தயாராகிறது. மீண்டும் பாருங்கள்.',invalid:'சரியான YouTube வீடியோ ID அல்லது URL உள்ளிடவும்.',noPoll:'இப்போது வாக்கெடுப்பு இல்லை.',votes:'வாக்குகள்',footer:'நேரலை கிரிக்கெட்டைப் பின்தொடர எளிய இடம்.'},
 hi:{watch:'लाइव क्रिकेट देखें',live:'लाइव',loading:'लाइव मैच लोड हो रहा है…',offline:'अभी कोई लाइव मैच निर्धारित नहीं है।',poll:'मैच पोल',vote:'वोट दें',voted:'आपका वोट दर्ज हो गया',results:'लाइव नतीजे',ad:'विज्ञापन',about:'हमारे बारे में',contact:'संपर्क',privacy:'गोपनीयता',language:'भाषा',watchOn:'YouTube पर देखें',admin:'एडमिन',login:'एडमिन लॉगिन',email:'ईमेल',password:'पासवर्ड',signIn:'साइन इन',save:'बदलाव सेव करें',match:'मैच का नाम',video:'YouTube वीडियो ID या URL',question:'पोल का सवाल',option1:'विकल्प 1',option2:'विकल्प 2',option3:'विकल्प 3',signOut:'साइन आउट',saved:'बदलाव सेव हो गए',setup:'लाइव पेज तैयार हो रहा है। कृपया बाद में देखें।',invalid:'मान्य YouTube वीडियो ID या URL दर्ज करें।',noPoll:'अभी कोई पोल सक्रिय नहीं है।',votes:'वोट',footer:'लाइव क्रिकेट देखने का आसान स्थान।'},
 te:{watch:'లైవ్ క్రికెట్ చూడండి',live:'లైవ్',loading:'లైవ్ మ్యాచ్ లోడ్ అవుతోంది…',offline:'ప్రస్తుతం లైవ్ మ్యాచ్ లేదు.',poll:'మ్యాచ్ పోల్',vote:'ఓటు వేయండి',voted:'మీ ఓటు నమోదు అయింది',results:'లైవ్ ఫలితాలు',ad:'ప్రకటన',about:'మా గురించి',contact:'సంప్రదించండి',privacy:'గోప్యత',language:'భాష',watchOn:'YouTubeలో చూడండి',admin:'అడ్మిన్',login:'అడ్మిన్ లాగిన్',email:'ఇమెయిల్',password:'పాస్‌వర్డ్',signIn:'సైన్ ఇన్',save:'మార్పులను సేవ్ చేయండి',match:'మ్యాచ్ పేరు',video:'YouTube వీడియో ID లేదా URL',question:'పోల్ ప్రశ్న',option1:'ఎంపిక 1',option2:'ఎంపిక 2',option3:'ఎంపిక 3',signOut:'సైన్ అవుట్',saved:'మార్పులు సేవ్ అయ్యాయి',setup:'లైవ్ పేజీ సిద్ధమవుతోంది. తర్వాత మళ్లీ చూడండి.',invalid:'సరైన YouTube వీడియో ID లేదా URL ఇవ్వండి.',noPoll:'ప్రస్తుతం పోల్ లేదు.',votes:'ఓట్లు',footer:'లైవ్ క్రికెట్‌ను అనుసరించడానికి సులభమైన స్థలం.'},
 bn:{watch:'লাইভ ক্রিকেট দেখুন',live:'লাইভ',loading:'লাইভ ম্যাচ লোড হচ্ছে…',offline:'এখন কোনো লাইভ ম্যাচ নির্ধারিত নেই।',poll:'ম্যাচ পোল',vote:'ভোট দিন',voted:'আপনার ভোট জমা হয়েছে',results:'লাইভ ফলাফল',ad:'বিজ্ঞাপন',about:'আমাদের সম্পর্কে',contact:'যোগাযোগ',privacy:'গোপনীয়তা',language:'ভাষা',watchOn:'YouTube-এ দেখুন',admin:'অ্যাডমিন',login:'অ্যাডমিন লগইন',email:'ইমেল',password:'পাসওয়ার্ড',signIn:'সাইন ইন',save:'পরিবর্তন সংরক্ষণ',match:'ম্যাচের নাম',video:'YouTube ভিডিও ID বা URL',question:'পোলের প্রশ্ন',option1:'বিকল্প ১',option2:'বিকল্প ২',option3:'বিকল্প ৩',signOut:'সাইন আউট',saved:'পরিবর্তন সংরক্ষিত',setup:'লাইভ পেজ প্রস্তুত হচ্ছে। পরে আবার দেখুন।',invalid:'একটি বৈধ YouTube ভিডিও ID বা URL দিন।',noPoll:'এখন কোনো পোল সক্রিয় নেই।',votes:'ভোট',footer:'লাইভ ক্রিকেট অনুসরণ করার সহজ জায়গা।'},
 es:{watch:'Ver cricket en directo',live:'EN VIVO',loading:'Cargando el partido…',offline:'No hay ningún partido en directo ahora.',poll:'Encuesta del partido',vote:'Votar',voted:'Tu voto ha sido registrado',results:'Resultados en directo',ad:'Publicidad',about:'Acerca de',contact:'Contacto',privacy:'Privacidad',language:'Idioma',watchOn:'Ver en YouTube',admin:'Admin',login:'Acceso de administrador',email:'Correo',password:'Contraseña',signIn:'Entrar',save:'Guardar cambios',match:'Nombre del partido',video:'ID o URL del vídeo de YouTube',question:'Pregunta de la encuesta',option1:'Opción 1',option2:'Opción 2',option3:'Opción 3',signOut:'Cerrar sesión',saved:'Cambios guardados',setup:'La página en directo se está preparando.',invalid:'Introduce un ID o URL válido de YouTube.',noPoll:'No hay ninguna encuesta activa.',votes:'votos',footer:'Un lugar sencillo para seguir el cricket en directo.'},
 fr:{watch:'Regarder le cricket en direct',live:'EN DIRECT',loading:'Chargement du match…',offline:'Aucun match en direct pour le moment.',poll:'Sondage du match',vote:'Voter',voted:'Votre vote a été enregistré',results:'Résultats en direct',ad:'Publicité',about:'À propos',contact:'Contact',privacy:'Confidentialité',language:'Langue',watchOn:'Voir sur YouTube',admin:'Admin',login:'Connexion admin',email:'E-mail',password:'Mot de passe',signIn:'Se connecter',save:'Enregistrer',match:'Nom du match',video:'ID ou URL de la vidéo YouTube',question:'Question du sondage',option1:'Option 1',option2:'Option 2',option3:'Option 3',signOut:'Déconnexion',saved:'Modifications enregistrées',setup:'La page en direct est en préparation.',invalid:'Saisissez un ID ou une URL YouTube valide.',noPoll:'Aucun sondage actif.',votes:'votes',footer:'Un endroit simple pour suivre le cricket en direct.'},
 ar:{watch:'شاهد الكريكيت مباشرة',live:'مباشر',loading:'جارٍ تحميل المباراة…',offline:'لا توجد مباراة مباشرة الآن.',poll:'تصويت المباراة',vote:'صوّت',voted:'تم تسجيل صوتك',results:'النتائج المباشرة',ad:'إعلان',about:'معلومات عنا',contact:'اتصل بنا',privacy:'الخصوصية',language:'اللغة',watchOn:'شاهد على YouTube',admin:'المسؤول',login:'دخول المسؤول',email:'البريد الإلكتروني',password:'كلمة المرور',signIn:'تسجيل الدخول',save:'حفظ التغييرات',match:'اسم المباراة',video:'معرّف فيديو YouTube أو رابطه',question:'سؤال التصويت',option1:'الخيار 1',option2:'الخيار 2',option3:'الخيار 3',signOut:'تسجيل الخروج',saved:'تم حفظ التغييرات',setup:'يتم إعداد صفحة البث المباشر.',invalid:'أدخل معرّف أو رابط YouTube صالحًا.',noPoll:'لا يوجد تصويت نشط الآن.',votes:'أصوات',footer:'مكان بسيط لمتابعة الكريكيت مباشرة.'},
 id:{watch:'Tonton kriket langsung',live:'LIVE',loading:'Memuat pertandingan…',offline:'Tidak ada pertandingan langsung saat ini.',poll:'Jajak pendapat',vote:'Pilih',voted:'Suara Anda telah direkam',results:'Hasil langsung',ad:'Iklan',about:'Tentang',contact:'Kontak',privacy:'Privasi',language:'Bahasa',watchOn:'Tonton di YouTube',admin:'Admin',login:'Masuk admin',email:'Email',password:'Kata sandi',signIn:'Masuk',save:'Simpan perubahan',match:'Nama pertandingan',video:'ID atau URL video YouTube',question:'Pertanyaan jajak pendapat',option1:'Pilihan 1',option2:'Pilihan 2',option3:'Pilihan 3',signOut:'Keluar',saved:'Perubahan tersimpan',setup:'Halaman siaran langsung sedang disiapkan.',invalid:'Masukkan ID atau URL YouTube yang valid.',noPoll:'Tidak ada jajak pendapat aktif.',votes:'suara',footer:'Tempat sederhana untuk mengikuti kriket langsung.'}
}
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string|undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string|undefined
const db: SupabaseClient|null = supabaseUrl && supabaseKey ? createClient(supabaseUrl,supabaseKey) : null
type Player = {name:string;role:string}
type Standing = {team:string;played:string;won:string;lost:string;nr:string;points:string;nrr:string}
type Settings = {
 match_title:string;video_id:string;poll_question:string;poll_options:string[];poll_id:string;updated_at?:string;
 tournament_name:string;match_number:string;match_stage:string;venue:string;city:string;match_date:string;match_time:string;
 toss_winner:string;toss_decision:string;team1_name:string;team1_flag:string;team1_captain:string;team1_players:Player[];
 team2_name:string;team2_flag:string;team2_captain:string;team2_players:Player[];points_table:Standing[];match_preview:string;score_match_id:string;score_refresh_seconds:number;
}
const initial: Settings = {
 match_title:'Cricket Live',video_id:'',poll_question:'Who will win this match?',poll_options:['Team A','Team B'],poll_id:'default',
 tournament_name:'',match_number:'',match_stage:'',venue:'',city:'',match_date:'',match_time:'',toss_winner:'',toss_decision:'',
 team1_name:'',team1_flag:'',team1_captain:'',team1_players:[],team2_name:'',team2_flag:'',team2_captain:'',team2_players:[],points_table:[],match_preview:'',score_match_id:'161285',score_refresh_seconds:30
}
function parsePlayers(value:string):Player[]{return value.split('\n').map(line=>line.trim()).filter(Boolean).map(line=>{const [name,...role]=line.split('|');return {name:name.trim(),role:role.join('|').trim()}}).filter(p=>p.name)}
function parseStandings(value:string):Standing[]{return value.split('\n').map(line=>line.trim()).filter(Boolean).map(line=>{const [team,played='',won='',lost='',nr='',points='',nrr='']=line.split('|').map(x=>x.trim());return {team,played,won,lost,nr,points,nrr}}).filter(x=>x.team)}
function videoId(value:string){const s=value.trim(); const m=s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/))([\w-]{11})/); return m?.[1] || (/^[\w-]{11}$/.test(s)?s:'')}
function AdsterraFrame({width,height,keyId,title}:{width:number;height:number;keyId:string;title:string}){
 const srcDoc=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:transparent}body{display:flex;align-items:center;justify-content:center}</style></head><body><script>var atOptions={key:'${keyId}',format:'iframe',height:${height},width:${width},params:{}};<\/script><script src="https://czernik.org/22/${keyId}"><\/script></body></html>`;
 return <iframe className="adsterra-frame" title={title} width={width} height={height} srcDoc={srcDoc} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />;
}
function ResponsiveTopAd(){
 const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width: 600px)').matches);
 useEffect(()=>{const mq=window.matchMedia('(max-width: 600px)');const change=(e:MediaQueryListEvent)=>setMobile(e.matches);mq.addEventListener('change',change);return()=>mq.removeEventListener('change',change)},[]);
 return <div className="ad-slot top-ad"><span>Advertisement</span><AdsterraFrame width={mobile?320:728} height={mobile?50:90} keyId={mobile?'562feb2d081b5b0ca9dcd57f03d6a2dd':'e69deac0722a5d5fa7aa9212bbbdda76'} title="BoundaryLive banner advertisement"/></div>;
}
function NativeAd(){
 useEffect(()=>{
  const container=document.getElementById('container-17113e23d1586de3e816aeb0113374cf');
  if(!container) return;
  container.innerHTML='';
  const script=document.createElement('script');
  script.async=true;
  script.setAttribute('data-cfasync','false');
  script.src='https://czernik.org/21/17113e23d1586de3e816aeb0113374cf';
  document.body.appendChild(script);
  return ()=>{
   script.remove();
   container.innerHTML='';
  };
 },[]);
 return <section className="native-ad-wrap"><span>Advertisement</span><div id="container-17113e23d1586de3e816aeb0113374cf" className="native-ad-container"/></section>;
}
function App(){
 const t=copy.en
 const [settings,setSettings]=useState<Settings>(initial),[,setLoading]=useState(true),[choice,setChoice]=useState(''),[voted,setVoted]=useState(false),[counts,setCounts]=useState<number[]>([]),[error,setError]=useState('')
 const admin=location.pathname.replace(/\/+$/,'')==='/admin'||location.pathname.replace(/\/+$/,'')==='/admin/messages',adminMessages=location.pathname.replace(/\/+$/,'')==='/admin/messages',contactPage=location.pathname.replace(/\/+$/,'')==='/contact',detailsPage=location.pathname.replace(/\/+$/,'')==='/details',livePage=location.pathname.replace(/\/+$/,'')==='/live',scorePage=location.pathname.replace(/\/+$/,'')==='/score',[session,setSession]=useState<any>(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[form,setForm]=useState(initial),[notice,setNotice]=useState(''),[messages,setMessages]=useState<any[]>([]),[contact,setContact]=useState({name:'',email:'',subject:'',message:''}),[sending,setSending]=useState(false),[sent,setSent]=useState(false),[adminAllowed,setAdminAllowed]=useState(false),[jsonInput,setJsonInput]=useState(''),[jsonError,setJsonError]=useState('')
 useEffect(()=>{document.documentElement.lang='en';document.documentElement.dir='ltr'},[])
 useEffect(()=>{
  const origin='https://boundarylive-three.vercel.app';
  const path=window.location.pathname.replace(/\/+$/,'')||'/';
  const privatePage=path==='/admin'||path==='/admin/messages';
  const matchName=settings.match_title&&settings.match_title!=='Cricket Live'?settings.match_title:'Cricket Match';
  const title=path==='/details'?matchName+' – Match Details | BoundaryLive':path==='/live'?matchName+' – Live Cricket Stream | BoundaryLive':path==='/score'?'Live Cricket Score, Commentary & Scorecard | BoundaryLive':path==='/contact'?'Contact BoundaryLive':'BoundaryLive – Live Cricket Streaming Today in India';
  const description=path==='/details'?'View '+matchName+' match details on BoundaryLive, including teams, playing XI, venue, toss, tournament information and match preview.':path==='/live'?'Open the BoundaryLive live cricket match page for the featured stream, match information and optional YouTube live chat.':path==='/score'?'Follow the live cricket score, innings scorecards, batting, bowling and ball-by-ball commentary on BoundaryLive.':path==='/contact'?'Contact BoundaryLive with cricket website questions, corrections, suggestions or feedback.':'Follow live cricket streaming today on BoundaryLive. Find the featured match, team information, playing XI, venue and tournament details for cricket fans in India.';
  document.title=title;
  const setMeta=(selector:string,key:string,value:string,content:string)=>{
   let node=document.head.querySelector<HTMLMetaElement>(selector);
   if(!node){node=document.createElement('meta');node.setAttribute(key,value);document.head.appendChild(node)}
   node.content=content;
  };
  setMeta('meta[name="description"]','name','description',description);
  setMeta('meta[name="robots"]','name','robots',privatePage?'noindex,nofollow':'index,follow,max-image-preview:large');
  setMeta('meta[property="og:type"]','property','og:type','website');
  setMeta('meta[property="og:site_name"]','property','og:site_name','BoundaryLive');
  setMeta('meta[property="og:title"]','property','og:title',title);
  setMeta('meta[property="og:description"]','property','og:description',description);
  setMeta('meta[property="og:url"]','property','og:url',origin+(path==='/'?'/':path));
  setMeta('meta[property="og:locale"]','property','og:locale','en_IN');
  setMeta('meta[name="twitter:card"]','name','twitter:card','summary');
  setMeta('meta[name="twitter:title"]','name','twitter:title',title);
  setMeta('meta[name="twitter:description"]','name','twitter:description',description);
  let canonical=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}
  canonical.href=origin+(path==='/'?'/':path);
  const graph:any[]=[
   {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'BoundaryLive',description:'Live cricket match coverage and match information for cricket fans in India.',inLanguage:['en','ta','hi','te','bn']},
   {'@type':'Organization','@id':origin+'/#organization',name:'BoundaryLive',url:origin+'/'},
   {'@type':'WebPage','@id':origin+path+'#webpage',url:origin+(path==='/'?'/':path),name:title,description,inLanguage:'en-IN'},
   {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/'},...(path==='/'?[]:[{'@type':'ListItem',position:2,name:path==='/details'?'Match Details':path==='/live'?'Live Match':path==='/score'?'Live Score':'Contact',item:origin+path}])]}
  ];
  if(path==='/details'&&settings.match_date&&settings.match_title){
   const event:any={'@type':'SportsEvent','name':settings.match_title,'sport':'Cricket','startDate':settings.match_date};
   if(settings.venue||settings.city)event.location={'@type':'Place','name':[settings.venue,settings.city].filter(Boolean).join(', ')};
   const competitors=[settings.team1_name,settings.team2_name].filter(Boolean).map(name=>({'@type':'SportsTeam','name':name}));
   if(competitors.length)event.competitor=competitors;
   graph.push(event);
  }
  let structured=document.getElementById('boundarylive-jsonld') as HTMLScriptElement|null;
  if(!structured){structured=document.createElement('script');structured.id='boundarylive-jsonld';structured.type='application/ld+json';document.head.appendChild(structured)}
  structured.textContent=JSON.stringify({'@context':'https://schema.org','@graph':graph});
 },[settings.match_title,settings.match_date,settings.venue,settings.city,settings.team1_name,settings.team2_name]);

 function applyMatchJson(){
  setJsonError('');
  try{
   const parsed=JSON.parse(jsonInput);
   if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Paste a JSON object, not an array.');
   const manualOnly=['video_id','poll_question','poll_options','poll_id','score_match_id','score_refresh_seconds'];
   const included=Object.keys(parsed).filter(k=>!manualOnly.includes(k));
   const unknown=included.filter(k=>!Object.keys(initial).includes(k));
   if(unknown.length)throw new Error('Unknown field(s): '+unknown.join(', '));
   const manualProvided=Object.keys(parsed).filter(k=>manualOnly.includes(k));
   if(manualProvided.length)throw new Error('Enter video ID and poll details manually in the fields below. Remove these JSON keys: '+manualProvided.join(', '));
   const next={...form,...parsed} as Settings;
   for(const key of ['team1_players','team2_players'] as const){if(parsed[key]!==undefined&&(!Array.isArray(parsed[key])||parsed[key].some((p:any)=>!p||typeof p.name!=='string'||(p.role!==undefined&&typeof p.role!=='string'))))throw new Error(key+' must be an array of { name, role } objects.');}
   if(parsed.points_table!==undefined&&(!Array.isArray(parsed.points_table)||parsed.points_table.some((p:any)=>!p||typeof p.team!=='string')))throw new Error('points_table must be an array of team objects.');
   for(const key of Object.keys(parsed)){const v=(parsed as any)[key];if(!['team1_players','team2_players','points_table'].includes(key)&&typeof v!=='string')throw new Error(key+' must be text.');}
   setForm(next);setNotice('Match details applied. Enter or review the video ID and poll manually, then click Save changes.');
  }catch(e){setJsonError(e instanceof Error?e.message:'Invalid JSON. Check the format and try again.');}
 }
 async function refresh(){
  if(!db){setLoading(false);return}
  const {data,error:e}=await db.from('site_settings').select('*').eq('id',1).maybeSingle()
  if(!e&&data){const s={...initial,...data,team1_players:Array.isArray(data.team1_players)?data.team1_players:[],team2_players:Array.isArray(data.team2_players)?data.team2_players:[],points_table:Array.isArray(data.points_table)?data.points_table:[]} as Settings;setSettings(s);setForm(s)}
  setLoading(false)
 }
 useEffect(()=>{refresh();if(db){db.auth.getSession().then(({data})=>setSession(data.session));const {data}=db.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>data.subscription.unsubscribe()}},[])
 useEffect(()=>{let live=true;async function checkAdmin(){if(!db||!session?.user){setAdminAllowed(false);return}const {data,error:e}=await db.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();if(live)setAdminAllowed(!e&&!!data)}checkAdmin();return()=>{live=false}},[session])
 useEffect(()=>{if(!db||!adminMessages||!adminAllowed)return;db.from('contact_messages').select('id,name,email,subject,message,status,created_at').order('created_at',{ascending:false}).then(({data,error:e})=>{if(!e&&data)setMessages(data)})},[adminMessages,adminAllowed])
 useEffect(()=>{if(!db||!settings.poll_id||settings.poll_id==='default')return;db.rpc('get_poll_results',{p_poll_id:settings.poll_id}).then(({data})=>{if(data)setCounts((data as {option_key:string;vote_count:number}[]).map(x=>Number(x.vote_count)))})},[settings.poll_id])
 const total=useMemo(()=>counts.reduce((a,b)=>a+b,0),[counts])
 async function castVote(){
  if(!db||!choice)return
  const key='bl-voter-'+settings.poll_id
  if(localStorage.getItem(key)){setVoted(true);return}
  const voter=crypto.randomUUID()
  const {error:e}=await db.rpc('cast_poll_vote',{p_poll_id:settings.poll_id,p_option_key:choice,p_voter_key:voter})
  if(e){setError(e.message);return}
  localStorage.setItem(key,'1');setVoted(true)
  const {data}=await db.rpc('get_poll_results',{p_poll_id:settings.poll_id})
  if(data)setCounts((data as {option_key:string;vote_count:number}[]).map(x=>Number(x.vote_count)))
 }
 async function signIn(e:React.FormEvent){e.preventDefault();if(!db)return;const {error:e2}=await db.auth.signInWithPassword({email,password});setError(e2?.message||'')}
 async function save(e:React.FormEvent){e.preventDefault();if(!db)return;const id=videoId(form.video_id);if(form.video_id&&!id){setError(t.invalid);return};const options=form.poll_options.map(x=>x.trim()).filter(Boolean);if(options.length!==form.poll_options.length||options.length<2||options.length>10||new Set(options.map(x=>x.toLowerCase())).size!==options.length){setError('Add 2–10 non-empty, unique poll options.');return};const refreshSeconds=Math.min(300,Math.max(15,Number(form.score_refresh_seconds)||30));const next={...form,video_id:id,poll_options:options,score_match_id:form.score_match_id.trim()||'161285',score_refresh_seconds:refreshSeconds,poll_id:crypto.randomUUID(),updated_at:new Date().toISOString()};const {error:e2}=await db.from('site_settings').update(next).eq('id',1);setError(e2?.message||'');if(!e2){setSettings(next);setForm(next);setCounts([]);setVoted(false);setChoice('');setNotice(t.saved)}}
 async function signOut(){await db?.auth.signOut();setSession(null);setAdminAllowed(false)}
 async function sendContact(e:React.FormEvent){e.preventDefault();if(!db)return;setSending(true);setError('');const {error:e2}=await db.from('contact_messages').insert({name:contact.name.trim()||null,email:contact.email.trim()||null,subject:contact.subject.trim(),message:contact.message.trim()});setSending(false);if(e2){setError('Message could not be sent. Please try again.');return}setSent(true);setContact({name:'',email:'',subject:'',message:''})}
 async function updateMessage(id:string,status:string){if(!db)return;const {error:e}=await db.from('contact_messages').update({status}).eq('id',id);if(e){setError(e.message);return}setMessages(old=>old.map(m=>m.id===id?{...m,status}:m))}
 async function deleteMessage(id:string){if(!db||!confirm('Delete this message permanently?'))return;const {error:e}=await db.from('contact_messages').delete().eq('id',id);if(e){setError(e.message);return}setMessages(old=>old.filter(m=>m.id!==id))}
 const player=videoId(settings.video_id)
 return <div className="app" dir="ltr">
  <header className="topbar"><a className="brand" href="/"><span className="brand-mark"><Radio size={20}/></span><span>Boundary<span className="brand-accent">Live</span></span></a><nav className="site-nav"><a className={!detailsPage&&!livePage&&!admin&&!contactPage?"active":""} href="/">Home</a><a className={detailsPage?"active":""} href="/details">Match Details</a><a className={livePage?"active":""} href="/live">Live Match</a><a className={scorePage?"active":""} href="/score">Live Score</a></nav></header>
  {contactPage?<main className="admin-wrap contact-wrap"><a className="back-link" href="/"><ArrowLeft size={15}/> Back to BoundaryLive</a><div className="admin-heading"><span className="eyebrow">BOUNDARYLIVE</span><h1>Contact us</h1><p>Have a question, suggestion or feedback? Send us a message.</p></div>{sent?<div className="panel form-feedback"><CheckCircle2 size={28}/><h2>Message sent</h2><p>Thanks for contacting BoundaryLive. Your message has been received.</p><button className="secondary" onClick={()=>setSent(false)}>Send another message</button></div>:<form className="panel admin-form" onSubmit={sendContact}><label>Name (optional)<input maxLength={80} value={contact.name} onChange={e=>setContact({...contact,name:e.target.value})} autoComplete="name"/></label><label>Email (optional)<input type="email" maxLength={254} value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})} autoComplete="email" placeholder="If you would like a reply"/></label><label>Subject<input required maxLength={120} value={contact.subject} onChange={e=>setContact({...contact,subject:e.target.value})}/></label><label>Message<textarea required minLength={5} maxLength={5000} rows={6} value={contact.message} onChange={e=>setContact({...contact,message:e.target.value})}/></label><button className="primary" type="submit" disabled={sending||!db}>{sending?'Sending…':'Send message'}</button>{error&&<p className="error">{error}</p>}{!db&&<p className="muted">The contact form is temporarily unavailable.</p>}</form>}</main>:admin?<main className="admin-wrap"><div className="admin-heading"><span className="eyebrow">BOUNDARYLIVE</span><h1>{t.login}</h1><p>Manage the single active cricket stream and match poll.</p></div>{!db?<div className="notice">{t.setup} Database connection is not configured yet.</div>:!session?<form className="panel admin-form" onSubmit={signIn}><label>{t.email}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label><label>{t.password}<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label><button className="primary" type="submit">{t.signIn}</button>{error&&<p className="error">{error}</p>}</form>:!adminAllowed?<div className="panel admin-form"><p className="error">This account does not have administrator access.</p><button className="secondary" onClick={signOut}>Sign out</button></div>:adminMessages?<><div className="messages-head"><div><h2>Contact messages</h2><p>{messages.length} message(s)</p></div><a className="secondary nav-button" href="/admin">Stream settings</a></div>{error&&<p className="error">{error}</p>}{messages.length===0?<div className="panel empty-messages"><Inbox size={28}/><p>No messages yet.</p></div>:messages.map(m=><article className="panel message-card" key={m.id}><div className="message-meta"><span className={'message-status '+m.status}>{m.status}</span><time>{new Date(m.created_at).toLocaleString()}</time></div><h3>{m.subject}</h3><p className="message-body">{m.message}</p><p className="message-sender">{m.name||'Anonymous'}{m.email?' · '+m.email:''}</p><div className="message-actions"><button className="secondary" onClick={()=>updateMessage(m.id,m.status==='read'?'unread':'read')}>{m.status==='read'?'Mark unread':'Mark read'}</button><button className="secondary danger-button" onClick={()=>deleteMessage(m.id)}><Trash2 size={14}/> Delete</button></div></article>)}</>:<><div className="admin-nav"><a className="secondary nav-button active" href="/admin">Stream settings</a><a className="secondary nav-button" href="/admin/messages"><Inbox size={14}/> Messages</a></div><section className="panel admin-form json-import-panel"><h2 className="admin-section-title">Quick update with JSON</h2><p>Paste AI-generated match details here. Video ID and poll question/options stay manual below. Review everything, then save.</p><textarea rows={12} value={jsonInput} onChange={e=>{setJsonInput(e.target.value);setJsonError('')}} placeholder={'{\n  "match_title": "India vs Australia",\n  "tournament_name": "Champions Trophy",\n  "match_number": "Final",\n  "venue": "Dubai International Stadium",\n  "city": "Dubai",\n  "match_date": "2026-11-23",\n  "match_time": "2:30 PM IST",\n  "team1_name": "India",\n  "team1_flag": "🇮🇳",\n  "team1_captain": "Captain name",\n  "team1_players": [{"name":"Player 1","role":"Batter"}],\n  "team2_name": "Australia",\n  "team2_flag": "🇦🇺",\n  "team2_captain": "Captain name",\n  "team2_players": [{"name":"Player 2","role":"Bowler"}],\n}'}/><div className="json-import-actions"><button className="secondary" type="button" onClick={applyMatchJson}>Apply JSON to fields</button><button className="secondary" type="button" onClick={()=>{setJsonInput('');setJsonError('')}}>Clear</button></div>{jsonError&&<p className="error">{jsonError}</p>}</section>
 <form className="panel admin-form" onSubmit={save}>
 <h2 className="admin-section-title">Stream and match heading</h2>
 <label>{t.match}<input value={form.match_title} onChange={e=>setForm({...form,match_title:e.target.value})} placeholder="India vs Australia"/></label>
 <label>YouTube video ID or URL<input value={form.video_id} onChange={e=>setForm({...form,video_id:e.target.value})} placeholder="YouTube video ID or URL"/></label>
  <h2 className="admin-section-title">Live score feed</h2>
  <div className="match-editor-grid"><label>Score API match ID<input inputMode="numeric" value={form.score_match_id} onChange={e=>setForm({...form,score_match_id:e.target.value.replace(/[^0-9]/g,'')})} placeholder="161285"/></label><label>Auto-refresh interval (seconds)<input type="number" min="15" max="300" value={form.score_refresh_seconds} onChange={e=>setForm({...form,score_refresh_seconds:Number(e.target.value)})}/></label></div>
  <p className="muted">The Live Score page uses your Boundary Cricket API. Updates are shared through server-side caching; refresh is stopped automatically when the match is complete. Minimum interval: 15 seconds.</p>
 <div className="match-editor-grid">
  <label>Tournament<input value={form.tournament_name} onChange={e=>setForm({...form,tournament_name:e.target.value})} placeholder="ICC Men's T20 World Cup"/></label>
  <label>Match number / stage<input value={form.match_number} onChange={e=>setForm({...form,match_number:e.target.value})} placeholder="Match 12 · Group A"/></label>
  <label>Venue<input value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} placeholder="M. A. Chidambaram Stadium"/></label>
  <label>City<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="Chennai"/></label>
  <label>Match date<input type="date" value={form.match_date} onChange={e=>setForm({...form,match_date:e.target.value})}/></label>
  <label>Start time<input value={form.match_time} onChange={e=>setForm({...form,match_time:e.target.value})} placeholder="7:30 PM IST"/></label>
  <label>Toss winner<input value={form.toss_winner} onChange={e=>setForm({...form,toss_winner:e.target.value})}/></label>
  <label>Toss decision<input value={form.toss_decision} onChange={e=>setForm({...form,toss_decision:e.target.value})} placeholder="Elected to bat / bowl"/></label>
 </div>
 <h2 className="admin-section-title">Team 1</h2>
 <div className="match-editor-grid">
  <label>Team name<input value={form.team1_name} onChange={e=>setForm({...form,team1_name:e.target.value})} placeholder="India"/></label>
  <label>Flag / emoji<input value={form.team1_flag} onChange={e=>setForm({...form,team1_flag:e.target.value})} placeholder="🇮🇳"/></label>
  <label>Captain<input value={form.team1_captain} onChange={e=>setForm({...form,team1_captain:e.target.value})}/></label>
 </div>
 <label>Playing XI · one player per line, optional role after |<textarea rows={7} value={form.team1_players.map(p=>p.role?p.name+' | '+p.role:p.name).join('\n')} onChange={e=>setForm({...form,team1_players:parsePlayers(e.target.value)})} placeholder={'Player name | Batter\nPlayer name | Wicketkeeper'}/></label>
 <h2 className="admin-section-title">Team 2</h2>
 <div className="match-editor-grid">
  <label>Team name<input value={form.team2_name} onChange={e=>setForm({...form,team2_name:e.target.value})} placeholder="Australia"/></label>
  <label>Flag / emoji<input value={form.team2_flag} onChange={e=>setForm({...form,team2_flag:e.target.value})} placeholder="🇦🇺"/></label>
  <label>Captain<input value={form.team2_captain} onChange={e=>setForm({...form,team2_captain:e.target.value})}/></label>
 </div>
 <label>Playing XI · one player per line, optional role after |<textarea rows={7} value={form.team2_players.map(p=>p.role?p.name+' | '+p.role:p.name).join('\n')} onChange={e=>setForm({...form,team2_players:parsePlayers(e.target.value)})} placeholder={'Player name | Batter\nPlayer name | Bowler'}/></label>
 <h2 className="admin-section-title">Match preview and points table</h2>
 <label>Match preview / key information<textarea rows={4} value={form.match_preview} onChange={e=>setForm({...form,match_preview:e.target.value})} placeholder="Short preview, key players, head-to-head notes..."/></label>
 <label>Points table · one team per line: Team | P | W | L | NR | Pts | NRR<textarea rows={7} value={form.points_table.map(x=>[x.team,x.played,x.won,x.lost,x.nr,x.points,x.nrr].join(' | ')).join('\n')} onChange={e=>setForm({...form,points_table:parseStandings(e.target.value)})} placeholder={'India | 4 | 3 | 1 | 0 | 6 | +1.25\nAustralia | 4 | 3 | 1 | 0 | 6 | +0.85'}/></label>
 <label>{t.question}<input value={form.poll_question} onChange={e=>setForm({...form,poll_question:e.target.value})}/></label><div className="poll-options-editor"><div className="poll-options-heading"><strong>Poll options</strong><span>{form.poll_options.length}/10</span></div>{form.poll_options.map((v,i)=><div className="poll-option-edit" key={i}><label>Option {i+1}<input maxLength={80} value={v} onChange={e=>setForm({...form,poll_options:form.poll_options.map((x,j)=>i===j?e.target.value:x)})} placeholder={'Enter option '+(i+1)}/></label><button className="remove-option" type="button" aria-label={'Remove option '+(i+1)} onClick={()=>setForm({...form,poll_options:form.poll_options.filter((_,j)=>j!==i)})} disabled={form.poll_options.length<=2}>×</button></div>)}<button className="secondary add-option" type="button" onClick={()=>setForm({...form,poll_options:[...form.poll_options,'']})} disabled={form.poll_options.length>=10}>+ Add option</button><small>Use 2 to 10 unique options. Leave no empty option fields.</small></div><button className="primary" type="submit">{t.save}</button><button className="secondary" type="button" onClick={signOut}>{t.signOut}</button>{notice&&<p className="success">{notice}</p>}{error&&<p className="error">{error}</p>}</form></> }</main>
   :detailsPage?<main className="content page-content">
    <section className="page-heading"><span className="eyebrow">{settings.tournament_name||'MATCH CENTRE'}</span><h1>{settings.match_title || "Cricket Match"} – Match Details</h1><p>{settings.match_title||'Match information and team details'}</p></section>
    <ResponsiveTopAd/>
    <section className="match-overview">
     <div className="match-overview-top"><div><span className="eyebrow">{settings.match_number||settings.match_stage||'MATCH INFORMATION'}</span><h2>{settings.match_title||'Teams to be announced'}</h2><p>{settings.tournament_name}</p></div></div>
     <div className="match-meta">{settings.match_date&&<span>📅 {settings.match_date}</span>}{settings.match_time&&<span>🕒 {settings.match_time}</span>}{(settings.venue||settings.city)&&<span>📍 {[settings.venue,settings.city].filter(Boolean).join(', ')}</span>}</div>
     <div className="match-teams">
      <article className="match-team"><div className="team-identity"><span className="team-flag">{settings.team1_flag||'🏏'}</span><strong>{settings.team1_name||'Team 1'}</strong></div>{settings.team1_captain&&<span className="team-captain">Captain: {settings.team1_captain}</span>}</article>
      <article className="match-team"><div className="team-identity"><span className="team-flag">{settings.team2_flag||'🏏'}</span><strong>{settings.team2_name||'Team 2'}</strong></div>{settings.team2_captain&&<span className="team-captain">Captain: {settings.team2_captain}</span>}</article>
     </div>
     {(settings.toss_winner||settings.toss_decision)&&<p className="toss-note">Toss: {settings.toss_winner} {settings.toss_decision}</p>}
    </section>
    {(settings.team1_players.length>0||settings.team2_players.length>0)&&<section className="lineups-section"><div className="section-heading"><div><span className="eyebrow">SQUADS</span><h2>Teams & Playing XI</h2></div><Users size={20}/></div><div className="lineups-grid">{[{name:settings.team1_name||'Team 1',flag:settings.team1_flag,players:settings.team1_players},{name:settings.team2_name||'Team 2',flag:settings.team2_flag,players:settings.team2_players}].map((team,i)=><article className="lineup-card" key={i}><h3><span>{team.flag}</span>{team.name}</h3>{team.players.map((p,j)=><div className="lineup-player" key={j}><span className="player-number">{j+1}</span><span>{p.name}</span>{p.role&&<small>{p.role}</small>}</div>)}</article>)}</div></section>}
    {settings.match_preview&&<section className="preview-section"><span className="eyebrow">MATCH INFORMATION</span><h2>Preview & Key Details</h2><p>{settings.match_preview}</p></section>}
    {settings.points_table.length>0&&<section className="points-section"><div className="section-heading"><div><span className="eyebrow">TOURNAMENT</span><h2>Points Table</h2></div><Trophy size={20}/></div><div className="points-table-wrap"><table className="points-table"><thead><tr><th>Team</th><th>P</th><th>W</th><th>L</th><th>NR</th><th>Pts</th><th>NRR</th></tr></thead><tbody>{settings.points_table.map((row,i)=><tr key={i}><td>{row.team}</td><td>{row.played}</td><td>{row.won}</td><td>{row.lost}</td><td>{row.nr}</td><td>{row.points}</td><td>{row.nrr}</td></tr>)}</tbody></table></div></section>}
    <section className="poll-card"><div className="poll-title"><span className="poll-icon"><Vote size={19}/></span><div><span className="eyebrow">{t.poll}</span><h2>{settings.poll_question}</h2></div></div>{settings.poll_options.filter(o=>typeof o==='string'&&o.trim()).length?settings.poll_options.filter(o=>typeof o==='string'&&o.trim()).map((o,i)=>{const pct=total?Math.round((counts[i]||0)*100/total):0;return <button key={o} className={'poll-option '+(choice===o?'selected':'')} onClick={()=>setChoice(o)} disabled={voted}>{voted&&<span className="poll-fill" style={{width:pct+'%'}}/>}<span className="poll-option-text">{o}</span>{voted&&<span className="poll-pct">{pct}%</span>}</button>}):<p>{t.noPoll}</p>}{!voted?<button className="primary vote-button" onClick={castVote} disabled={!choice||!db}>{t.vote}</button>:<p className="success"><CheckCircle2 size={16}/>{t.voted} · {total} {t.votes}</p>}{!db&&<p className="muted">{t.setup}</p>}</section><div className="ad-slot adsterra-rectangle"><span>{t.ad}</span><AdsterraFrame width={300} height={250} keyId="cb17dc67c3edf8b48af9ce0d6ac6a0e6" title="Match details advertisement"/></div><NativeAd/>
    <div className="page-actions"><a className="primary page-action" href="/live">Watch Live Match <Radio size={16}/></a><a className="secondary page-action" href="/">Back to Home</a></div>
   </main>
   :scorePage?<main className="content page-content"><ScorePage matchId={settings.score_match_id||'161285'} refreshSeconds={settings.score_refresh_seconds||30}/></main>
   :livePage?<main className="content page-content">
    <section className="page-heading live-page-heading"><span className="eyebrow">{settings.tournament_name||'BOUNDARYLIVE'}</span><h1>{settings.match_title||'Live Cricket Match'}</h1><p>{settings.match_number||settings.match_stage||'Live coverage'}{settings.venue?' · '+settings.venue:''}</p></section>
    <ResponsiveTopAd/>
    <div className="stream-layout"><section className="stream-card"><div className="stream-head"><div><span className="eyebrow">NOW STREAMING</span><h2>{settings.tournament_name||'Cricket'} · {settings.match_title||'Live Match'}</h2></div>{player&&<span className="live-pill"><i/>{t.live}</span>}</div><div className="player"><iframe src="https://player.kick.com/reachclips" title="BoundaryLive Kick live stream" style={{width:'100%',height:'100%',border:0}} frameBorder="0" scrolling="no" allowFullScreen/></div></section></div>
    <div className="ad-slot adsterra-rectangle"><span>{t.ad}</span><AdsterraFrame width={300} height={250} keyId="cb17dc67c3edf8b48af9ce0d6ac6a0e6" title="Live match advertisement"/></div><NativeAd/>
    <div className="page-actions"><a className="secondary page-action" href="/details">View Match Details</a><a className="secondary page-action" href="/">Home</a></div>
   </main>
   :<main className="content page-content">
    <section className="hero"><div><span className="eyebrow">BOUNDARYLIVE • CRICKET</span><h1>{settings.match_title||t.watch}</h1><p>{settings.tournament_name||t.footer}</p></div>{player&&<span className="live-pill"><i/>{t.live}</span>}</section>
    <ResponsiveTopAd/>
    <section className="home-feature">
     <div className="home-feature-copy"><span className="eyebrow">{player?'LIVE COVERAGE':'FEATURED MATCH'}</span><h2>{settings.match_title||'Follow the latest cricket match'}</h2><p>{[settings.tournament_name,settings.match_date,settings.match_time].filter(Boolean).join(' · ')||'Match information, teams and live coverage in one place.'}</p><div className="home-actions"><a className="primary page-action" href="/live">{player?'Watch Live':'Live Match'} <Radio size={16}/></a><a className="secondary page-action" href="/details">Match Details <ArrowLeft size={15}/></a></div></div>
     <div className="home-teams"><div><span>{settings.team1_flag||'🏏'}</span><strong>{settings.team1_name||'Team 1'}</strong></div><b>VS</b><div><span>{settings.team2_flag||'🏏'}</span><strong>{settings.team2_name||'Team 2'}</strong></div></div>
    </section>
    <section className="seo-intro"><h2>Live cricket streaming today</h2><p>Follow the featured cricket match on BoundaryLive. Check match details, team line-ups, venue and tournament information, then open the live match page when coverage is available.</p>{((/india/i.test(settings.team1_name)&&/pakistan/i.test(settings.team2_name))||(/pakistan/i.test(settings.team1_name)&&/india/i.test(settings.team2_name)))?<p><strong>India vs Pakistan live:</strong> Visit the live match page for coverage when this fixture is scheduled.</p>:null}</section><div className="home-info-grid"><a className="home-info-card" href="/details"><span className="eyebrow">MATCH CENTRE</span><h2>Match Details</h2><p>Teams, squads, venue, toss and tournament information.</p><strong>Explore details →</strong></a><a className="home-info-card" href="/live"><span className="eyebrow">WATCH NOW</span><h2>Live Match & Chat</h2><p>Watch the stream and open the live chat when you want to join in.</p><strong>Open live match →</strong></a></div>
    <div className="ad-slot adsterra-rectangle"><span>{t.ad}</span><AdsterraFrame width={300} height={250} keyId="cb17dc67c3edf8b48af9ce0d6ac6a0e6" title="Home page advertisement"/></div><NativeAd/>
   </main>}
  <footer className="footer"><a href="/about.html">{t.about}</a><a href="/contact">{t.contact}</a><a href="/privacy.html">{t.privacy}</a><a href="/disclaimer.html">Disclaimer</a><span>© {new Date().getFullYear()} BoundaryLive</span></footer>
 </div>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
