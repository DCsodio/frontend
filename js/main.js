"use strict";

/* Aside: submenus toggle */
Array.from(document.getElementsByClassName('menu is-menu-main')).forEach(function (el) {
  Array.from(el.getElementsByClassName('has-dropdown-icon')).forEach(function (elA) {
    elA.addEventListener('click', function (e) {
      var dropdownIcon = e.currentTarget.getElementsByClassName('dropdown-icon')[0].getElementsByClassName('mdi')[0];
      e.currentTarget.parentNode.classList.toggle('is-active');
      dropdownIcon.classList.toggle('mdi-plus');
      dropdownIcon.classList.toggle('mdi-minus');
    });
  });
});

/* Aside Mobile toggle */
Array.from(document.getElementsByClassName('jb-aside-mobile-toggle')).forEach(function (el) {
  el.addEventListener('click', function (e) {
    var dropdownIcon = e.currentTarget.getElementsByClassName('icon')[0].getElementsByClassName('mdi')[0];
    document.documentElement.classList.toggle('has-aside-mobile-expanded');
    dropdownIcon.classList.toggle('mdi-forwardburger');
    dropdownIcon.classList.toggle('mdi-backburger');
  });
});

/* NavBar menu mobile toggle */
Array.from(document.getElementsByClassName('jb-navbar-menu-toggle')).forEach(function (el) {
  el.addEventListener('click', function (e) {
    var dropdownIcon = e.currentTarget.getElementsByClassName('icon')[0].getElementsByClassName('mdi')[0];
    document.getElementById(e.currentTarget.getAttribute('data-target')).classList.toggle('is-active');
    dropdownIcon.classList.toggle('mdi-dots-vertical');
    dropdownIcon.classList.toggle('mdi-close');
  });
});

/* Modal genérico: open */
Array.from(document.getElementsByClassName('jb-modal')).forEach(function (el) {
  el.addEventListener('click', function (e) {
    var modalTarget = e.currentTarget.getAttribute('data-target');
    document.getElementById(modalTarget).classList.add('is-active');
    document.documentElement.classList.add('is-clipped');
  });
});

/* Modal genérico: close */
Array.from(document.getElementsByClassName('jb-modal-close')).forEach(function (el) {
  el.addEventListener('click', function (e) {
    e.currentTarget.closest('.modal').classList.remove('is-active');
    document.documentElement.classList.remove('is-clipped');
  });
});

/* Notification dismiss */
Array.from(document.getElementsByClassName('jb-notification-dismiss')).forEach(function (el) {
  el.addEventListener('click', function (e) {
    e.currentTarget.closest('.notification').classList.add('is-hidden');
  });
});

/* Logout */
document.querySelectorAll('[data-logout]').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('device_id');
    window.location.href = 'login.html';
  });
});

/* ── Username en navbar ────────────────────────────────────────────────────── */
var usernameEl = document.getElementById('navbar-username');
if (usernameEl) {
  var storedUsername = localStorage.getItem('username') || 'Usuario';
  usernameEl.textContent = storedUsername;
}

var API = "https://backend-ff8w.onrender.com";

/* ── Badge de dispositivo ─────────────────────────────────────────────────── */
// Mostrar "!" en el menú si el usuario no tiene device_id configurado
(function checkDeviceBadge() {
  var deviceId = localStorage.getItem('device_id');
  var badge = document.getElementById('device-badge');
  if (badge && !deviceId) {
    badge.style.display = 'inline';
  }
})();

/* ── Modal dispositivo ────────────────────────────────────────────────────── */
function abrirModalDevice() {
  var deviceId = localStorage.getItem('device_id');
  var infoEl = document.getElementById('device-current-info');
  var msgEl = document.getElementById('device-msg');
  var inputEl = document.getElementById('device-input');

  // Limpiar estado anterior
  msgEl.textContent = '';
  msgEl.className = '';
  inputEl.value = '';

  // Mostrar device actual si existe
  if (deviceId) {
    infoEl.className = 'device-current';
    infoEl.innerHTML = '<span class="mdi mdi-chip"></span> Dispositivo actual: <strong>' + deviceId + '</strong>';
  } else {
    infoEl.className = 'device-current no-device';
    infoEl.innerHTML = '<span class="mdi mdi-alert-circle"></span> <span>Sin dispositivo configurado</span>';
  }

  document.getElementById('device-modal').classList.add('is-active');
  document.documentElement.classList.add('is-clipped');
  setTimeout(function() { inputEl.focus(); }, 100);
}

function cerrarModalDevice() {
  document.getElementById('device-modal').classList.remove('is-active');
  document.documentElement.classList.remove('is-clipped');
}

function guardarDevice(btn) {
  var deviceId = document.getElementById('device-input').value.trim();
  var msgEl = document.getElementById('device-msg');
  var token = localStorage.getItem('token');

  msgEl.textContent = '';
  msgEl.className = '';

  if (!deviceId) {
    msgEl.textContent = 'Ingresá un ID de dispositivo';
    msgEl.className = 'is-error';
    return;
  }
  if (deviceId.length < 4) {
    msgEl.textContent = 'El ID debe tener al menos 4 caracteres';
    msgEl.className = 'is-error';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="mdi mdi-loading mdi-spin"></span> Guardando...';

  fetch(API + '/auth/device', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ device_id: deviceId })
  })
  .then(function(res) {
    return res.json().then(function(data) { return { ok: res.ok, data: data }; });
  })
  .then(function(result) {
    btn.disabled = false;
    btn.innerHTML = '<span class="mdi mdi-content-save"></span> Guardar';

    if (result.ok) {
      // Guardar en localStorage para uso local
      localStorage.setItem('device_id', deviceId);

      // Actualizar badge
      var badge = document.getElementById('device-badge');
      if (badge) badge.style.display = 'none';

      // Actualizar info en el modal
      var infoEl = document.getElementById('device-current-info');
      infoEl.className = 'device-current';
      infoEl.innerHTML = '<span class="mdi mdi-chip"></span> Dispositivo actual: <strong>' + deviceId + '</strong>';

      msgEl.textContent = '✓ Dispositivo configurado correctamente';
      msgEl.className = 'is-success';

      // Cerrar y recargar datos después de un momento
      setTimeout(function() {
        cerrarModalDevice();
        if (typeof cargarLecturas === 'function') cargarLecturas();
      }, 1200);

    } else {
      msgEl.textContent = result.data.detail || 'Error al guardar el dispositivo';
      msgEl.className = 'is-error';
    }
  })
  .catch(function() {
    btn.disabled = false;
    btn.innerHTML = '<span class="mdi mdi-content-save"></span> Guardar';
    msgEl.textContent = 'No se pudo conectar con el servidor';
    msgEl.className = 'is-error';
  });
}

/* ── Estadísticas ─────────────────────────────────────────────────────────── */
function fetchStats(btn) {
  var token   = localStorage.getItem('token');
  var errorEl = document.getElementById('stats-error');
  var panelEl = document.getElementById('stats-panel');

  errorEl.style.display = 'none';
  panelEl.style.display = 'none';
  btn.disabled  = true;
  btn.innerHTML = '<span class="mdi mdi-loading mdi-spin"></span> Cargando...';

  fetch(API + '/estadisticas/hoy', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(function(res) {
    return res.json().then(function(data) { return { ok: res.ok, data: data }; });
  })
  .then(function(result) {
    btn.disabled  = false;
    btn.innerHTML = '<span class="mdi mdi-chart-bar"></span> Ver estadística del día';

    if (!result.ok) {
      errorEl.textContent    = result.data.detail || 'No se pudo obtener la estadística.';
      errorEl.style.display  = 'block';
      return;
    }

    var d = result.data;

    if (d.total_lecturas > 0) {
      var fechaMax = new Date(d.maxima.hora);
      var fechaMin = new Date(d.minima.hora);
      var horaMaxLocal = fechaMax.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      var horaMinLocal = fechaMin.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

      document.getElementById('stats-fecha').textContent   = d.fecha;
      document.getElementById('stat-total').textContent    = d.total_lecturas;
      document.getElementById('stat-avg').textContent      = parseFloat(d.promedio).toFixed(1) + ' °C';
      document.getElementById('stat-max').textContent      = parseFloat(d.maxima.temperatura).toFixed(1) + ' °C';
      document.getElementById('stat-max-hora').textContent = 'a las ' + horaMaxLocal;
      document.getElementById('stat-min').textContent      = parseFloat(d.minima.temperatura).toFixed(1) + ' °C';
      document.getElementById('stat-min-hora').textContent = 'a las ' + horaMinLocal;
    } else {
      document.getElementById('stats-fecha').textContent = 'Sin datos hoy';
      document.getElementById('stat-total').textContent  = '0';
      document.getElementById('stat-avg').textContent    = '-';
    }

    panelEl.style.display = 'block';
  })
  .catch(function() {
    btn.disabled  = false;
    btn.innerHTML = '<span class="mdi mdi-chart-bar"></span> Ver estadística del día';
    errorEl.textContent   = 'No se pudo conectar con el servidor.';
    errorEl.style.display = 'block';
  });
}