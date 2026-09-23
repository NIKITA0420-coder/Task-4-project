(function () {
  "use strict";

  // ---------- tiny state helpers (localStorage, guarded) ----------
  function safeGet(key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  const els = {
    steps: document.querySelectorAll('.step'),
    views: document.querySelectorAll('.route-view'),
    toast: document.getElementById('toast'),
  };

  let toastTimer = null;
  function showToast(text) {
    els.toast.textContent = text;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600);
  }

  // ---------- client-side router ----------
  const ROUTES = ['register', 'login', 'dashboard'];

  function currentRoute() {
    const hash = (location.hash || '').replace(/^#\/?/, '');
    return ROUTES.includes(hash) ? hash : 'register';
  }

  function render(route) {
    els.views.forEach(v => v.classList.toggle('active', v.id === 'view-' + route));

    els.steps.forEach(step => {
      const stepName = step.dataset.step;
      const stepIdx = ROUTES.indexOf(stepName);
      const curIdx = ROUTES.indexOf(route);
      step.classList.remove('active', 'done');
      if (stepIdx === curIdx) step.classList.add('active');
      else if (stepIdx < curIdx) step.classList.add('done');
    });

    // guard: dashboard requires a logged-in session
    const session = safeGet('cog_session');
    if (route === 'dashboard' && !session) {
      location.hash = '#/login';
      return;
    }
    if (route === 'dashboard') paintDashboard(session);
  }

  function navigate(route) {
    location.hash = '#/' + route;
  }

  window.addEventListener('hashchange', () => render(currentRoute()));
  document.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.route));
  });

  // ---------- password show/hide (dynamic DOM) ----------
  const EYE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  document.querySelectorAll('.toggle-vis').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      btn.innerHTML = isPw ? EYE_OFF_ICON : EYE_ICON;
      btn.setAttribute('aria-label', isPw ? 'Hide password' : 'Show password');
    });
  });

  // ---------- validation helpers ----------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldState(input, msgEl, valid, message) {
    input.classList.toggle('valid', !!valid && input.value.length > 0);
    input.classList.toggle('invalid', !valid && input.value.length > 0);
    if (msgEl) {
      msgEl.textContent = input.value.length > 0 ? (message || '') : '';
      msgEl.className = 'msg' + (valid ? ' ok' : (input.value.length > 0 ? ' err' : ''));
    }
  }

  function passwordChecks(pw) {
    return {
      len: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      num: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };
  }

  function strengthScore(checks) {
    return Object.values(checks).filter(Boolean).length; // 0..5
  }

  function strengthLabel(score) {
    if (score <= 1) return { text: 'Weak', cls: 'fill-weak', bars: 1 };
    if (score <= 2) return { text: 'Weak', cls: 'fill-weak', bars: 1 };
    if (score === 3) return { text: 'Fair', cls: 'fill-fair', bars: 2 };
    if (score === 4) return { text: 'Good', cls: 'fill-good', bars: 3 };
    return { text: 'Strong', cls: 'fill-strong', bars: 4 };
  }

  // ---------- REGISTER form ----------
  const regName = document.getElementById('reg-name');
  const regEmail = document.getElementById('reg-email');
  const regPassword = document.getElementById('reg-password');
  const regConfirm = document.getElementById('reg-confirm');
  const regSubmit = document.getElementById('reg-submit');
  const regBanner = document.getElementById('register-banner');
  const bars = document.querySelectorAll('.bar');
  const strengthLabelEl = document.getElementById('strength-label');
  const reqItems = document.querySelectorAll('#req-list li');

  let regState = { name: false, email: false, password: false, confirm: false };

  function validateName() {
    const v = regName.value.trim();
    const valid = v.length >= 2;
    regState.name = valid;
    setFieldState(regName, document.getElementById('reg-name-msg'), valid,
      valid ? 'Looks good' : 'Enter at least 2 characters');
    updateSubmitState();
  }

  function validateEmail() {
    const v = regEmail.value.trim();
    const valid = EMAIL_RE.test(v);
    regState.email = valid;
    setFieldState(regEmail, document.getElementById('reg-email-msg'), valid,
      valid ? 'Valid email' : 'Enter a valid email address');
    updateSubmitState();
  }

  function validatePassword() {
    const pw = regPassword.value;
    const checks = passwordChecks(pw);

    reqItems.forEach(li => {
      const key = li.dataset.req;
      li.classList.toggle('met', !!checks[key]);
    });

    const score = strengthScore(checks); // 0..5
    const info = strengthLabel(score);
    bars.forEach((bar, i) => {
      bar.className = 'bar' + (i < info.bars ? ' ' + info.cls : '');
    });
    strengthLabelEl.textContent = pw.length ? ('Strength: ' + info.text) : 'Strength: —';

    const valid = checks.len && checks.upper && checks.lower && checks.num && checks.special;
    regState.password = valid;
    regPassword.classList.toggle('valid', valid);
    regPassword.classList.toggle('invalid', pw.length > 0 && !valid);

    // only reveal the strength meter and requirement checklist while the password is wrong
    const shouldShowHelp = pw.length > 0 && !valid;
    document.getElementById('strength-wrap').classList.toggle('show', shouldShowHelp);
    document.getElementById('req-list').classList.toggle('show', shouldShowHelp);

    // re-check confirm whenever password changes
    validateConfirm();
    updateSubmitState();
  }

  function validateConfirm() {
    const match = regConfirm.value.length > 0 && regConfirm.value === regPassword.value;
    regState.confirm = match;
    setFieldState(regConfirm, document.getElementById('reg-confirm-msg'), match,
      match ? 'Passwords match' : 'Passwords do not match');
    updateSubmitState();
  }

  function updateSubmitState() {
    const ok = regState.name && regState.email && regState.password && regState.confirm;
    regSubmit.disabled = !ok;
  }

  regName.addEventListener('input', validateName);
  regEmail.addEventListener('input', validateEmail);
  regPassword.addEventListener('input', validatePassword);
  regConfirm.addEventListener('input', validateConfirm);

  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    validateName(); validateEmail(); validatePassword(); validateConfirm();
    if (regSubmit.disabled) return;

    const checks = passwordChecks(regPassword.value);
    const score = strengthScore(checks);
    const user = {
      name: regName.value.trim(),
      email: regEmail.value.trim().toLowerCase(),
      password: regPassword.value, // demo only — never store plaintext in a real app
      strength: strengthLabel(score).text,
      createdAt: new Date().toISOString(),
    };
    safeSet('cog_user', user);

    regBanner.textContent = 'Account created for ' + user.name + '. Redirecting to sign in…';
    regBanner.className = 'banner ok show';
    showToast('Account created — please sign in');

    setTimeout(() => {
      navigate('login');
      document.getElementById('log-email').value = user.email;
    }, 900);
  });

  // ---------- LOGIN form ----------
  const logEmail = document.getElementById('log-email');
  const logPassword = document.getElementById('log-password');
  const logBanner = document.getElementById('login-banner');

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = safeGet('cog_user');
    const emailMsg = document.getElementById('log-email-msg');
    const pwMsg = document.getElementById('log-password-msg');
    emailMsg.textContent = ''; pwMsg.textContent = '';
    logBanner.className = 'banner';
    logEmail.classList.remove('invalid'); logPassword.classList.remove('invalid');

    if (!user) {
      logBanner.textContent = 'No account found yet — create one first.';
      logBanner.className = 'banner err show';
      return;
    }
    const emailOk = logEmail.value.trim().toLowerCase() === user.email;
    const pwOk = logPassword.value === user.password;

    if (!emailOk) {
      logEmail.classList.add('invalid');
      emailMsg.textContent = 'No account with that email';
      emailMsg.className = 'msg err';
    }
    if (!pwOk) {
      logPassword.classList.add('invalid');
      pwMsg.textContent = 'Incorrect password';
      pwMsg.className = 'msg err';
    }
    if (!emailOk || !pwOk) {
      logBanner.textContent = 'Sign in failed — check your details.';
      logBanner.className = 'banner err show';
      return;
    }

    const session = safeGet('cog_session');
    const visits = (session && session.visits ? session.visits : 0) + 1;
    safeSet('cog_session', {
      email: user.email,
      name: user.name,
      strength: user.strength,
      loginAt: new Date().toISOString(),
      visits: visits,
    });
    showToast('Signed in — welcome back, ' + user.name.split(' ')[0]);
    navigate('dashboard');
  });

  // ---------- DASHBOARD (dynamic DOM render from state) ----------
  function paintDashboard(session) {
    if (!session) return;
    const initials = session.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('dash-avatar').textContent = initials || '?';
    document.getElementById('dash-name').textContent = session.name;
    document.getElementById('dash-email').textContent = session.email;
    document.getElementById('stat-visits').textContent = session.visits || 1;

    const t = new Date(session.loginAt);
    document.getElementById('stat-time').textContent = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const activity = document.getElementById('activity-list');
    activity.innerHTML = '';
    const entries = [
      ['Account created', new Date(session.loginAt).toLocaleDateString()],
      ['Signed in from this device', t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })],
    ];
    entries.forEach(([label, val]) => {
      const li = document.createElement('li');
      li.innerHTML = '<b>' + label + '</b> — ' + val;
      activity.appendChild(li);
    });
  }

  document.getElementById('logout-btn').addEventListener('click', () => {
    try { localStorage.removeItem('cog_session'); } catch (e) {}
    showToast('Logged out');
    navigate('login');
  });

  // ---------- init ----------
  if (!location.hash) location.hash = '#/register';
  render(currentRoute());
})();
