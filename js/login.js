// ════════════════════════════════════════════
//  NeonStream — Login page script
// ════════════════════════════════════════════

// ════════════════════════════════════════════
//  1. FLOATING PARTICLES BACKGROUND
// ════════════════════════════════════════════
(function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['rgba(255,46,99,', 'rgba(106,53,255,', 'rgba(255,255,255,'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 3 + Math.random() * 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${Math.random() * 100}%;
      background:${color}${0.15 + Math.random() * 0.25});
      --dur:${6 + Math.random() * 10}s;
      --delay:${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
})();

// ════════════════════════════════════════════
//  2. NAVBAR SCROLL DARK EFFECT
// ════════════════════════════════════════════
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// ════════════════════════════════════════════
//  3. TOAST
// ════════════════════════════════════════════
function showToast(msg, color = '#ff2e63') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = color + '66';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ════════════════════════════════════════════
//  4. PASSWORD SHOW / HIDE
// ════════════════════════════════════════════
const pwInput  = document.getElementById('passwordInput');
const eyeBtn   = document.getElementById('eyeToggle');
let   pwVis    = false;

eyeBtn.addEventListener('click', () => {
  pwVis = !pwVis;
  pwInput.type    = pwVis ? 'text' : 'password';
  eyeBtn.textContent = pwVis ? '🙈' : '👁';
});

// ════════════════════════════════════════════
//  5. PASSWORD STRENGTH METER
// ════════════════════════════════════════════
const strengthData = [
  { pct:'0%',   color:'transparent', label:'',        hint:'' },
  { pct:'20%',  color:'#ff2e63',     label:'Very Weak 🔴', hint:'Add more characters' },
  { pct:'40%',  color:'#ff8c00',     label:'Weak 🟠',       hint:'Make it longer' },
  { pct:'65%',  color:'#f0d000',     label:'Fair 🟡',       hint:'Add a capital letter' },
  { pct:'85%',  color:'#4db8ff',     label:'Good 🔵',       hint:'Add a number too' },
  { pct:'100%', color:'#00c26e',     label:'Strong 🟢',     hint:'Excellent!' },
];

pwInput.addEventListener('input', () => {
  const v = pwInput.value;
  const wrap = document.getElementById('strengthWrap');
  if (!v) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';

  let score = 0;
  if (v.length >= 6)  score++;
  if (v.length >= 10) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  const lv = strengthData[score] || strengthData[4];
  const bar = document.getElementById('strengthBar');
  bar.style.width      = lv.pct;
  bar.style.background = lv.color;
  document.getElementById('strengthLabel').textContent = lv.label;
  document.getElementById('strengthHint').textContent  = lv.hint;

  // Clear error
  pwInput.classList.remove('error');
  document.getElementById('passError').classList.remove('show');
});

// ════════════════════════════════════════════
//  6. LIVE EMAIL VALIDATION
// ════════════════════════════════════════════
const emailInput  = document.getElementById('emailInput');
const emailStatus = document.getElementById('emailStatus');

function isEmailValid(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\d{10}$/.test(v);
}

emailInput.addEventListener('input', () => {
  const v = emailInput.value.trim();
  document.getElementById('emailError').classList.remove('show');
  if (!v) {
    emailInput.classList.remove('error','valid');
    emailStatus.textContent = '';
    return;
  }
  if (isEmailValid(v)) {
    emailInput.classList.remove('error');
    emailInput.classList.add('valid');
    emailStatus.textContent = '✅';
  } else {
    emailInput.classList.remove('valid');
    emailStatus.textContent = '';
  }
});

function validateEmail() {
  const v = emailInput.value.trim();
  if (!isEmailValid(v)) {
    emailInput.classList.add('error','shake');
    document.getElementById('emailError').classList.add('show');
    setTimeout(() => emailInput.classList.remove('shake'), 450);
    return false;
  }
  return true;
}

function validatePass() {
  const v = pwInput.value;
  if (v.length < 6) {
    pwInput.classList.add('error','shake');
    document.getElementById('passError').classList.add('show');
    setTimeout(() => pwInput.classList.remove('shake'), 450);
    return false;
  }
  return true;
}

// ════════════════════════════════════════════
//  7. LOGIN BUTTON — LOADING → SUCCESS
// ════════════════════════════════════════════
document.getElementById('loginBtn').addEventListener('click', () => {
  const eOk = validateEmail();
  const pOk = validatePass();
  if (!eOk || !pOk) {
    showToast('⚠️ Please fill in all fields correctly.');
    return;
  }

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Verifying...';

  setTimeout(() => {
    btn.innerHTML = '✅ Login Successful!';
    // Remember the logged-in user (used by the header's account menu / Log Out)
    try {
      localStorage.setItem('ns_user', JSON.stringify({ email: emailInput.value.trim(), since: Date.now() }));
    } catch (_) { /* storage not available */ }
    btn.style.background = 'linear-gradient(135deg,#00c26e,#007a45)';
    showToast('🎉 Welcome back to NeonStream!', '#00c26e');
    setTimeout(() => { window.location.href = 'index.html'; }, 1400);
  }, 2000);
});

// ════════════════════════════════════════════
//  8. FORGOT PASSWORD FLOW
// ════════════════════════════════════════════
document.getElementById('forgotLink').addEventListener('click', (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) {
    emailInput.focus();
    emailInput.classList.add('shake');
    setTimeout(() => emailInput.classList.remove('shake'), 450);
    showToast('📧 Please enter your email or mobile number first.');
    return;
  }
  showToast('📩 Reset link sent! Please check your inbox.');
});

// ════════════════════════════════════════════
//  9. GOOGLE LOGIN
// ════════════════════════════════════════════
document.getElementById('googleBtn').addEventListener('click', function() {
  const btn = this;
  btn.innerHTML = `<span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px"></span><span>Connecting...</span>`;
  btn.disabled = true;
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = `<img src="images/google.png" alt="Google" style="width:20px;height:20px;border-radius:3px"><span>Google</span>`;
    showToast('ℹ️ Google login is in demo mode.');
  }, 1800);
});

// ════════════════════════════════════════════
// 10. APPLE LOGIN
// ════════════════════════════════════════════
document.getElementById('appleBtn').addEventListener('click', function() {
  const btn = this;
  btn.innerHTML = `<span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:8px"></span><span>Connecting...</span>`;
  btn.disabled = true;
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = `<img src="images/apple.png" alt="Apple" style="width:20px;height:20px;border-radius:3px"><span>Apple</span>`;
    showToast('ℹ️ Apple login is in demo mode.');
  }, 1800);
});

// ════════════════════════════════════════════
// 11. ENTER KEY SUPPORT
// ════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});
