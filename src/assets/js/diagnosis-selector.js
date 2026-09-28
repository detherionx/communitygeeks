/* One fee and one visible detail panel; all downstream controls share the choice. */
(() => {
  const root=document.querySelector('[data-diagnosis-selector]');
  if(!root)return;
  const disclosure=root.querySelector('[data-diagnosis-disclosure]');
  const tracks=[...root.querySelectorAll('[data-diagnosis-track]')].map(tab=>{
    const panel=document.getElementById(tab.getAttribute('aria-controls'));
    return {tab,panel,offer:panel.dataset};
  });
  const select=(track,updateHash=false)=>{
    tracks.forEach(item=>{
      item.tab.setAttribute('aria-checked',String(item===track));
      item.tab.tabIndex=item===track?0:-1;
      item.panel.hidden=item!==track;
    });
    document.querySelectorAll('[data-contextual-cta]').forEach(button=>{
      button.dataset.offer=track.offer.offer;
      button.dataset.name=button.dataset.tierLabel?button.dataset.tierLabel+' · '+track.offer.track:track.offer.name;
      button.dataset.intro=button.dataset.tierIntro||track.offer.intro;
    });
    document.querySelectorAll('[data-selected-diagnosis]').forEach(element=>element.textContent=track.offer.name);
    if(updateHash){history.replaceState(null,'','#'+track.panel.id);disclosure.open=true;}
    window.dispatchEvent(new CustomEvent('diagnosis:change',{detail:{name:track.offer.name}}));
  };
  tracks.forEach((track,index)=>{
    track.tab.addEventListener('click',event=>{event.preventDefault();select(track,true);});
    track.tab.addEventListener('keydown',event=>{
      if(event.ctrlKey||event.metaKey||event.altKey)return;
      if(event.key===' '){event.preventDefault();select(track,true);return;}
      const offset={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[event.key];
      if(!offset&&event.key!=='Home'&&event.key!=='End')return;
      event.preventDefault();
      const next=tracks[event.key==='Home'?0:event.key==='End'?tracks.length-1:(index+offset+tracks.length)%tracks.length];
      select(next,true);next.tab.focus();
    });
  });
  const fromHash=()=>tracks.find(track=>'#'+track.panel.id===location.hash);
  window.addEventListener('hashchange',()=>{const track=fromHash();if(track){select(track);disclosure.open=true;}});
  window.addEventListener('diagnosis:request',event=>{const track=tracks.find(item=>item.offer.name===event.detail?.name);if(track)select(track,true);});
  root.dataset.enhanced='true';
  select(fromHash()||tracks[0]);
  disclosure.open=Boolean(fromHash());
})();
