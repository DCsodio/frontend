var API = "https://backend-ff8w.onrender.com";

// ── Capturar token si Google nos redirigió de vuelta ──────────────────────────
var urlParams = new URLSearchParams(window.location.search);
var googleToken = urlParams.get('token');
var esNuevo = urlParams.get('es_nuevo');

if (googleToken) {
  localStorage.setItem('token', googleToken);

  var googleNombre = urlParams.get('nombre');        // ← NUEVO
  if (googleNombre) {
    localStorage.setItem('display_name', googleNombre); // ← NUEVO
  }
  
  if (esNuevo === 'true') {
    // Usuario nuevo de Google, todavía no tiene device_id
    window.location.href = 'setup-device.html';
  } else {
    window.location.href = 'index.html';
  }
}

// ── Si ya hay sesión activa, ir directo al panel ──────────────────────────────
if (localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function switchTab(tab) {
  var allTabs = document.querySelectorAll('.auth-tab');
  var allPanels = document.querySelectorAll('.form-panel');

  allTabs.forEach(function(t) { t.classList.remove('is-active'); });
  allPanels.forEach(function(p) { p.classList.remove('is-active'); });

  document.getElementById('panel-' + tab).classList.add('is-active');
  allTabs[tab === 'login' ? 0 : 1].classList.add('is-active');

  clearMessages();
}

// ── Mensajes ──────────────────────────────────────────────────────────────────
function showMessage(id, text, type) {
  var el = document.getElementById(id);
  el.textContent = text;
  el.className = 'auth-message ' + (type === 'error' ? 'is-error' : 'is-success');
}

function clearMessages() {
  document.querySelectorAll('.auth-message').forEach(function(el) {
    el.className = 'auth-message';
    el.textContent = '';
  });
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.style.opacity = loading ? '0.7' : '1';
}

// ── Login normal ──────────────────────────────────────────────────────────────
function doLogin(btn) {
  var username = document.getElementById('login-username').value.trim();
  var password = document.getElementById('login-password').value;

  if (!username || !password) {
    showMessage('login-msg', 'Completá todos los campos', 'error');
    return;
  }

  setLoading(btn, true);

  fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password })
  })
  .then(function(res) {
    return res.json().then(function(data) { return { ok: res.ok, data: data }; });
  })
  .then(function(result) {
    if (result.ok) {
      localStorage.setItem('token', result.data.access_token);
      localStorage.setItem('username', username);
      showMessage('login-msg', '✓ Bienvenido, redirigiendo...', 'success');
      setTimeout(function() { window.location.href = 'index.html'; }, 800);
    } else {
      showMessage('login-msg', result.data.detail || 'Error al iniciar sesión', 'error');
      setLoading(btn, false);
    }
  })
  .catch(function() {
    showMessage('login-msg', 'No se pudo conectar con el servidor', 'error');
    setLoading(btn, false);
  });
}

// ── Login con Google ──────────────────────────────────────────────────────────
function doLoginGoogle() {
  window.location.href = API + '/auth/google/login';
}

// ── Registro ──────────────────────────────────────────────────────────────────
function doRegister(btn) {
  var username = document.getElementById('reg-username').value.trim();
  var password = document.getElementById('reg-password').value;
  var password2 = document.getElementById('reg-password2').value;
  var deviceId = document.getElementById('reg-device-id').value.trim();

  if (!username || !password || !password2 || !deviceId) {
    showMessage('register-msg', 'Completá todos los campos', 'error');
    return;
  }
  if (username.length < 3) {
    showMessage('register-msg', 'El usuario debe tener al menos 3 caracteres', 'error');
    return;
  }
  if (password.length < 6) {
    showMessage('register-msg', 'La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }
  if (password !== password2) {
    showMessage('register-msg', 'Las contraseñas no coinciden', 'error');
    return;
  }

  setLoading(btn, true);

  fetch(API + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password, device_id: deviceId })
  })
  .then(function(res) {
    return res.json().then(function(data) { return { ok: res.ok, data: data }; });
  })
  .then(function(result) {
    if (result.ok) {
      showMessage('register-msg', '✓ Cuenta creada. Podés iniciar sesión.', 'success');
      setLoading(btn, false);
      setTimeout(function() { switchTab('login'); }, 1500);
    } else {
      var errorMsg = 'Error al registrarse';

      if (result.data && Array.isArray(result.data.detail)) {
        errorMsg = result.data.detail[0].msg.replace('Value error, ', '');
      } else if (typeof result.data.detail === 'string') {
        errorMsg = result.data.detail;
      }

      showMessage('register-msg', errorMsg, 'error');
      setLoading(btn, false);
    }
  })
  .catch(function() {
    showMessage('register-msg', 'No se pudo conectar con el servidor', 'error');
    setLoading(btn, false);
  });
}

// ── Enter para submit ─────────────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  var activePanel = document.querySelector('.form-panel.is-active');
  if (activePanel.id === 'panel-login') doLogin(activePanel.querySelector('.btn-submit'));
  else doRegister(activePanel.querySelector('.btn-submit'));
});