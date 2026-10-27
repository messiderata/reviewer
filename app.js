const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let history=[];try{history=JSON.parse(localStorage.getItem('recall-history')||'[]');if(!Array.isArray(history))history=[];}catch{}
let quiz=null, noteIndex=0;
const fishKinds={gold:{name:'Goldfish',price:15,hue:0},blue:{name:'Blue fish',price:20,hue:160},pink:{name:'Pink fish',price:25,hue:290}};
const whole=n=>Number.isSafeInteger(n)&&n>=0;
let fishSaved=true;
let fishStore={coins:0,earned:0,food:0,selected:0,pets:[{kind:'gold',growth:0}]};
try{
  const raw=localStorage.getItem('recall-fish-shop');
  if(raw){
    const saved=JSON.parse(raw);
    if(whole(saved.coins)&&whole(saved.earned)&&whole(saved.food)&&Array.isArray(saved.pets)&&saved.pets.length>0&&saved.pets.length<=100&&saved.pets.every(p=>Object.hasOwn(fishKinds,p.kind)&&whole(p.growth))){
      fishStore={...saved,selected:whole(saved.selected)&&saved.selected<saved.pets.length?saved.selected:0};
    }else fishSaved=false;
  }else{
    const previous=Number(localStorage.getItem('recall-fish-points'));
    if(whole(previous)){fishStore.coins=fishStore.earned=previous;fishStore.pets[0].growth=previous;}
  }
}catch{fishSaved=false;}
function saveFish(){try{localStorage.setItem('recall-fish-shop',JSON.stringify(fishStore));fishSaved=true;}catch{fishSaved=false;}}
function earnFishCoins(points){
  fishStore.coins=Math.min(Number.MAX_SAFE_INTEGER,fishStore.coins+points);
  fishStore.earned=Math.min(Number.MAX_SAFE_INTEGER,fishStore.earned+points);saveFish();
}
function fishSize(pet=fishStore.pets[fishStore.selected]){return 100+Math.floor(200*pet.growth/(pet.growth+100));}
function shopAction(item){
  let message='';
  if(item==='feed'){
    if(!fishStore.food)return;
    fishStore.food--;const pet=fishStore.pets[fishStore.selected];pet.growth=Math.min(Number.MAX_SAFE_INTEGER,pet.growth+10);message='Yum! Your fish grew.';
  }else if(item==='food'){
    if(fishStore.coins<5)return;
    fishStore.coins-=5;fishStore.food+=3;message='Bought 3 servings of food.';
  }else if(Object.hasOwn(fishKinds,item)){
    const kind=fishKinds[item];if(fishStore.coins<kind.price||fishStore.pets.length>=100)return;
    fishStore.coins-=kind.price;fishStore.pets.push({kind:item,growth:0});fishStore.selected=fishStore.pets.length-1;message=`Welcome your new ${kind.name.toLowerCase()}!`;
  }else return;
  saveFish();fishGame();$('#shop-message').textContent=message;
  const control=document.querySelector(`[data-shop="${item}"]`);if(control&&!control.disabled)control.focus();else $('#shop-message').focus();
}
function fishGame(){
  const pet=fishStore.pets[fishStore.selected],kind=fishKinds[pet.kind];
  app.innerHTML=`<div class="narrow"><h1 class="small-title">Fish Game</h1><p class="muted">Each correct answer point earns 1 coin. Buy fish and food, then feed your fish to grow it.</p><section class="panel fish-game"><div class="fish-stats"><div><strong>${fishStore.coins}</strong><span>Coins to spend</span></div><div><strong>${fishStore.food}</strong><span>Food servings</span></div><div><strong>${fishStore.pets.length}</strong><span>Fish owned</span></div></div><label for="pet-select">Your fish</label><select id="pet-select">${fishStore.pets.map((p,i)=>`<option value="${i}" ${i===fishStore.selected?'selected':''}>${i+1}. ${fishKinds[p.kind].name} · ${fishSize(p)}% size</option>`).join('')}</select><div class="aquarium" role="img" aria-label="${kind.name}, size ${fishSize()} percent"><div class="pet-swim"><div class="pet-growth" style="--fish-size:${fishSize()/100};filter:hue-rotate(${kind.hue}deg)">${fishGraphic()}</div></div><span class="aquarium-floor" aria-hidden="true"></span></div><div class="actions"><button class="button" data-shop="feed" ${fishStore.food?'':'disabled'}>Feed fish · 1 serving</button><span>${fishSize()}% size</span></div><p id="shop-message" role="status" tabindex="-1">${fishStore.food?'Choose a fish and feed it to help it grow.':'Buy food below to feed your fish.'}</p><h2>Shop</h2><div class="fish-shop"><article><h3>Fish food</h3><p>3 servings</p><button class="secondary" data-shop="food" ${fishStore.coins>=5?'':'disabled'}>Buy food · 5 coins</button></article>${Object.entries(fishKinds).map(([id,k])=>`<article><div class="shop-fish" aria-hidden="true" style="filter:hue-rotate(${k.hue}deg)">${fishGraphic()}</div><h3>${k.name}</h3><button class="secondary" data-shop="${id}" ${fishStore.coins>=k.price&&fishStore.pets.length<100?'':'disabled'}>Buy fish · ${k.price} coins</button></article>`).join('')}</div><p class="micro">${fishSaved?'Your coins, food, fish, and sizes are saved in this browser.':'Storage is unavailable or could not be read. Changes may not survive closing the app.'}</p><p class="micro">${fishStore.earned} coins earned in total. Fish grow when fed; they never shrink.</p><a class="button" href="${quiz?'#quiz':'#setup'}">${quiz?'Return to quiz':'Earn coins'}</a></section></div>`;
  $('#pet-select').onchange=e=>{fishStore.selected=Number(e.target.value);saveFish();fishGame();$('#pet-select').focus();};
  document.querySelectorAll('[data-shop]').forEach(button=>button.onclick=()=>shopAction(button.dataset.shop));
}

let soundEnabled=true, audioContext, answerAudio;
try{soundEnabled=localStorage.getItem('recall-sound')!=='off';}catch{}
function updateSoundButton(){const button=$('#sound-toggle');button.textContent=soundEnabled?'Sound: on':'Sound: off';button.setAttribute('aria-pressed',String(soundEnabled));}
$('#sound-toggle').onclick=()=>{soundEnabled=!soundEnabled;if(!soundEnabled&&answerAudio){answerAudio.pause();answerAudio.currentTime=0;}try{localStorage.setItem('recall-sound',soundEnabled?'on':'off');}catch{}updateSoundButton();};
updateSoundButton();
async function playAnswerSound(correct){
  if(!soundEnabled)return;
  try{
    if(answerAudio){answerAudio.pause();answerAudio.currentTime=0;}
    answerAudio=new window.Audio(correct?'assets/audio/correct-tagalog.mp3':'assets/audio/wrong-tagalog.mp3');
    answerAudio.volume=0.85;
    await answerAudio.play();
    return;
  }catch{} // Use a short chime if the saved clip cannot play.
  try{
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    audioContext=audioContext||new Audio();
    if(audioContext.state==='suspended')await audioContext.resume();
    if(!soundEnabled||audioContext.state!=='running')return;
    const start=audioContext.currentTime;
    const tones=correct?[523.25,659.25,783.99]:[293.66,220];
    tones.forEach((frequency,i)=>{
      const oscillator=audioContext.createOscillator(), gain=audioContext.createGain();
      const time=start+i*0.12, duration=0.22;
      oscillator.type='sine';oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(0,time);
      gain.gain.linearRampToValueAtTime(0.12,time+0.015);
      gain.gain.exponentialRampToValueAtTime(0.001,time+duration);
      oscillator.connect(gain);gain.connect(audioContext.destination);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
      oscillator.start(time);oscillator.stop(time+duration+0.02);
    });
  }catch{} // Audio support must never interrupt answering.
}
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function grade(q,values){let used=new Set();return values.map(v=>{const i=q.answers.findIndex((a,i)=>!used.has(i)&&a.some(x=>norm(x)===norm(v))&&norm(v));if(i>=0)used.add(i);return i>=0;});}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const topics=[...new Set(QUESTIONS.map(q=>q.topic))];
function source(q){return ['REVIEWER STS','STS NEW LESSON REVIEWR','STS Presentation','STS REVIEWER NI BUSSENG'][q.source];}
function home(){setup();}
function setup(mode='mixed'){app.innerHTML=`<div class="narrow"><h1 class="small-title">STS Reviewer</h1><p class="muted">${QUESTIONS.length} questions</p><form id="setup" class="panel"><label for="mode">Type</label><select id="mode"><option value="mixed">Mixed</option><option value="identification">Identification</option><option value="enumeration">Enumeration</option></select><label for="topic">Topic</label><select id="topic"><option value="all">All topics</option>${topics.map(t=>`<option>${esc(t)}</option>`).join('')}</select><label for="count">Questions</label><select id="count"><option value="10">10</option><option value="20">20</option><option value="50">50</option><option value="100">100</option><option value="999">All</option></select><p class="muted" id="available"></p><button class="button">Start</button></form></div>`;$('#mode').value=['mixed','identification','enumeration'].includes(mode)?mode:'mixed';const pool=()=>QUESTIONS.filter(q=>($('#mode').value==='mixed'||q.type===$('#mode').value)&&($('#topic').value==='all'||q.topic===$('#topic').value));const update=()=>{$('#available').textContent=`${pool().length} available`;$('#setup button').disabled=!pool().length;};$('#mode').onchange=$('#topic').onchange=update;update();$('#setup').onsubmit=e=>{e.preventDefault();start(shuffle(pool()).slice(0,+$('#count').value));};}
function start(qs){quiz={qs,index:0,results:[],checked:false};location.hash='quiz';render();}
function fishGraphic(){return `<svg class="quiz-fish" viewBox="0 0 100 64"><path class="fish-tail" d="M35 32 7 10 7 54Z" fill="#ee9950"/><ellipse cx="58" cy="32" rx="32" ry="23" fill="#ffc56e"/><path d="M43 12Q55 0 70 11M44 52Q55 64 69 53" fill="#ee9950"/><circle cx="76" cy="26" r="4" fill="#20342d"/><path d="M76 40q6 5 11-2" fill="none" stroke="#654126" stroke-width="3" stroke-linecap="round"/><path d="m50 28 12 8-12 5" fill="#ee9950"/></svg>`;}
function fishProgress(){
  const correct=quiz.results.filter(r=>r.earned===r.total).length;
  return `<section class="fish-progress" aria-label="Correct answer progress"><div class="fish-caption"><strong>Keep swimming!</strong><span id="fish-score" aria-live="polite">${correct} of ${quiz.qs.length} correct</span></div><div class="fish-tank" aria-hidden="true"><div class="fish-swimmer" style="--distance:${correct/quiz.qs.length*100}%">${fishGraphic()}</div><span class="tank-plant plant-one">〰</span><span class="tank-plant plant-two">〰</span><span class="tank-finish">★</span></div><p class="micro">Each fully correct answer moves your fish closer to the star.</p></section>`;
}
function updateFish(){
  const correct=quiz.results.filter(r=>r.earned===r.total).length;
  const swimmer=$('.fish-swimmer');
  if(!swimmer)return;
  swimmer.style.setProperty('--distance',`${correct/quiz.qs.length*100}%`);
  $('#fish-score').textContent=`${correct} of ${quiz.qs.length} correct`;
}
function question(){if(!quiz){location.hash='setup';return;}if(quiz.index>=quiz.qs.length){location.hash='results';return;}const q=quiz.qs[quiz.index];app.innerHTML=`<div class="narrow"><div class="section-head"><a class="backlink" href="#home">← Exit</a><span class="muted">Question ${quiz.index+1} of ${quiz.qs.length}</span></div><progress value="${quiz.index}" max="${quiz.qs.length}" aria-label="Quiz progress"></progress>${fishProgress()}<p class="eyebrow">${esc(q.topic)} · ${q.type}</p><h2 class="question">${esc(q.prompt)}</h2><p class="muted">${q.type==='enumeration'?`Enter ${q.answers.length} answers, any order.`:'Identify the term.'}</p><form id="answer-form"><div class="pen-help" id="pen-help"><strong>Write your answer with your pen</strong><p>Write in the answer box using your tablet’s handwriting-to-text feature. Wait for your writing to become text, review it, then tap Check.</p><details><summary>Set up handwriting</summary><p>iPad: enable Scribble in Settings → Apple Pencil. Samsung: enable S Pen to text in Settings → Advanced features → S Pen. On other tablets, choose handwriting in your on-screen keyboard.</p><p>This mode needs your device’s handwriting-to-text support. You can still type if it isn’t available.</p></details></div><div class="answers">${q.answers.map((a,i)=>`<label class="answer-row"><span>${q.type==='enumeration'?String(i+1).padStart(2,'0'):'Aa'}</span><textarea rows="1" aria-label="Answer ${i+1}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${q.type==='enumeration'?'Your answer '+(i+1):'Your answer…'}" maxlength="300"></textarea></label>`).join('')}</div><div id="feedback" aria-live="polite"></div><div class="actions"><button class="button" id="check">Check</button><button type="button" class="secondary" id="skip">Skip</button></div></form><p class="micro">From ${esc(source(q))}</p></div>`;if(quiz.checked){showFeedback(quiz.results[quiz.index]);}$('#answer-form').onsubmit=e=>{e.preventDefault();if(quiz.checked){next();return;}check();};$('#skip').onclick=()=>check(true);document.querySelectorAll('.answers textarea').forEach(field=>field.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('#answer-form').requestSubmit();}}));}
function check(skip=false){if(quiz.checked)return;const q=quiz.qs[quiz.index], values=[...document.querySelectorAll('.answers textarea')].map(x=>skip?'':x.value.trim());const matches=grade(q,values);const r={id:q.id,values,matches,earned:matches.filter(Boolean).length,total:q.answers.length};quiz.results.push(r);quiz.checked=true;if(r.earned)earnFishCoins(r.earned);showFeedback(r);if(!skip)void playAnswerSound(r.earned===r.total);}
function showFeedback(r){const q=quiz.qs[quiz.index];document.querySelectorAll('.answers textarea').forEach((x,i)=>{x.value=r.values[i];x.disabled=true;x.parentElement.classList.add(r.matches[i]?'correct':'incorrect');});$('#feedback').innerHTML=`<div class="feedback"><strong>${r.earned===r.total?'Correct':'Score'} ${r.earned}/${r.total}</strong><p>Answer: ${q.answers.map(a=>esc(a[0])).join(' · ')}</p><span class="micro">${r.earned?`+${r.earned} fish coins · `:""}Check the notes for alternate wording.</span></div>`;$('#check').textContent=quiz.index===quiz.qs.length-1?'Results':'Next';$('#skip').hidden=true;updateFish();}
function next(){quiz.index++;quiz.checked=false;if(quiz.index===quiz.qs.length){const entry={date:new Date().toISOString(),earned:quiz.results.reduce((s,r)=>s+r.earned,0),total:quiz.results.reduce((s,r)=>s+r.total,0),questions:quiz.qs.length};history.unshift(entry);history=history.slice(0,100);try{localStorage.setItem('recall-history',JSON.stringify(history));}catch{}location.hash='results';}else question();window.scrollTo(0,0);}
function results(){if(!quiz||quiz.index!==quiz.qs.length){location.hash='home';return;}const earned=quiz.results.reduce((s,r)=>s+r.earned,0),total=quiz.results.reduce((s,r)=>s+r.total,0),missed=quiz.qs.filter((q,i)=>quiz.results[i].earned<quiz.results[i].total);app.innerHTML=`<div class="narrow"><h1 class="small-title">Results</h1><div class="score panel"><strong>${Math.round(earned/total*100)}<small>%</small></strong><p>${earned} of ${total} answer points · ${quiz.qs.length} questions</p></div><div class="actions">${missed.length?'<button id="retry" class="button">Retry missed</button>':''}<a class="secondary" href="#setup">New session</a></div><h2>Answers</h2>${quiz.qs.map((q,i)=>{const r=quiz.results[i];return `<details class="review"><summary>${r.earned===r.total?'✓':'↻'} ${esc(q.prompt)} <span>${r.earned}/${r.total}</span></summary><p>Your answers: ${r.values.map(v=>esc(v||'(blank)')).join(' · ')}</p><p><strong>Answer key:</strong> ${q.answers.map(a=>esc(a[0])).join(' · ')}</p><p class="micro">${esc(source(q))}</p></details>`;}).join('')}</div>`;if($('#retry'))$('#retry').onclick=()=>start(shuffle(missed));}
function notes(){app.innerHTML=`<h1 class="small-title">Notes</h1><div class="notes-layout"><aside class="panel">${NOTES.map((n,i)=>`<button class="note-tab ${i===noteIndex?'selected':''}" data-note="${i}"><span>0${i+1}</span>${esc(n.title)}<small>${n.pages.length} pages</small></button>`).join('')}</aside><section class="panel note-content"><div class="section-head"><h2>${esc(NOTES[noteIndex].title)}</h2><button type="button" class="secondary" id="pdf-toggle" aria-expanded="false" aria-controls="pdf-viewer">View PDF</button></div><div id="pdf-viewer" hidden><iframe id="pdf-frame" title="${esc(NOTES[noteIndex].title)} PDF" data-src="${esc(encodeURI(NOTES[noteIndex].file))}" ></iframe></div><label for="search">Search</label><input type="search" id="search" placeholder="Search notes…"><p class="micro">For the original layout, open the PDF.</p><div id="note-pages"></div></section></div>`;$('#pdf-toggle').onclick=()=>{const viewer=$('#pdf-viewer'),button=$('#pdf-toggle'),frame=$('#pdf-frame');viewer.hidden=!viewer.hidden;button.setAttribute('aria-expanded',String(!viewer.hidden));button.textContent=viewer.hidden?'View PDF':'Hide PDF';if(!viewer.hidden&&!frame.hasAttribute('src'))frame.src=frame.dataset.src;};const show=()=>{const term=$('#search').value.toLowerCase();const pages=NOTES[noteIndex].pages.map((p,i)=>({p,i})).filter(x=>x.p.toLowerCase().includes(term));$('#note-pages').innerHTML=pages.length?pages.map(x=>`<article class="note-page"><p class="eyebrow">PAGE ${x.i+1}</p><pre>${esc(x.p)}</pre></article>`).join(''):'<p>No matching pages. Try another keyword.</p>';};show();$('#search').oninput=show;document.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>{noteIndex=+b.dataset.note;notes();});}
function progress(){app.innerHTML=`<div class="narrow"><h1 class="small-title">Progress</h1><p class="muted">Saved on this device.</p>${history.length?`<div class="panel"><h2>${history.length} sessions completed</h2>${history.map(h=>`<div class="history-row"><div><strong>${new Date(h.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</strong><p>${h.questions} questions · ${h.earned}/${h.total} points</p></div><strong>${Math.round(h.earned/h.total*100)}%</strong></div>`).join('')}</div>`:'<div class="panel empty"><h2>No results yet.</h2><a href="#setup" class="button">Start</a></div>'}</div>`;}
function render(){const [route,mode]=(location.hash.slice(1)||'home').split('/');document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+route));({home,setup:()=>setup(mode),quiz:question,results,notes,progress,fish:fishGame}[route]||home)();}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});render();
