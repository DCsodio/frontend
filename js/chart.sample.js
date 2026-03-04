"use strict";

// --- Guard: redirigir a login si no hay token ---
var TOKEN = localStorage.getItem("token");
if (!TOKEN) {
  window.location.href = "login.html";
}

var chartColors = {
  "default": {
    primary: '#00D1B2',
    info: '#209CEE',
    danger: '#FF3860'
  }
};

var ctx = document.getElementById('big-line-chart').getContext('2d');

var chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperatura (°C)',
      fill: false,
      borderColor: chartColors["default"].primary,
      borderWidth: 2,
      borderDash: [],
      borderDashOffset: 0.0,
      pointBackgroundColor: chartColors["default"].primary,
      pointBorderColor: 'rgba(255,255,255,0)',
      pointHoverBackgroundColor: chartColors["default"].primary,
      pointBorderWidth: 20,
      pointHoverRadius: 4,
      pointHoverBorderWidth: 15,
      pointRadius: 4,
      data: []
    }]
  },
  options: {
    maintainAspectRatio: false,
    legend: { display: false },
    responsive: true,
    tooltips: {
      backgroundColor: '#f5f5f5',
      titleFontColor: '#333',
      bodyFontColor: '#666',
      bodySpacing: 4,
      xPadding: 12,
      mode: 'nearest',
      intersect: 0,
      position: 'nearest'
    },
    scales: {
      yAxes: [{
        barPercentage: 1.6,
        gridLines: { drawBorder: false, color: 'rgba(29,140,248,0.0)', zeroLineColor: 'transparent' },
        ticks: { padding: 20, fontColor: '#9a9a9a' }
      }],
      xAxes: [{
        barPercentage: 1.6,
        gridLines: { drawBorder: false, color: 'rgba(225,78,202,0.1)', zeroLineColor: 'transparent' },
        ticks: { padding: 20, fontColor: '#9a9a9a', maxTicksLimit: 12, maxRotation: 45, minRotation: 0 }
      }]
    }
  }
});

// --- Carga de datos ---
var API_URL = "https://backend-ff8w.onrender.com/lecturas?limit=50";
var REFRESCO_MS = 10000;

function formatearTimestamp(ts) {
  var d = new Date(ts);
  return d.toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
}

function cargarLecturas() {
  fetch(API_URL, {
    headers: {
      "Authorization": "Bearer " + TOKEN
    }
  })
  .then(function(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "login.html";
      return;
    }
    if (!res.ok) throw new Error("Error HTTP: " + res.status);
    return res.json();
  })
  .then(function(lecturas) {
    if (!lecturas || !Array.isArray(lecturas) || lecturas.length === 0) return;
    chart.data.labels = lecturas.map(function(l) { return formatearTimestamp(l.hora); });
    chart.data.datasets[0].data = lecturas.map(function(l) { return l.temperatura; });
    chart.update();
  })
  .catch(function(err) { console.error("Error cargando lecturas:", err); });
}

cargarLecturas();
setInterval(cargarLecturas, REFRESCO_MS);

var reloadBtn = document.querySelector('.card-header-icon');
if (reloadBtn) {
  reloadBtn.addEventListener('click', function(e) {
    e.preventDefault();
    cargarLecturas();
  });
}

// Logout — cualquier elemento con data-logout="true"
document.querySelectorAll('[data-logout]').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "login.html";
  });
});
