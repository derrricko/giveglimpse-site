/* Progressive enhancement: all mission copy is readable before JavaScript runs. */
(() => {
 document.body.classList.add('js');
 const mediaPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
 let manualReduced = false;
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
 motionToggle.addEventListener('click', () => {manualReduced = !manualReduced; updateMotion();});
 mediaPreference.addEventListener('change', updateMotion);

 const missionButtons = [...document.querySelectorAll('[data-mission]')];
 const missionCopy = [...document.querySelectorAll('[data-mission-copy]')];
 const missionStage = document.querySelector('.mission-stage');
 function selectMission(index, animate = true) {
  missionButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mission === index)));
  missionStage.dataset.stage = index;
  missionCopy.forEach(article => {
   const selected = article.dataset.missionCopy === index;
   article.hidden = !selected;
   article.classList.toggle('is-entering', selected && animate);
  });
 }
 missionButtons.forEach(button => button.addEventListener('click', () => selectMission(button.dataset.mission)));
 if (missionStage) selectMission('0', false);

 const mediaButtons = [...document.querySelectorAll('[data-media]')];
 const mediaIllustration = document.querySelector('.media-explainer');
 const playButton = document.querySelector('.sequence-play');
 let sequenceTimers = [];
 let playing = false;
 function showMedia(state) {
  mediaIllustration.dataset.mediaState = state;
  mediaButtons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.media === state)));
  document.querySelectorAll('[data-media-copy]').forEach(copy => {
   copy.style.display = copy.dataset.mediaCopy === state ? 'block' : 'none';
  });
 }
 function stopSequence() {
  sequenceTimers.forEach(timer => clearTimeout(timer));
  sequenceTimers = [];
  playing = false;
  if (playButton) playButton.innerHTML = 'Play the sequence <span aria-hidden="true">↗</span>';
 }
 mediaButtons.forEach(button => button.addEventListener('click', () => {
  stopSequence();
  showMedia(button.dataset.media);
 }));
 if (playButton) {
  playButton.hidden = false;
  playButton.addEventListener('click', () => {
   if (playing) {stopSequence(); return;}
   if (document.body.classList.contains('reduce-motion')) {showMedia('business'); return;}
   showMedia('event');
   playing = true;
   playButton.textContent = 'Stop sequence';
   sequenceTimers.push(setTimeout(() => showMedia('stories'), 1600));
   sequenceTimers.push(setTimeout(() => showMedia('business'), 3700));
   sequenceTimers.push(setTimeout(stopSequence, 4000));
  });
  if ('IntersectionObserver' in window) {
   const sequenceObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) stopSequence();
   }, {threshold:0});
   sequenceObserver.observe(mediaIllustration);
  }
  document.addEventListener('visibilitychange', () => {if(document.hidden) stopSequence();});
  document.addEventListener('keydown', event => {if (event.key === 'Escape') stopSequence();});
  mediaPreference.addEventListener('change', stopSequence);
  motionToggle.addEventListener('click', stopSequence);
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
