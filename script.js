/* Progressive enhancement: all mission copy is readable before JavaScript runs. */
(() => {
 document.body.classList.add('js');
 const mediaPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
 if (!mediaPreference.addEventListener) mediaPreference.addEventListener = (type, fn) => mediaPreference.addListener(fn);
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

 /* Opening sequence: finite, skippable, never blocks reading. Rest state is the designed hero. */
 const hero = document.querySelector('.hero[data-beat]');
 if (hero) {
  const skip = hero.querySelector('.opening-skip');
  const caption = hero.querySelector('.op-caption');
  const beats = [
   [0, ''],
   [900, 'People can come together around something worth doing.'],
   [6000, 'Glimpse is building a way to turn that purpose into real work.'],
   [12000, 'Work becomes stories people want to follow.'],
   [18000, 'Stories build an audience. Advertising helps sustain the business behind them. Contributions follow their own path.'],
   [24000, 'And a record anyone can inspect. Nothing deleted.']
  ];
  const END = 29500;
  let openingTimers = [];
  const reduced = () => document.body.classList.contains('reduce-motion');
  function setBeat(index, text) {
   hero.dataset.beat = String(index);
   caption.textContent = text;
   caption.classList.remove('is-entering'); void caption.offsetWidth; caption.classList.add('is-entering');
  }
  function finishOpening() {
   openingTimers.forEach(timer => clearTimeout(timer)); openingTimers = [];
   if (!hero.classList.contains('is-playing')) return;
   hero.dataset.beat = 'rest';
   hero.classList.remove('is-playing'); hero.classList.add('was-played');
   skip.hidden = true; caption.textContent = '';
   try { sessionStorage.setItem('glimpse-opening', '1'); } catch {}
   window.removeEventListener('scroll', onScroll);
  }
  function onScroll() { if (window.scrollY > 60) finishOpening(); }
  function startOpening() {
   if (reduced()) return;
   let seen = false; try { seen = sessionStorage.getItem('glimpse-opening') === '1'; } catch {}
   if (seen || window.scrollY > 60 || location.hash) return;
   hero.classList.add('is-playing'); skip.hidden = false;
   beats.forEach(([at, text], index) => openingTimers.push(setTimeout(() => setBeat(index, text), at)));
   openingTimers.push(setTimeout(finishOpening, END));
   window.addEventListener('scroll', onScroll, {passive:true});
  }
  skip.addEventListener('click', finishOpening);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') finishOpening(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishOpening(); });
  motionToggle.addEventListener('click', () => { if (reduced()) finishOpening(); });
  mediaPreference.addEventListener('change', () => { if (mediaPreference.matches) finishOpening(); });
  window.__glimpseOpening = { setBeat, finish: finishOpening };
  startOpening();
 }

 /* Undertaking 001: the hero object counts down to a real date, reads LIVE only when set by hand, and rests as the record. */
 const countdown = document.querySelector('.countdown');
 if (countdown) {
  const EVENT = {
   date: '2026-10-31',          // Saturday, October 31, 2026 · Muscatine, Iowa (America/Chicago). Days only until the time is fixed.
   startsAt: null,              // Set once the stream time is real, e.g. '2026-10-31T10:00:00-05:00'. Then hours show on the last day.
   live: false,                 // Set to true by hand while the stream is on. Never inferred from the clock.
   streamUrl: 'https://x.com/GiveGlimpse',
   record: false                // Set to true after the event: the countdown goes, the card is the record.
  };
  const num = countdown.querySelector('.count-num'), unit = countdown.querySelector('.count-unit'), label = countdown.querySelector('.count-label'), link = countdown.querySelector('.count-link');
  const stateLabel = document.querySelector('.art-state');
  const baseline = document.querySelector('.baseline-rest');
  const baselines = { before: 'Counting down to the first stream.<br>Then this becomes the record.', live: 'The first stream is on.<br>This card becomes the record.', record: 'The first stream has happened.<br>This is the record.' };
  const DAY = 86400000;
  const ymd = date => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Chicago', year:'numeric', month:'2-digit', day:'2-digit'}).format(date);
  const utc = s => Date.UTC(+s.slice(0,4), +s.slice(5,7) - 1, +s.slice(8,10));
  function setState(state, text) { countdown.dataset.state = state; if (stateLabel) stateLabel.textContent = text; if (baseline) baseline.innerHTML = baselines[state]; }
  function render() {
   if (EVENT.live) {
    countdown.hidden = false; setState('live', 'LIVE NOW');
    num.textContent = 'LIVE'; unit.textContent = ''; label.textContent = 'STREAMING NOW · UNDERTAKING 001'; link.href = EVENT.streamUrl;
    return;
   }
   const days = Math.round((utc(EVENT.date) - utc(ymd(new Date()))) / DAY);
   if (EVENT.record || days < 0) { countdown.hidden = true; setState('record', 'THE RECORD'); return; }
   countdown.hidden = false; setState('before', 'BEFORE THE STREAM');
   if (days === 0) {
    if (EVENT.startsAt) {
     const hours = Math.max(0, Math.floor((new Date(EVENT.startsAt) - Date.now()) / 3600000));
     num.textContent = String(hours); unit.textContent = hours === 1 ? 'HOUR' : 'HOURS';
     label.textContent = 'UNTIL THE FIRST LIVE STREAM · TODAY';
    } else { num.textContent = 'TODAY'; unit.textContent = ''; label.textContent = 'THE FIRST LIVE STREAM · SATURDAY, OCTOBER 31'; }
    return;
   }
   num.textContent = String(days); unit.textContent = days === 1 ? 'DAY' : 'DAYS';
   label.textContent = 'UNTIL THE FIRST LIVE STREAM · OCT 31';
  }
  render();
  setInterval(render, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
 }

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
