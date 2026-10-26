'use strict';
/* AFTERLIGHT — vanilla Canvas game. No dependencies. */
const $=s=>document.querySelector(s),cv=$('#c'),cx=cv.getContext('2d');
const SK='afterlight.save',SV=1,ST='afterlight.settings';
let VW=480,VH=270,K=1,mode='menu',mprev='menu',G=null,T=0,tr=null,echo=null,shk=0,glit=0,cd=0,tg=null,keys={},jv={x:0,y:0},PAD=null,PW=[0,1,0,0],EV=[],lastObj='',stepT=0,hasSave=false;
let set={vol:.7,sfx:.8,amb:.6,mute:false,rfx:false,shk:true,js:1};
try{Object.assign(set,JSON.parse(localStorage.getItem(ST)||'{}'))}catch(e){}
document.body.classList.toggle('rfx',!!set.rfx);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),hs=(a,b)=>{let h=a*374761393+b*668265263;h=(h^(h>>13))*1274126177;return((h^(h>>16))>>>0)/4294967295};
/* ---------- audio ---------- */
let AC=null,mg,sg,ag;
function ainit(){if(AC){AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)();mg=AC.createGain();mg.connect(AC.destination);sg=AC.createGain();sg.connect(mg);ag=AC.createGain();ag.connect(mg);
const b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
const n=AC.createBufferSource();n.buffer=b;n.loop=true;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=1600;const rg=AC.createGain();rg.gain.value=.1;n.connect(f);f.connect(rg);rg.connect(ag);n.start();
[55,82.4].forEach(fr=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=fr;const lf=AC.createBiquadFilter();lf.frequency.value=170;const g=AC.createGain();g.gain.value=.03;o.connect(lf);lf.connect(g);g.connect(ag);o.start()});avol()}catch(e){AC=null}}
function avol(){if(!AC)return;mg.gain.value=set.mute?0:set.vol;sg.gain.value=set.sfx;ag.gain.value=set.amb}
function snd(f,d=.1,ty='square',v=.07,sl=0){if(!AC||set.mute)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+sl),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(sg);o.start(t);o.stop(t+d)}
const SFX={key:()=>snd(900,.04,'square',.03),tick:()=>snd(500,.02,'square',.015),ok:()=>{snd(520,.12,'triangle');setTimeout(()=>snd(780,.22,'triangle'),100)},bad:()=>snd(150,.25,'sawtooth',.06,-70),door:()=>{snd(90,.4,'sawtooth',.07,-40);setTimeout(()=>snd(60,.2,'square',.05),250)},echo:()=>snd(180,1.4,'sine',.1,700),find:()=>{snd(660,.1,'triangle');setTimeout(()=>snd(990,.18,'triangle'),110)},step:()=>snd(65,.05,'triangle',.02),mach:()=>snd(70,.8,'sawtooth',.05,60)};
/* ---------- text content ---------- */
const D={
msg:['MESSAGE — TERMINAL 904',['CITIZEN NOT FOUND.','"IF YOU ARE READING THIS, DO NOT GO TO SECTOR 7. YOU ALREADY DIED THERE."','Signed: R. Okoye. That is your name. You do not remember writing this.']],
letter:['HALCYON DYNAMICS LETTER',['Re: Archive Technician R. Okoye, Sector 7. Clearance for Project AFTERLIGHT approved.','"The Archive does not store memory. It keeps it alive." Please do not discuss the project outside the lab.']],
cal:['WALL CALENDAR — MARCH',['The 14th is circled in red ink. Beside it: "Mira\'s lantern night. Day first, then month. I will never forget."']],
papers:['TORN PAGES',['The same sentence, written nine times: "Mira says the Archive is not saving us. It is replacing us."','At the bottom, shaky: "Check the 02:14 log. Someone is lying about when I died."']],
photo:['TORN PHOTOGRAPH',['Two people under paper lanterns, laughing. One of them is you.','On the back: "Ren & Mira. Before the rain stopped being weather."']],
flyer:['MISSING POSTER',['MISSING: REN OKOYE. Last seen: Sector 7 lift, 02:14.','Stamped across it in red: RECORD DELETED. Someone drew a tiny lantern in the corner.']],
evac:['EVACUATION LOOP',['"Citizens of Veyra-9: remain calm. The Silence is a scheduled maintenance event."','"There are no citizens in Veyra-9."','The screen flickers: CITIZEN NOT FOUND.']],
tamsin:['TAMSIN\'S RECORDING',['"Day three of the Silence. I fed forty people this week. The city says I imagined them."','"If you find this: the plaza junction box has four breakers in a row. Each one drags its neighbours with it. The metro runs only when all four are up."','"And Ren, if you ever come back, you never ate before a shift. Eat something."']],
cmemo:['MIRA\'S VOICE MEMO',['"Ren, if the Archive let you wake, I am sorry. I signed the transfer."','"You were dying. I could not let your memories die with you."','"My terminal has the records. Compare them. Somebody wrote down the wrong time."']],
mnote:['GATE 7 MAINTENANCE',['Gate 7 requires a green keycard and a three-digit override.','Override held by Archive staff only. Last used: 02:41.']],
ec1:['INK ON A GHOST PALM',['Four digits written in pen: 0772. Beneath them: "clinic".']],
ec2:['TRANSFER LOG (ECHO)',['SUBJECT O.: 1 WALKED OUT.','Transfer began 02:15, one minute after death. The patient who left the clinic was not the patient who died.']],
ec3:['GHOST TABLET (ECHO)',['Gate 7 override: SEVEN. ONE. FOUR.','Under it, added later in a different hand: "It will let you in. It always lets you in."']]};
const ITEMS={fuse:['Fuse Cell','A heavy fuse wrapped in cloth. Fits the plaza junction box.'],keycard:['Sector 7 Keycard','Green clearance card from Locker 3. Opens Gate 7 in the metro (an override code is also needed).']};
const CHARS=[['Ren Okoye (you)',()=>1,'Archive technician, Sector 7. Declared dead at 02:14. Erased from the city.'],['Mira Vasquez',f=>f.e1,'Clinician and close friend. Signed "the transfer". Appears in your memories.'],['Tamsin',f=>f.tam,'Noodle shop owner. Fed the last residents. Left a recording.'],['The Archive',f=>f.msg,'Halcyon\'s system. Insists no citizens ever lived in Veyra-9.']];
const QS=[['Who wrote the message on my terminal?','e2'],['What happened at 02:14?','card'],['Why was I erased from the city?','end'],['Why does the memory know I am watching?',null]];
const EC={
e1:{x:250,y:175,cl:{x:284,y:164,w:14,h:14,l:'Read the ink',d:'ec1',f:'clinicSeen'},gh:[{x:262,y:172,c:'#ff2fd0'},{x:240,y:174,c:'#2ff3ff'}],
 L:['MIRA (echo)|Lantern night, Ren. Tamsin closed early so we get the whole street to ourselves.','REN (echo)|One more shift, Mira. Then I am all yours.','MIRA (echo)|Write this on your hand. The clinic door code. In case the lights go out.']},
e2:{x:130,y:112,cl:{x:104,y:74,w:16,h:12,l:'Read the tablet',d:'ec2'},gh:[{x:140,y:66,c:'#ff2fd0'},{x:108,y:96,c:'#2ff3ff',lie:1},{x:112,y:98,c:'#2ff3ff',walk:[230,150]}],
 L:['MIRA (echo)|Time of death, 02:14. Starting the transfer.','MIRA (echo)|Do not look at me like that. It is still you.','REN (echo)|Mira... who is on the table?','MIRA (echo)|Nobody. Walk out the door, Ren. Do not look back.']},
e3:{x:200,y:118,cl:{x:222,y:104,w:14,h:12,l:'Read the tablet',d:'ec3'},gh:[{x:216,y:112,c:'#ff2fd0',look:1},{x:190,y:114,c:'#2ff3ff'}],
 L:['MIRA (echo)|The Gate 7 override is seven, one, four. Say it back to me, Ren.','REN (echo)|Seven. One. Four.'],L2:['MIRA (echo)|...You are early.','MIRA (echo)|Yes, you. The one watching. Do not read the last file.']}};
/* ---------- helpers ---------- */
const has=i=>G.inv.includes(i),give=i=>{if(!has(i)){G.inv.push(i);toast('+ '+ITEMS[i][0]);SFX.find()}},setf=k=>{if(!G.f[k]){G.f[k]=1;save()}};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('show'),2600)}
function read(id,cb){const d=D[id];if(!G.docs.includes(id)){G.docs.push(id);save()}say(d[1].map(s=>d[0]+'|'+s),cb)}
/* ---------- dialogue ---------- */
let dq=[],di=0,dc=0,dtx='',dcb=null,dsh='';
function say(a,cb){dq=a;di=0;dcb=cb||null;mprev=mode==='dlg'?mprev:mode;mode='dlg';$('#dlg').hidden=false;dl()}
function dl(){const s=dq[di],p=s.indexOf('|');$('#dn').textContent=p<0?'':s.slice(0,p);dtx=p<0?s:s.slice(p+1);dc=0;dsh=''}
function dadv(){if(dc<dtx.length){dc=dtx.length;return}if(++di>=dq.length)dend();else dl()}
function dend(){$('#dlg').hidden=true;mode='play';const f=dcb;dcb=null;f&&f()}
/* ---------- modal ---------- */
function mod(h){if(mode!=='modal')mprev=mode;mode='modal';$('#mbox').innerHTML=h;$('#modal').hidden=false}
function closeM(){PAD=null;$('#modal').hidden=true;mode=mprev==='dlg'?'play':mprev}
function pad(t,hint,code,ok){PAD={v:'',code,ok};mod(`<h2>${t}</h2><p class=dim>${hint}</p><div id=padv class=lcd>${'_'.repeat(code.length)}</div><div id=padmsg class=dim>&nbsp;</div><div class=pad>${[1,2,3,4,5,6,7,8,9,'C',0,'OK'].map(k=>`<button data-a=pk data-v=${k}>${k}</button>`).join('')}</div><div class=row><button data-a=close>CANCEL</button></div>`)}
function powerUI(){PW=[0,1,0,0];mod(`<h2>PLAZA JUNCTION BUS</h2><p class=dim>Fuse seated. Four breakers share one bus. Raise them all to restore power.</p><div id=sw></div><div id=padmsg class=dim>&nbsp;</div><div class=row><button data-a=rst>RESET</button><button data-a=close>LEAVE</button></div>`);rsw()}
function rsw(){$('#sw').innerHTML=PW.map((v,i)=>`<button class="sw ${v?'on':''}" data-a=sw data-v=${i}>${v?'&#9650;':'&#9660;'}<small>B${i+1}</small></button>`).join('')}
const EVC=[['DEATH CERTIFICATE: Ren Okoye. Time of death 02:14, Sector 7 lift.'],['CLINIC LEDGER: Dr. M. Vasquez on shift 02:00 to 06:00.'],['WEATHER LOG: Rain began 01:50 and has not stopped.'],['GATE LOG: Badge R. Okoye exits Sector 7 at 02:41, alive and walking.'],['POWER LOG: Sector 7 lift offline 02:12 to 03:00.']];
function evUI(){EV=[];mod(`<h2>DR. VASQUEZ // TERMINAL</h2><p class=dim>Select the two records that cannot both be true.</p><div id=cards></div><div id=padmsg class=dim>&nbsp;</div><div class=row><button data-a=cmp>COMPARE</button><button data-a=close>LEAVE</button></div>`);rev()}
function rev(){$('#cards').innerHTML=EVC.map((c,i)=>`<button class="card ${EV.includes(i)?'sel':''}" data-a=ev data-v=${i}>${c[0]}</button>`).join('')}
const msgM=m=>{const e=$('#padmsg');if(e)e.textContent=m};
const UI={
new(){ainit();newGame()},cont(){ainit();if(loadSave())startPlay(false)},set(){settingsUI()},cred(){mod('<h2>CREDITS</h2><p>AFTERLIGHT: The City That Forgot You</p><p class=dim>Design, code, art and synthesized audio generated locally. No assets, no network.</p><div class=row><button data-a=close>BACK</button></div>')},
close(){closeM();if(mode==='play'&&!$('#menu').hidden&&false)0},
inv(){if(mode!=='play')return;let h='<h2>INVENTORY</h2>';h+=G.inv.length?G.inv.map(i=>`<div class=it><b>${ITEMS[i][0]}</b><p>${ITEMS[i][1]}</p></div>`).join(''):'<p class=dim>Empty. Items are used automatically when you interact with the right object.</p>';mod(h+'<div class=row><button data-a=close>CLOSE</button></div>')},
jr(){if(mode!=='play')return;let h='<h2>NOTEBOOK</h2><h4>EVIDENCE</h4>';h+=G.docs.length?G.docs.map(d=>`<button class=card data-a=rd data-v=${d}>${D[d][0]}</button>`).join(''):'<p class=dim>Nothing collected yet.</p>';h+='<h4>PEOPLE</h4>'+CHARS.filter(c=>c[1](G.f)).map(c=>`<p><b>${c[0]}</b><br><span class=dim>${c[2]}</span></p>`).join('')+'<h4>UNRESOLVED QUESTIONS</h4>'+QS.map(q=>`<p class="${q[1]&&G.f[q[1]]?'done':''}">? ${q[0]}</p>`).join('');mod(h+'<div class=row><button data-a=close>CLOSE</button></div>')},
rd(id){closeM();read(id)},
pz(){if(mode!=='play')return;mod('<h2>PAUSED</h2><div class=row style="flex-direction:column"><button data-a=close>RESUME</button><button data-a=set>SETTINGS</button><button data-a=quit>SAVE &amp; QUIT TO MENU</button></div>')},
quit(){save();closeM();toMenu()},skip(){dq=[dq[dq.length-1]];di=0;dl();dc=dtx.length;dend()},
pk(v){const p=PAD;if(!p)return;if(v==='C')p.v='';else if(v==='OK'){if(p.v===p.code){const f=p.ok;SFX.ok();closeM();f()}else{p.v='';SFX.bad();msgM('ACCESS DENIED')}}else if(p.v.length<p.code.length){p.v+=v;SFX.key();msgM('')}const e=$('#padv');if(e&&PAD)e.textContent=p.v.padEnd(p.code.length,'_')},
sw(i){i=+i;[i-1,i,i+1].forEach(j=>{if(j>=0&&j<4)PW[j]^=1});SFX.key();rsw();if(PW.every(v=>v)){SFX.mach();setf('power');closeM();say(['JUNCTION|BUS LIVE. Somewhere beneath the street, machinery shudders awake.','The metro stairwell shutters are rising.'],()=>toast('POWER RESTORED'))}},
rst(){PW=[0,1,0,0];rsw();SFX.key()},
ev(i){i=+i;const k=EV.indexOf(i);if(k>=0)EV.splice(k,1);else{if(EV.length>=2)EV.shift();EV.push(i)}SFX.key();rev()},
cmp(){if(EV.length<2){msgM('Select two records.');SFX.bad();return}if(EV.includes(0)&&EV.includes(3)){setf('card');give('keycard');SFX.ok();closeM();say(['TERMINAL|CONTRADICTION CONFIRMED. A man cannot die at 02:14 and walk out at 02:41.','TERMINAL|Locker 3 released. Keycard dispensed.','You|Two of me? One died in that lift. One kept walking.'])}else{SFX.bad();msgM('These records do not conflict. Look at the times.')}}};
function settingsUI(){const r=(k,l,mx,mn,st)=>`<label>${l}<input type=range min=${mn} max=${mx} step=${st} data-s=${k} value=${set[k]}></label>`,c=(k,l)=>`<label><input type=checkbox data-s=${k} ${set[k]?'checked':''}> ${l}</label>`;
mod('<h2>SETTINGS</h2>'+r('vol','Master volume',1,0,.05)+r('sfx','Effects volume',1,0,.05)+r('amb','Ambience volume',1,0,.05)+c('mute','Mute all sound')+c('rfx','Reduced visual effects')+c('shk','Screen shake')+r('js','Joystick sensitivity',1.6,.5,.1)+'<div class=row><button data-a=close>BACK</button></div>')}
document.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(a){e.stopPropagation();const f=UI[a.dataset.a];f&&f(a.dataset.v);a.blur?.();return}if(mode==='dlg'&&e.target.closest('#dlg'))dadv()});
document.addEventListener('input',e=>{const s=e.target.dataset&&e.target.dataset.s;if(!s)return;set[s]=e.target.type==='checkbox'?e.target.checked:+e.target.value;if(s==='rfx')document.body.classList.toggle('rfx',set.rfx);avol();try{localStorage.setItem(ST,JSON.stringify(set))}catch(x){}});
/* ---------- save / load ---------- */
function save(){if(!G)return;try{localStorage.setItem(SK,JSON.stringify({v:SV,room:G.room,x:G.x,y:G.y,f:G.f,inv:G.inv,docs:G.docs}));hasSave=true}catch(e){}}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SK));if(!s||s.v!==SV||!R[s.room]||typeof s.x!=='number'||typeof s.y!=='number')throw 0;G={room:s.room,x:s.x,y:s.y,f:s.f&&typeof s.f==='object'?s.f:{},inv:(s.inv||[]).filter(i=>ITEMS[i]),docs:(s.docs||[]).filter(d=>D[d]),fx:1,wk:0};return true}catch(e){try{localStorage.removeItem(SK)}catch(x){}hasSave=false;$('#bc').disabled=true;return false}}
function checkSave(){try{const s=JSON.parse(localStorage.getItem(SK));hasSave=!!(s&&s.v===SV&&R[s.room])}catch(e){hasSave=false}$('#bc').disabled=!hasSave}
function newGame(){G={room:'apt',x:160,y:130,f:{},inv:[],docs:[],fx:1,wk:0};save();startPlay(true)}
function startPlay(intro){$('#menu').hidden=true;$('#hud').hidden=false;$('#touch').hidden=!isTouch;echo=null;tr={t:1,room:null,sw:1};mode='play';if(intro)say(['???|Rain. Always rain.','???|You wake on a cold floor in apartment 904. The city outside is silent.','???|You do not remember your name. Neither, it seems, does the city.'],()=>toast(R[G.room].n));else toast(R[G.room].n)}
function toMenu(){mode='menu';$('#menu').hidden=false;$('#hud').hidden=true;$('#touch').hidden=true;$('#dlg').hidden=true;echo=null;checkSave()}
function go(room,x,y){SFX.door();tr={t:0,room,x,y,sw:0};mode='trans'}
/* ---------- world data ---------- */
const O=(id,k,x,y,w,h,o)=>Object.assign({id,k,x,y,w,h},o);
const door=(id,x,y,w,h,to,tx,ty,l,lk,c)=>O(id,'door',x,y,w,h,{i:1,l,c:c||'#2ff3ff',lk,a:o=>{if(o.lk&&o.lk())return;go(to,tx,ty)}});
const echoSpot=(id,x,y)=>O('s'+id,'echo',x,y,20,12,{i:1,l:'Focus memory',a:()=>startEcho(id)});
const R={
apt:{n:'APARTMENT 904',w:320,h:190,wh:44,th:{f:'#0c1022',l:'rgba(47,243,255,.05)',w:'#10162e',e:'#1d2a55'},s:[],o:[
 O('bed','bed',20,54,52,34,{s:1}),
 O('desk','desk',110,50,56,22,{s:1,i:1,l:'Search desk',a:()=>read('letter')}),
 O('term','term',176,46,24,26,{s:1,i:1,l:'Use terminal',a:()=>{setf('term');read('msg',()=>{if(!G.f.msg){setf('msg');toast('Objective updated')}})}}),
 O('cal','cal',232,16,20,26,{i:1,l:'Read calendar',a:()=>read('cal')}),
 O('win','win',40,10,64,32,{i:1,l:'Look outside',a:()=>say(['You|Veyra-9. Towers of dead glass. Every sign still burning for customers who never come.'])}),
 O('stor','locker',276,50,30,36,{s:1,i:1,l:'Open storage',a:()=>{if(G.f.stor)return say(['You|Empty now.']);pad('STORAGE LOCK','4-digit PIN. A date someone never forgot.','1403',()=>{setf('stor');give('fuse');say(['You|Inside: a heavy fuse cell and a torn photograph.'],()=>read('photo'))})}}),
 O('papers','paper',210,118,14,10,{i:1,l:'Read pages',a:()=>read('papers')}),
 O('rug','rug',100,100,90,50,{}),
 door('adoor',140,166,32,24,'street',60,96,'Leave apartment',()=>{if(!G.f.term){say(['You|Not yet. The terminal is still blinking at me.']);return 1}},'#ffb43a')]},
street:{n:'NEON DISTRICT',w:640,h:230,wh:72,rain:1,th:{f:'#080a18',l:'rgba(138,92,255,.05)',w:'#0b0d1e',e:'#1b1440'},s:[[0,0,640,72]],o:[
 door('sdoor',40,46,28,26,'apt',156,150,'Enter apartment 904',0,'#ffb43a'),
 door('ndoor',150,46,34,26,'noodle',110,120,'Enter Tamsin\'s Noodles',0,'#ff2fd0'),
 door('cdoor',330,46,34,26,'clinic',130,140,'Enter Halcyon Clinic',()=>{if(!G.f.clinic){pad('HALCYON CLINIC','4-digit door code. Someone once said it aloud.','0772',()=>{setf('clinic');go('clinic',130,140)});return 1}},'#7dff9a'),
 door('mstair',552,46,40,26,'metro',44,100,'Descend to metro',()=>{if(!G.f.power){say(['You|The stairwell shutters are dead. The whole district has no power.']);return 1}},'#8a5cff'),
 O('pterm','kiosk',100,118,18,28,{s:1,i:1,l:'Use public terminal',a:()=>{setf('ptm');read('evac')}}),
 O('bench','bench',226,150,48,14,{s:1}),echoSpot('e1',250,176),
 O('junc','junction',450,116,24,30,{s:1,i:1,l:'Inspect junction box',a:()=>{if(G.f.power)return say(['You|Humming steadily. Power is on.']);if(!has('fuse'))return say(['You|Four breakers, and an empty fuse socket. I need a fuse.']);powerUI()}}),
 O('flyer','paper',384,186,14,10,{i:1,l:'Read flyer',a:()=>read('flyer')}),
 O('crate','crate',500,170,26,22,{s:1}),O('crate2','crate',520,184,22,20,{s:1}),O('plant','plant',596,120,16,26,{s:1}),O('plant2','plant',20,150,16,26,{s:1})]},
noodle:{n:'TAMSIN\'S NOODLES',w:220,h:160,wh:44,th:{f:'#150d1c',l:'rgba(255,47,208,.06)',w:'#241030',e:'#4a1b55'},s:[],o:[
 O('cnt','counter',20,52,110,22,{s:1}),
 O('rec','recorder',150,56,14,10,{i:1,l:'Play recording',a:()=>{setf('tam');read('tamsin')}}),
 O('tab1','table',40,100,34,20,{s:1}),O('tab2','table',140,100,34,20,{s:1}),
 O('bowl','bowl',50,92,10,8,{i:1,l:'Look at bowl',a:()=>say(['You|Noodles, still faintly warm. Three days of Silence, and someone has been eating here.'])}),
 door('ndr',90,136,32,24,'street',166,84,'Exit shop')]},
clinic:{n:'HALCYON CLINIC',w:260,h:170,wh:44,th:{f:'#0b141a',l:'rgba(125,255,154,.05)',w:'#10222a',e:'#1f5a52'},s:[],o:[
 O('tbl','gurney',96,62,50,22,{s:1}),echoSpot('e2',130,112),
 O('cterm','term',196,46,24,26,{s:1,i:1,l:'Use Vasquez terminal',a:()=>{if(G.f.card)return say(['TERMINAL|Contradiction already confirmed.']);evUI()}}),
 O('clock','locker',30,48,30,36,{s:1,i:1,l:'Inspect Locker 3',a:()=>{if(G.f.card)return say(['You|Open. Nothing left inside.']);say(['You|Locker 3. Sealed. The terminal must control it.'])}}),
 O('memo','paper',176,112,14,10,{i:1,l:'Play voice memo',a:()=>{read('cmemo');setf('memo')}}),
 door('cdr',114,146,32,24,'street',346,96,'Exit clinic',0,'#7dff9a')]},
metro:{n:'VEYRA-9 CENTRAL STATION',w:520,h:200,wh:60,rain:1,th:{f:'#0a0d17',l:'rgba(255,180,58,.04)',w:'#101426',e:'#2a2f52'},s:[[0,158,520,42]],o:[
 door('mdr',20,34,36,26,'street',572,96,'Climb to street',0,'#8a5cff'),
 O('mterm','term',298,34,24,26,{s:1,i:1,l:'Use maintenance terminal',a:()=>read('mnote')}),echoSpot('e3',200,126),
 door('gate','gate',440,30,48,30,'sec7',16,70,'Approach Gate 7',()=>{if(!has('keycard')){say(['GATE 7|KEYCARD REQUIRED. GREEN CLEARANCE ONLY.']);return 1}if(!G.f.gate){pad('GATE 7 OVERRIDE','3-digit override. Archive staff only.','714',()=>{setf('gate');say(['GATE 7|OVERRIDE ACCEPTED. WELCOME BACK, R. OKOYE.','You|I never told it my name.'],()=>go('sec7',16,70))});return 1}},'#ffb43a'),
 O('p1','pillar',130,100,12,12,{s:1}),O('p2','pillar',280,100,12,12,{s:1}),O('p3','pillar',390,100,12,12,{s:1}),O('bn','bench',330,104,40,12,{s:1})]},
sec7:{n:'SECTOR 7: ARCHIVE CORRIDOR',w:420,h:120,wh:40,th:{f:'#06080f',l:'rgba(255,47,208,.06)',w:'#0a0c1a',e:'#401a50'},s:[],o:[
 O('final','term',380,34,28,30,{s:1,i:1,l:'Query the Archive',a:()=>ending()})]}};
const ECH=EC;
function ending(){if(G.f.end)return say(['ARCHIVE|Instance 2,114,902 is standing behind you. It is smiling.'],endCard);setf('end');say(['ARCHIVE|AFTERLIGHT CORE. QUERY: OKOYE, REN.','ARCHIVE|CITIZEN FOUND.','ARCHIVE|Status: DECEASED 02:14. Instance 2,114,903 of 2,114,903: ACTIVE.','ARCHIVE|Veyra-9 never went silent. Its people were stored. Every one of them is still in here, waiting to be woken.','ARCHIVE|You are not the one who died, Ren. You are the one who was kept.','ARCHIVE|Warning: instance 2,114,902 has been awake for 41 days. It wrote you a message. It is standing behind you.'],endCard)}
function endCard(){mod('<h2>CHAPTER ONE COMPLETE</h2><p>You turn around.</p><p>The figure wears your coat, your face, and the same terrible calm. It lifts one hand and, very gently, presses a finger to its lips.</p><p class=dim>AFTERLIGHT will return. Your progress is saved.</p><div class=row><button data-a=quit>RETURN TO MENU</button><button data-a=close>KEEP EXPLORING</button></div>')}
/* ---------- echoes ---------- */
function startEcho(id){const d=EC[id];if(echo)return;setf(id);SFX.echo();shk=.5;glit=.8;echo={id,d,t:0,got:0,ph:0,end:0,gh:d.gh.map(g=>Object.assign({},g)),cl:O('cl','clue',d.cl.x,d.cl.y,d.cl.w,d.cl.h,{i:1,l:d.cl.l,a:()=>{echo.got=1;SFX.find();setf(d.cl.d);read(d.cl.d,()=>{echo.end=T+1.5})}})};
say(d.L,()=>{echo.ph=1;if(d.L2){glit=1.6;shk=.6;SFX.echo();say(d.L2,()=>{echo.ph=2})}})}
function endEcho(){echo=null;toast('The echo fades.');snd(300,.8,'sine',.08,-200)}
/* ---------- input ---------- */
const isTouch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
if(mode==='modal'){if(k==='escape'){closeM()}else if(PAD&&/^[0-9]$/.test(k))UI.pk(k);else if(PAD&&k==='enter')UI.pk('OK');else if(PAD&&k==='backspace')UI.pk('C');return}
if(e.repeat)return;
if(mode==='dlg'){if(k==='e'||k===' '||k==='enter')dadv();return}
if(mode!=='play'){return}
if(k==='e'||k===' ')interact();else if(k==='i')UI.inv();else if(k==='j')UI.jr();else if(k==='escape')UI.pz();else keys[k]=1});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
addEventListener('blur',()=>{keys={};jv.x=jv.y=0;if(mode==='play')UI.pz()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')UI.pz()});
addEventListener('contextmenu',e=>e.preventDefault());
(function(){const j=$('#joy'),kn=$('#knob');let id=null;const mv=e=>{const r=j.getBoundingClientRect(),dx=e.clientX-(r.left+55),dy=e.clientY-(r.top+55),m=Math.hypot(dx,dy)||1,c=Math.min(m,45);jv.x=clamp(dx/45*set.js,-1,1)*(m<8?0:1);jv.y=clamp(dy/45*set.js,-1,1)*(m<8?0:1);kn.style.transform=`translate(${dx/m*c}px,${dy/m*c}px)`};
j.addEventListener('pointerdown',e=>{id=e.pointerId;j.setPointerCapture(id);mv(e);e.preventDefault()});j.addEventListener('pointermove',e=>{if(e.pointerId===id)mv(e)});
const up=e=>{if(e.pointerId===id){id=null;jv.x=jv.y=0;kn.style.transform=''}};j.addEventListener('pointerup',up);j.addEventListener('pointercancel',up);
$('#act').addEventListener('pointerdown',e=>{e.preventDefault();ainit();if(mode==='dlg')dadv();else if(mode==='play')interact()})})();
function interact(){if(mode!=='play'||cd>0||!tg)return;cd=.25;ainit();tg.a(tg)}
/* ---------- update ---------- */
function solidAt(x,y){const r=R[G.room];if(x-4<0||x+4>r.w||y>r.h-2||y<r.wh+6)return true;const l=x-4,t=y-4,rr=x+4;for(const s of r.s)if(l<s[0]+s[2]&&rr>s[0]&&t<s[1]+s[3]&&y>s[1])return true;for(const o of r.o)if(o.s&&l<o.x+o.w&&rr>o.x&&t<o.y+o.h&&y>o.y+o.h*.3)return true;return false}
function update(dt){cd=Math.max(0,cd-dt);shk=Math.max(0,shk-dt);glit=Math.max(0,glit-dt);
if(tr){tr.t+=dt/.4;if(!tr.sw&&tr.t>=1){tr.sw=1;G.room=tr.room;G.x=tr.x;G.y=tr.y;echo=null;$('#echoi').hidden=true;save();toast(R[G.room].n);if(G.room==='sec7'&&!G.f.s7){setf('s7');say(['You|The corridor hums. Something here is happy to see me.'])}}if(tr.t>=2||(tr.sw&&tr.t>=1&&tr.room===null)){if(tr.t>=(tr.room===null?1.6:2)){tr=null;if(mode==='trans')mode='play'}}
}
if(mode==='dlg'){dc+=dt*60;const s=dtx.slice(0,dc|0);if(s!==dsh){dsh=s;$('#dt').textContent=s;if(s.length%3===0)SFX.tick()}}
if(mode!=='play'&&mode!=='dlg'&&!(echo&&mode==='modal'))return;
if(echo){echo.t+=dt;const d=echo.d;for(const g of echo.gh){if(g.walk&&echo.ph>=1){const dx=g.walk[0]-g.x,dy=g.walk[1]-g.y,m=Math.hypot(dx,dy);if(m>2){g.x+=dx/m*28*dt;g.y+=dy/m*28*dt}}if(g.look&&echo.ph>=2){const dx=G.x-g.x,m=Math.abs(dx);if(m>26)g.x+=Math.sign(dx)*10*dt}}
$('#echoi').hidden=false;$('#eb').style.width=clamp(1-echo.t/55,0,1)*100+'%';if(echo.t>55||(echo.end&&T>echo.end&&mode==='play'))endEcho()}else $('#echoi').hidden=true;
if(mode!=='play')return;
let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+jv.x,dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+jv.y;const m=Math.hypot(dx,dy);G.wk=0;
if(m>.05){if(m>1){dx/=m;dy/=m}const sp=72*dt;let nx=G.x+dx*sp,ny=G.y+dy*sp;if(!solidAt(nx,G.y))G.x=nx;if(!solidAt(G.x,ny))G.y=ny;G.wk=1;if(Math.abs(dx)>.2)G.fx=Math.sign(dx);stepT-=dt;if(stepT<=0){stepT=.34;SFX.step()}}
tg=near();const p=$('#prompt');if(tg){const t=(isTouch?'':'[E] ')+tg.l;if(p.textContent!==t)p.textContent=t;p.hidden=false}else p.hidden=true;
const ob=objective();if(ob!==lastObj){lastObj=ob;$('#obj').textContent=ob}}
function near(){const r=R[G.room],cy=G.y-6;let b=null,bd=99;const chk=o=>{if(!o.i)return;const dx=Math.max(o.x-G.x,0,G.x-(o.x+o.w)),dy=Math.max(o.y-cy,0,cy-(o.y+o.h)),d=Math.hypot(dx,dy);if(d<16&&d<bd){bd=d;b=o}};for(const o of r.o)chk(o);if(echo&&!echo.got)chk(echo.cl);return b}
function objective(){const f=G.f;if(f.end)return 'CHAPTER ONE COMPLETE';if(f.gate)return 'Walk to the end of the Sector 7 corridor.';if(!f.term)return 'Read the terminal in apartment 904.';if(!f.stor)return 'Open the locked storage. Look for a date.';if(G.room==='apt'&&!f.power&&!f.e1)return 'Leave the apartment and explore the street.';if(!f.e1)return 'Find a glowing Memory Echo marker in the street.';if(!f.power)return has('fuse')?'Restore power at the plaza junction box.':'Find a fuse for the junction box.';if(!f.clinic)return 'Get into Halcyon Clinic. The ghost wrote the code.';if(!f.card)return 'Find the contradiction on the clinic terminal.';if(!f.e3)return 'Descend to the metro. Find the platform echo.';return 'Open Gate 7: keycard and override code.'}
/* ---------- rendering ---------- */
const LC={},rc=(x,y,w,h,c)=>{cx.fillStyle=c;cx.fillRect(x|0,y|0,w|0,h|0)};
function lamp(x,y,r,c,a){const k=c+r;let s=LC[k];if(!s){s=document.createElement('canvas');s.width=s.height=r*2;const g=s.getContext('2d'),gr=g.createRadialGradient(r,r,0,r,r,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,r*2,r*2);LC[k]=s}cx.globalCompositeOperation='lighter';cx.globalAlpha=a;cx.drawImage(s,(x-r)|0,(y-r)|0);cx.globalAlpha=1;cx.globalCompositeOperation='source-over'}
const fl=(i,sp)=>set.rfx?1:(hs(i,Math.floor(T*(sp||5)))>.18?1:.25);
function man(x,y,coat,glow,al,wk,fx){const b=wk?Math.round(Math.sin(T*14)):0,l=wk?Math.round(Math.sin(T*14)*2):0;cx.globalAlpha=al;if(al>=1)rc(x-6,y-1,12,3,'rgba(0,0,0,.45)');rc(x-3,y-5,3,5+l,'#0c0f1c');rc(x,y-5,3,5-l,'#0c0f1c');rc(x-4,y-15+b,8,10,coat);rc(x-4,y-9+b,8,1,glow);rc(x-5,y-14+b,1,7,coat);rc(x+4,y-14+b,1,7,coat);rc(x-3,y-21+b,6,6,'#d6b39b');rc(x-3,y-22+b,6,2,'#1b1030');rc(x-3+fx,y-19+b,5,2,glow);cx.globalAlpha=1}
const OD={
bed(o){rc(o.x,o.y,o.w,o.h,'#1a2350');rc(o.x+2,o.y+2,o.w-4,o.h-4,'#2a3670');rc(o.x+3,o.y+4,14,10,'#cfe');rc(o.x+22,o.y+2,o.w-24,o.h-4,'#6a2a78');rc(o.x+22,o.y+2,3,o.h-4,'#ff2fd0')},
desk(o){rc(o.x,o.y,o.w,o.h,'#2a2f4a');rc(o.x,o.y+o.h-5,o.w,5,'#171b30');rc(o.x+8,o.y+4,14,9,'#cdd');rc(o.x+30,o.y+6,10,7,'#bcd');lamp(o.x+48,o.y+4,24,'#ffb43a',.45)},
term(o){rc(o.x,o.y,o.w,o.h,'#1a1d30');rc(o.x+2,o.y+2,o.w-4,o.h-10,'#021416');const a=.6+.4*fl(o.x,3);cx.globalAlpha=a;for(let i=0;i<4;i++)rc(o.x+4,o.y+4+i*4,(hs(i,o.x)*10+4)|0,1,'#7dff9a');cx.globalAlpha=1;lamp(o.x+o.w/2,o.y+o.h/2,26,'#2ff3ff',.28*a);rc(o.x+4,o.y+o.h-6,o.w-8,3,'#333a5a')},
locker(o){rc(o.x,o.y,o.w,o.h,'#3a4260');rc(o.x+2,o.y+2,o.w-4,o.h-4,'#2a3050');rc(o.x+o.w/2,o.y+2,1,o.h-4,'#151a2c');rc(o.x+o.w-8,o.y+o.h/2,3,6,'#9ab');rc(o.x+o.w-8,o.y+6,3,3,(G.f[o.id]||G.f.card&&o.id==='clock')?'#7dff9a':'#ff3355')},
cal(o){rc(o.x,o.y,o.w,o.h,'#e8e4d6');rc(o.x,o.y,o.w,5,'#b33');cx.strokeStyle='#d22';cx.beginPath();cx.arc(o.x+13,o.y+16,4,0,7);cx.stroke()},
win(o){rc(o.x-2,o.y-2,o.w+4,o.h+4,'#2a3060');rc(o.x,o.y,o.w,o.h,'#070a1c');for(let i=0;i<9;i++)rc(o.x+i*7,o.y+10+hs(i,1)*14,5,o.h,'#0e1332');for(let i=0;i<14;i++)if(hs(i,9)>.5)rc(o.x+2+i*4.5,o.y+14+hs(i,2)*12,2,2,['#ff2fd0','#2ff3ff','#ffb43a'][i%3]);cx.fillStyle='rgba(120,200,255,.5)';for(let i=0;i<8;i++){const q=(T*60+i*37)%o.h;cx.fillRect(o.x+(i*9)%o.w,o.y+q,1,4)}lamp(o.x+o.w/2,o.y+o.h,40,'#8a5cff',.3)},
paper(o){rc(o.x,o.y,o.w,o.h,'#d8d4c4');rc(o.x+2,o.y+2,o.w-4,1,'#778');rc(o.x+2,o.y+5,o.w-6,1,'#778');if(!set.rfx&&Math.sin(T*3+o.x)>0)lamp(o.x+o.w/2,o.y+o.h/2,10,'#ffb43a',.35)},
rug(o){cx.globalAlpha=.5;rc(o.x,o.y,o.w,o.h,'#3a1a55');rc(o.x+4,o.y+4,o.w-8,o.h-8,'#1f2a62');cx.globalAlpha=1},
door(o){const lk=(o.id==='cdoor'&&!G.f.clinic)||(o.id==='mstair'&&!G.f.power)||(o.id==='gate'&&!G.f.gate)||(o.id==='adoor'&&!G.f.term);rc(o.x,o.y,o.w,o.h,'#161a30');rc(o.x+2,o.y+3,o.w-4,o.h-3,'#0a0c18');rc(o.x,o.y,o.w,2,o.c);rc(o.x,o.y,2,o.h,o.c);rc(o.x+o.w-2,o.y,2,o.h,o.c);rc(o.x+o.w-6,o.y+o.h/2,2,4,lk?'#ff3355':'#7dff9a');lamp(o.x+o.w/2,o.y+o.h,22,o.c,.35*fl(o.x,4))},
gate(o){OD.door(o);for(let i=0;i<o.w;i+=8)rc(o.x+i,o.y+3,4,o.h-3,'#b8902a');cx.globalAlpha=.6;rc(o.x+2,o.y+3,o.w-4,o.h-3,G.f.gate?'#0a2a14':'#3a0a10');cx.globalAlpha=1},
kiosk(o){rc(o.x,o.y,o.w,o.h,'#242a48');rc(o.x+2,o.y+3,o.w-4,12,'#03161a');rc(o.x+4,o.y+5,o.w-8,1,'#7dff9a');rc(o.x+4,o.y+8,o.w-12,1,'#7dff9a');lamp(o.x+o.w/2,o.y+8,24,'#2ff3ff',.35*fl(7))},
bench(o){rc(o.x,o.y,o.w,o.h-6,'#2a2540');rc(o.x,o.y+o.h-6,o.w,6,'#161228');rc(o.x+3,o.y+o.h,3,3,'#111');rc(o.x+o.w-6,o.y+o.h,3,3,'#111')},
junction(o){rc(o.x,o.y,o.w,o.h,'#2c334f');rc(o.x+2,o.y+2,o.w-4,o.h-4,'#171b2e');for(let i=0;i<4;i++)rc(o.x+4,o.y+4+i*6,o.w-8,3,G.f.power?'#7dff9a':(has('fuse')?'#ffb43a':'#ff3355'));if(G.f.power)lamp(o.x+12,o.y+14,24,'#7dff9a',.3)},
crate(o){rc(o.x,o.y,o.w,o.h,'#3a2f28');rc(o.x,o.y,o.w,2,'#5a4a3a');rc(o.x+o.w/2-1,o.y,2,o.h,'#251c18')},
plant(o){rc(o.x+3,o.y+16,10,10,'#2a2036');for(let i=0;i<5;i++){rc(o.x+7+Math.sin(T+i)*1,o.y+2+i*3,2,10,i%2?'#1fd88a':'#ff2fd0')}rc(o.x+2,o.y+6,12,2,'#1fd88a')},
counter(o){rc(o.x,o.y,o.w,o.h,'#3a1c44');rc(o.x,o.y,o.w,4,'#ff2fd0');rc(o.x+10,o.y+6,16,8,'#d9c9a8');lamp(o.x+55,o.y,40,'#ff2fd0',.2)},
recorder(o){rc(o.x,o.y,o.w,o.h,'#333b5a');rc(o.x+3,o.y+3,3,3,Math.sin(T*5)>0?'#ff3355':'#401018');rc(o.x+7,o.y+3,4,4,'#9ab')},
table(o){rc(o.x,o.y+6,o.w,o.h-6,'#3a2a44');rc(o.x-2,o.y+2,o.w+4,6,'#5a3a66')},
bowl(o){rc(o.x,o.y+2,o.w,6,'#e8e4d6');rc(o.x+1,o.y,o.w-2,3,'#e0a040');if(!set.rfx)rc(o.x+3+Math.sin(T*2)*2,o.y-5-(T*6%6),1,3,'rgba(255,255,255,.3)')},
gurney(o){rc(o.x,o.y+6,o.w,o.h-6,'#aab4c4');rc(o.x,o.y+o.h,3,6,'#445');rc(o.x+o.w-3,o.y+o.h,3,6,'#445');rc(o.x+2,o.y+4,o.w-4,4,'#7dff9a55')},
pillar(o){rc(o.x-1,o.y-52,o.w+2,64,'#1a2040');rc(o.x+1,o.y-52,3,64,'#2a3260');rc(o.x-1,o.y-20,o.w+2,2,'#b8902a')},
echo(o){const p=.5+.5*Math.sin(T*3);cx.globalAlpha=.35+.4*p;cx.strokeStyle='#8a5cff';cx.lineWidth=1;cx.beginPath();cx.ellipse(o.x+10,o.y+6,6+p*5,3+p*2,0,0,7);cx.stroke();cx.globalAlpha=1;lamp(o.x+10,o.y+6,22,'#8a5cff',.3+.3*p);if(!set.rfx&&Math.random()<.2)burst(o.x+4+Math.random()*12,o.y+8,'#b69cff')},
clue(o){const p=.5+.5*Math.sin(T*6);lamp(o.x+o.w/2,o.y+o.h/2,26,'#ffb43a',.6+.3*p);rc(o.x,o.y,o.w,o.h,'rgba(255,220,150,.8)')},
sign(){}};
const PT=[];for(let i=0;i<40;i++)PT.push({x:0,y:0,vx:0,vy:0,l:0,c:''});let pi=0;
function burst(x,y,c){const p=PT[pi++%40];p.x=x;p.y=y;p.vx=(Math.random()-.5)*10;p.vy=-8-Math.random()*10;p.l=1;p.c=c}
const RD=[];for(let i=0;i<90;i++)RD.push({x:Math.random(),y:Math.random(),s:.6+Math.random()});
function drawBG(r,id){const w=r.w,h=r.h,t=r.th;rc(0,0,w,h,t.f);for(let y=r.wh;y<h;y+=16)rc(0,y,w,1,t.l);for(let x=0;x<w;x+=16)rc(x,r.wh,1,h-r.wh,t.l);rc(0,0,w,r.wh,t.w);rc(0,r.wh-3,w,3,t.e);
if(id==='apt'){for(let x=0;x<w;x+=12)rc(x,0,1,r.wh-3,'rgba(138,92,255,.08)');lamp(160,20,90,'#8a5cff',.12)}
else if(id==='street'){for(let x=0;x<w;x+=46){const bh=30+hs(x,1)*40;rc(x,r.wh-bh,44,bh,'#0e1128');for(let wy=r.wh-bh+4;wy<r.wh-10;wy+=8)for(let wx=x+4;wx<x+40;wx+=8)if(hs(wx,wy)>.62)rc(wx,wy,4,4,['#ffb43a','#2ff3ff','#ff2fd0'][(wx+wy)%3|0])}
 rc(0,r.wh-10,w,10,'#141838');const sg=[[200,38,'#ff2fd0','OPEN'],[370,34,'#7dff9a','CLINIC'],[290,40,'#2ff3ff','NOODLE']];for(const s of sg){const a=fl(s[0],4);cx.globalAlpha=a;rc(s[0]-18,s[1],36,12,'#05060f');cx.fillStyle=s[2];cx.font='9px monospace';cx.fillText(s[3],s[0]-s[3].length*2.7,s[1]+9);cx.globalAlpha=1;lamp(s[0],s[1]+10,36,s[2],.25*a);lamp(s[0],r.wh+60,50,s[2],.1*a)}
 for(let i=0;i<10;i++){cx.globalAlpha=.1;rc(60+i*58,100+hs(i,3)*100,34,3,'#2ff3ff');cx.globalAlpha=1}}
else if(id==='metro'){for(let x=0;x<w;x+=20)rc(x,0,1,r.wh-3,'rgba(255,255,255,.05)');rc(0,148,w,3,'#b8902a');rc(0,158,w,42,'#04050a');rc(0,170,w,2,'#444a66');rc(0,184,w,2,'#444a66');for(let i=0;i<6;i++){const a=fl(i+3,7);rc(40+i*88,8,40,4,'#cfe');lamp(60+i*88,12,50,'#cfe',.16*a)}for(let i=0;i<4;i++){rc(110+i*100,14,22,26,'#1a1030');rc(112+i*100,16,18,22,i%2?'#ff2fd0':'#2ff3ff')}if(G.f.power)rc(10,60,w-20,1,'rgba(47,243,255,.25)')}
else if(id==='sec7'){rc(0,r.wh-3,w,3,'#ff2fd0')}
else if(id==='noodle'){for(let i=0;i<5;i++){rc(20+i*40,10,10,14,'#ff2fd0');lamp(25+i*40,18,26,'#ff2fd0',.3*fl(i,3))}}
else if(id==='clinic'){rc(0,10,w,3,'#7dff9a');lamp(130,8,100,'#7dff9a',.12*fl(2,2))}}
function drawGhost(g){const j=set.rfx?0:Math.sin(T*30)*.6*(hs(g.x|0,T*8|0)>.8?3:0);if(g.lie){cx.globalAlpha=.55;rc(g.x-16+j,g.y-2,32,6,g.c);rc(g.x+14,g.y-5,7,7,'#d6b39b');cx.globalAlpha=1;return}let fx=1;if(g.look){fx=G.x<g.x?-1:1;man(g.x+j,g.y,g.c,'#fff',.6,0,fx);if(echo.ph>=2){rc(g.x-3+fx*2,g.y-19,2,2,'#ff3355');lamp(g.x,g.y-18,14,'#ff3355',.5)}return}man(g.x+j,g.y,g.c,'#fff',.55,g.walk&&echo.ph>=1?1:0,1)}
function drawEcho(r){const id=echo.id;if(id==='e1'){for(let i=0;i<10;i++){const x=190+i*26,y=78+Math.sin(i*.9+T)*3;rc(x,y,2,6,'#552');rc(x-2,y+4,6,8,'#ff3355');lamp(x+1,y+8,22,'#ff7050',.5)}}else if(id==='e2'){lamp(120,70,70,'#cfe',.35)}else if(id==='e3'){rc(0,160,520,36,'#161030');for(let i=0;i<14;i++)rc(10+i*38-((T*20)%38),166,30,14,hs(i,5)>.3?'#ffb43a':'#2a1a50');for(let i=0;i<4;i++)man(120+i*34,126,'#32204a','#8a5cff',.3,0,1)}for(const g of echo.gh)drawGhost(g)}
const dl_=[];
function draw(){cx.setTransform(K,0,0,K,0,0);cx.imageSmoothingEnabled=false;rc(0,0,VW,VH,'#04050b');
if(mode==='menu'&&!G||$('#menu').hidden===false){menuBG();return}
const r=R[G.room],id=G.room;let cxm=r.w<VW?-(VW-r.w)/2:clamp(G.x-VW/2,0,r.w-VW),cym=r.h<VH?-(VH-r.h)/2:clamp(G.y-VH/2-10,0,r.h-VH);cxm=Math.round(cxm);cym=Math.round(cym);
const sh=shk>0&&set.shk&&!set.rfx?(Math.random()-.5)*4*shk:0;cx.save();cx.translate(-cxm+sh,-cym+sh);
drawBG(r,id);dl_.length=0;for(const o of r.o)if(!(o.k==='door'&&0))dl_.push(o);dl_.sort((a,b)=>(a.y+a.h*(a.k==='rug'||a.k==='paper'||a.k==='echo'?-9:1))-(b.y+b.h*(b.k==='rug'||b.k==='paper'||b.k==='echo'?-9:1)));
let pd=false;for(const o of dl_){if(!pd&&o.y+o.h>G.y&&o.k!=='rug'&&o.k!=='paper'&&o.k!=='echo'&&o.k!=='door'&&o.k!=='gate'){playerDraw();pd=true}(OD[o.k]||OD.sign)(o)}if(!pd)playerDraw();
if(id==='sec7')sec7Dec(r);if(G.f.end&&id==='sec7')man(G.x-20,G.y,'#2a1a40','#ff2fd0',.9,0,1);
if(echo){drawEcho(r);if(!echo.got)OD.clue(echo.cl)}
if(tg&&mode==='play'){cx.strokeStyle='#ff2fd0';cx.globalAlpha=.6+.4*Math.sin(T*8);cx.strokeRect(tg.x-1.5,tg.y-1.5,tg.w+3,tg.h+3);cx.globalAlpha=1}
for(const p of PT)if(p.l>0){p.l-=.016*1.2;p.x+=p.vx*.016;p.y+=p.vy*.016;rc(p.x,p.y,2,2,p.c)}
cx.restore();
if(!set.rfx){if(r.rain){cx.strokeStyle='rgba(150,200,255,.28)';cx.beginPath();for(const d of RD){const yy=((d.y*VH+T*220*d.s)%VH),xx=(d.x*VW+yy*.25)%VW;cx.moveTo(xx,yy);cx.lineTo(xx-1.5,yy+7)}cx.stroke()}
 for(let i=0;i<3;i++){cx.globalAlpha=.05;rc(0,VH*(.5+i*.18)+Math.sin(T*.4+i)*8,VW,34,'#8a5cff');cx.globalAlpha=1}}
if(echo){cx.globalAlpha=.16;rc(0,0,VW,VH,'#8a5cff');cx.globalAlpha=1;if(!set.rfx)for(let i=0;i<3;i++){const y=(T*40+i*90)%VH;cx.globalAlpha=.08;rc(0,y,VW,2,'#fff');cx.globalAlpha=1}}
if(glit>0&&!set.rfx){for(let i=0;i<5;i++){const y=Math.random()*VH;cx.drawImage(cv,0,y*K,cv.width,8*K,(Math.random()-.5)*14*K,y*K,cv.width,8*K)}rc(0,Math.random()*VH,VW,2,'rgba(255,47,208,.4)')}
const vg=cx.createRadialGradient(VW/2,VH/2,VH*.35,VW/2,VH/2,VH*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,6,.6)');cx.fillStyle=vg;cx.fillRect(0,0,VW,VH);
if(tr){const a=tr.t<1?tr.t:Math.max(0,2-tr.t);cx.globalAlpha=clamp(tr.room===null?1-tr.t:a,0,1);rc(0,0,VW,VH,'#000');cx.globalAlpha=1}}
function playerDraw(){man(G.x,G.y,'#18284a','#2ff3ff',1,G.wk,G.fx||1);if(!set.rfx)lamp(G.x,G.y-8,22,'#2ff3ff',.12)}
function sec7Dec(r){for(let i=0;i<9;i++){const x=40+i*40,on=G.x<x-6||G.f.end;const a=on?fl(i,6):0;rc(x-10,10,20,4,'#cfe');if(a)lamp(x,14,44,'#ff9fe9',.2*a);const sg=Math.max(0,Math.min(1,(G.x-(x-90))/90));if(i%2===0)man(x,r.wh+8,'#1c1030','#ff2fd0',.25+.35*sg,0,G.x<x?-1:1);else man(x,r.h-4,'#1c1030','#ff2fd0',.2+.3*sg,0,G.x<x?-1:1)}}
function menuBG(){rc(0,0,VW,VH,'#05060f');for(let x=0;x<VW;x+=28){const bh=60+hs(x,2)*110;rc(x,VH-bh,26,bh,'#0b0e22');for(let y=VH-bh+6;y<VH-6;y+=9)if(hs(x,y)>.6)rc(x+4,y,3,4,['#ffb43a','#2ff3ff','#ff2fd0'][(x+y)%3|0])}for(let i=0;i<4;i++){const c=['#ff2fd0','#2ff3ff','#8a5cff','#ffb43a'][i];lamp(60+i*110,VH*.55,70,c,.25*fl(i,3))}if(!set.rfx){cx.strokeStyle='rgba(150,200,255,.3)';cx.beginPath();for(const d of RD){const yy=(d.y*VH+T*240*d.s)%VH,xx=(d.x*VW+yy*.25)%VW;cx.moveTo(xx,yy);cx.lineTo(xx-1.5,yy+7)}cx.stroke()}}
/* ---------- resize / loop ---------- */
function rs(){const d=Math.min(devicePixelRatio||1,2);cv.width=Math.floor(innerWidth*d);cv.height=Math.floor(innerHeight*d);K=Math.min(innerHeight/270,innerWidth/400)*d;VW=cv.width/K;VH=cv.height/K}
addEventListener('resize',rs);rs();
let last=0;function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;T+=dt;try{update(dt);draw()}catch(e){console.error(e)}requestAnimationFrame(loop)}
loadSave()?0:0;G=null;checkSave();requestAnimationFrame(loop);
