const nombreElement = document.getElementById('nombreUsuario');
const userCache = JSON.parse(localStorage.getItem('user'));

if (userCache) {
  nombreElement.textContent = `Hola, ${userCache.nombre}`;
} else {
  nombreElement.textContent = 'No se encontró información del usuario';
}
