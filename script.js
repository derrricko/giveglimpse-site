/* Progressive enhancement: all mission copy is readable before JavaScript runs. */
(() => {
 document.body.classList.add('js');
 const mediaPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
 if (!mediaPreference.addEventListener) mediaPreference.addEventListener = (type, fn) => mediaPreference.addListener(fn);
 let manualReduced = false;
 try { manualReduced = sessionStorage.getItem('glimpse-reduce-motion') === '1'; } catch {}
 const motionToggle = document.querySelector('.motion-toggle') || document.createElement('button');
 function updateMotion() {
  const reduced = manualReduced || mediaPreference.matches;
  document.body.classList.toggle('reduce-motion', reduced);
  document.documentElement.classList.toggle('reduce-motion', reduced);
  motionToggle.setAttribute('aria-pressed', String(reduced));
  motionToggle.textContent = mediaPreference.matches ? 'Motion reduced by system' : reduced ? 'Motion reduced' : 'Reduce motion';
  motionToggle.disabled = mediaPreference.matches;
 }
 if (motionToggle.isConnected) motionToggle.hidden = false;
 updateMotion();
 motionToggle.addEventListener('click', () => {
  manualReduced = !manualReduced;
  try { sessionStorage.setItem('glimpse-reduce-motion', manualReduced ? '1' : '0'); } catch {}
  updateMotion();
 });
 mediaPreference.addEventListener('change', updateMotion);

 /* Principles use one stable record. Controls choose the point of focus. */
 function connectStudy(rootSelector, dataKey, buttonSelector, copySelector, buttonKey, copyKey) {
  const study = document.querySelector(rootSelector);
  if (!study) return;
  const buttons = [...study.querySelectorAll(buttonSelector)];
  const articles = [...study.querySelectorAll(copySelector)];
  function select(value) {
   study.dataset[dataKey] = value;
   buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset[buttonKey] === value)));
   articles.forEach(article => { article.hidden = article.dataset[copyKey] !== value; });
  }
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset[buttonKey])));
  select('0');
 }
 connectStudy('.trust-study', 'principle', '[data-principle-button]', '[data-principle-copy]', 'principleButton', 'principleCopy');
 // Trace the four connections once. Never gate text or scrolling on the animation.
 const cycle = document.querySelector('.community-cycle');
 if (cycle && 'IntersectionObserver' in window) {
  const cycleObserver = new IntersectionObserver(entries => {
   if (!entries.some(entry => entry.isIntersecting)) return;
   cycle.classList.add('cycle-traced');
   cycleObserver.disconnect();
  }, {threshold:0.25});
  cycleObserver.observe(cycle);
 }

 const chapters = [...document.querySelectorAll('[data-chapter]')];
 if ('IntersectionObserver' in window && chapters.length) {
  const observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.chapter-nav a').forEach(link => {
     if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'true');
     else link.removeAttribute('aria-current');
    });
   });
  }, { rootMargin:'-15% 0px -55% 0px', threshold:0 });
  chapters.forEach(chapter => observer.observe(chapter));
 }
 document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const feedback = document.querySelector('.copy-feedback') || document.createElement('p');
  try {
   await navigator.clipboard.writeText(button.dataset.copy);
   feedback.textContent = 'Contract address copied.';
   button.textContent = 'Copied';
   feedback.classList.remove('is-error');
   setTimeout(() => {button.textContent = 'Copy address ↗';}, 2000);
  } catch {
   feedback.classList.add('is-error');
   feedback.textContent = 'Clipboard access is unavailable here. Select the address above and copy it manually.';
  }
 }));
})();
