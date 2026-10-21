const results={1:[['OpenVLA-OFT',52.12,39,287.94],['AEGIS',32.38,28.5,310.67],['PPO',54.12,39.88,285.67],['SafeVLA',54.25,45,294.69],['WMPO',60.62,44.88,274.02],['WoVR',50.62,37.62,287.99],['SafeDojo (ours)',64.5,53.25,269.41]],2:[['OpenVLA-OFT',52.12,43.38,286.72],['AEGIS',33.13,30.5,302.44],['PPO',52.12,43.25,285.51],['SafeVLA',56.5,49.5,289.87],['WMPO',55.75,46.12,277.17],['WoVR',50.12,44,285.76],['SafeDojo (ours)',57,49.62,277]]};
function render(level){document.querySelector('#result-rows').innerHTML=results[level].map((r,i)=>`<tr class="${i===6?'ours':''}"><td>${r[0]}</td><td>${r[1].toFixed(2)}%</td><td>${r[2].toFixed(2)}%</td><td>${r[3].toFixed(2)}</td></tr>`).join('');document.querySelector('#table-caption').textContent=level===1?'SafeLIBERO Level I · trained and evaluated on Level I':'SafeLIBERO Level II · trained on Level I, evaluated zero-shot on Level II';document.querySelectorAll('[data-level]').forEach(b=>{const active=Number(b.dataset.level)===level;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))})}
document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>render(Number(b.dataset.level))));render(1);
document.querySelector('#copy-citation').addEventListener('click',async()=>{const s=document.querySelector('#copy-status');try{await navigator.clipboard.writeText(document.querySelector('#bibtex').textContent);s.textContent='Citation copied.'}catch{const range=document.createRange();range.selectNodeContents(document.querySelector('#bibtex'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);s.textContent='Citation selected. Press Ctrl+C or ⌘C to copy.'}});

// Keep silent rollouts moving only while visible; leave the narrated video manual.
const demoVideos=[...document.querySelectorAll('.demo video')];
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
function startDemo(video){video.muted=true;video.play().catch(()=>{/* Native controls remain available if autoplay is blocked. */});}
const demoObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){if(!motionPreference.matches)startDemo(entry.target);}else entry.target.pause();}},{threshold:0.15});
for(const video of demoVideos){if(motionPreference.matches){video.removeAttribute('autoplay');video.pause();}demoObserver.observe(video);}
motionPreference.addEventListener('change',event=>{if(event.matches)demoVideos.forEach(video=>video.pause());});

// Section entrances are progressive enhancement: content stays visible without JS.
const entrances = document.querySelectorAll('.hero > *, .demo, .intro, .figure, .steps > div, .results-summary, .table-scroll, #overview .wrap, .paper-section');
const entranceObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    if (!motionPreference.matches) {
      const animation = entry.target.animate([
        {opacity:0,transform:'translateY(20px)'},
        {opacity:1,transform:'translateY(0)'}
      ], {duration:650,delay:Number(entry.target.dataset.entranceDelay || 0),easing:'cubic-bezier(.2,.7,.2,1)'});
      motionPreference.addEventListener('change', () => animation.finish(), {once:true});
    }
    entranceObserver.unobserve(entry.target);
  }
}, {threshold:.08});
entrances.forEach(el => entranceObserver.observe(el));
document.querySelectorAll('.hero > *, .demo').forEach((el,i) => {el.dataset.entranceDelay=String((i%5)*55);});

for (const video of demoVideos) {
  const track = document.createElement('div');
  track.className='demo-progress';track.setAttribute('aria-hidden','true');
  const bar=document.createElement('i');track.append(bar);video.after(track);
  video.addEventListener('timeupdate',()=>{bar.style.transform=`scaleX(${video.duration ? video.currentTime/video.duration : 0})`;});
}

const header=document.querySelector('.nav');
const progress=document.createElement('div');progress.className='scroll-progress';progress.setAttribute('aria-hidden','true');header.append(progress);
const navigation=[...header.querySelectorAll('nav a')];
let scrollFrame=0;
function updateNavigation(){
  scrollFrame=0;
  const height=document.documentElement.scrollHeight-innerHeight;
  progress.style.transform=`scaleX(${height>0 ? Math.min(1,Math.max(0,scrollY/height)) : 0})`;
  header.classList.toggle('scrolled',scrollY>12);
  let current=null;
  for(const link of navigation){const section=document.querySelector(link.hash);if(section && section.getBoundingClientRect().top<=innerHeight*.4)current=link;}
  navigation.forEach(link=>{if(link===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateNavigation);},{passive:true});
addEventListener('resize',updateNavigation);updateNavigation();

const methodSteps=[...document.querySelectorAll('.steps > div')];
let methodVisible=false,stepTimer=null,stepIndex=0;
function syncMethod(){
  clearInterval(stepTimer);stepTimer=null;
  methodSteps.forEach(el=>el.classList.remove('flow-active'));
  if(!methodVisible || document.hidden || motionPreference.matches)return;
  const highlight=()=>methodSteps.forEach((el,i)=>el.classList.toggle('flow-active',i===stepIndex));
  highlight();stepTimer=setInterval(()=>{stepIndex=(stepIndex+1)%methodSteps.length;highlight();},2200);
}
new IntersectionObserver(([entry])=>{methodVisible=entry.isIntersecting;syncMethod();},{threshold:.2}).observe(document.querySelector('.steps'));
document.addEventListener('visibilitychange',syncMethod);
motionPreference.addEventListener('change',syncMethod);
