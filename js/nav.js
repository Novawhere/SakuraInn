import { limpiarSesion } from '/js/authHelpers.js';

const btnLogin = document.getElementById('btnLogin');
const dropdownMenuBtn = document.getElementById('dropdownMenuBtn');
const dashboardLink = document.getElementById('dashboardLink');
const btnLogout = document.getElementById('btnLogout');

const userCache = JSON.parse(localStorage.getItem('user'));

if (userCache) {
  console.log('Usuario desde cache:', userCache);

  // Ocultar botón de login, mostrar menú de usuario
  btnLogin.style.display = 'none';
  dropdownMenuBtn.style.display = 'block';
  dashboardLink.style.display = 'block'; 
  btnLogout.style.display = 'block';

  // Mostrar nombre en el botón del dropdown
  dropdownMenuBtn.textContent = userCache.nombre || 'Usuario';

  // Configurar el botón de dashboard según rol
  dashboardLink.addEventListener('click', () => {
    if (userCache.rol === 'admin') {
      window.location.href = '/views/dashboardAdmin.html';
    } else {
      window.location.href = '/views/dashboardCliente.html';
    }
  });

} else {
  btnLogin.style.display = 'block';
  dropdownMenuBtn.style.display = 'none';
  dashboardLink.style.display = 'none';
  btnLogout.style.display = 'none';
}

// Cierre de sesión
btnLogout?.addEventListener('click', () => {
  limpiarSesion();
  window.location.href = '/index.html';
});

// Redirige al login
btnLogin?.addEventListener('click', () => {
  window.location.href = '/views/login.html';
});
