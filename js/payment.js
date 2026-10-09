// ════════════════════════════════════════════
//  NeonStream — Checkout / Payment page script
//  Flow: Plan (subscription.html) → Account → Payment method → Details → OTP/Approve → Success
//  NOTE: This is a front-end demo. Nothing is sent to any server.
// ════════════════════════════════════════════

// ════════════════════════════════════════════
//  1. PLAN DATA (same prices as subscription.html)
// ════════════════════════════════════════════
const PLANS = {
  free: {
    name: 'Free Plan', badge: 'FREE', monthly: 0, annual: 0,
    features: ['720p Streaming', 'Watch on Mobile & Web', 'Limited Movies & Anime', 'Ads Included', 'Single Device']
  },
  standard: {
    name: 'Standard', badge: 'POPULAR', monthly: 299, annual: 239,
    features: ['1080p Full HD', '2 Devices Support', 'Movies + Anime + Series', 'No Ads', 'Download up to 10 Titles']
  },
  premium: {
    name: 'Premium', badge: '4K', monthly: 599, annual: 479,
    features: ['Ultra HD 4K', '4 Devices Support', 'Dolby Audio', 'Unlimited Downloads', 'All Premium Content']
  }
};

const params  = new URLSearchParams(location.search);
const planKey = PLANS[params.get('plan')] ? params.get('plan') : 'standard';
const billing = params.get('billing') === 'annual' ? 'annual' : 'monthly';
const plan    = PLANS[planKey];
const isFree  = planKey === 'free';

const perMonth   = plan[billing];
const dueToday   = billing === 'annual' ? perMonth * 12 : perMonth;
const yearSaving = (plan.monthly - plan.annual) * 12;

const rupees = n => '₹' + n.toLocaleString('en-IN');
const $ = id => document.getElementById(id);

// Everything collected during checkout (kept only in memory)
const order = { email: '', phone: '', method: '', methodLabel: '' };

// ════════════════════════════════════════════
//  2. TOAST + CONFETTI
// ════════════════════════════════════════════
let toastTimer;
function showToast(msg, color = '#ff2e63') {
  const t = $('toast');
  t.textContent = msg;
  t.style.borderColor = color + '66';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

function launchConfetti() {
  const colors = ['#ff2e63', '#6a35ff', '#fff', '#ff8c00', '#00c26e'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = el.style.height = (7 + Math.random() * 8) + 'px';
    el.style.animationDelay = Math.random() * 0.8 + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
}

// ════════════════════════════════════════════
//  3. ORDER SUMMARY (right side)
// ════════════════════════════════════════════
function fillSummary() {
  $('sumName').textContent = plan.name;
  $('sumBadge').textContent = plan.badge;
  $('sumBadge').classList.toggle('free', isFree);
  $('sumFeatures').innerHTML = plan.features.map(f => `<li>${f}</li>`).join('');

  if (isFree) {
    $('sumBilling').textContent = 'Free forever';
    $('sumPrice').textContent = '₹0';
  } else {
    $('sumBilling').textContent = billing === 'annual' ? 'Annual (billed yearly)' : 'Monthly';
    $('sumPrice').textContent = rupees(perMonth) + '/month';
  }
  $('sumTotal').textContent = rupees(dueToday);

  const showSaving = billing === 'annual' && yearSaving > 0;
  $('sumSavingRow').style.display = showSaving ? '' : 'none';
  $('sumSaving').textContent = rupees(yearSaving) + '/year';

  // "Change" links go back to the plan page with the same billing choice
  const back = `subscription.html?billing=${billing}`;
  $('changePlan').href = back;
  $('changePlan2').href = back;

  // Confirm box above the "Start Membership" button
  $('confirmPrice').textContent = billing === 'annual'
    ? `${rupees(dueToday)}/year`
    : `${rupees(perMonth)}/month`;
  $('confirmPlan').textContent = `${plan.name} plan`;
  $('fineCycle').textContent = billing === 'annual' ? 'yearly' : 'monthly';

  // Free plan doesn't need payment: change the account button text
  if (isFree) $('accountNext').textContent = 'Start Free Plan';
}
fillSummary();

// ════════════════════════════════════════════
//  4. STEP NAVIGATION + PROGRESS BAR
// ════════════════════════════════════════════
const progressFor = { stepAccount: 2, stepMethod: 3, stepDetails: 3, stepSuccess: 4 };

function showStep(id, push = true) {
  document.querySelectorAll('.step').forEach(s => s.classList.toggle('active', s.id === id));

  const current = progressFor[id];
  document.querySelectorAll('.progress-step').forEach(p => {
    const n = Number(p.dataset.step);
    p.classList.toggle('done', n < current);
    p.classList.toggle('active', n === current);
  });

  document.querySelector('.checkout').classList.toggle('done', id === 'stepSuccess');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (push) history.pushState({ step: id }, '', '#' + id.replace('step', '').toLowerCase());
}

// Browser back button moves between steps (but never back out of "Success")
history.replaceState({ step: 'stepAccount' }, '', location.pathname + location.search);
window.addEventListener('popstate', (e) => {
  if ($('stepSuccess').classList.contains('active')) {
    history.pushState({ step: 'stepSuccess' }, '');
    return;
  }
  showStep((e.state && e.state.step) || 'stepAccount', false);
});

document.querySelectorAll('.link-back').forEach(btn => {
  btn.addEventListener('click', () => history.back());
});

showStep('stepAccount', false);

// ════════════════════════════════════════════
//  5. HELPERS FOR FIELD ERRORS
// ════════════════════════════════════════════
function setError(input, errId, hasError) {
  input.classList.toggle('invalid', hasError);
  $(errId).classList.toggle('show', hasError);
  if (hasError) {
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 400);
  }
  return !hasError;
}

function clearOnInput(input, errId) {
  input.addEventListener('input', () => {
    input.classList.remove('invalid');
    $(errId).classList.remove('show');
  });
}

// Show / hide password
document.querySelectorAll('.eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = $(btn.dataset.target);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? '🙈' : '👁';
  });
});

// ════════════════════════════════════════════
//  6. STEP 2 — CREATE ACCOUNT
// ════════════════════════════════════════════
const accEmail = $('accEmail');
const accPhone = $('accPhone');
const accPass  = $('accPass');

// Pre-fill the email if the user signed up before on this browser
try {
  const saved = JSON.parse(localStorage.getItem('ns_account') || 'null');
  if (saved) { accEmail.value = saved.email || ''; accPhone.value = saved.phone || ''; }

  // Already logged in? Use that email (only if it's an email, not a mobile number)
  const user = JSON.parse(localStorage.getItem('ns_user') || 'null');
  if (user && user.email) {
    if (user.email.includes('@')) accEmail.value = user.email;
    else if (!accPhone.value && /^\d{10}$/.test(user.email)) accPhone.value = user.email;
    $('navSignIn').textContent = 'Signed in';
    $('navSignIn').href = 'index.html';
  }
} catch (_) { /* storage not available */ }

accPhone.addEventListener('input', () => { accPhone.value = accPhone.value.replace(/\D/g, '').slice(0, 10); });
clearOnInput(accEmail, 'accEmailErr');
clearOnInput(accPhone, 'accPhoneErr');
clearOnInput(accPass, 'accPassErr');

$('accountForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const okEmail = setError(accEmail, 'accEmailErr', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accEmail.value.trim()));
  const okPhone = setError(accPhone, 'accPhoneErr', !/^[6-9]\d{9}$/.test(accPhone.value));
  const okPass  = setError(accPass,  'accPassErr',  accPass.value.length < 6);
  if (!okEmail || !okPhone || !okPass) {
    showToast('⚠️ Please fix the highlighted fields.');
    return;
  }

  order.email = accEmail.value.trim();
  order.phone = accPhone.value;
  // Only email & phone are remembered — never the password
  try { localStorage.setItem('ns_account', JSON.stringify({ email: order.email, phone: order.phone })); } catch (_) {}

  if (isFree) {
    order.methodLabel = 'No payment needed';
    runProcessing('Activating your free plan…', 'Setting up your account.', 1600, finishCheckout);
  } else {
    showStep('stepMethod');
  }
});

// ════════════════════════════════════════════
//  7. STEP 3 — CHOOSE PAYMENT METHOD
// ════════════════════════════════════════════
const titles = {
  card: 'Set up your credit or debit card',
  upi: 'Set up UPI AutoPay',
  netbanking: 'Pay with Net Banking',
  wallet: 'Pay with a wallet'
};

document.querySelectorAll('.method').forEach(btn => {
  btn.addEventListener('click', () => {
    order.method = btn.dataset.method;
    $('detailsTitle').textContent = titles[order.method];
    document.querySelectorAll('.pay-form').forEach(f => {
      f.classList.toggle('active', f.dataset.method === order.method);
    });
    showStep('stepDetails');
  });
});

// ════════════════════════════════════════════
//  8. CARD FORM — formatting, brand, live preview
// ════════════════════════════════════════════
const cardNumber = $('cardNumber');
const cardName   = $('cardName');
const cardExpiry = $('cardExpiry');
const cardCvv    = $('cardCvv');
const preview    = $('cardPreview');

function detectBrand(num) {
  if (/^4/.test(num)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'MASTERCARD';
  if (/^3[47]/.test(num)) return 'AMEX';
  if (/^(60|65|81|82|508)/.test(num)) return 'RUPAY';
  return '';
}

// Luhn checksum — the standard check every real card number passes
function luhnValid(num) {
  let sum = 0, double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (double) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    double = !double;
  }
  return num.length >= 13 && sum % 10 === 0;
}

cardNumber.addEventListener('input', () => {
  const digits = cardNumber.value.replace(/\D/g, '');
  const brand = detectBrand(digits);
  const max = brand === 'AMEX' ? 15 : 16;
  const d = digits.slice(0, max);

  // AMEX is grouped 4-6-5, everything else 4-4-4-4
  const formatted = brand === 'AMEX'
    ? [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(' ')
    : d.replace(/(.{4})/g, '$1 ').trim();
  cardNumber.value = formatted;

  $('cardBrandTag').textContent = brand;
  $('pvBrand').textContent = brand;
  const masked = (d + '•'.repeat(Math.max(0, max - d.length)));
  $('pvNumber').textContent = brand === 'AMEX'
    ? `${masked.slice(0, 4)} ${masked.slice(4, 10)} ${masked.slice(10)}`
    : masked.replace(/(.{4})/g, '$1 ').trim();
  cardCvv.maxLength = brand === 'AMEX' ? 4 : 3;
});

cardName.addEventListener('input', () => {
  cardName.value = cardName.value.replace(/[^a-zA-Z .']/g, '');
  $('pvName').textContent = cardName.value.trim() || 'YOUR NAME';
});

cardExpiry.addEventListener('input', (e) => {
  let v = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
  if (v.length === 1 && Number(v) > 1) v = '0' + v;            // "4" → "04"
  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
  else if (v.length === 2 && e.inputType !== 'deleteContentBackward') v += '/';
  cardExpiry.value = v;
  $('pvExpiry').textContent = v || 'MM/YY';
});

cardCvv.addEventListener('input', () => {
  cardCvv.value = cardCvv.value.replace(/\D/g, '');
  $('pvCvv').textContent = '•'.repeat(cardCvv.value.length) || '•••';
});
cardCvv.addEventListener('focus', () => preview.classList.add('flipped'));
cardCvv.addEventListener('blur',  () => preview.classList.remove('flipped'));

[['cardNumber', 'cardNumberErr'], ['cardName', 'cardNameErr'], ['cardExpiry', 'cardExpiryErr'], ['cardCvv', 'cardCvvErr']]
  .forEach(([i, e]) => clearOnInput($(i), e));

function expiryValid(v) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]), year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= now && year <= now.getFullYear() + 20;
}

function validateCard() {
  const digits = cardNumber.value.replace(/\D/g, '');
  const brand = detectBrand(digits);
  const okNum  = setError(cardNumber, 'cardNumberErr', !luhnValid(digits));
  const okName = setError(cardName,   'cardNameErr',   cardName.value.trim().length < 2);
  const okExp  = setError(cardExpiry, 'cardExpiryErr', !expiryValid(cardExpiry.value));
  const okCvv  = setError(cardCvv,    'cardCvvErr',    cardCvv.value.length !== (brand === 'AMEX' ? 4 : 3));
  if (okNum && okName && okExp && okCvv) {
    const label = brand ? brand.charAt(0) + brand.slice(1).toLowerCase() : 'Card';
    order.methodLabel = `${label} •••• ${digits.slice(-4)}`;
    return true;
  }
  return false;
}

// ════════════════════════════════════════════
//  9. UPI FORM
// ════════════════════════════════════════════
const upiId = $('upiId');
const upiPattern = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

document.querySelectorAll('#upiApps .chip-btn').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#upiApps .chip-btn').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    // Fill a suggested handle for the chosen app, keeping what's before "@"
    const name = upiId.value.split('@')[0] || (order.phone || '');
    upiId.value = name + '@' + chip.dataset.suffix;
    $('upiIdOk').classList.remove('show');
    upiId.focus();
  });
});

upiId.addEventListener('input', () => {
  upiId.classList.remove('invalid', 'valid');
  $('upiIdErr').classList.remove('show');
  $('upiIdOk').classList.remove('show');
});

$('upiVerify').addEventListener('click', () => {
  const ok = setError(upiId, 'upiIdErr', !upiPattern.test(upiId.value.trim()));
  if (!ok) return;
  $('upiVerify').textContent = '…';
  setTimeout(() => {
    $('upiVerify').textContent = 'Verify';
    upiId.classList.add('valid');
    $('upiIdOk').classList.add('show');
  }, 700);
});

function validateUpi() {
  const ok = setError(upiId, 'upiIdErr', !upiPattern.test(upiId.value.trim()));
  if (ok) order.methodLabel = 'UPI · ' + upiId.value.trim();
  return ok;
}

// ════════════════════════════════════════════
// 10. NET BANKING FORM
// ════════════════════════════════════════════
let chosenBank = '';
const bankSelect = $('bankSelect');

document.querySelectorAll('#bankTiles .bank').forEach(tile => {
  tile.addEventListener('click', () => {
    document.querySelectorAll('#bankTiles .bank').forEach(t => t.classList.remove('selected'));
    tile.classList.add('selected');
    chosenBank = tile.dataset.bank;
    bankSelect.value = '';
    bankSelect.classList.remove('invalid');
    $('bankErr').classList.remove('show');
  });
});

bankSelect.addEventListener('change', () => {
  if (!bankSelect.value) return;
  document.querySelectorAll('#bankTiles .bank').forEach(t => t.classList.remove('selected'));
  chosenBank = bankSelect.value;
  bankSelect.classList.remove('invalid');
  $('bankErr').classList.remove('show');
});

function validateBank() {
  const ok = setError(bankSelect, 'bankErr', !chosenBank);
  if (ok) order.methodLabel = 'Net Banking · ' + chosenBank;
  return ok;
}

// ════════════════════════════════════════════
// 11. WALLET FORM
// ════════════════════════════════════════════
document.querySelectorAll('input[name="wallet"]').forEach(r => {
  r.addEventListener('change', () => $('walletErr').classList.remove('show'));
});

function validateWallet() {
  const picked = document.querySelector('input[name="wallet"]:checked');
  $('walletErr').classList.toggle('show', !picked);
  if (picked) order.methodLabel = picked.value;
  return !!picked;
}

// ════════════════════════════════════════════
// 12. "START MEMBERSHIP" BUTTON
// ════════════════════════════════════════════
const validators = { card: validateCard, upi: validateUpi, netbanking: validateBank, wallet: validateWallet };

$('agree').addEventListener('change', () => $('agreeErr').classList.remove('show'));

$('payBtn').addEventListener('click', () => {
  const formOk = validators[order.method]();
  const agreed = $('agree').checked;
  $('agreeErr').classList.toggle('show', !agreed);

  if (!formOk || !agreed) {
    showToast('⚠️ Please complete all required details.');
    return;
  }

  if (order.method === 'card') {
    runProcessing('Contacting your bank…', 'Please don\'t close or refresh this page.', 1500, openOtp);
  } else if (order.method === 'upi') {
    openUpiWait();
  } else if (order.method === 'netbanking') {
    runProcessing(`Redirecting to ${chosenBank}…`, 'Log in to your bank to approve the payment.', 2000, () =>
      runProcessing('Confirming your payment…', 'Almost there!', 1500, finishCheckout));
  } else {
    runProcessing(`Connecting to ${order.methodLabel}…`, 'Please wait a moment.', 2000, finishCheckout);
  }
});

// ════════════════════════════════════════════
// 13. PROCESSING OVERLAY
// ════════════════════════════════════════════
function runProcessing(title, text, ms, next) {
  $('processingTitle').textContent = title;
  $('processingText').textContent = text;
  $('processing').classList.add('open');
  setTimeout(() => {
    $('processing').classList.remove('open');
    next();
  }, ms);
}

// ════════════════════════════════════════════
// 14. OTP MODAL (card payments)
// ════════════════════════════════════════════
const otpBoxes = [...document.querySelectorAll('#otpInputs input')];
let otpInterval;

function openOtp() {
  $('otpPhone').textContent = order.phone.slice(-4);
  otpBoxes.forEach(b => (b.value = ''));
  $('otpErr').classList.remove('show');
  $('otpModal').classList.add('open');
  otpBoxes[0].focus();
  startOtpTimer();
  showToast('📩 OTP sent to your mobile number.', '#00c26e');
}

function startOtpTimer() {
  let left = 30;
  const resend = $('otpResend');
  resend.disabled = true;
  resend.innerHTML = `Resend OTP in <span id="otpTimer">${left}</span>s`;
  clearInterval(otpInterval);
  otpInterval = setInterval(() => {
    left--;
    if (left <= 0) {
      clearInterval(otpInterval);
      resend.disabled = false;
      resend.textContent = 'Resend OTP';
    } else {
      $('otpTimer').textContent = left;
    }
  }, 1000);
}

otpBoxes.forEach((box, i) => {
  box.addEventListener('input', () => {
    box.value = box.value.replace(/\D/g, '').slice(0, 1);
    $('otpErr').classList.remove('show');
    if (box.value && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && i > 0) otpBoxes[i - 1].focus();
    if (e.key === 'Enter') $('otpSubmit').click();
  });
  // Paste the whole code into the first box
  box.addEventListener('paste', (e) => {
    const code = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!code) return;
    e.preventDefault();
    code.split('').forEach((c, j) => { if (otpBoxes[j]) otpBoxes[j].value = c; });
    otpBoxes[Math.min(code.length, 5)].focus();
  });
});

$('otpResend').addEventListener('click', () => {
  startOtpTimer();
  showToast('📩 A new OTP has been sent.', '#00c26e');
});

$('otpCancel').addEventListener('click', () => {
  clearInterval(otpInterval);
  $('otpModal').classList.remove('open');
  showToast('Payment cancelled. You have not been charged.');
});

$('otpSubmit').addEventListener('click', () => {
  const code = otpBoxes.map(b => b.value).join('');
  if (code.length !== 6) {
    $('otpErr').classList.add('show');
    $('otpInputs').classList.add('shake');
    setTimeout(() => $('otpInputs').classList.remove('shake'), 400);
    return;
  }
  clearInterval(otpInterval);
  $('otpModal').classList.remove('open');
  runProcessing('Processing your payment…', 'Please don\'t close or refresh this page.', 2000, finishCheckout);
});

// ════════════════════════════════════════════
// 15. UPI WAITING MODAL
// ════════════════════════════════════════════
let upiInterval, upiApprove;

function openUpiWait() {
  $('upiTarget').textContent = upiId.value.trim();
  $('upiModal').classList.add('open');
  let left = 300;
  const tick = () => {
    const m = String(Math.floor(left / 60)).padStart(2, '0');
    const s = String(left % 60).padStart(2, '0');
    $('upiTimer').textContent = `${m}:${s}`;
    left--;
  };
  tick();
  upiInterval = setInterval(tick, 1000);

  // Demo: the request is "approved" automatically after a few seconds
  upiApprove = setTimeout(() => {
    closeUpiWait();
    runProcessing('Payment approved ✔', 'Activating your membership…', 1400, finishCheckout);
  }, 4500);
}

function closeUpiWait() {
  clearInterval(upiInterval);
  clearTimeout(upiApprove);
  $('upiModal').classList.remove('open');
}

$('upiCancel').addEventListener('click', () => {
  closeUpiWait();
  showToast('UPI request cancelled. You have not been charged.');
});

// ════════════════════════════════════════════
// 16. SUCCESS — receipt + save membership
// ════════════════════════════════════════════
function finishCheckout() {
  const orderId = 'NS-' + Date.now().toString().slice(-8);
  const next = new Date();
  if (billing === 'annual') next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);
  const nextText = isFree ? 'Never — it\'s free' : next.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  $('rcPlan').textContent = `${plan.name} (${isFree ? 'Free' : billing === 'annual' ? 'Annual' : 'Monthly'})`;
  $('rcAmount').textContent = rupees(dueToday);
  $('rcMethod').textContent = order.methodLabel;
  $('rcOrder').textContent = orderId;
  $('rcEmail').textContent = order.email;
  $('rcNext').textContent = nextText;
  if (isFree) $('successLead').textContent = 'Your free plan is active. Start watching now!';

  // Remember the membership so the home page can show it
  try {
    localStorage.setItem('ns_user', JSON.stringify({ email: order.email, since: Date.now() }));
    localStorage.setItem('ns_membership', JSON.stringify({
      plan: planKey, planName: plan.name, billing, orderId,
      email: order.email, nextBilling: nextText, since: new Date().toISOString()
    }));
  } catch (_) {}

  showStep('stepSuccess');
  launchConfetti();
  showToast('🎉 Payment successful! Welcome to NeonStream.', '#00c26e');
}

// ════════════════════════════════════════════
// 17. ESC closes the OTP / UPI popups
// ════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if ($('otpModal').classList.contains('open')) $('otpCancel').click();
  if ($('upiModal').classList.contains('open')) $('upiCancel').click();
});
