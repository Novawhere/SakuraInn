// Sakura Toast Notification System
// Uso: showToast('Mensaje', 'success|error|info|warning', duracion_ms)

(function () {
  // Crear contenedor si no existe
  function getContainer() {
    let container = document.querySelector('.sakura-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'sakura-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  window.showToast = function (message, type = 'info', duration = 3000) {
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = `sakura-toast ${type}`;

    toast.innerHTML = `
      <span class="toast-icon"></span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Cerrar">&times;</button>
    `;

    // Cerrar al hacer click en X
    toast.querySelector('.toast-close').addEventListener('click', () => {
      removeToast(toast);
    });

    container.appendChild(toast);

    // Auto-remover después de la duración
    if (duration > 0) {
      setTimeout(() => removeToast(toast), duration);
    }

    return toast;
  };

  function removeToast(toast) {
    if (!toast || toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }
})();
