// ═══════════════════════════════════════
//  NeonStream — Home page script
// ═══════════════════════════════════════

// ═══════════════════════════════════════
//  1. NAVBAR — turns dark on scroll
// ═══════════════════════════════════════
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ═══════════════════════════════════════
//  2. TOAST NOTIFICATION
// ═══════════════════════════════════════
let toastTimer;
function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

// ═══════════════════════════════════════
//  3. NAVBAR LINKS — Home / Movies / Series / Anime / Trending
// ═══════════════════════════════════════
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const navTargets = {
  navHome: 'home',
  navMovies: 'movies',
  navSeries: 'series',     // Breaking Bad & Game of Thrones
  navAnime: 'anime',
  navTrending: 'movies'    // Trending Movies slider
};

Object.entries(navTargets).forEach(([linkId, sectionId]) => {
  const link = document.getElementById(linkId);
  if (!link) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSection(sectionId);
    history.replaceState(null, '', '#' + sectionId);
  });
});

// Highlight the nav link of the section currently on screen
const sectionToLink = {
  home: 'navHome',
  movies: 'navMovies',
  series: 'navSeries',
  anime: 'navAnime'
};
const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    const linkId = sectionToLink[entry.target.id];
    if (linkId) document.getElementById(linkId).classList.add('active');
  });
}, { rootMargin: '-45% 0px -50% 0px' });
Object.keys(sectionToLink).forEach(id => {
  const el = document.getElementById(id);
  if (el) activeObserver.observe(el);
});

// ═══════════════════════════════════════
//  4. HERO BUTTONS
// ═══════════════════════════════════════
document.getElementById('watchNowBtn').addEventListener('click', () => {
  scrollToSection('movies');
  showToast('🎬 Welcome to the Trending section!');
});

document.getElementById('trendingBtn').addEventListener('click', () => {
  scrollToSection('movies');
});

const myListModal = document.getElementById('myListModal');
document.getElementById('myListBtn').addEventListener('click', () => {
  myListModal.classList.add('open');
});
document.getElementById('modalClose').addEventListener('click', () => {
  myListModal.classList.remove('open');
});
myListModal.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') myListModal.classList.remove('open');
});

// ═══════════════════════════════════════
//  5. PLAY BUTTONS — show a toast
// ═══════════════════════════════════════
document.querySelectorAll('.play-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const title = btn.closest('.movie-card').querySelector('h3').textContent;
    showToast(`▶ "${title}" — Please log in to play`);
  });
});

// ═══════════════════════════════════════
//  6. ANIMATED STATS COUNTER
// ═══════════════════════════════════════
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const duration = 2000;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString() + suffix;
    if (current >= target) clearInterval(timer);
  }, 16);
}

// ═══════════════════════════════════════
//  7. SCROLL REVEAL + COUNTER TRIGGER
// ═══════════════════════════════════════
let statsAnimated = false;
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');

    // Start the counters once the stats section is visible
    if (!statsAnimated && entry.target.classList.contains('stats-section')) {
      statsAnimated = true;
      animateCounter(document.getElementById('stat1'), 50000, '+');
      animateCounter(document.getElementById('stat2'), 12, '+');
      animateCounter(document.getElementById('stat3'), 4, 'K');
      animateCounter(document.getElementById('stat4'), 15, '+');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ═══════════════════════════════════════
//  8. TRENDING SLIDER — ARROWS
// ═══════════════════════════════════════
const slider = document.getElementById('trendingSlider');
document.getElementById('sliderLeft').addEventListener('click', () => {
  slider.scrollBy({ left: -260, behavior: 'smooth' });
});
document.getElementById('sliderRight').addEventListener('click', () => {
  slider.scrollBy({ left: 260, behavior: 'smooth' });
});

// ═══════════════════════════════════════
//  9. GENRE FILTER TABS
// ═══════════════════════════════════════
const genreMap = {
  'all': null,
  'sci-fi': ['Sci-Fi'],
  'action': ['Action'],
  'romance': ['Romance'],
  'adventure': ['Adventure']
};

document.querySelectorAll('.genre-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.genre-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const genres = genreMap[tab.dataset.genre];

    document.querySelectorAll('#trendingSlider .movie-card').forEach(card => {
      const genreText = card.querySelector('p') ? card.querySelector('p').textContent : '';
      if (!genres || genres.some(g => genreText.includes(g))) {
        card.style.display = '';
        card.style.transition = 'opacity 0.4s';
        card.style.opacity = '0';
        setTimeout(() => (card.style.opacity = '1'), 50);
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ═══════════════════════════════════════
// 10. SEARCH — jump to the movie and put it at No. 1
//     (the page layout never changes: nothing is hidden)
// ═══════════════════════════════════════
const searchInput  = document.getElementById('search-input');
const searchForm   = document.querySelector('.search-box');
const suggestBox   = document.getElementById('searchSuggest');
const allCards     = [...document.querySelectorAll('.movie-card')];

// Remember every card's original position in its row
allCards.forEach(card => {
  card.dataset.order = [...card.parentElement.children].indexOf(card);
});

const cardTitle   = card => card.querySelector('h3').textContent.trim();
const cardGenre   = card => card.querySelector('.movie-bottom p').textContent.trim();
const cardSection = card => {
  const t = card.closest('section').querySelector('.section-title');
  return t ? t.textContent.trim() : '';
};

// Lower score = better match
function matchScore(card, q) {
  const title = cardTitle(card).toLowerCase();
  const genre = cardGenre(card).toLowerCase();
  if (title === q) return 0;
  if (title.startsWith(q)) return 1;
  if (title.split(/\s+/).some(w => w.startsWith(q))) return 2;
  if (title.includes(q)) return 3;
  if (genre.includes(q)) return 4;
  return Infinity;
}

function findMatches(q) {
  q = q.toLowerCase().trim();
  if (!q) return [];
  return allCards
    .map(card => ({ card, score: matchScore(card, q) }))
    .filter(m => m.score !== Infinity)
    .sort((x, y) => x.score - y.score)
    .map(m => m.card);
}

// Put the row back in its original order (undo the previous search)
function restoreRowOrder(row) {
  [...row.children]
    .sort((x, y) => x.dataset.order - y.dataset.order)
    .forEach(c => row.appendChild(c));
}

function goToCard(card) {
  const row = card.parentElement;

  // If a genre tab is hiding this movie, switch back to "All"
  if (card.style.display === 'none') {
    document.querySelector('.genre-tab[data-genre="all"]').click();
  }

  restoreRowOrder(row);
  row.prepend(card);                                   // No. 1 position
  if (row.id === 'trendingSlider') row.scrollTo({ left: 0, behavior: 'smooth' });

  const section = card.closest('section');
  section.classList.add('visible');                    // make sure it's revealed
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Highlight the found movie for a moment
  allCards.forEach(c => c.classList.remove('search-hit'));
  void card.offsetWidth;                               // restart the animation
  card.classList.add('search-hit');
  setTimeout(() => card.classList.remove('search-hit'), 3000);

  closeSuggestions();
  searchInput.blur();
  showToast(`🎬 "${cardTitle(card)}" — ${cardSection(card)}`);
}

// ---- Suggestions dropdown (floats over the page, layout stays the same) ----
let activeIndex = -1;
let currentMatches = [];

function renderSuggestions() {
  const q = searchInput.value.trim();
  currentMatches = findMatches(q).slice(0, 6);
  activeIndex = -1;

  if (!q) { closeSuggestions(); return; }

  if (!currentMatches.length) {
    suggestBox.innerHTML = `<li class="no-result">No results for "${q.replace(/</g, '&lt;')}"</li>`;
  } else {
    suggestBox.innerHTML = currentMatches.map((card, i) => `
      <li role="option" data-i="${i}">
        <img src="${card.querySelector('img').getAttribute('src')}" alt="">
        <div>
          <strong>${cardTitle(card)}</strong>
          <small>${cardSection(card)} · ${cardGenre(card)}</small>
        </div>
      </li>`).join('');
  }
  suggestBox.classList.add('open');
}

function closeSuggestions() {
  suggestBox.classList.remove('open');
  activeIndex = -1;
}

function setActive(i) {
  const items = suggestBox.querySelectorAll('li[data-i]');
  if (!items.length) return;
  activeIndex = (i + items.length) % items.length;
  items.forEach((li, j) => li.classList.toggle('active', j === activeIndex));
}

searchInput.addEventListener('input', renderSuggestions);
searchInput.addEventListener('focus', () => { if (searchInput.value.trim()) renderSuggestions(); });

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(activeIndex - 1); }
  if (e.key === 'Escape')    { closeSuggestions(); }
});

// Click a suggestion (mousedown so it fires before the input loses focus)
suggestBox.addEventListener('mousedown', (e) => {
  const li = e.target.closest('li[data-i]');
  if (!li) return;
  e.preventDefault();
  const card = currentMatches[Number(li.dataset.i)];
  searchInput.value = cardTitle(card);
  goToCard(card);
});

// Enter / search button → highlighted suggestion, or the best match
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) { searchInput.focus(); return; }
  const matches = findMatches(q);
  const card = activeIndex >= 0 ? currentMatches[activeIndex] : matches[0];
  if (card) {
    searchInput.value = cardTitle(card);
    goToCard(card);
  } else {
    closeSuggestions();
    showToast(`🔍 No results found for "${q}"`);
  }
});

// Click anywhere else closes the dropdown
document.addEventListener('click', (e) => {
  if (!searchForm.contains(e.target)) closeSuggestions();
});

// ═══════════════════════════════════════
// 11. OPEN A SECTION FROM THE URL (e.g. index.html#series)
// ═══════════════════════════════════════
window.addEventListener('load', () => {
  const id = location.hash.slice(1);
  if (id && document.getElementById(id)) {
    setTimeout(() => scrollToSection(id), 100);
  }
});

// ═══════════════════════════════════════
// 12. SHOW ACTIVE MEMBERSHIP (saved after choosing a plan)
// ═══════════════════════════════════════
const PLAN_LABELS = { free: 'Free Plan', standard: 'Standard Plan', premium: 'Premium Plan' };
const DOWNLOAD_LIMITS = { standard: 10, premium: Infinity };   // free plan: no downloads

let membership = null;
try { membership = JSON.parse(localStorage.getItem('ns_membership') || 'null'); } catch (_) {}

if (membership) {
  const subBtn = document.querySelector('.subscribe-btn');
  subBtn.textContent = `★ ${PLAN_LABELS[membership.plan] || membership.planName}`;
  subBtn.title = `Order ${membership.orderId} · Next billing: ${membership.nextBilling}`;
  subBtn.classList.add('member');
}

const isPaid = !!membership && membership.plan in DOWNLOAD_LIMITS;

// ═══════════════════════════════════════
// 13. DOWNLOADS (Standard & Premium plans only)
// ═══════════════════════════════════════
const downloadsBtn   = document.getElementById('downloadsBtn');
const downloadsModal = document.getElementById('downloadsModal');
const upgradeModal   = document.getElementById('upgradeModal');
const downloadsList  = document.getElementById('downloadsList');

let downloads = [];
try { downloads = JSON.parse(localStorage.getItem('ns_downloads') || '[]'); } catch (_) {}
const saveDownloads = () => {
  try { localStorage.setItem('ns_downloads', JSON.stringify(downloads)); } catch (_) {}
};

const DL_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';
const DONE_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// Size shown in the list depends on the plan's video quality
const fileSize = () => membership && membership.plan === 'premium' ? '4K · 4.2 GB' : 'Full HD · 1.6 GB';

function isDownloaded(title) { return downloads.some(d => d.title === title); }

// Add a download button on every movie poster
allCards.forEach(card => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dl-btn';
  btn.setAttribute('aria-label', `Download ${cardTitle(card)}`);
  btn.title = 'Download';
  btn.innerHTML = DL_ICON + '<span class="dl-progress"></span>';
  card.appendChild(btn);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    startDownload(card, btn);
  });
  refreshCardButton(card);
});

function refreshCardButton(card) {
  const btn = card.querySelector('.dl-btn');
  const done = isDownloaded(cardTitle(card));
  btn.classList.toggle('done', done);
  btn.innerHTML = (done ? DONE_ICON : DL_ICON) + '<span class="dl-progress"></span>';
  btn.title = done ? 'Downloaded' : 'Download';
}

function startDownload(card, btn) {
  const title = cardTitle(card);

  // Free plan or no plan → offer an upgrade
  if (!isPaid) {
    upgradeModal.classList.add('open');
    return;
  }
  if (isDownloaded(title)) {
    showToast(`✔ "${title}" is already in your Downloads`);
    openDownloads();
    return;
  }
  if (btn.classList.contains('loading')) return;

  const limit = DOWNLOAD_LIMITS[membership.plan];
  if (downloads.length >= limit) {
    showToast(`⚠️ Standard plan allows ${limit} downloads. Remove one or upgrade to Premium.`, 4000);
    return;
  }

  // Simulated download with a progress ring
  btn.classList.add('loading');
  const ring = btn.querySelector('.dl-progress');
  let pct = 0;
  showToast(`⬇ Downloading "${title}"…`);
  const timer = setInterval(() => {
    pct = Math.min(100, pct + 4 + Math.random() * 9);
    ring.style.setProperty('--p', pct);
    if (pct >= 100) {
      clearInterval(timer);
      btn.classList.remove('loading');
      downloads.push({
        title,
        img: card.querySelector('img').getAttribute('src'),
        genre: cardGenre(card),
        size: fileSize(),
        at: Date.now()
      });
      saveDownloads();
      refreshCardButton(card);
      updateDownloadsCount();
      showToast(`✅ "${title}" downloaded — watch it offline anytime`);
    }
  }, 120);
}

function updateDownloadsCount() {
  downloadsBtn.querySelector('.dl-count').textContent = downloads.length;
}

function renderDownloads() {
  const limit = DOWNLOAD_LIMITS[membership.plan];
  document.getElementById('downloadsInfo').textContent = limit === Infinity
    ? `${downloads.length} downloaded · Unlimited downloads on Premium`
    : `${downloads.length} of ${limit} downloads used on Standard`;

  if (!downloads.length) {
    downloadsList.innerHTML = '<li class="dl-empty">No downloads yet. Tap the ⬇ button on any movie to save it for offline viewing.</li>';
    return;
  }
  downloadsList.innerHTML = downloads.map((d, i) => `
    <li>
      <img src="${d.img}" alt="">
      <div class="dl-meta">
        <strong>${d.title}</strong>
        <small>${d.genre} · ${d.size}</small>
      </div>
      <button class="dl-play" data-i="${i}" aria-label="Play ${d.title}">▶</button>
      <button class="dl-remove" data-i="${i}" aria-label="Remove ${d.title}">✕</button>
    </li>`).join('');
}

function openDownloads() {
  renderDownloads();
  downloadsModal.classList.add('open');
}

downloadsList.addEventListener('click', (e) => {
  const play = e.target.closest('.dl-play');
  const remove = e.target.closest('.dl-remove');
  if (play) {
    showToast(`▶ Playing "${downloads[play.dataset.i].title}" offline`);
  }
  if (remove) {
    const [removed] = downloads.splice(Number(remove.dataset.i), 1);
    saveDownloads();
    updateDownloadsCount();
    renderDownloads();
    const card = allCards.find(c => cardTitle(c) === removed.title);
    if (card) refreshCardButton(card);
    showToast(`🗑 "${removed.title}" removed from Downloads`);
  }
});

// Downloads button in the header is only shown on paid plans
if (isPaid) {
  downloadsBtn.hidden = false;
  downloadsBtn.title = 'My Downloads';
  updateDownloadsCount();
  downloadsBtn.addEventListener('click', openDownloads);
}

// Close buttons / backdrop / Esc for both popups
const logoutModal = document.getElementById('logoutModal');
[downloadsModal, upgradeModal, logoutModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('.modal-close')) modal.classList.remove('open');
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    downloadsModal.classList.remove('open');
    upgradeModal.classList.remove('open');
    logoutModal.classList.remove('open');
    closeAccountMenu();
  }
});

// ═══════════════════════════════════════
// 14. ACCOUNT MENU + LOG OUT
// ═══════════════════════════════════════
const accountMenu     = document.getElementById('accountMenu');
const accountBtn      = document.getElementById('accountBtn');
const accountDropdown = document.getElementById('accountDropdown');
const loginLink       = document.getElementById('loginBtn');

let user = null;
try { user = JSON.parse(localStorage.getItem('ns_user') || 'null'); } catch (_) {}
// Older checkouts saved the email only on the membership
if (!user && membership && membership.email) user = { email: membership.email };

function closeAccountMenu() {
  accountDropdown.classList.remove('open');
  accountBtn.setAttribute('aria-expanded', 'false');
}

if (user) {
  const name = user.email.includes('@') ? user.email.split('@')[0] : user.email;
  loginLink.hidden = true;
  accountMenu.hidden = false;
  document.getElementById('accountAvatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('accountName').textContent = name;
  document.getElementById('accountEmail').textContent = user.email;
  document.getElementById('accountPlan').textContent = membership
    ? `${PLAN_LABELS[membership.plan] || membership.planName} · ${membership.plan === 'free' ? 'Free forever' : 'Renews ' + membership.nextBilling}`
    : 'No plan yet — choose one to start watching';

  if (isPaid) {
    const md = document.getElementById('menuDownloads');
    md.hidden = false;
    md.addEventListener('click', () => { closeAccountMenu(); openDownloads(); });
  }
}

accountBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = accountDropdown.classList.toggle('open');
  accountBtn.setAttribute('aria-expanded', String(open));
  // On phones the menu is fixed to the screen: place it just below the button
  accountDropdown.style.top = window.innerWidth <= 600
    ? accountBtn.getBoundingClientRect().bottom + 10 + 'px'
    : '';
});
document.addEventListener('click', (e) => {
  if (!accountMenu.contains(e.target)) closeAccountMenu();
});

// Log Out → ask first
document.getElementById('menuLogout').addEventListener('click', () => {
  closeAccountMenu();
  logoutModal.classList.add('open');
});
document.getElementById('logoutCancel').addEventListener('click', () => {
  logoutModal.classList.remove('open');
});
document.getElementById('logoutConfirm').addEventListener('click', () => {
  try {
    ['ns_user', 'ns_membership', 'ns_downloads', 'ns_account'].forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem('ns_flash', '👋 You have been logged out. See you soon!');
  } catch (_) {}
  location.href = 'index.html';   // reload as a logged-out visitor
});

// Show a message carried over from the previous page (e.g. after logging out)
try {
  const flash = sessionStorage.getItem('ns_flash');
  if (flash) {
    sessionStorage.removeItem('ns_flash');
    setTimeout(() => showToast(flash, 3500), 300);
  }
} catch (_) {}

