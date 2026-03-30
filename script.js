// ===================== SCORE & POPUP =====================
let totalScore = 0;
function addScore(n) {
  totalScore += n;
  const ts = document.getElementById('totalScore');
  const fs = document.getElementById('footerScore');
  if(ts) ts.textContent = totalScore;
  if(fs) fs.textContent = totalScore;
}
function showPopup(icon, text) {
  const p = document.getElementById('popup');
  if(!p) return;
  document.getElementById('popupIcon').textContent = icon;
  document.getElementById('popupText').textContent = text;
  p.classList.add('show');
  setTimeout(() => p.classList.remove('show'), 2500);
}
function spawnFloat(el, text) {
  const r = el.getBoundingClientRect();
  const d = document.createElement('div');
  d.textContent = text;
  d.style.cssText = `position:fixed;left:${r.left+r.width/2+(Math.random()-.5)*50}px;top:${r.top+10}px;color:#181712;font-family:'DM Sans',system-ui,sans-serif;font-size:14px;font-weight:700;pointer-events:none;z-index:9999;animation:floatUp 0.8s ease forwards`;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 800);
}

// ===================== LAZY GAME INIT SYSTEM =====================
// Games register an init function. The modal calls initGame(id) when opened.
const _gameInits = {};
const _gameInited = new Set();
function registerGame(id, fn) { _gameInits[id] = fn; }
function initGame(id) {
  if (_gameInited.has(id)) return;
  if (_gameInits[id]) {
    try { _gameInits[id](); } catch(e) { console.error('Game init error ['+id+']:', e); }
    _gameInited.add(id);
  }
}

// ===================== 01 CLICKER =====================
registerGame('clicker', () => {
  let cClicks=0,cRunning=false,cSecs=10,cBest=0,cThisSec=0,cTimer,cCPS;
  const cBtn=document.getElementById('clickerBtn');
  const cCountEl=document.getElementById('clickCount'),cCPSEl=document.getElementById('clickCPS'),cBestEl=document.getElementById('clickBest');
  const cTimerEl=document.getElementById('clickerTimer'),cBar=document.getElementById('clickerBar');
  const emojis=['💥','⚡','🔥','✨','💫','🌟'];
  cBtn.addEventListener('click',()=>{
    if(!cRunning){
      cRunning=true;cSecs=10;cClicks=0;cThisSec=0;cBar.style.width='0%';
      cTimer=setInterval(()=>{
        cSecs--;cTimerEl.textContent=cSecs>0?`⏱ ${cSecs}s LEFT`:"TIME'S UP!";
        if(cSecs<=0){
          clearInterval(cTimer);clearInterval(cCPS);cRunning=false;
          const cps=(cClicks/10).toFixed(1);cCPSEl.textContent=cps;
          if(parseFloat(cps)>cBest){cBest=parseFloat(cps);cBestEl.textContent=cBest;showPopup('🏆',`NEW BEST: ${cBest} CPS!`);}
          else showPopup('💥',`${cClicks} CLICKS!`);
          addScore(cClicks*2);cTimerEl.textContent=`✅ ${cClicks} CLICKS — ${cps}/sec`;
        }
      },1000);
      cCPS=setInterval(()=>{cCPSEl.textContent=cThisSec;cThisSec=0;},1000);
    }
    cClicks++;cThisSec++;cCountEl.textContent=cClicks;
    cBar.style.width=Math.min((cClicks/(10*8))*100,100)+'%';
    cBtn.querySelector('.click-inner').textContent=emojis[Math.floor(Math.random()*emojis.length)];
    spawnFloat(cBtn,'+1');
  });
  document.getElementById('clickerReset').addEventListener('click',()=>{
    clearInterval(cTimer);clearInterval(cCPS);
    cClicks=0;cRunning=false;cSecs=10;cThisSec=0;
    cCountEl.textContent='0';cCPSEl.textContent='0';cBar.style.width='0%';
    cTimerEl.textContent='CLICK TO START — 10 SEC CHALLENGE';
  });
});

// ===================== 02 SNAKE =====================
registerGame('snake', () => {
  const sc=document.getElementById('snakeCanvas'),sctx=sc.getContext('2d');
  const SG=20,SCOLS=sc.width/SG,SROWS=sc.height/SG;
  let sSnake,sDir,sNextDir,sFood,sRunning=false,sScore=0,sHigh=0,sLastStep=0;
  function sInit(){sSnake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];sDir={x:1,y:0};sNextDir={x:1,y:0};sScore=0;document.getElementById('snakeScore').textContent=0;sPlaceFood();}
  function sPlaceFood(){do{sFood={x:Math.floor(Math.random()*SCOLS),y:Math.floor(Math.random()*SROWS)}}while(sSnake.some(s=>s.x===sFood.x&&s.y===sFood.y));}
  function sDraw(){
    sctx.fillStyle='#08080f';sctx.fillRect(0,0,sc.width,sc.height);
    sctx.fillStyle='rgba(255,255,255,0.03)';
    for(let x=0;x<SCOLS;x++)for(let y=0;y<SROWS;y++){sctx.beginPath();sctx.arc(x*SG+SG/2,y*SG+SG/2,1,0,Math.PI*2);sctx.fill();}
    const p=0.5+0.5*Math.abs(Math.sin(Date.now()/300));
    sctx.save();sctx.shadowColor='#00FF87';sctx.shadowBlur=8+14*p;sctx.fillStyle=`rgba(0,255,135,${0.7+0.3*p})`;
    sctx.beginPath();sctx.arc(sFood.x*SG+SG/2,sFood.y*SG+SG/2,6+2*p,0,Math.PI*2);sctx.fill();sctx.restore();
    sSnake.forEach((seg,i)=>{
      const r=i/sSnake.length;
      sctx.save();sctx.shadowColor='#FF3CAC';sctx.shadowBlur=i===0?18:7;
      sctx.fillStyle=i===0?'#FF3CAC':`hsl(${320+r*40},100%,${60-r*20}%)`;
      const sz=i===0?SG-2:SG-4,of=i===0?1:2;
      sctx.beginPath();sctx.roundRect(seg.x*SG+of,seg.y*SG+of,sz,sz,i===0?6:4);sctx.fill();sctx.restore();
    });
  }
  function sStep(){
    sDir={...sNextDir};const h={x:sSnake[0].x+sDir.x,y:sSnake[0].y+sDir.y};
    if(h.x<0||h.x>=SCOLS||h.y<0||h.y>=SROWS||sSnake.some(s=>s.x===h.x&&s.y===h.y)){return sGameOver();}
    sSnake.unshift(h);
    if(h.x===sFood.x&&h.y===sFood.y){sScore+=10;document.getElementById('snakeScore').textContent=sScore;addScore(10);sPlaceFood();if(sScore%50===0)showPopup('🐍',`${sScore} PTS!`);}
    else sSnake.pop();
  }
  function sGameOver(){
    sRunning=false;
    if(sScore>sHigh){sHigh=sScore;document.getElementById('snakeHigh').textContent=sHigh;showPopup('🏆',`HIGH SCORE: ${sHigh}!`);}
    sDraw();sctx.fillStyle='rgba(0,0,0,0.75)';sctx.fillRect(0,0,sc.width,sc.height);
    sctx.fillStyle='#FF3CAC';sctx.font='bold 36px Boogaloo';sctx.textAlign='center';sctx.fillText('GAME OVER!',sc.width/2,sc.height/2-18);
    sctx.fillStyle='white';sctx.font='18px Nunito';sctx.fillText(`Score: ${sScore}`,sc.width/2,sc.height/2+18);
    sctx.fillText('Press START again',sc.width/2,sc.height/2+46);
    document.getElementById('snakeStart').textContent='▶ PLAY AGAIN';
  }
  function sLoop(ts){if(!sRunning)return;if(ts-sLastStep>=120){sStep();sLastStep=ts;}sDraw();requestAnimationFrame(sLoop);}
  function sIdleLoop(){if(sRunning)return;sDraw();requestAnimationFrame(sIdleLoop);}
  document.getElementById('snakeStart').addEventListener('click',()=>{
    if(sRunning)return;sInit();sRunning=true;sLastStep=0;
    document.getElementById('snakeStart').textContent='⏸ RUNNING';requestAnimationFrame(sLoop);
  });
  document.querySelectorAll('.dpad-btn').forEach(b=>b.addEventListener('click',()=>{
    const m={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
    const d=m[b.dataset.dir];if(d&&(d.x!==-sDir.x||d.y!==-sDir.y))sNextDir=d;
  }));
  document.addEventListener('keydown',e=>{
    const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};
    if(m[e.key]){e.preventDefault();const d=m[e.key];if(d.x!==-sDir.x||d.y!==-sDir.y)sNextDir=d;}
  });
  sInit();requestAnimationFrame(sIdleLoop);
});

// ===================== 03 MEMORY =====================
registerGame('memory', () => {
  const MEM_E=['🎮','🎯','🎪','🎨','🎭','🎬','🎤','🎸'];
  let mFlipped=[],mMatched=0,mMoves=0,mLocked=false,mBest=null;
  function buildMem(){
    const g=document.getElementById('memoryGrid');g.innerHTML='';
    mFlipped=[];mMatched=0;mMoves=0;mLocked=false;
    document.getElementById('memoryMoves').textContent=0;document.getElementById('memoryMatches').textContent=0;
    [...MEM_E,...MEM_E].sort(()=>Math.random()-.5).forEach(em=>{
      const c=document.createElement('div');c.className='mem-card';c.dataset.em=em;
      c.innerHTML=`<div class="front">❓</div><div class="back">${em}</div>`;
      c.addEventListener('click',()=>{
        if(mLocked||c.classList.contains('flipped')||c.classList.contains('matched'))return;
        c.classList.add('flipped');mFlipped.push(c);
        if(mFlipped.length===2){
          mLocked=true;mMoves++;document.getElementById('memoryMoves').textContent=mMoves;
          const[a,b]=mFlipped;
          if(a.dataset.em===b.dataset.em){
            setTimeout(()=>{a.classList.add('matched');b.classList.add('matched');mMatched++;document.getElementById('memoryMatches').textContent=mMatched;addScore(20);mFlipped=[];mLocked=false;
              if(mMatched===MEM_E.length){if(mBest===null||mMoves<mBest){mBest=mMoves;document.getElementById('memoryBest').textContent=mBest;showPopup('🧠',`CLEARED IN ${mMoves} MOVES!`);}else showPopup('🎉',`WIN! ${mMoves} MOVES`);addScore(100);}
            },400);
          }else{setTimeout(()=>{a.classList.remove('flipped');b.classList.remove('flipped');mFlipped=[];mLocked=false;},900);}
        }
      });g.appendChild(c);
    });
  }
  document.getElementById('memoryReset').addEventListener('click',buildMem);buildMem();
});

// ===================== 04 WHACK =====================
registerGame('whack', () => {
  let wScore=0,wBest=0,wTimeLeft=30,wRunning=false,wMoleTO=null,wCountTO=null,wActive=null;
  const holes=document.querySelectorAll('.hole');
  holes.forEach(h=>h.addEventListener('click',()=>{
    if(!wRunning||!h.classList.contains('up'))return;
    h.classList.remove('up');clearTimeout(wMoleTO);
    wScore++;document.getElementById('whackScore').textContent=wScore;addScore(5);spawnFloat(h,'+5');popMole();
  }));
  function popMole(){
    if(!wRunning)return;if(wActive)wActive.classList.remove('up');
    const idx=Math.floor(Math.random()*holes.length);wActive=holes[idx];wActive.classList.add('up');
    const spd=Math.max(400,1000-wScore*15);
    wMoleTO=setTimeout(()=>{if(wActive)wActive.classList.remove('up');popMole();},spd);
  }
  document.getElementById('whackStart').addEventListener('click',()=>{
    if(wRunning)return;wScore=0;wTimeLeft=30;wRunning=true;
    document.getElementById('whackScore').textContent=0;document.getElementById('whackTimer').textContent=30;
    document.getElementById('whackStart').textContent='⏸ RUNNING';popMole();
    wCountTO=setInterval(()=>{
      wTimeLeft--;document.getElementById('whackTimer').textContent=wTimeLeft;
      if(wTimeLeft<=0){
        clearInterval(wCountTO);clearTimeout(wMoleTO);wRunning=false;if(wActive)wActive.classList.remove('up');
        if(wScore>wBest){wBest=wScore;document.getElementById('whackBest').textContent=wBest;showPopup('🐹',`NEW RECORD: ${wBest}!`);}
        else showPopup('🔨',`${wScore} MOLES!`);document.getElementById('whackStart').textContent='▶ PLAY AGAIN';
      }
    },1000);
  });
});

// ===================== 05 TYPE RACER =====================
registerGame('typer', () => {
  const PHRASES=['the quick brown fox jumps over the lazy dog','pack my box with five dozen liquor jugs','sphinx of black quartz judge my vow','how vexingly quick daft zebras jump','javascript is the language of the web','wilapple dot com is the most fun site on the internet','the five boxing wizards jump quickly','crazy fredrick bought many very exquisite opal jewels'];
  let tPhrase='',tTyped='',tStart=null,tBest=0,tActive=false,tBarInt=null;
  const tIn=document.getElementById('typerInput'),tPr=document.getElementById('typerPrompt'),tBar=document.getElementById('typerTimerBar');
  function loadPhrase(){
    tPhrase=PHRASES[Math.floor(Math.random()*PHRASES.length)];
    tTyped='';tStart=null;tActive=true;tIn.value='';tIn.disabled=false;
    clearInterval(tBarInt);tBar.style.width='100%';renderTyper();
    document.getElementById('typerWPM').textContent=0;document.getElementById('typerAcc').textContent=100;
  }
  function renderTyper(){
    tPr.innerHTML=tPhrase.split('').map((ch,i)=>{
      if(i<tTyped.length)return`<span class="${tTyped[i]===ch?'c':'w'}">${ch}</span>`;
      if(i===tTyped.length)return`<span class="cur">${ch}</span>`;
      return`<span>${ch}</span>`;
    }).join('');
  }
  tIn.addEventListener('input',()=>{
    if(!tActive)return;
    if(!tStart){tStart=Date.now();let el=0;tBarInt=setInterval(()=>{el+=100;tBar.style.width=Math.max(0,100-(el/60000)*100)+'%';if(el>=60000||!tActive)clearInterval(tBarInt);},100);}
    tTyped=tIn.value;renderTyper();
    const mins=(Date.now()-tStart)/60000;const wpm=mins>0?Math.round(tTyped.trim().split(' ').length/mins):0;
    document.getElementById('typerWPM').textContent=wpm;
    let cor=0;for(let i=0;i<tTyped.length;i++)if(tTyped[i]===tPhrase[i])cor++;
    document.getElementById('typerAcc').textContent=tTyped.length>0?Math.round(cor/tTyped.length*100):100;
    if(tTyped===tPhrase){
      tActive=false;tIn.disabled=true;clearInterval(tBarInt);tBar.style.width='0%';
      const fw=Math.round(tPhrase.split(' ').length/((Date.now()-tStart)/60000));
      document.getElementById('typerWPM').textContent=fw;addScore(fw);
      if(fw>tBest){tBest=fw;document.getElementById('typerBest').textContent=tBest;showPopup('⌨️',`${fw} WPM! BEST!`);}
      else showPopup('✅',`DONE! ${fw} WPM`);
    }
  });
  document.getElementById('typerReset').addEventListener('click',loadPhrase);loadPhrase();
});

// ===================== 06 COLOR GUESS =====================
registerGame('color', () => {
  let cgScore=0,cgStreak=0,cgBest=0,cgAnswer='';
  function rHex(){return'#'+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0').toUpperCase();}
  function buildColor(){
    cgAnswer=rHex();const fakes=[rHex(),rHex(),rHex()];const all=[...fakes,cgAnswer].sort(()=>Math.random()-.5);
    document.getElementById('colorSwatch').style.background=cgAnswer;document.getElementById('colorFeedback').textContent='';
    const ch=document.getElementById('colorChoices');ch.innerHTML='';
    all.forEach(h=>{
      const b=document.createElement('button');b.className='color-choice';b.textContent=h;
      b.addEventListener('click',()=>{
        ch.querySelectorAll('.color-choice').forEach(x=>x.style.pointerEvents='none');
        const fb=document.getElementById('colorFeedback');
        if(h===cgAnswer){b.classList.add('right');cgScore+=10+cgStreak*2;cgStreak++;document.getElementById('colorScore').textContent=cgScore;document.getElementById('colorStreak').textContent=cgStreak;if(cgScore>cgBest){cgBest=cgScore;document.getElementById('colorBest').textContent=cgBest;}fb.textContent='✅ CORRECT!';fb.style.color='var(--green)';addScore(10);}
        else{b.classList.add('wrong');ch.querySelectorAll('.color-choice').forEach(x=>{if(x.textContent===cgAnswer)x.classList.add('right');});cgStreak=0;document.getElementById('colorStreak').textContent=0;fb.textContent=`❌ WAS ${cgAnswer}`;fb.style.color='#ff5555';}
        setTimeout(buildColor,1200);
      });ch.appendChild(b);
    });
  }
  buildColor();
});

// ===================== 07 REACTION =====================
registerGame('reaction', () => {
  let rState='idle',rTO=null,rStart=null,rTimes=[],rBestMs=null;
  const rPad=document.getElementById('reactionPad'),rMsg=document.getElementById('reactionMsg');
  rPad.addEventListener('click',()=>{
    if(rState==='idle'){
      rState='waiting';rPad.classList.add('waiting');rMsg.textContent='WAIT FOR GREEN...';
      rTO=setTimeout(()=>{rState='go';rPad.classList.remove('waiting');rPad.classList.add('go');rMsg.textContent='CLICK NOW!!!';rStart=Date.now();},1500+Math.random()*3500);
    }else if(rState==='waiting'){
      clearTimeout(rTO);rState='idle';rPad.classList.remove('waiting');rMsg.textContent='😅 TOO EARLY! TRY AGAIN';
    }else if(rState==='go'){
      const ms=Date.now()-rStart;rState='idle';rPad.classList.remove('go');rTimes.push(ms);
      const avg=Math.round(rTimes.reduce((a,b)=>a+b,0)/rTimes.length);
      document.getElementById('reactionLast').textContent=ms;document.getElementById('reactionAvg').textContent=avg;
      if(rBestMs===null||ms<rBestMs){rBestMs=ms;document.getElementById('reactionBest').textContent=ms;if(rTimes.length>1)showPopup('⚡',`NEW BEST: ${ms}ms!`);}
      const rat=ms<200?'⚡INSANE':ms<300?'🔥FAST':ms<500?'👍GOOD':'🐢SLOW';
      rMsg.textContent=`${ms}ms — ${rat} — CLICK AGAIN`;addScore(Math.max(1,Math.round(500/ms*10)));
    }
  });
});

// ===================== 08 PONG =====================
registerGame('pong', () => {
  const pc=document.getElementById('pongCanvas'),pctx=pc.getContext('2d');
  const PW=pc.width,PH=pc.height,PAD_H=65,PAD_W=10,BALL_R=7;
  let pRunning=false,pKeys={};
  let pBall={x:PW/2,y:PH/2,vx:4,vy:3},pPlayer={y:PH/2-PAD_H/2},pAI={y:PH/2-PAD_H/2},pScore={p:0,a:0};
  function pReset(dir=1){const vy=(Math.random()*3-1.5);pBall={x:PW/2,y:PH/2,vx:(4+Math.random())*dir,vy:Math.abs(vy)<1?(vy<0?-1:1):vy};}
  function pDraw(){
    pctx.fillStyle='#08080f';pctx.fillRect(0,0,PW,PH);
    pctx.setLineDash([7,7]);pctx.strokeStyle='rgba(255,255,255,0.08)';pctx.lineWidth=2;
    pctx.beginPath();pctx.moveTo(PW/2,0);pctx.lineTo(PW/2,PH);pctx.stroke();pctx.setLineDash([]);
    pctx.save();pctx.shadowColor='#FF3CAC';pctx.shadowBlur=18;pctx.fillStyle='#FF3CAC';pctx.beginPath();pctx.arc(pBall.x,pBall.y,BALL_R,0,Math.PI*2);pctx.fill();pctx.restore();
    pctx.save();pctx.shadowColor='#00F0FF';pctx.shadowBlur=14;pctx.fillStyle='#00F0FF';pctx.beginPath();pctx.roundRect(8,pPlayer.y,PAD_W,PAD_H,4);pctx.fill();pctx.restore();
    pctx.save();pctx.shadowColor='#FFE500';pctx.shadowBlur=14;pctx.fillStyle='#FFE500';pctx.beginPath();pctx.roundRect(PW-PAD_W-8,pAI.y,PAD_W,PAD_H,4);pctx.fill();pctx.restore();
    pctx.fillStyle='rgba(255,255,255,0.18)';pctx.font='bold 30px Boogaloo';pctx.textAlign='center';
    pctx.fillText(pScore.p,PW/2-55,38);pctx.fillText(pScore.a,PW/2+55,38);
  }
  function pUpdate(){
    if(!pRunning)return;const sp=6;
    if(pKeys['ArrowUp']||pKeys['w']||pKeys['W'])pPlayer.y=Math.max(0,pPlayer.y-sp);
    if(pKeys['ArrowDown']||pKeys['s']||pKeys['S'])pPlayer.y=Math.min(PH-PAD_H,pPlayer.y+sp);
    const ac=pAI.y+PAD_H/2;
    if(ac<pBall.y-4)pAI.y=Math.min(PH-PAD_H,pAI.y+3.8);else if(ac>pBall.y+4)pAI.y=Math.max(0,pAI.y-3.8);
    pBall.x+=pBall.vx;pBall.y+=pBall.vy;
    if(pBall.y-BALL_R<0){pBall.y=BALL_R;pBall.vy*=-1;}if(pBall.y+BALL_R>PH){pBall.y=PH-BALL_R;pBall.vy*=-1;}
    if(pBall.x-BALL_R<8+PAD_W&&pBall.y>pPlayer.y&&pBall.y<pPlayer.y+PAD_H&&pBall.vx<0){pBall.vx*=-1.05;pBall.vy+=(pBall.y-(pPlayer.y+PAD_H/2))*0.1;}
    if(pBall.x+BALL_R>PW-PAD_W-8&&pBall.y>pAI.y&&pBall.y<pAI.y+PAD_H&&pBall.vx>0){pBall.vx*=-1.05;pBall.vy+=(pBall.y-(pAI.y+PAD_H/2))*0.1;}
    pBall.vx=Math.max(-12,Math.min(12,pBall.vx));pBall.vy=Math.max(-10,Math.min(10,pBall.vy));
    if(pBall.x<0){pScore.a++;document.getElementById('pongAI').textContent=pScore.a;pReset(1);}
    if(pBall.x>PW){pScore.p++;document.getElementById('pongPlayer').textContent=pScore.p;addScore(20);if(pScore.p%3===0)showPopup('🏓',`${pScore.p} POINTS!`);pReset(-1);}
    pDraw();requestAnimationFrame(pUpdate);
  }
  document.getElementById('pongStart').addEventListener('click',()=>{
    if(pRunning){pRunning=false;document.getElementById('pongStart').textContent='▶ RESUME';return;}
    pRunning=true;pScore={p:0,a:0};document.getElementById('pongPlayer').textContent=0;document.getElementById('pongAI').textContent=0;
    document.getElementById('pongStart').textContent='⏸ PAUSE';pReset(1);requestAnimationFrame(pUpdate);
  });
  document.addEventListener('keydown',e=>{pKeys[e.key]=true;});
  document.addEventListener('keyup',e=>{pKeys[e.key]=false;});
  pDraw();
});

// ===================== 09 MATH BLITZ =====================
registerGame('math', () => {
  let mbScore=0,mbStreak=0,mbTimer=30,mbRunning=false,mbTO=null,mbAnswer=0,mbLocked=false;
  function mbGen(){
    const ops=['+','-','×'];const op=ops[Math.floor(Math.random()*ops.length)];
    let a,b,ans;
    if(op==='+'){a=Math.floor(Math.random()*50)+1;b=Math.floor(Math.random()*50)+1;ans=a+b;}
    else if(op==='-'){a=Math.floor(Math.random()*50)+20;b=Math.floor(Math.random()*a)+1;ans=a-b;}
    else{a=Math.floor(Math.random()*12)+1;b=Math.floor(Math.random()*12)+1;ans=a*b;}
    mbAnswer=ans;document.getElementById('mathQuestion').textContent=`${a} ${op} ${b} = ?`;
    const wrong=[ans+Math.floor(Math.random()*10)+1,ans-Math.floor(Math.random()*10)-1,ans+Math.floor(Math.random()*20)+5];
    const choices=[ans,...wrong.map(w=>Math.max(0,w))].sort(()=>Math.random()-.5);
    const g=document.getElementById('mathChoices');g.innerHTML='';mbLocked=false;
    choices.forEach(c=>{
      const b=document.createElement('button');b.className='choice-btn';b.textContent=c;
      b.addEventListener('click',()=>{
        if(mbLocked||!mbRunning)return;mbLocked=true;
        if(c===mbAnswer){b.classList.add('right');mbScore+=10+mbStreak*2;mbStreak++;document.getElementById('mathScore').textContent=mbScore;document.getElementById('mathStreak').textContent=mbStreak;addScore(10);setTimeout(mbGen,400);}
        else{b.classList.add('wrong');g.querySelectorAll('.choice-btn').forEach(x=>{if(parseInt(x.textContent)===mbAnswer)x.classList.add('right');});mbStreak=0;document.getElementById('mathStreak').textContent=0;setTimeout(mbGen,800);}
      });g.appendChild(b);
    });
  }
  document.getElementById('mathStart').addEventListener('click',()=>{
    if(mbRunning)return;mbScore=0;mbStreak=0;mbTimer=30;mbRunning=true;
    document.getElementById('mathScore').textContent=0;document.getElementById('mathStreak').textContent=0;
    document.getElementById('mathStart').textContent='⏸ RUNNING';mbGen();
    mbTO=setInterval(()=>{mbTimer--;document.getElementById('mathTimer').textContent=mbTimer;
      if(mbTimer<=0){clearInterval(mbTO);mbRunning=false;document.getElementById('mathQuestion').textContent="TIME'S UP!";document.getElementById('mathChoices').innerHTML='';showPopup('🧮',`MATH SCORE: ${mbScore}`);document.getElementById('mathStart').textContent='▶ PLAY AGAIN';}
    },1000);
  });
});

// ===================== 10 SCRAMBLE =====================
registerGame('scramble', () => {
  const WORDS=[{w:'JAVASCRIPT',h:'A programming language'},{w:'WEBSITE',h:'Pages on the internet'},{w:'KEYBOARD',h:'You type on it'},{w:'MONITOR',h:'The screen'},{w:'BROWSER',h:'Chrome, Firefox...'},{w:'NETWORK',h:'Computers connected'},{w:'PROGRAM',h:'Set of instructions'},{w:'FUNCTION',h:'Reusable code block'},{w:'VARIABLE',h:'Stores a value'},{w:'WILAPPLE',h:'The best website'},{w:'PIXEL',h:'Tiny screen dot'},{w:'SERVER',h:'Hosts websites'},{w:'DOMAIN',h:'Website address'},{w:'BUTTON',h:'You click it'},{w:'CANVAS',h:'HTML drawing surface'}];
  let scScore=0,scStreak=0,scBest=0,scCurrent=null;
  function loadScramble(){
    scCurrent=WORDS[Math.floor(Math.random()*WORDS.length)];
    const sh=scCurrent.w.split('').sort(()=>Math.random()-.5).join('');
    document.getElementById('scrambleWord').textContent=sh;document.getElementById('scrambleHint').textContent=`💡 HINT: ${scCurrent.h}`;
    document.getElementById('scrambleInput').value='';document.getElementById('scrambleFeedback').textContent='';
  }
  document.getElementById('scrambleCheck').addEventListener('click',()=>{
    const ans=document.getElementById('scrambleInput').value.trim().toUpperCase();const fb=document.getElementById('scrambleFeedback');
    if(ans===scCurrent.w){fb.textContent='✅ CORRECT!';fb.style.color='var(--green)';scScore+=10+scStreak*3;scStreak++;document.getElementById('scrambleScore').textContent=scScore;document.getElementById('scrambleStreak').textContent=scStreak;if(scScore>scBest){scBest=scScore;document.getElementById('scrambleBest').textContent=scBest;}addScore(15);setTimeout(loadScramble,600);}
    else{fb.textContent='❌ NOPE! TRY AGAIN';fb.style.color='#ff5555';scStreak=0;document.getElementById('scrambleStreak').textContent=0;}
  });
  document.getElementById('scrambleSkip').addEventListener('click',()=>{document.getElementById('scrambleFeedback').textContent=`ANSWER: ${scCurrent.w}`;scStreak=0;document.getElementById('scrambleStreak').textContent=0;setTimeout(loadScramble,800);});
  loadScramble();
});

// ===================== 11 SIMON SAYS =====================
registerGame('simon', () => {
  let simonSeq=[],simonInput=[],simonPlaying=false,simonBest=0,simonPlayerTurn=false;
  const simonColors=['red','blue','green','yellow'];
  const simonBtns=document.querySelectorAll('.simon-btn');
  function simonLight(color,dur=400){
    return new Promise(res=>{const b=document.querySelector(`.simon-btn[data-color="${color}"]`);b.classList.add('lit');setTimeout(()=>{b.classList.remove('lit');setTimeout(res,100);},dur);});
  }
  async function simonPlaySeq(){
    simonPlayerTurn=false;document.getElementById('simonMsg').textContent='WATCH...';
    for(const c of simonSeq){await simonLight(c,500);await new Promise(r=>setTimeout(r,150));}
    simonPlayerTurn=true;simonInput=[];document.getElementById('simonMsg').textContent=`YOUR TURN — ${simonSeq.length} STEPS`;
  }
  simonBtns.forEach(b=>b.addEventListener('click',async()=>{
    if(!simonPlaying||!simonPlayerTurn)return;
    const col=b.dataset.color;simonLight(col,200);simonInput.push(col);const idx=simonInput.length-1;
    if(simonInput[idx]!==simonSeq[idx]){
      simonPlaying=false;simonPlayerTurn=false;
      document.getElementById('simonMsg').textContent=`❌ WRONG! GOT TO ROUND ${simonSeq.length}`;
      if(simonSeq.length>simonBest){simonBest=simonSeq.length;document.getElementById('simonBest').textContent=simonBest;showPopup('🏆',`SIMON BEST: ${simonBest}!`);}
      else showPopup('😬',`OUT AT ROUND ${simonSeq.length}`);
      document.getElementById('simonStart').textContent='▶ PLAY AGAIN';return;
    }
    if(simonInput.length===simonSeq.length){
      addScore(simonSeq.length*5);document.getElementById('simonRound').textContent=simonSeq.length;
      document.getElementById('simonMsg').textContent='✅ CORRECT!';
      simonSeq.push(simonColors[Math.floor(Math.random()*4)]);setTimeout(simonPlaySeq,800);
    }
  }));
  document.getElementById('simonStart').addEventListener('click',()=>{
    if(simonPlaying)return;simonPlaying=true;simonSeq=[simonColors[Math.floor(Math.random()*4)]];
    document.getElementById('simonStart').textContent='⏸ PLAYING';document.getElementById('simonRound').textContent=0;setTimeout(simonPlaySeq,500);
  });
});

// ===================== 12 ASTEROID DODGE =====================
registerGame('dodge', () => {
  const dc=document.getElementById('dodgeCanvas'),dctx=dc.getContext('2d');
  const DW=dc.width,DH=dc.height;
  let dRunning=false,dScore=0,dBest=0,dPlayer={x:DW/2,y:DH-50,r:14},dAsteroids=[],dFrame=0,dMouseX=DW/2;
  dc.addEventListener('mousemove',e=>{const r=dc.getBoundingClientRect();dMouseX=e.clientX-r.left;});
  function dSpawnAst(){dAsteroids.push({x:Math.random()*DW,y:-20,r:8+Math.random()*18,vy:1.5+Math.random()*2+dScore/200,vx:(Math.random()-.5)*2});}
  function dDrawFrame(){
    dctx.fillStyle='#08080f';dctx.fillRect(0,0,DW,DH);
    dPlayer.x+=(dMouseX-dPlayer.x)*0.12;dPlayer.x=Math.max(dPlayer.r,Math.min(DW-dPlayer.r,dPlayer.x));
    dctx.font='28px serif';dctx.textAlign='center';dctx.textBaseline='middle';dctx.fillText('🚀',dPlayer.x,dPlayer.y);
    dFrame++;if(dFrame%60===0)dSpawnAst();
    dAsteroids=dAsteroids.filter(a=>{
      a.x+=a.vx;a.y+=a.vy;if(a.y>DH+30)return false;
      const p=0.6+0.4*Math.sin(Date.now()/300);
      dctx.save();dctx.shadowColor='#aaa';dctx.shadowBlur=10*p;dctx.fillStyle=`rgba(160,160,180,${p})`;
      dctx.beginPath();dctx.arc(a.x,a.y,a.r,0,Math.PI*2);dctx.fill();dctx.restore();
      const dx=a.x-dPlayer.x,dy=a.y-dPlayer.y;
      if(Math.sqrt(dx*dx+dy*dy)<a.r+dPlayer.r-4){dGameOver();return false;}return true;
    });
    dScore++;document.getElementById('dodgeScore').textContent=dScore;
    if(!dRunning)return;requestAnimationFrame(dDrawFrame);
  }
  function dGameOver(){
    dRunning=false;if(dScore>dBest){dBest=dScore;document.getElementById('dodgeBest').textContent=dBest;showPopup('🚀',`DODGED FOR ${dBest} FRAMES!`);}
    else showPopup('💥',`KABOOM! ${dScore} FRAMES`);
    document.getElementById('dodgeStart').textContent='▶ TRY AGAIN';
    dctx.fillStyle='rgba(0,0,0,0.7)';dctx.fillRect(0,0,DW,DH);dctx.fillStyle='#FF6B35';dctx.font='bold 34px Boogaloo';dctx.textAlign='center';dctx.textBaseline='middle';dctx.fillText('KABOOM! 💥',DW/2,DH/2-16);
    dctx.fillStyle='white';dctx.font='18px Nunito';dctx.fillText(`Score: ${dScore}`,DW/2,DH/2+18);
  }
  document.getElementById('dodgeStart').addEventListener('click',()=>{
    if(dRunning)return;dRunning=true;dScore=0;dAsteroids=[];dFrame=0;dPlayer={x:DW/2,y:DH-50,r:14};
    document.getElementById('dodgeStart').textContent='⏸ MOVE MOUSE!';requestAnimationFrame(dDrawFrame);
  });
  dctx.fillStyle='#08080f';dctx.fillRect(0,0,DW,DH);dctx.fillStyle='rgba(255,107,53,0.4)';dctx.font='18px Boogaloo';dctx.textAlign='center';dctx.textBaseline='middle';dctx.fillText('MOVE MOUSE OVER CANVAS TO DODGE!',DW/2,DH/2);
});

// ===================== 13 NUMBER MEMORY =====================
registerGame('numMemory', () => {
  let nmLevel=1,nmBest=0,nmPhase='idle',nmNumber='';
  const nmDisplay=document.getElementById('nummemDisplay'),nmInput=document.getElementById('nummemInput'),nmFeedback=document.getElementById('nummemFeedback');
  document.getElementById('nummemStart').addEventListener('click',()=>{
    nmNumber=Array.from({length:nmLevel},()=>Math.floor(Math.random()*10)).join('');
    nmPhase='show';nmDisplay.textContent=nmNumber;nmDisplay.style.color='var(--cyan)';
    nmInput.style.display='none';nmFeedback.textContent='Memorise it!';
    setTimeout(()=>{nmDisplay.textContent='?'.repeat(nmLevel);nmPhase='type';nmInput.style.display='block';nmInput.value='';nmInput.focus();nmFeedback.textContent='Type it from memory! Press ENTER.';},1000+nmLevel*400);
  });
  nmInput.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&nmPhase==='type'){
      if(nmInput.value.replace(/^0+/,'')===nmNumber.replace(/^0+/,'')){
        nmFeedback.textContent=`✅ CORRECT! ${nmLevel} DIGITS`;nmFeedback.style.color='var(--cyan)';
        nmLevel++;document.getElementById('nummemLevel').textContent=nmLevel;
        if(nmLevel-1>nmBest){nmBest=nmLevel-1;document.getElementById('nummemBest').textContent=nmBest;showPopup('🧠',`LEVEL ${nmBest}!`);}
        addScore(nmLevel*10);nmInput.style.display='none';nmPhase='idle';
      }else{
        nmFeedback.textContent=`❌ WAS: ${nmNumber}`;nmFeedback.style.color='#ff5555';
        nmLevel=Math.max(1,nmLevel-1);document.getElementById('nummemLevel').textContent=nmLevel;nmInput.style.display='none';nmPhase='idle';
      }
    }
  });
});

// ===================== 14 EMOJI RAIN =====================
registerGame('emojiRain', () => {
  const rc=document.getElementById('rainCanvas'),rctx=rc.getContext('2d');
  const RW=rc.width,RH=rc.height;
  const RAIN_EM=['⭐','💫','✨','🌟','💥','🔥','💎','🎯','🎪','🎨'];
  let rRunning=false,rScore=0,rMissed=0,rBest=0,rDrops=[],rDropInt=null;
  function rSpawn(){rDrops.push({x:Math.random()*(RW-40)+20,y:-30,vy:1.5+Math.random()*2,em:RAIN_EM[Math.floor(Math.random()*RAIN_EM.length)],r:24});}
  function rFrame(){
    rctx.fillStyle='#08080f';rctx.fillRect(0,0,RW,RH);
    rDrops=rDrops.filter(d=>{
      d.y+=d.vy;rctx.font='36px serif';rctx.textAlign='center';rctx.textBaseline='middle';rctx.fillText(d.em,d.x,d.y);
      if(d.y>RH+30){rMissed++;document.getElementById('rainMissed').textContent=rMissed;if(rMissed>=10){rGameOver();return false;}return false;}return true;
    });
    if(!rRunning)return;requestAnimationFrame(rFrame);
  }
  function rGameOver(){
    rRunning=false;clearInterval(rDropInt);
    if(rScore>rBest){rBest=rScore;document.getElementById('rainBest').textContent=rBest;showPopup('⭐',`CAUGHT ${rBest}!`);}else showPopup('💫',`CAUGHT ${rScore}`);
    document.getElementById('rainStart').textContent='▶ PLAY AGAIN';
    rctx.fillStyle='rgba(0,0,0,0.75)';rctx.fillRect(0,0,RW,RH);rctx.fillStyle='#FFE500';rctx.font='bold 32px Boogaloo';rctx.textAlign='center';rctx.textBaseline='middle';rctx.fillText(`GAME OVER — ${rScore} CAUGHT`,RW/2,RH/2);
  }
  rc.addEventListener('click',e=>{
    if(!rRunning)return;const r=rc.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let hit=false;
    rDrops=rDrops.filter(d=>{if(!hit&&Math.abs(d.x-mx)<d.r&&Math.abs(d.y-my)<d.r){hit=true;rScore++;document.getElementById('rainScore').textContent=rScore;addScore(5);return false;}return true;});
  });
  document.getElementById('rainStart').addEventListener('click',()=>{
    if(rRunning)return;rRunning=true;rScore=0;rMissed=0;rDrops=[];
    document.getElementById('rainScore').textContent=0;document.getElementById('rainMissed').textContent=0;
    document.getElementById('rainStart').textContent='⏸ RUNNING';clearInterval(rDropInt);rDropInt=setInterval(rSpawn,800);requestAnimationFrame(rFrame);
  });
  rctx.fillStyle='#08080f';rctx.fillRect(0,0,RW,RH);rctx.fillStyle='rgba(255,229,0,0.3)';rctx.font='18px Boogaloo';rctx.textAlign='center';rctx.textBaseline='middle';rctx.fillText('CLICK STARS AS THEY FALL!',RW/2,RH/2);
});

// ===================== 15 GUESS THE NUMBER =====================
registerGame('guessNum', () => {
  let gTarget=0,gAttempts=0,gBest=null;
  function gNew(){gTarget=Math.floor(Math.random()*100)+1;gAttempts=0;document.getElementById('guessHistory').innerHTML='';document.getElementById('guessHint').textContent="I'm thinking of a number between 1 and 100...";document.getElementById('guessAttempts').textContent=0;document.getElementById('guessInput').value='';}
  function gGuess(){
    const v=parseInt(document.getElementById('guessInput').value);
    if(!v||v<1||v>100){document.getElementById('guessHint').textContent='Enter a number 1-100!';return;}
    gAttempts++;document.getElementById('guessAttempts').textContent=gAttempts;
    const tag=document.createElement('span');tag.className='guess-tag';tag.textContent=v;
    if(v===gTarget){tag.classList.add('win');document.getElementById('guessHint').textContent=`🎉 YES! It was ${gTarget}! In ${gAttempts} tries!`;if(gBest===null||gAttempts<gBest){gBest=gAttempts;document.getElementById('guessBest').textContent=gBest;showPopup('🎯',`GOT IT IN ${gAttempts}!`);}addScore(Math.max(10,100-gAttempts*8));}
    else if(v<gTarget){tag.classList.add('low');document.getElementById('guessHint').textContent='📈 TOO LOW! Try higher.';}
    else{tag.classList.add('high');document.getElementById('guessHint').textContent='📉 TOO HIGH! Try lower.';}
    document.getElementById('guessHistory').appendChild(tag);document.getElementById('guessInput').value='';
  }
  document.getElementById('guessSubmit').addEventListener('click',gGuess);
  document.getElementById('guessInput').addEventListener('keydown',e=>{if(e.key==='Enter')gGuess();});
  document.getElementById('guessReset').addEventListener('click',gNew);gNew();
});

// ===================== 16 SPEED MATH =====================
registerGame('speedmath', () => {
  let smScore=0,smTimer=60,smBest=0,smRunning=false,smTO=null,smAnswer=0;
  const smInput=document.getElementById('speedmathInput'),smQ=document.getElementById('speedmathQ');
  function smGen(){
    const ops=['+','-','×'];const op=ops[Math.floor(Math.random()*3)];
    let a,b,ans;
    if(op==='+'){a=Math.floor(Math.random()*99)+1;b=Math.floor(Math.random()*99)+1;ans=a+b;}
    else if(op==='-'){a=Math.floor(Math.random()*99)+10;b=Math.floor(Math.random()*a)+1;ans=a-b;}
    else{a=Math.floor(Math.random()*12)+1;b=Math.floor(Math.random()*12)+1;ans=a*b;}
    smAnswer=ans;smQ.textContent=`${a} ${op} ${b}`;smInput.value='';smInput.focus();
  }
  smInput.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&smRunning){const v=parseInt(smInput.value);
      if(v===smAnswer){smScore++;document.getElementById('speedmathScore').textContent=smScore;addScore(5);smQ.style.color='var(--green)';setTimeout(()=>{smQ.style.color='';smGen();},200);}
      else{smQ.style.color='#ff5555';setTimeout(()=>{smQ.style.color='';},300);}
    }
  });
  document.getElementById('speedmathStart').addEventListener('click',()=>{
    if(smRunning)return;smRunning=true;smScore=0;smTimer=60;smInput.style.display='block';smInput.focus();
    document.getElementById('speedmathScore').textContent=0;document.getElementById('speedmathStart').textContent='⏸ RUNNING';smGen();
    smTO=setInterval(()=>{smTimer--;document.getElementById('speedmathTimer').textContent=smTimer;
      if(smTimer<=0){clearInterval(smTO);smRunning=false;smInput.style.display='none';smQ.textContent="TIME'S UP!";
        if(smScore>smBest){smBest=smScore;document.getElementById('speedmathBest').textContent=smBest;showPopup('🧮',`NEW BEST: ${smBest}!`);}
        else showPopup('➕',`SPEED MATH: ${smScore}`);document.getElementById('speedmathStart').textContent='▶ PLAY AGAIN';
      }},1000);
  });
});

// ===================== 17 PATTERN COPY =====================
registerGame('pattern', () => {
  const PGRID=5;let ptLevel=1,ptBest=0,ptPattern=[],ptUserPat=[];
  function ptBuild(){
    const cells=PGRID*PGRID;const count=3+ptLevel*2;ptPattern=[];
    while(ptPattern.length<count){const i=Math.floor(Math.random()*cells);if(!ptPattern.includes(i))ptPattern.push(i);}
    ptUserPat=[];document.getElementById('patternMsg').textContent='Memorise it! Then click NEW ROUND to hide and copy.';
    document.getElementById('patternLevel').textContent=ptLevel;renderPtShow();renderPtDraw(false);
  }
  function renderPtShow(){
    const g=document.getElementById('patternShow');g.innerHTML='';
    for(let i=0;i<PGRID*PGRID;i++){const c=document.createElement('div');c.className='pattern-cell'+(ptPattern.includes(i)?' on':'');g.appendChild(c);}
  }
  function renderPtDraw(clickable){
    const g=document.getElementById('patternDraw');g.innerHTML='';
    for(let i=0;i<PGRID*PGRID;i++){
      const c=document.createElement('div');c.className='pattern-cell'+(ptUserPat.includes(i)?' on':'')+(clickable?' clickable':'');
      if(clickable)c.addEventListener('click',()=>{if(ptUserPat.includes(i)){ptUserPat=ptUserPat.filter(x=>x!==i);c.classList.remove('on');}else{ptUserPat.push(i);c.classList.add('on');}});
      g.appendChild(c);
    }
  }
  document.getElementById('patternStart').addEventListener('click',()=>{
    ptBuild();setTimeout(()=>{
      const g=document.getElementById('patternShow');g.innerHTML='';
      for(let i=0;i<PGRID*PGRID;i++){const c=document.createElement('div');c.className='pattern-cell';g.appendChild(c);}
      renderPtDraw(true);document.getElementById('patternMsg').textContent='Now copy it!';
    },1500+ptLevel*400);
  });
  document.getElementById('patternCheck').addEventListener('click',()=>{
    const correct=ptPattern.length===ptUserPat.length&&ptPattern.every(i=>ptUserPat.includes(i));
    if(correct){document.getElementById('patternMsg').textContent='✅ PERFECT MATCH!';ptLevel++;if(ptLevel-1>ptBest){ptBest=ptLevel-1;document.getElementById('patternBest').textContent=ptBest;showPopup('🎨',`LEVEL ${ptBest}!`);}addScore(ptLevel*15);}
    else{renderPtShow();document.getElementById('patternMsg').textContent="❌ NOT QUITE — here's the pattern again!";setTimeout(()=>{const g=document.getElementById('patternShow');g.innerHTML='';for(let i=0;i<PGRID*PGRID;i++){const c=document.createElement('div');c.className='pattern-cell';g.appendChild(c);}ptUserPat=[];renderPtDraw(true);document.getElementById('patternMsg').textContent='Try again!';},1500);}
  });
  ptBuild();
});

// ===================== 18 TRIVIA =====================
registerGame('trivia', () => {
  const TRIVIA=[
    {q:'The Great Wall of China is visible from space.',a:false},
    {q:'Bananas are technically berries.',a:true},
    {q:'Lightning never strikes the same place twice.',a:false},
    {q:'Goldfish have a memory of only 3 seconds.',a:false},
    {q:'Honey never spoils. Edible honey was found in Egyptian tombs.',a:true},
    {q:'The Eiffel Tower was originally intended to be in Barcelona.',a:true},
    {q:'A group of flamingos is called a flamboyance.',a:true},
    {q:'Humans share 50% of their DNA with bananas.',a:true},
    {q:'Napoleon Bonaparte was unusually short for his time.',a:false},
    {q:'Cleopatra lived closer in time to the Moon landing than to the pyramids being built.',a:true},
    {q:'A day on Venus is shorter than a year on Venus.',a:false},
    {q:'Sharks are older than trees.',a:true},
    {q:'Hot water freezes faster than cold water.',a:true},
    {q:'The tongue is the strongest muscle in the human body.',a:false},
    {q:'Octopuses have three hearts.',a:true},
    {q:'Sound travels faster in water than in air.',a:true},
  ];
  let tvScore=0,tvStreak=0,tvBest=0,tvCurrent=null,tvLocked=false;
  function loadTrivia(){tvCurrent=TRIVIA[Math.floor(Math.random()*TRIVIA.length)];document.getElementById('triviaQuestion').textContent=tvCurrent.q;document.getElementById('triviaFeedback').textContent='';tvLocked=false;}
  function answerTrivia(ans){
    if(tvLocked)return;tvLocked=true;const fb=document.getElementById('triviaFeedback');
    if(ans===tvCurrent.a){fb.textContent='✅ CORRECT!';fb.style.color='var(--green)';tvScore+=10+tvStreak*3;tvStreak++;document.getElementById('triviaScore').textContent=tvScore;document.getElementById('triviaStreak').textContent=tvStreak;if(tvScore>tvBest){tvBest=tvScore;document.getElementById('triviaBest').textContent=tvBest;}addScore(10);}
    else{fb.textContent=`❌ WRONG! Answer was ${tvCurrent.a?'TRUE':'FALSE'}`;fb.style.color='#ff5555';tvStreak=0;document.getElementById('triviaStreak').textContent=0;}
    setTimeout(loadTrivia,1200);
  }
  document.getElementById('triviaTrue').addEventListener('click',()=>answerTrivia(true));
  document.getElementById('triviaFalse').addEventListener('click',()=>answerTrivia(false));
  loadTrivia();
});

// ===================== 19 BRICK BREAKER =====================
registerGame('bricks', () => {
  const bc=document.getElementById('bricksCanvas'),bctx=bc.getContext('2d');
  const BW=bc.width,BH=bc.height;
  const ROWS_B=5,COLS_B=10,BRW=42,BRH=18,BPAD=6,BALL_BR=8,PAD_BW=80,PAD_BH=12;
  let bRunning=false,bScore=0,bLives=3,bBest=0,bBricks=[],bBall={},bPad={x:BW/2-PAD_BW/2,y:BH-30},bMouseXb=BW/2,bActive=false;
  bc.addEventListener('mousemove',e=>{const r=bc.getBoundingClientRect();bMouseXb=e.clientX-r.left;});
  function bInit(){
    bScore=0;bLives=3;bActive=false;bBricks=[];bBall={x:BW/2,y:BH-60,vx:3,vy:-4};bPad.x=BW/2-PAD_BW/2;
    document.getElementById('bricksScore').textContent=0;document.getElementById('bricksLives').textContent=3;
    const colors=['#FF3CAC','#FF6B35','#FFE500','#00F0FF','#00FF87'];
    for(let r=0;r<ROWS_B;r++)for(let c=0;c<COLS_B;c++)bBricks.push({x:c*(BRW+BPAD)+BPAD,y:r*(BRH+BPAD)+BPAD+30,w:BRW,h:BRH,alive:true,color:colors[r%colors.length]});
  }
  function bDraw(){
    bctx.fillStyle='#08080f';bctx.fillRect(0,0,BW,BH);
    bBricks.forEach(br=>{if(!br.alive)return;bctx.save();bctx.shadowColor=br.color;bctx.shadowBlur=8;bctx.fillStyle=br.color;bctx.beginPath();bctx.roundRect(br.x,br.y,br.w,br.h,4);bctx.fill();bctx.restore();});
    bctx.save();bctx.shadowColor='#00FF87';bctx.shadowBlur=12;bctx.fillStyle='#00FF87';bctx.beginPath();bctx.roundRect(bPad.x,bPad.y,PAD_BW,PAD_BH,6);bctx.fill();bctx.restore();
    bctx.save();bctx.shadowColor='white';bctx.shadowBlur=10;bctx.fillStyle='white';bctx.beginPath();bctx.arc(bBall.x,bBall.y,BALL_BR,0,Math.PI*2);bctx.fill();bctx.restore();
  }
  function bUpdate(){
    if(!bRunning)return;bPad.x+=(bMouseXb-PAD_BW/2-bPad.x)*0.15;bPad.x=Math.max(0,Math.min(BW-PAD_BW,bPad.x));
    if(!bActive){bBall.x=bPad.x+PAD_BW/2;bDraw();requestAnimationFrame(bUpdate);return;}
    bBall.x+=bBall.vx;bBall.y+=bBall.vy;
    if(bBall.x-BALL_BR<0){bBall.x=BALL_BR;bBall.vx*=-1;}if(bBall.x+BALL_BR>BW){bBall.x=BW-BALL_BR;bBall.vx*=-1;}
    if(bBall.y-BALL_BR<0){bBall.y=BALL_BR;bBall.vy*=-1;}
    if(bBall.y+BALL_BR>bPad.y&&bBall.x>bPad.x&&bBall.x<bPad.x+PAD_BW&&bBall.vy>0){bBall.vy*=-1;bBall.vx+=(bBall.x-(bPad.x+PAD_BW/2))*0.05;}
    if(bBall.y>BH+20){
      bLives--;document.getElementById('bricksLives').textContent=bLives;
      if(bLives<=0){bRunning=false;if(bScore>bBest){bBest=bScore;document.getElementById('bricksBest').textContent=bBest;showPopup('🧱',`NEW BEST: ${bBest}!`);}else showPopup('💔',`GAME OVER! ${bScore} PTS`);document.getElementById('bricksStart').textContent='▶ PLAY AGAIN';bctx.fillStyle='rgba(0,0,0,0.7)';bctx.fillRect(0,0,BW,BH);bctx.fillStyle='#00FF87';bctx.font='bold 32px Boogaloo';bctx.textAlign='center';bctx.textBaseline='middle';bctx.fillText(`GAME OVER — ${bScore} PTS`,BW/2,BH/2);return;}
      bActive=false;bBall.x=bPad.x+PAD_BW/2;bBall.y=bPad.y-BALL_BR-2;bBall.vx=3;bBall.vy=-4;
    }
    bBricks.forEach(br=>{if(!br.alive||bBall.x<br.x||bBall.x>br.x+br.w||bBall.y<br.y||bBall.y>br.y+br.h)return;br.alive=false;bBall.vy*=-1;bScore++;document.getElementById('bricksScore').textContent=bScore;addScore(10);if(bBricks.every(b=>!b.alive)){showPopup('🎉','ALL BRICKS CLEARED!');addScore(200);bRunning=false;document.getElementById('bricksStart').textContent='▶ PLAY AGAIN';}});
    bDraw();requestAnimationFrame(bUpdate);
  }
  bc.addEventListener('click',()=>{if(bRunning&&!bActive){bActive=true;bBall.vy=-5;}});
  document.getElementById('bricksStart').addEventListener('click',()=>{if(bRunning)return;bInit();bRunning=true;document.getElementById('bricksStart').textContent='⏸ CLICK CANVAS TO LAUNCH';requestAnimationFrame(bUpdate);});
  bInit();bDraw();
});

// ===================== 20 EMOJI SHOOTER =====================
registerGame('shooter', () => {
  const shc=document.getElementById('shooterCanvas'),shctx=shc.getContext('2d');
  const SHW=shc.width,SHH=shc.height;
  const SH_EM=['😈','👾','🤖','👻','💀','🎃'];
  let shRunning=false,shScore=0,shLives=5,shBest=0,shEnemies=[],shBullets=[],shPlayer={x:SHW/2,y:SHH-40,r:16},shMouseXsh=SHW/2,shSpawnInt=null;
  shc.addEventListener('mousemove',e=>{const r=shc.getBoundingClientRect();shMouseXsh=e.clientX-r.left;});
  shc.addEventListener('click',()=>{if(!shRunning)return;shBullets.push({x:shPlayer.x,y:shPlayer.y-20,vy:-8});});
  function shSpawn(){shEnemies.push({x:Math.random()*(SHW-40)+20,y:-30,vy:0.8+Math.random()*1.2+shScore/100,em:SH_EM[Math.floor(Math.random()*SH_EM.length)],r:20});}
  function shFrame(){
    shctx.fillStyle='#08080f';shctx.fillRect(0,0,SHW,SHH);
    shPlayer.x+=(shMouseXsh-shPlayer.x)*0.15;shPlayer.x=Math.max(shPlayer.r,Math.min(SHW-shPlayer.r,shPlayer.x));
    shctx.font='32px serif';shctx.textAlign='center';shctx.textBaseline='middle';shctx.fillText('🛸',shPlayer.x,shPlayer.y);
    shBullets=shBullets.filter(b=>{
      b.y+=b.vy;if(b.y<-10)return false;
      shctx.save();shctx.shadowColor='#FFE500';shctx.shadowBlur=12;shctx.fillStyle='#FFE500';shctx.beginPath();shctx.arc(b.x,b.y,4,0,Math.PI*2);shctx.fill();shctx.restore();
      let hit=false;shEnemies=shEnemies.filter(en=>{if(hit)return true;const dx=b.x-en.x,dy=b.y-en.y;if(Math.sqrt(dx*dx+dy*dy)<en.r+4){hit=true;shScore++;document.getElementById('shooterScore').textContent=shScore;addScore(10);return false;}return true;});
      return !hit;
    });
    shEnemies=shEnemies.filter(en=>{en.y+=en.vy;shctx.font='34px serif';shctx.textAlign='center';shctx.textBaseline='middle';shctx.fillText(en.em,en.x,en.y);if(en.y>SHH+30){shLives--;document.getElementById('shooterLives').textContent=shLives;if(shLives<=0){shGameOver();return false;}return false;}return true;});
    if(!shRunning)return;requestAnimationFrame(shFrame);
  }
  function shGameOver(){shRunning=false;clearInterval(shSpawnInt);if(shScore>shBest){shBest=shScore;document.getElementById('shooterBest').textContent=shBest;showPopup('🛸',`NEW BEST: ${shBest}!`);}else showPopup('👾',`GAME OVER! ${shScore} KILLS`);document.getElementById('shooterStart').textContent='▶ PLAY AGAIN';shctx.fillStyle='rgba(0,0,0,0.75)';shctx.fillRect(0,0,SHW,SHH);shctx.fillStyle='#FFE500';shctx.font='bold 32px Boogaloo';shctx.textAlign='center';shctx.textBaseline='middle';shctx.fillText(`GAME OVER — ${shScore} KILLS`,SHW/2,SHH/2);}
  document.getElementById('shooterStart').addEventListener('click',()=>{if(shRunning)return;shRunning=true;shScore=0;shLives=5;shEnemies=[];shBullets=[];document.getElementById('shooterScore').textContent=0;document.getElementById('shooterLives').textContent=5;document.getElementById('shooterStart').textContent='⏸ MOVE MOUSE — CLICK TO SHOOT';clearInterval(shSpawnInt);shSpawnInt=setInterval(shSpawn,1200);requestAnimationFrame(shFrame);});
  shctx.fillStyle='#08080f';shctx.fillRect(0,0,SHW,SHH);shctx.fillStyle='rgba(255,229,0,0.35)';shctx.font='18px Boogaloo';shctx.textAlign='center';shctx.textBaseline='middle';shctx.fillText('MOVE MOUSE TO AIM — CLICK TO SHOOT',SHW/2,SHH/2);
});
// ===================== 21 NEON COBRA =====================
registerGame('neon-cobra', () => {
  const canvas = document.getElementById('cobraCanvas');
  const ctx    = canvas.getContext('2d');
  const flash  = document.getElementById('cobraFlash');
  const TILE = 20;
  const COLS = canvas.width  / TILE;
  const ROWS = canvas.height / TILE;

  // ── POWERUP DEFINITIONS ──────────────────────────────────────
  const PU_TYPES = {
    ghost:  { color:'#c084fc', emoji:'👻', label:'GHOST!',   duration:5000 },
    shield: { color:'#00F0FF', emoji:'🛡️', label:'SHIELD!',  duration:0    },
    slow:   { color:'#00FF87', emoji:'🐢', label:'SLOW-MO!', duration:4000 },
    shrink: { color:'#FF6B35', emoji:'✂️', label:'SHRINK!',  duration:0    },
    frenzy: { color:'#FFE500', emoji:'⚡', label:'FRENZY!',  duration:3000 },
    bomb:   { color:'#FF3CAC', emoji:'💣', label:'BOMB!',    duration:0    },
  };

  // ── STATE ────────────────────────────────────────────────────
  let snake, dir, nextDir, food, powerUps, walls;
  let score, combo, highscore = 0, running = false;
  let particles, floatTexts, lastTime, speed, baseSpeed;
  let ghostTimer, shieldTimer, slowTimer, frenzyTimer, shieldHits;

  // ── INIT ─────────────────────────────────────────────────────
  function init() {
    snake      = [{x:15,y:10},{x:14,y:10},{x:13,y:10},{x:12,y:10}];
    dir        = {x:1,y:0};
    nextDir    = {x:1,y:0};
    score      = 0; combo = 1.0;
    baseSpeed  = 115; speed = baseSpeed;
    particles  = []; floatTexts = [];
    powerUps   = []; walls = [];
    ghostTimer = 0; shieldTimer = 0; slowTimer = 0; frenzyTimer = 0; shieldHits = 0;
    lastTime   = 0;
    spawnFood(); updateUI();
  }

  // ── SPAWN HELPERS ────────────────────────────────────────────
  function freeCell() {
    let x, y, tries = 0;
    do {
      x = Math.floor(Math.random() * COLS);
      y = Math.floor(Math.random() * ROWS);
      tries++;
    } while (tries < 200 && (
      snake.some(s=>s.x===x&&s.y===y) ||
      (food && food.x===x && food.y===y) ||
      powerUps.some(p=>p.x===x&&p.y===y) ||
      walls.some(w=>w.x===x&&w.y===y)
    ));
    return {x, y};
  }

  function spawnFood() {
    const r = Math.random();
    food = { ...freeCell(), type: r>0.92?'mega':r>0.78?'gold':'normal', spawnTime:Date.now() };
  }

  function maybespawnPowerUp() {
    if (powerUps.length >= 3) return;
    if (Math.random() > 0.82) {
      const types = Object.keys(PU_TYPES);
      const type = types[Math.floor(Math.random() * types.length)];
      powerUps.push({ ...freeCell(), type, spawnTime:Date.now(), life:7000 });
    }
  }

  function maybeSpawnWall() {
    if (walls.length >= 8) return;
    if (Math.random() > 0.95 && snake.length > 8)
      walls.push({ ...freeCell(), spawnTime:Date.now(), life:12000 });
  }

  // ── APPLY POWERUP ────────────────────────────────────────────
  function applyPowerUp(type) {
    const def = PU_TYPES[type];
    showFloat(snake[0].x, snake[0].y, def.emoji+' '+def.label, def.color);
    burst(snake[0].x*TILE+TILE/2, snake[0].y*TILE+TILE/2, def.color, 18);
    triggerFlash(def.color);
    switch(type) {
      case 'ghost':  ghostTimer = def.duration; break;
      case 'slow':   slowTimer  = def.duration; speed = Math.min(speed*1.7, 210); break;
      case 'frenzy': frenzyTimer= def.duration; speed = Math.max(45, speed*0.55); break;
      case 'shield': shieldHits = 1; shieldTimer = 1; break;
      case 'shrink':
        const cut = Math.max(3, Math.floor(snake.length*0.45));
        snake = snake.slice(0, snake.length - cut);
        score += 150; combo = Math.min(6.0, combo+0.5);
        break;
      case 'bomb':
        walls = []; score += 200;
        burst(snake[0].x*TILE+TILE/2, snake[0].y*TILE+TILE/2, '#FF3CAC', 28);
        break;
    }
    addScore(50); updateUI();
  }

  // ── STEP ─────────────────────────────────────────────────────
  function step(now) {
    dir = {...nextDir};
    const head = {x: snake[0].x+dir.x, y: snake[0].y+dir.y};

    if (ghostTimer > 0) {
      head.x = ((head.x%COLS)+COLS)%COLS;
      head.y = ((head.y%ROWS)+ROWS)%ROWS;
    } else {
      if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS) return die();
    }

    if (snake.slice(2).some(s=>s.x===head.x&&s.y===head.y)) {
      if (shieldHits>0) { shieldHits=0; shieldTimer=0; triggerFlash('#00F0FF'); }
      else return die();
    }

    if (walls.some(w=>w.x===head.x&&w.y===head.y)) {
      if (shieldHits>0) {
        shieldHits=0; shieldTimer=0;
        walls=walls.filter(w=>!(w.x===head.x&&w.y===head.y));
        burst(head.x*TILE+TILE/2, head.y*TILE+TILE/2, '#FF3CAC', 12);
      } else return die();
    }

    snake.unshift(head);

    if (head.x===food.x && head.y===food.y) {
      const pts   = food.type==='mega'?150:food.type==='gold'?50:10;
      const earned= Math.floor(pts*combo);
      score += earned;
      combo = Math.min(6.0, combo+(food.type==='mega'?0.5:food.type==='gold'?0.3:0.15));
      if (frenzyTimer<=0) speed = Math.max(48, speed-(food.type==='mega'?4:1.8));
      burst(food.x*TILE+TILE/2, food.y*TILE+TILE/2,
            food.type==='mega'?'#FF3CAC':food.type==='gold'?'#FFE500':'#00F0FF',
            food.type==='mega'?20:10);
      showFloat(food.x, food.y, '+'+earned,
            food.type==='mega'?'#FF3CAC':food.type==='gold'?'#FFE500':'#00FF87');
      addScore(earned); spawnFood(); maybespawnPowerUp(); maybeSpawnWall(); updateUI();
    } else {
      snake.pop();
      combo = Math.max(1.0, combo-0.004);
    }

    for (let i=powerUps.length-1; i>=0; i--) {
      if (head.x===powerUps[i].x && head.y===powerUps[i].y) {
        applyPowerUp(powerUps[i].type);
        powerUps.splice(i,1);
      }
    }

    powerUps = powerUps.filter(p => now-p.spawnTime < p.life);
    walls    = walls.filter(w => now-w.spawnTime < w.life);
    updateUI();
  }

  function die() {
    running = false;
    triggerFlash('#FF3CAC');
    burst(snake[0].x*TILE+TILE/2, snake[0].y*TILE+TILE/2, '#FF3CAC', 25);
    if (score > highscore) {
      highscore = Math.floor(score);
      showPopup('👑','NEW COBRA BEST: '+highscore);
    } else {
      showPopup('💀','SCORE: '+Math.floor(score));
    }
    document.getElementById('cobraStart').textContent = '▶ TRY AGAIN';
  }

  // ── DRAW ─────────────────────────────────────────────────────
  function draw(now) {
    const t = now/1000;
    ctx.fillStyle='#08080f'; ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle='rgba(255,255,255,0.025)'; ctx.lineWidth=0.5;
    for (let i=0;i<COLS;i++){ctx.beginPath();ctx.moveTo(i*TILE,0);ctx.lineTo(i*TILE,canvas.height);ctx.stroke();}
    for (let j=0;j<ROWS;j++){ctx.beginPath();ctx.moveTo(0,j*TILE);ctx.lineTo(canvas.width,j*TILE);ctx.stroke();}

    if (ghostTimer>0) {
      ctx.strokeStyle='rgba(192,132,252,0.4)'; ctx.lineWidth=5;
      ctx.shadowBlur=14; ctx.shadowColor='#c084fc';
      ctx.strokeRect(3,3,canvas.width-6,canvas.height-6);
      ctx.shadowBlur=0;
    }
    if (frenzyTimer>0) {
      const fp=Math.sin(t*8)*0.5+0.5;
      ctx.strokeStyle='rgba(255,229,0,'+(0.2+fp*0.4)+')'; ctx.lineWidth=4;
      ctx.shadowBlur=10+fp*8; ctx.shadowColor='#FFE500';
      ctx.strokeRect(3,3,canvas.width-6,canvas.height-6);
      ctx.shadowBlur=0;
    }
    ctx.lineWidth=1;

    walls.forEach(w => {
      const age=(now-w.spawnTime)/w.life;
      const al=age>0.85?(1-age)/0.15:1;
      ctx.save(); ctx.globalAlpha=al;
      ctx.fillStyle='#FF3CAC'; ctx.shadowBlur=10; ctx.shadowColor='#FF3CAC';
      ctx.beginPath(); ctx.roundRect(w.x*TILE+2,w.y*TILE+2,TILE-4,TILE-4,3); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=1.5; ctx.shadowBlur=0;
      ctx.beginPath(); ctx.moveTo(w.x*TILE+5,w.y*TILE+5); ctx.lineTo(w.x*TILE+TILE-5,w.y*TILE+TILE-5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w.x*TILE+TILE-5,w.y*TILE+5); ctx.lineTo(w.x*TILE+5,w.y*TILE+TILE-5); ctx.stroke();
      ctx.restore();
    });

    const fp2=Math.sin(t*4)*3;
    const fdcol=food.type==='mega'?'#FF3CAC':food.type==='gold'?'#FFE500':'#00F0FF';
    const fdr  =food.type==='mega'?9:food.type==='gold'?7:6;
    ctx.shadowBlur=14+fp2; ctx.shadowColor=fdcol; ctx.fillStyle=fdcol;
    ctx.beginPath(); ctx.arc(food.x*TILE+TILE/2,food.y*TILE+TILE/2,fdr+fp2*0.5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0; ctx.fillStyle='rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(food.x*TILE+TILE/2,food.y*TILE+TILE/2,2.5,0,Math.PI*2); ctx.fill();

    powerUps.forEach(pu => {
      const def=PU_TYPES[pu.type];
      const age=(now-pu.spawnTime)/pu.life;
      const al=age>0.75?(1-age)/0.25:1;
      const pulse=Math.sin(t*5+pu.x)*2;
      ctx.save(); ctx.globalAlpha=al;
      ctx.strokeStyle=def.color; ctx.lineWidth=1.5;
      ctx.shadowBlur=10+pulse; ctx.shadowColor=def.color;
      ctx.beginPath(); ctx.arc(pu.x*TILE+TILE/2,pu.y*TILE+TILE/2,TILE/2-1,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0;
      ctx.font='13px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(def.emoji, pu.x*TILE+TILE/2, pu.y*TILE+TILE/2+1);
      ctx.restore();
    });

    snake.forEach((seg,i) => {
      const isHead=i===0;
      const frac=i/snake.length;
      const isGhost=ghostTimer>0; const isFrenz=frenzyTimer>0;
      ctx.save();
      if (isGhost) ctx.globalAlpha=0.55;
      let segCol;
      if (isHead) segCol=isGhost?'#c084fc':isFrenz?'#FFE500':'#00F0FF';
      else segCol=isGhost?'rgba(192,132,252,'+(0.85-frac*0.5)+')'
                 :isFrenz?'rgba(255,229,0,'+(0.9-frac*0.5)+')'
                 :'rgba(0,240,255,'+(0.9-frac*0.55)+')';
      ctx.fillStyle=segCol;
      ctx.shadowBlur=isHead?22:6;
      ctx.shadowColor=isGhost?'#c084fc':isFrenz?'#FFE500':'#00F0FF';
      ctx.beginPath(); ctx.roundRect(seg.x*TILE+1,seg.y*TILE+1,TILE-2,TILE-2,isHead?5:3); ctx.fill();
      if (isHead&&shieldHits>0) {
        ctx.strokeStyle='#00F0FF'; ctx.lineWidth=2;
        ctx.shadowBlur=12; ctx.shadowColor='#00F0FF';
        ctx.strokeRect(seg.x*TILE-1,seg.y*TILE-1,TILE+2,TILE+2);
      }
      if (isHead) {
        ctx.shadowBlur=0; ctx.fillStyle='#000';
        const ex=dir.x,ey=dir.y;
        const e1x=seg.x*TILE+TILE/2+ey*5+ex*6, e1y=seg.y*TILE+TILE/2-ex*5+ey*6;
        const e2x=seg.x*TILE+TILE/2-ey*5+ex*6, e2y=seg.y*TILE+TILE/2+ex*5+ey*6;
        ctx.beginPath(); ctx.arc(e1x,e1y,2.5,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x,e2y,2.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fff';
        ctx.beginPath(); ctx.arc(e1x+0.5,e1y-0.5,1,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x+0.5,e2y-0.5,1,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    });

    ctx.save();
    particles.forEach(p => {
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.08; p.life-=0.022;
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.fillStyle=p.color; ctx.shadowBlur=4; ctx.shadowColor=p.color;
      ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
    });
    particles=particles.filter(p=>p.life>0);
    ctx.restore();

    ctx.save();
    floatTexts.forEach(f => {
      f.y-=1.2; f.life-=0.025;
      ctx.globalAlpha=Math.max(0,f.life);
      ctx.font='bold 13px Boogaloo,cursive'; ctx.fillStyle=f.color;
      ctx.shadowBlur=6; ctx.shadowColor=f.color;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(f.text,f.x,f.y);
    });
    floatTexts=floatTexts.filter(f=>f.life>0);
    ctx.restore(); ctx.shadowBlur=0;

    let hudY=8;
    if(ghostTimer>0)  {pill(8,hudY,'👻 GHOST', '#c084fc',ghostTimer, 5000);hudY+=22;}
    if(slowTimer>0)   {pill(8,hudY,'🐢 SLOW',  '#00FF87',slowTimer,  4000);hudY+=22;}
    if(frenzyTimer>0) {pill(8,hudY,'⚡ FRENZY','#FFE500',frenzyTimer,3000);hudY+=22;}
    if(shieldHits>0)  {pill(8,hudY,'🛡 SHIELD','#00F0FF',1,1);             hudY+=22;}
  }

  function pill(x,y,label,color,rem,tot) {
    const pct=Math.min(1,rem/tot), w=104, h=16;
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(x,y,w,h,4); ctx.fill();
    ctx.fillStyle=color; ctx.globalAlpha=0.8; ctx.beginPath(); ctx.roundRect(x,y,w*pct,h,4); ctx.fill();
    ctx.globalAlpha=1; ctx.font='bold 9px Nunito,sans-serif'; ctx.fillStyle='#fff';
    ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText(label,x+5,y+h/2);
    ctx.restore();
  }

  // ── HELPERS ──────────────────────────────────────────────────
  function burst(x,y,color,count) {
    for(let i=0;i<count;i++) {
      const a=(i/count)*Math.PI*2+Math.random()*0.5, sp=2+Math.random()*5;
      particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1,life:0.8+Math.random()*0.5,color,size:2+Math.random()*3});
    }
  }
  function showFloat(tx,ty,text,color) {
    floatTexts.push({x:tx*TILE+TILE/2,y:ty*TILE+TILE/2,text,color,life:1.0});
  }
  function triggerFlash(color) {
    flash.style.background=color; flash.style.opacity='0.35';
    setTimeout(()=>flash.style.opacity='0',120);
  }
  function updateUI() {
    document.getElementById('cobraScore').textContent=Math.floor(score);
    document.getElementById('cobraCombo').textContent=combo.toFixed(1);
    document.getElementById('cobraBest').textContent=highscore;
  }

  // ── LOOP ─────────────────────────────────────────────────────
  function loop(now) {
    if (!running) return;
    if (now-lastTime > speed) {
      const elapsed=now-lastTime;
      if(ghostTimer>0)  ghostTimer =Math.max(0,ghostTimer -elapsed);
      if(slowTimer>0)   slowTimer  =Math.max(0,slowTimer  -elapsed);
      if(frenzyTimer>0) frenzyTimer=Math.max(0,frenzyTimer-elapsed);
      if(slowTimer===0&&frenzyTimer===0&&Math.abs(speed-baseSpeed)>1)
        speed+=(baseSpeed-speed)*0.3;
      step(now); lastTime=now;
    }
    draw(now);
    requestAnimationFrame(loop);
  }

  // ── CONTROLS ─────────────────────────────────────────────────
  document.getElementById('cobraStart').addEventListener('click',()=>{
    if(running)return;
    init(); running=true;
    document.getElementById('cobraStart').textContent='⚡ HUNTING';
    requestAnimationFrame(loop);
  });

  window.addEventListener('keydown',e=>{
    if(!running)return;
    const map={ArrowUp:{x:0,y:-1},KeyW:{x:0,y:-1},ArrowDown:{x:0,y:1},KeyS:{x:0,y:1},
               ArrowLeft:{x:-1,y:0},KeyA:{x:-1,y:0},ArrowRight:{x:1,y:0},KeyD:{x:1,y:0}};
    const move=map[e.code];
    if(move){if(move.x!==-dir.x||move.y!==-dir.y)nextDir=move;e.preventDefault();}
  });

  // ── DPAD (mobile) ────────────────────────────────────────────
  const dirMap={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
  document.querySelectorAll('#cobraDpad .dpad-btn').forEach(btn=>{
    const handler=e=>{
      e.preventDefault();
      if(!running)return;
      const move=dirMap[btn.dataset.dir];
      if(move&&(move.x!==-dir.x||move.y!==-dir.y)) nextDir=move;
    };
    btn.addEventListener('touchstart',handler,{passive:false});
    btn.addEventListener('mousedown',handler);
  });
});