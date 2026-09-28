/* Static artwork is the default. Crew arrives, then the unresolved signal appears. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || typeof IntersectionObserver === 'undefined') return;
  const targets = '[data-crew-motion], [data-scene-motion]';
  const actors = [...document.querySelectorAll(targets)];
  if (!actors.length || !actors.every(actor => typeof actor.animate === 'function')) return;
  const seen = new Set(), active = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < .2 || seen.has(entry.target)) continue;
      seen.add(entry.target);
      observer.unobserve(entry.target);
      entry.target.querySelectorAll(targets).forEach((actor, index) => {
        const direction = actor.dataset.entryDirection === '-1' ? -1 : 1;
        const role = actor.closest('[data-actor]')?.dataset.actor;
        const poses = {
          walk: [`translateX(${14 * direction}px) rotate(${direction}deg)`, 550],
          carry: [`translate(${-16 * direction}px,8px) rotate(${-1.5 * direction}deg)`, 600],
          connect: [`translate(${-18 * direction}px,14px) rotate(${-3 * direction}deg)`, 650],
          flying: [`translate(${-18 * direction}px,14px) rotate(${-3 * direction}deg)`, 650],
          handoff: ['translateY(12px) scale(.985)', 600]
        };
        const signal = actor.dataset.sceneMotion;
        const [transform, duration] = signal ? ['translateY(4px)', 600] : poses[actor.dataset.pose] || ['translateY(12px)', 550];
        let frames = [{ transform, opacity: 0 }, { transform: 'none', opacity: 1 }];
        let actionDuration = duration;
        if (role === 'carrier') {
          frames = [
            { transform: `translateX(${-34 * direction}px) translateY(2px) rotate(${-1.2 * direction}deg)`, opacity: .55 },
            { transform: `translateX(${-23 * direction}px) translateY(-3px) rotate(${.8 * direction}deg)`, opacity: 1, offset: .34 },
            { transform: `translateX(${-11 * direction}px) translateY(2px) rotate(${-.5 * direction}deg)`, opacity: 1, offset: .68 },
            { transform: 'none', opacity: 1 }
          ];
          actionDuration = 1250;
        } else if (role === 'reviewer') {
          frames = [
            { transform: 'translateX(-7px) rotate(-4deg)', opacity: .65 },
            { transform: 'translateX(-4px) rotate(-3deg)', opacity: 1, offset: .3 },
            { transform: 'translateX(6px) rotate(4deg)', opacity: 1, offset: .7 },
            { transform: 'none', opacity: 1 }
          ];
          actionDuration = 1450;
        }
        const animation = actor.animate(frames, {
          duration: actionDuration, delay: signal ? 380 : index * 80, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'
        });
        active.add(animation);
        animation.finished.then(() => active.delete(animation), () => active.delete(animation));
      });
    }
  }, { threshold: .2 });
  new Set(actors.map(actor => actor.closest('svg'))).forEach(scene => observer.observe(scene));
  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    observer.disconnect();
    actors.forEach(actor => seen.add(actor.closest('svg')));
    active.forEach(animation => animation.cancel());
    active.clear();
  });
})();
