// Función inline - no depende de Firebase
function limpiarSesion() {
  localStorage.removeItem('user');
  sessionStorage.removeItem('hasRedirected');
}

const btnLogin = document.getElementById('btnLogin');
const dropdownMenuBtn = document.getElementById('dropdownMenuBtn');
const dashboardLink = document.getElementById('dashboardLink');
const btnLogout = document.getElementById('btnLogout');

// Detectar ubicación para rutas relativas
const isInViews = window.location.pathname.includes('/views/');
const viewsPath = isInViews ? './' : './views/';
const rootPath = isInViews ? '../' : './';

let userCache = null;
try {
  userCache = JSON.parse(localStorage.getItem('user'));
} catch (e) {
  localStorage.removeItem('user');
  userCache = null;
}

if (userCache) {
  console.log('Usuario desde cache:', userCache);

  btnLogin?.style.display = 'none';
  dropdownMenuBtn?.style.display = 'block';
  dashboardLink?.style.display = 'block';
  btnLogout?.style.display = 'block';

  if (dropdownMenuBtn) dropdownMenuBtn.textContent = userCache.nombre || 'Usuario';

  dashboardLink?.addEventListener('click', () => {
    if (userCache.rol === 'admin') {
      window.location.href = viewsPath + 'dashboardAdmin.html';
    } else {
      window.location.href = viewsPath + 'dashboardCliente.html';
    }
  });

} else {
  if (btnLogin) btnLogin.style.display = 'block';
  if (dropdownMenuBtn) dropdownMenuBtn.style.display = 'none';
  if (dashboardLink) dashboardLink.style.display = 'none';
  if (btnLogout) btnLogout.style.display = 'none';
}

btnLogout?.addEventListener('click', () => {
  limpiarSesion();
  window.location.href = rootPath + 'index.html';
});

btnLogin?.addEventListener('click', () => {
  window.location.href = viewsPath + 'login.html';
});
