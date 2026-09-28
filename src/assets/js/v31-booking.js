(()=>{
  'use strict';
  const booking=document.getElementById('talk');
  if(!booking)return;
  document.querySelectorAll('.v31-book').forEach(button=>button.addEventListener('click',()=>{
    booking.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }));
})();
