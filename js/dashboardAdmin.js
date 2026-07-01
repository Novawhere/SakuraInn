import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  app
} from "./firebaseConfig.js";
import {
  checkAdmin
} from "./authHelpers.js";

const db = getFirestore(app);
const auth = getAuth(app);

// Mostrar nombre
const nombreElement = document.getElementById('nombreUsuario');
const userCache = JSON.parse(localStorage.getItem('user'));
if (userCache) {
  nombreElement.textContent = `${userCache.nombre}`;
} else {
  nombreElement.textContent = 'No se encontró información del usuario';
}

// Validación de administrador
checkAdmin().catch(() => window.location.href = "../views/login.html");

// Sucursales a consultar
const sucursales = ["tokyo", "kyoto", "osaka", "sapporo", "hiroshima"];

// ✅ Estado de habitaciones
async function cargarEstadoHabitaciones() {
  try {
    const contenedor = document.getElementById("estadoHabitaciones");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const hoy = new Date();

    const reservasSnapshot = await getDocs(collection(db, "Reservas"));
    const reservasHoy = reservasSnapshot.docs.filter(docSnap => {
      const r = docSnap.data();
      const entrada = new Date(r.entrada);
      const salida = new Date(r.salida);
      return entrada <= hoy && salida > hoy;
    });

    const habitacionesOcupadas = {};
    reservasHoy.forEach(docSnap => {
      const r = docSnap.data();
      const key = `${r.sucursal.toLowerCase()}-${r.habitacion}`;
      habitacionesOcupadas[key] = r;
    });

    for (const sucursal of sucursales) {
      const habitacionesRef = collection(db, "Sucursales", sucursal, "habitaciones");
      const habitacionesSnap = await getDocs(habitacionesRef);

      const bloqueSucursal = document.createElement("div");
      bloqueSucursal.classList.add("bloque-sucursal");

      const titulo = document.createElement("h4");
      titulo.textContent = sucursal.toUpperCase();
      bloqueSucursal.appendChild(titulo);

      const tabla = document.createElement("table");
      tabla.classList.add("tabla-habitaciones");
      tabla.innerHTML = `
        <thead>
          <tr>
            <th>Habitación</th>
            <th>Tipo</th>
            <th>Estado (Hoy)</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const cuerpo = tabla.querySelector("tbody");

      habitacionesSnap.forEach(docSnap => {
        const hab = docSnap.data();
        const habId = hab.nombre;
        const clave = `${sucursal.toLowerCase()}-${habId}`;
        const reserva = habitacionesOcupadas[clave];

        const estado = reserva
          ? `🔴 Ocupada por ${reserva.nombreCliente} (${reserva.entrada} → ${reserva.salida})`
          : "🟢 Disponible";

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${habId}</td>
          <td>${hab.tipo}</td>
          <td>${estado}</td>
        `;
        cuerpo.appendChild(fila);
      });

      bloqueSucursal.appendChild(tabla);
      contenedor.appendChild(bloqueSucursal);
    }
  } catch (error) {
    console.error("Error cargando estado de habitaciones:", error);
    showToast("Error al cargar el estado de habitaciones.", "error");
  }
}
cargarEstadoHabitaciones();

// Historial hospedaje
async function cargarHistorialHospedaje() {
  try {
    const historialRef = collection(db, "historialHospedaje");
    const historialSnap = await getDocs(historialRef);
    const tablaBody = document.getElementById("tablaHistorial");
    if (!tablaBody) return;
    tablaBody.innerHTML = "";

    historialSnap.forEach(docSnap => {
      const data = docSnap.data();
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${data.nombre}</td>
        <td>${data.habitacion}</td>
        <td>${data.sucursal || "-"}</td>
        <td>${data.entrada}</td>
        <td>${data.salida}</td>
      `;
      tablaBody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error cargando historial:", error);
    showToast("Error al cargar el historial de hospedaje.", "error");
  }
}
cargarHistorialHospedaje();

// Reservas pendientes (check-in / check-out)
async function cargarReservasPendientes() {
  try {
    const reservasRef = collection(db, "Reservas");
    const reservasSnap = await getDocs(reservasRef);
    const lista = document.getElementById("reservasDia");
    if (!lista) return;
    lista.innerHTML = "";

    reservasSnap.forEach(docSnap => {
      const data = docSnap.data();
      const estado = (data.estado || "").toLowerCase();

      const esCheckInPendiente = estado === "check in pendiente";
      const esCheckOutPendiente = estado === "check out pendiente";

      if (esCheckInPendiente || esCheckOutPendiente) {
        const div = document.createElement("div");
        div.classList.add("tarjeta-reserva");
        let botones = "";

        if (esCheckInPendiente) {
          botones = `<button class="btn-checkin" data-id="${docSnap.id}">Check-in</button>`;
        } else if (esCheckOutPendiente) {
          botones = `<button class="btn-checkout" data-id="${docSnap.id}">Check-out</button>`;
        }

        div.innerHTML = `
          <p><strong>${data.nombreCliente}</strong> - ${data.habitacion} en ${data.sucursal}</p>
          <p>Entrada: ${data.entrada} | Salida: ${data.salida}</p>
          <p>Estado: ${data.estado}</p>
          ${botones}
        `;
        lista.appendChild(div);
      }
    });
  } catch (error) {
    console.error("Error cargando reservas pendientes:", error);
    showToast("Error al cargar las reservas pendientes.", "error");
  }
}
cargarReservasPendientes();

// Reseñas pendientes
async function cargarResenasPendientes() {
  try {
    const resenasRef = collection(db, "Reseñas");
    const resenasSnap = await getDocs(resenasRef);
    const contenedor = document.getElementById("resenasPendientes");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    resenasSnap.forEach(docSnap => {
      const data = docSnap.data();
      const estado = data.estado?.toLowerCase();

      if (estado === "pendiente") {
        const div = document.createElement("div");
        div.classList.add("tarjeta-resena");

        div.innerHTML = `
          <p><strong>${data.nombreCliente}</strong> dejó una reseña en <em>${data.nombreHabitacion} - ${data.nombreSucursal}</em></p>
          <p>Puntuación: ⭐ ${data.puntuacion}</p>
          <p><em>"${data.reseña}"</em></p>
          <label for="respuesta-${docSnap.id}"><strong>Respuesta del administrador:</strong></label><br>
          <textarea id="respuesta-${docSnap.id}" rows="3" style="width: 100%;" placeholder="Escribe una respuesta..."></textarea><br><br>
          <button class="btn-aprobar" data-id="${docSnap.id}">Aprobar</button>
          <button class="btn-rechazar" data-id="${docSnap.id}">Rechazar</button>
        `;

        contenedor.appendChild(div);
      }
    });
  } catch (error) {
    console.error("Error cargando reseñas pendientes:", error);
    showToast("Error al cargar las reseñas pendientes.", "error");
  }
}

document.getElementById("resenasPendientes").addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  try {
    const reseñaRef = doc(db, "Reseñas", id);

    const respuestaTextarea = document.getElementById(`respuesta-${id}`);
    const respuestaTexto = respuestaTextarea?.value.trim() || "";

    if (e.target.classList.contains("btn-aprobar")) {
      await updateDoc(reseñaRef, {
        estado: "aprobada",
        respuestaAdmin: respuestaTexto
      });
      showToast("Reseña aprobada con respuesta guardada.", "success");
    }

    if (e.target.classList.contains("btn-rechazar")) {
      await updateDoc(reseñaRef, { estado: "rechazada" });
      showToast("Reseña rechazada.", "success");
    }

    await cargarResenasPendientes();
    await cargarResumenGeneral();
  } catch (error) {
    console.error("Error procesando reseña:", error);
    showToast("Error al procesar la reseña.", "error");
  }
});

cargarResenasPendientes();

// Resumen general
async function cargarResumenGeneral() {
  try {
    let totalDisponibles = 0;
    let totalOcupadas = 0;
    let reservasHoy = 0;
    let ingresosHoy = 0;
    let resenasPendientes = 0;

    const hoy = new Date().toISOString().split("T")[0];

    for (const sucursal of sucursales) {
      const habitacionesRef = collection(db, "Sucursales", sucursal, "habitaciones");
      const habitacionesSnap = await getDocs(habitacionesRef);

      habitacionesSnap.forEach(docSnap => {
        const data = docSnap.data();
        totalDisponibles += data.disponibles;
        totalOcupadas += (data.total - data.disponibles);
      });
    }

    const reservasRef = collection(db, "Reservas");
    const reservasSnap = await getDocs(reservasRef);
    reservasSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.entrada === hoy) {
        reservasHoy++;
        ingresosHoy += data.precio || 0;
      }
    });

    const resenasRef = collection(db, "Reseñas");
    const resenasSnap = await getDocs(resenasRef);
    resenasSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.estado?.toLowerCase() === "pendiente") resenasPendientes++;
    });

    const el1 = document.getElementById("totalDisponibles");
    const el2 = document.getElementById("totalOcupadas");
    if (el1) el1.textContent = totalDisponibles;
    if (el2) el2.textContent = totalOcupadas;
    document.getElementById("reservasHoy").textContent = reservasHoy;
    document.getElementById("ingresosHoy").textContent = `$${ingresosHoy}`;
    document.getElementById("resenasPendientesContador").textContent = resenasPendientes;
  } catch (error) {
    console.error("Error cargando resumen general:", error);
    showToast("Error al cargar el resumen general.", "error");
  }
}
cargarResumenGeneral();

// Check-in / Check-out por ID de documento
document.getElementById("reservasDia").addEventListener("click", (e) => {
  const btn = e.target;
  if (btn.classList.contains("btn-checkin")) {
    confirmarCheckIn(btn.dataset.id);
  }
  if (btn.classList.contains("btn-checkout")) {
    confirmarCheckOut(btn.dataset.id);
  }
});

async function confirmarCheckIn(reservaId) {
  try {
    const reservaDoc = doc(db, "Reservas", reservaId);
    await updateDoc(reservaDoc, {
      estado: "en estadia",
      checkInConfirmado: true
    });

    showToast("Check-in confirmado.", "success");
    await cargarReservasPendientes();
    await cargarEstadoHabitaciones();
    await cargarResumenGeneral();
  } catch (error) {
    console.error("Error confirmando check-in:", error);
    showToast("Error al confirmar el check-in.", "error");
  }
}

async function confirmarCheckOut(reservaId) {
  try {
    const reservaDoc = doc(db, "Reservas", reservaId);
    const reservasSnap = await getDocs(collection(db, "Reservas"));
    const reserva = reservasSnap.docs.find(d => d.id === reservaId);

    if (!reserva) {
      showToast("Reserva no encontrada.", "error");
      return;
    }

    const data = reserva.data();

    await setDoc(doc(collection(db, "historialHospedaje")), {
      nombre: data.nombreCliente,
      habitacion: data.habitacion,
      sucursal: data.sucursal,
      entrada: data.entrada,
      salida: data.salida
    });

    await deleteDoc(reservaDoc);

    showToast("Check-out confirmado.", "success");
    await cargarReservasPendientes();
    await cargarEstadoHabitaciones();
    await cargarResumenGeneral();
  } catch (error) {
    console.error("Error confirmando check-out:", error);
    showToast("Error al confirmar el check-out.", "error");
  }
}

// Usuarios
async function cargarUsuarios() {
  try {
    const usuariosSnap = await getDocs(collection(db, "usuarios"));
    const tablaBody = document.querySelector("#tablaUsuarios tbody");
    if (!tablaBody) return;
    tablaBody.innerHTML = "";

    usuariosSnap.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;
      const fila = document.createElement("tr");

      const btnRol = document.createElement("button");
      btnRol.textContent = data.rol === "admin" ? "Admin" : "Cliente";
      btnRol.classList.add("btn-rol");
      btnRol.addEventListener("click", () => cambiarRolUsuario(id, data.rol));

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.classList.add("btn-eliminar");
      btnEliminar.addEventListener("click", () => eliminarUsuario(id));

      fila.innerHTML = `
        <td>${data.nombre}</td>
        <td>${data.correo}</td>
        <td></td>
        <td></td>
      `;
      fila.children[2].appendChild(btnRol);
      fila.children[3].appendChild(btnEliminar);
      tablaBody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    showToast("Error al cargar la lista de usuarios.", "error");
  }
}

async function cambiarRolUsuario(id, rolActual) {
  try {
    const nuevoRol = rolActual === "admin" ? "cliente" : "admin";
    await updateDoc(doc(db, "usuarios", id), { rol: nuevoRol });
    showToast(`Rol actualizado a ${nuevoRol}`, "success");
    await cargarUsuarios();
  } catch (error) {
    console.error("Error cambiando rol:", error);
    showToast("Error al cambiar el rol del usuario.", "error");
  }
}

async function eliminarUsuario(id) {
  const confirmar = confirm("¿Estás seguro de eliminar este usuario?");
  if (!confirmar) return;

  try {
    await deleteDoc(doc(db, "usuarios", id));
    showToast("Usuario eliminado.", "success");
    await cargarUsuarios();
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    showToast("Error al eliminar el usuario.", "error");
  }
}

cargarUsuarios();
