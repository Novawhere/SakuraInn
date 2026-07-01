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

  btnLogin?.style.setProperty('display', 'none');
  dropdownMenuBtn?.style.setProperty('display', 'block');
  dashboardLink?.style.setProperty('display', 'block');
  btnLogout?.style.setProperty('display', 'block');

  if (dropdownMenuBtn) dropdownMenuBtn.textContent = userCache.nombre || 'Usuario';

  dashboardLink?.addEventListener('click', (e) => {
    e.preventDefault();
    if (userCache.rol === 'admin') {
      window.location.href = viewsPath + 'dashboardAdmin.html';
    } else {
      window.location.href = viewsPath + 'dashboardCliente.html';
    }
  });

} else {
  btnLogin?.style.setProperty('display', 'inline-block');
  dropdownMenuBtn?.style.setProperty('display', 'none');
  dashboardLink?.style.setProperty('display', 'none');
  btnLogout?.style.setProperty('display', 'none');
}

btnLogout?.addEventListener('click', (e) => {
  e.preventDefault();
  limpiarSesion();
  window.location.href = rootPath + 'index.html';
});
