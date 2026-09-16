// One map explains who; a separate, illustrative journey explains what changes.
(() => {
  const people = [...document.querySelectorAll('[data-person]')];
  function selectPerson(button) {
    people.forEach(p => p.setAttribute('aria-pressed', String(p === button)));
    document.querySelectorAll('[data-body]').forEach(p => p.classList.toggle('is-active', p.dataset.body === button.dataset.person || p.dataset.body === button.dataset.recipient));
    document.querySelector('#who-name').textContent = button.dataset.relationshipTitle;
    document.querySelectorAll('[data-relationship]').forEach(p=>p.classList.toggle('is-active',p.dataset.relationship===button.dataset.person));
    document.querySelector('#who-description').textContent = button.dataset.description;
  }
  people.forEach(button => {
    button.addEventListener('click', () => selectPerson(button));
    button.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') selectPerson(button); });
    button.addEventListener('focus', () => selectPerson(button));
  });
  if (people.length) selectPerson(people[0]);
  const who=document.querySelector('.who-section');
  if(who)new IntersectionObserver(es=>es.forEach(e=>who.classList.toggle('motion-visible',e.isIntersecting))).observe(who);
})();
