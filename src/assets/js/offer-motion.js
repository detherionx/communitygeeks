// Finite instrument studies: reveal on entry, replay on deliberate hover.
// Static SVG remains the default, including when reduced motion is requested.
(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  // Claims reveal once when the text itself is visible, independently of the drawings.
  const claimAnimations = [];
  if ('IntersectionObserver' in window) {
    const claims = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      claims.unobserve(entry.target);
      if (!preference.matches) claimAnimations.push(entry.target.animate([
        { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%' }
      ], { duration: 950, easing: 'cubic-bezier(.22,1,.36,1)' }));
    }), { threshold: 1 });
    document.querySelectorAll('.claim-highlight').forEach(el => claims.observe(el));
  }
  preference.addEventListener('change', () => claimAnimations.forEach(a => a.cancel()));
  const ns = 'http://www.w3.org/2000/svg';
  const studies = [...document.querySelectorAll('.offer-visual')].map((el, index) => {
    const svg = el.querySelector('svg');
    const overlay = document.createElementNS(ns, 'g');
    overlay.setAttribute('aria-hidden', 'true');
    svg.appendChild(overlay);
    const particles = Array.from({ length: 3 }, () => {
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('r', '3');
      dot.setAttribute('fill', 'var(--signal)');
      dot.style.opacity = '0';
      overlay.appendChild(dot);
      return dot;
    });
    const halo = document.createElementNS(ns, 'circle');
    halo.setAttribute('cx', index === 0 ? '140' : '150');
    halo.setAttribute('cy', index === 0 ? '94' : '75');
    halo.setAttribute('r', '12');
    halo.setAttribute('fill', 'none');
    halo.setAttribute('stroke', 'var(--signal)');
    halo.setAttribute('stroke-width', '1');
    halo.style.opacity = '0';
    halo.style.transformOrigin = index === 0 ? '140px 94px' : '150px 75px';
    overlay.appendChild(halo);
    let running = [], seen = false, visible = false;
    const finish = () => { running.forEach(a => a.cancel()); running = []; };
    const play = (offset = 0) => {
      if (preference.matches || document.hidden || !visible || running.some(a => a.playState === 'running')) return;
      finish();
      const animate = (node, frames, duration, delay = 0, easing = 'cubic-bezier(.22,1,.36,1)') => {
        running.push(node.animate(frames, { duration, delay: delay + offset, easing, fill: 'backwards' }));
      };
      svg.querySelectorAll('.offer-line').forEach((line, i) => {
        const length = line.getTotalLength();
        animate(line, [{ strokeDasharray: `${length} ${length}`, strokeDashoffset: length, opacity: .15 },
          { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0, opacity: 1 }], 1600, i * 90);
      });
      svg.querySelectorAll('.offer-dot circle').forEach((dot, i) => {
        dot.style.transformBox = 'fill-box'; dot.style.transformOrigin = 'center';
        animate(dot, [{ opacity: .2, transform: 'scale(.55)' }, { opacity: 1, transform: 'scale(1)' }], 1000, i * 100);
      });
      if (index === 0) {
        animate(svg.querySelector('.offer-lens'), [{ transform: 'translate(-12px,5px)', opacity: .25 }, { transform: 'translate(0,0)', opacity: 1 }], 1900);
        const routes = [[18,110,92,75],[193,43,140,94],[206,124,140,94]];
        routes.forEach(([x,y,a,b], i) => animate(particles[i], [
          { transform: `translate(${x}px,${y}px)`, opacity: 0 },
          { transform: `translate(${x}px,${y}px)`, opacity: .9, offset: .12 },
          { transform: `translate(${a}px,${b}px)`, opacity: .9, offset: .85 },
          { transform: `translate(${a}px,${b}px)`, opacity: 0 }
        ], 1400, 900 + i * 280, 'ease-in-out'));
      } else if (index === 1) {
        svg.querySelectorAll('.offer-plane').forEach((plane, i) => animate(plane, [
          { transform: `translate(${i ? 14 : -12}px,${i ? 8 : -8}px)`, opacity: .3 },
          { transform: 'translate(0,0)', opacity: 1 }
        ], 1700, i * 160));
        [35,75,115].forEach((y, i) => animate(particles[i], [
          { transform: `translate(25px,${y}px)`, opacity: 0 },
          { transform: `translate(25px,${y}px)`, opacity: 1, offset: .1 },
          { transform: 'translate(116px,75px)', opacity: 1, offset: .7 },
          { transform: 'translate(155px,75px)', opacity: 0 }
        ], 1600, 700 + i * 260, 'cubic-bezier(.45,0,.2,1)'));
        const check = svg.querySelector('.offer-accent'), length = check.getTotalLength();
        animate(check, [{ strokeDasharray: `${length} ${length}`, strokeDashoffset: length, opacity: 0 },
          { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0, opacity: 1 }], 1000, 2200);
      } else {
        const arcs = svg.querySelector('path.offer-orbit'), arrows = svg.querySelector('.offer-accent');
        [arcs, arrows].forEach(node => {
          node.style.transformOrigin = '150px 75px';
          animate(node, [{ transform: 'rotate(-45deg)', opacity: .35 }, { transform: 'rotate(0deg)', opacity: 1 }], 2300);
        });
        const frames = Array.from({ length: 41 }, (_, i) => {
          const angle = -Math.PI / 2 + i / 40 * Math.PI * 2;
          return { transform: `translate(${150 + Math.cos(angle) * 48}px,${75 + Math.sin(angle) * 48}px)`, opacity: i === 0 || i === 40 ? 0 : .95, offset: i / 40 };
        });
        animate(particles[0], frames, 2800, 600, 'linear');
      }
      if (index !== 1) animate(halo, [{ opacity: 0, transform: 'scale(.6)' },
        { opacity: .65, transform: 'scale(1)', offset: .3 }, { opacity: 0, transform: 'scale(2.4)' }], 1400, 2500);
    };
    el.closest('.path-panel').addEventListener('pointerenter', () => { if (fine.matches) play(); });
    return { el, finish, enter() { visible = true; if (!seen) { seen = true; play(index * 140); } }, leave() { visible = false; finish(); } };
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const study = studies.find(s => s.el === entry.target);
      if (entry.isIntersecting) study.enter(); else study.leave();
    }), { threshold: .5 });
    studies.forEach(s => observer.observe(s.el));
  } else studies.forEach(s => s.enter());
  preference.addEventListener('change', () => studies.forEach(s => s.finish()));
  document.addEventListener('visibilitychange', () => { if (document.hidden) studies.forEach(s => s.finish()); });
})();
