import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

let paginaActual = 0;
const porPagina = 1; // Muestra 1 reseña a la vez

// Mostrar reseñas desde localStorage
function mostrarResenas() {
  const contenedor = document.getElementById("contenedorResenasHotel");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnSiguiente = document.getElementById("btnSiguiente");

  const reseñasHotel = JSON.parse(localStorage.getItem("reseñasHotel")) || [];

  contenedor.innerHTML = "";

  if (reseñasHotel.length === 0) {
    contenedor.innerHTML = "<p>No hay reseñas para mostrar.</p>";
    return;
  }

  const inicio = paginaActual * porPagina;
  const fin = inicio + porPagina;
  const reseñasPagina = reseñasHotel.slice(inicio, fin);

  reseñasPagina.forEach(resena => {
    const div = document.createElement("div");
    div.classList.add("card-resena");

    div.innerHTML = `
      <p><strong>${resena.nombreCliente}</strong> hospedado en <em>${resena.nombreHabitacion}</em></p>
      <p>Puntuación: ⭐ ${resena.puntuacion}</p>
      <p><em>"${resena.reseña}"</em></p>
      ${resena.respuestaAdmin ? `<p class="respuesta-admin"><strong>Respuesta:</strong> ${resena.respuestaAdmin}</p>` : ""}
      <hr>
    `;

    contenedor.appendChild(div);
  });

  // Habilitar/deshabilitar botones
  btnAnterior.disabled = paginaActual === 0;
  btnSiguiente.disabled = fin >= reseñasHotel.length;
}

// Cargar reseñas desde Firestore y guardarlas en localStorage
async function cargarResenasHotel() {
  const nombreHotel = document.getElementById("nombre_hotel_head")?.textContent?.trim();
  if (!nombreHotel) {
    console.warn("No se encontró el nombre del hotel.");
    return;
  }

  const contenedor = document.getElementById("contenedorResenasHotel");
  contenedor.innerHTML = "<p>Cargando reseñas...</p>";

  try {
    const resenasRef = collection(db, "Reseñas");
    const resenasSnap = await getDocs(resenasRef);

    const reseñasHotel = [];

    resenasSnap.forEach(doc => {
      const data = doc.data();
      const estado = data.estado?.toLowerCase();
      const sucursal = data.nombreSucursal?.toLowerCase();

      if (estado === "aprobada" && sucursal.includes(nombreHotel.toLowerCase())) {
        reseñasHotel.push(data);
      }
    });

    localStorage.setItem("reseñasHotel", JSON.stringify(reseñasHotel));
    paginaActual = 0;
    mostrarResenas();

  } catch (error) {
    contenedor.innerHTML = "<p>Error al cargar reseñas. Inténtalo más tarde.</p>";
    console.error("Error al obtener reseñas:", error);
  }
}

// Eventos al cargar
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnAnterior")?.addEventListener("click", () => {
    paginaActual--;
    mostrarResenas();
  });

  document.getElementById("btnSiguiente")?.addEventListener("click", () => {
    paginaActual++;
    mostrarResenas();
  });

  cargarResenasHotel();
});
document.addEventListener("DOMContentLoaded", () => {
  const btnReservar = document.getElementById("hotelContactButton");

  if (btnReservar) {
    btnReservar.addEventListener("click", (e) => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.uid) {
        e.preventDefault(); // Cancela la navegación
        mostrarModalInicioSesion();
      }
    });
  }
});

// Modal simple de advertencia
function mostrarModalInicioSesion() {
  const modal = document.createElement("div");
  modal.id = "modalSesion";
  modal.style.position = "fixed";
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.6)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = 1000;

  modal.innerHTML = `
    <div style="background:white;padding:20px;border-radius:8px;max-width:300px;text-align:center;">
      <h3>Inicia Sesión</h3>
      <p>Debes iniciar sesión para poder reservar.</p>
      <button id="cerrarModal" style="margin-top:10px;">Aceptar</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("cerrarModal").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}
