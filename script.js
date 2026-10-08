const results={1:[['OpenVLA-OFT',52.12,39,287.94],['AEGIS',32.38,28.5,310.67],['PPO',54.12,39.88,285.67],['SafeVLA',54.25,45,294.69],['WMPO',60.62,44.88,274.02],['WoVR',50.62,37.62,287.99],['SafeDojo (ours)',64.5,53.25,269.41]],2:[['OpenVLA-OFT',52.12,43.38,286.72],['AEGIS',33.13,30.5,302.44],['PPO',52.12,43.25,285.51],['SafeVLA',56.5,49.5,289.87],['WMPO',55.75,46.12,277.17],['WoVR',50.12,44,285.76],['SafeDojo (ours)',57,49.62,277]]};
function render(level){document.querySelector('#result-rows').innerHTML=results[level].map((r,i)=>`<tr class="${i===6?'ours':''}"><td>${r[0]}</td><td>${r[1].toFixed(2)}%</td><td>${r[2].toFixed(2)}%</td><td>${r[3].toFixed(2)}</td></tr>`).join('');document.querySelector('#table-caption').textContent=level===1?'SafeLIBERO Level I · trained and evaluated on Level I':'SafeLIBERO Level II · trained on Level I, evaluated zero-shot on Level II';document.querySelector('#result-note').textContent=level===1?'SafeDojo improves average safe success by 8.25 percentage points over SafeVLA (53.25% vs. 45.00%).':'SafeDojo is competitive with SafeVLA in safe success (49.62% vs. 49.50%), with the best average task success and execution efficiency.';document.querySelectorAll('[data-level]').forEach(b=>{const active=Number(b.dataset.level)===level;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))})}
document.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>render(Number(b.dataset.level))));render(1);
document.querySelector('#copy-citation').addEventListener('click',async()=>{const s=document.querySelector('#copy-status');try{await navigator.clipboard.writeText(document.querySelector('#bibtex').textContent);s.textContent='Citation copied.'}catch{const range=document.createRange();range.selectNodeContents(document.querySelector('#bibtex'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);s.textContent='Citation selected. Press Ctrl+C or ⌘C to copy.'}});

// Keep silent rollouts moving only while visible; leave the narrated video manual.
const demoVideos=[...document.querySelectorAll('.demo video')];
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
let demosPaused=motionPreference.matches;
const demoToggle=document.querySelector('#toggle-demos');
function updateDemoButton(){demoToggle.textContent=demosPaused?'Play demos':'Pause demos';}
function startDemo(video){video.muted=true;video.play().catch(()=>{/* Native controls remain available if autoplay is blocked. */});}
const visibleDemos=new Set();
const demoObserver=new IntersectionObserver(entries=>{for(const entry of entries){const video=entry.target;if(entry.isIntersecting){visibleDemos.add(video);if(!demosPaused)startDemo(video);}else{visibleDemos.delete(video);video.pause();}}},{threshold:0.15});
for(const video of demoVideos){if(demosPaused){video.removeAttribute('autoplay');video.pause();}demoObserver.observe(video);}
demoToggle.addEventListener('click',()=>{demosPaused=!demosPaused;for(const video of demoVideos){if(demosPaused)video.pause();else if(visibleDemos.has(video))startDemo(video);}updateDemoButton();});
motionPreference.addEventListener('change',event=>{if(event.matches){demosPaused=true;demoVideos.forEach(video=>video.pause());updateDemoButton();}});
updateDemoButton();
