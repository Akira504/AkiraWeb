const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const body = document.body;
const gate = $('#experienceGate');
const enterWithMusic = $('#enterWithMusic');
const enterMuted = $('#enterMuted');
const header = $('#siteHeader');
const menuBtn = $('#menuBtn');
const mobileNav = $('#mobileNav');
const cursorGlow = $('.cursor-glow');
const progressBar = $('.page-progress span');
const musicPlayer = $('#musicPlayer');
const playerClose = $('#playerClose');
const quickMusicToggle = $('#quickMusicToggle');
const playPause = $('#playPause');
const prevTrack = $('#prevTrack');
const nextTrack = $('#nextTrack');
const playlistToggle = $('#playlistToggle');
const playlist = $('#playlist');
const trackTitle = $('#trackTitle');
const trackArtist = $('#trackArtist');
const trackProgress = $('#trackProgress');
const currentTime = $('#currentTime');
const duration = $('#duration');
const volume = $('#volume');
const audio = $('#audio');

const tracks = [
  {
    title: 'Moonlit Sakura Trail',
    artist: 'Kaazoom',
    src: 'assets/media/moonlit-sakura-trail.mp3'
  },
  {
    title: 'Koto Japan Soundtrack',
    artist: 'Aikoto',
    src: 'assets/media/koto-japan-soundtrack.mp3'
  }
];

let currentTrackIndex = 0;
let userHasEntered = false;

audio.volume = Number(volume.value);

function loadTrack(index, autoPlay = false) {
  currentTrackIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrackIndex];
  audio.src = track.src;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  $$('.playlist-item').forEach((item, i) => item.classList.toggle('active', i === currentTrackIndex));

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: 'FCC — Fallen Crown Collective'
    });
  }

  if (autoPlay) playAudio();
}

async function playAudio() {
  try {
    await audio.play();
    body.classList.add('audio-playing');
    playPause.setAttribute('aria-label', 'Mettre en pause');
  } catch (error) {
    body.classList.remove('audio-playing');
  }
}

function pauseAudio() {
  audio.pause();
  body.classList.remove('audio-playing');
  playPause.setAttribute('aria-label', 'Lire');
}

function toggleAudio() {
  if (!audio.src) loadTrack(currentTrackIndex, false);
  audio.paused ? playAudio() : pauseAudio();
  musicPlayer.classList.add('open');
}

function enterExperience(withMusic) {
  userHasEntered = true;
  body.classList.remove('gate-open');
  gate.classList.add('hidden');
  if (withMusic) {
    loadTrack(0, true);
    musicPlayer.classList.add('open');
  }
  sessionStorage.setItem('fcc-entered', '1');
}

body.classList.add('gate-open');
if (sessionStorage.getItem('fcc-entered') === '1') {
  userHasEntered = true;
  body.classList.remove('gate-open');
  gate.classList.add('hidden');
}

enterWithMusic.addEventListener('click', () => enterExperience(true));
enterMuted.addEventListener('click', () => enterExperience(false));

quickMusicToggle.addEventListener('click', toggleAudio);
playPause.addEventListener('click', toggleAudio);
prevTrack.addEventListener('click', () => loadTrack(currentTrackIndex - 1, true));
nextTrack.addEventListener('click', () => loadTrack(currentTrackIndex + 1, true));
playerClose.addEventListener('click', () => musicPlayer.classList.remove('open'));
$$('.music-open').forEach(btn => btn.addEventListener('click', () => musicPlayer.classList.add('open')));

playlistToggle.addEventListener('click', () => {
  const open = playlist.classList.toggle('open');
  playlistToggle.setAttribute('aria-expanded', String(open));
});

$$('.playlist-item').forEach(item => {
  item.addEventListener('click', () => loadTrack(Number(item.dataset.track), true));
});

volume.addEventListener('input', () => {
  audio.volume = Number(volume.value);
});

trackProgress.addEventListener('input', () => {
  if (Number.isFinite(audio.duration)) audio.currentTime = (Number(trackProgress.value) / 100) * audio.duration;
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

audio.addEventListener('loadedmetadata', () => duration.textContent = formatTime(audio.duration));
audio.addEventListener('timeupdate', () => {
  currentTime.textContent = formatTime(audio.currentTime);
  if (Number.isFinite(audio.duration)) trackProgress.value = (audio.currentTime / audio.duration) * 100;
});
audio.addEventListener('ended', () => loadTrack(currentTrackIndex + 1, true));
audio.addEventListener('play', () => body.classList.add('audio-playing'));
audio.addEventListener('pause', () => body.classList.remove('audio-playing'));

if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', playAudio);
  navigator.mediaSession.setActionHandler('pause', pauseAudio);
  navigator.mediaSession.setActionHandler('previoustrack', () => loadTrack(currentTrackIndex - 1, true));
  navigator.mediaSession.setActionHandler('nexttrack', () => loadTrack(currentTrackIndex + 1, true));
}

menuBtn.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuBtn.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
});
$$('#mobileNav a').forEach(link => link.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  menuBtn.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

const sections = $$('main section[id]');
const navLinks = $$('.desktop-nav a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-42% 0px -50% 0px', threshold: 0 });
sections.forEach(section => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('.reveal').forEach(el => revealObserver.observe(el));

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 30);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('pointermove', e => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  }, { passive: true });
}

function createSakura() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = $('#sakuraLayer');
  const count = window.innerWidth < 700 ? 10 : 18;
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = '✦';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.opacity = `${0.18 + Math.random() * 0.5}`;
    petal.style.animationDuration = `${12 + Math.random() * 16}s`;
    petal.style.animationDelay = `${-Math.random() * 20}s`;
    petal.style.setProperty('--drift', `${-120 + Math.random() * 240}px`);
    petal.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(petal);
  }
}
createSakura();
loadTrack(0, false);


const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;

if (finePointer && !prefersReducedMotion) {
  const magneticCards = $$('.magnetic-card');
  magneticCards.forEach(card => {
    const inner = $('.expertise-card__inner', card);
    const resetCard = () => {
      card.classList.remove('is-active');
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
      inner.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0)';
    };

    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 16;
      const rotateX = (0.5 - py) * 14;
      card.classList.add('is-active');
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      inner.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0,-4px,0)`;
    }, { passive: true });

    card.addEventListener('pointerleave', resetCard);
    card.addEventListener('pointercancel', resetCard);
    resetCard();
  });
}
