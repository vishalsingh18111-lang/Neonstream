// ═══════════════════════════════════════
//  NeonStream — Subscription page script
// ═══════════════════════════════════════

// ═══════════════════════════════════════
//  1. BILLING TOGGLE — Monthly / Annual
// ═══════════════════════════════════════
let isAnnual = false;
const toggle = document.getElementById('billingToggle');
const monthlyLbl = document.getElementById('monthlyLabel');
const annualLbl  = document.getElementById('annualLabel');

toggle.addEventListener('click', () => {
  isAnnual = !isAnnual;
  toggle.classList.toggle('on', isAnnual);
  monthlyLbl.classList.toggle('active', !isAnnual);
  annualLbl.classList.toggle('active', isAnnual);

  document.querySelectorAll('.price').forEach(priceEl => {
    const target = isAnnual
      ? priceEl.dataset.annual
      : priceEl.dataset.monthly;
    animatePrice(priceEl, target);
  });

  // Update month label
  document.querySelectorAll('.month').forEach(m => {
    if (m.textContent.includes('Free')) return;
    m.textContent = isAnnual ? 'Per Month (Billed Annually)' : 'Per Month';
  });
});

function animatePrice(el, newVal) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(-10px)';
  el.style.transition = 'opacity 0.25s, transform 0.25s';
  setTimeout(() => {
    el.textContent = newVal;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 250);
}

// ═══════════════════════════════════════
//  2. CARD CLICK — HIGHLIGHT SELECTED
// ═══════════════════════════════════════
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});

// ═══════════════════════════════════════
//  3. SUBSCRIBE BUTTON — CONFETTI + TOAST
// ═══════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('subToast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

function launchConfetti() {
  const colors = ['#ff2e63','#6a35ff','#fff','#ff8c00','#00c26e'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top  = '-20px';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width  = (8 + Math.random() * 8) + 'px';
    el.style.height = (8 + Math.random() * 8) + 'px';
    el.style.animationDelay    = Math.random() * 1 + 's';
    el.style.animationDuration = (1.5 + Math.random()) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

// Free plan → straight to the Movies section on the home page.
// Paid plans → checkout page (account → payment → done) with the plan and billing in the URL.
document.querySelectorAll('.buy-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.card');
    const plan = card.dataset.plan;               // free / standard / premium
    const planName = btn.dataset.planName;
    const billing = isAnnual ? 'annual' : 'monthly';

    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    btn.textContent = '⏳ Please wait...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    // FREE PLAN: no account or payment needed — go straight to the movies
    if (plan === 'free') {
      // Don't overwrite a paid membership if the user already has one
      try {
        const current = JSON.parse(localStorage.getItem('ns_membership') || 'null');
        if (!current || current.plan === 'free') {
          localStorage.setItem('ns_membership', JSON.stringify({
            plan: 'free', planName: 'Free Plan', billing: 'free',
            orderId: 'FREE', nextBilling: 'Free forever', since: new Date().toISOString()
          }));
        }
      } catch (_) { /* storage not available */ }

      showToast('🎬 Free plan activated! Enjoy watching.');
      setTimeout(() => {
        window.location.href = 'index.html#movies';
      }, 900);
      return;
    }

    launchConfetti();
    showToast(`🎉 ${planName} plan selected! Let's set up your account.`);

    setTimeout(() => {
      window.location.href = `payment.html?plan=${plan}&billing=${billing}`;
    }, 1200);
  });
});

// Keep the billing choice if the user comes back with ?billing=annual
if (new URLSearchParams(location.search).get('billing') === 'annual') {
  toggle.click();
}

// ═══════════════════════════════════════
//  4. SCROLL REVEAL
// ═══════════════════════════════════════
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ═══════════════════════════════════════
//  5. NAVBAR SCROLL
// ═══════════════════════════════════════
window.addEventListener('scroll', () => {
  document.querySelector('nav').style.background =
    window.scrollY > 40 ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.5)';
});
