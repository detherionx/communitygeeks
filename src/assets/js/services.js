(() => {
 const section=document.querySelector('.buy-section');if(!section)return;
 const buttons=[...section.querySelectorAll('[data-service]')],worlds=[...section.querySelectorAll('[data-world]')],items=[...section.querySelectorAll('.service-item')],pause=section.querySelector('.service-pause');let paused=false;
 function select(i){buttons.forEach((b,n)=>b.setAttribute('aria-pressed',String(i===n)));}
 function effect(item){select(Number(item.dataset.owner));worlds.forEach((w,i)=>w.dataset.effect=i===Number(item.dataset.owner)?item.dataset.effect:'');items.filter(b=>b.dataset.owner===item.dataset.owner).forEach(b=>b.setAttribute('aria-pressed',String(b===item)));section.querySelectorAll('.service-deliverable')[Number(item.dataset.owner)].textContent=item.getAttribute('aria-description');}
 buttons.forEach((b,i)=>{b.addEventListener('click',()=>select(i));b.addEventListener('keydown',e=>{const keys={ArrowRight:(i+1)%3,ArrowLeft:(i+2)%3,Home:0,End:2};if(e.key in keys){e.preventDefault();select(keys[e.key]);buttons[keys[e.key]].focus();}});});
 items.forEach(item=>{item.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')effect(item);});item.addEventListener('focus',()=>effect(item));item.addEventListener('click',()=>effect(item));});
 pause.addEventListener('click',()=>{paused=!paused;section.classList.toggle('services-paused',paused);pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Resume motion':'Pause motion';});
 let visible=false;const visibility=()=>section.classList.toggle('services-visible',visible&&!document.hidden);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visibility();}).observe(section);document.addEventListener('visibilitychange',visibility);
})();
