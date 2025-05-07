import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth,
  signOut
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
checkAdmin().catch(() => window.location.href = "/views/login.html");

// Sucursales a consultar
const sucursales = ["tokyo", "kyoto", "osaka", "sapporo", "hiroshima"];

// ✅ FUNCIÓN UNIFICADA: Estado de habitaciones
async function cargarEstadoHabitaciones() {
  const contenedor = document.getElementById("estadoHabitaciones");
  contenedor.innerHTML = "";

  const hoy = new Date();
  const hoyISO = hoy.toISOString().split("T")[0];

  const reservasSnapshot = await getDocs(collection(db, "Reservas"));
  const reservasHoy = reservasSnapshot.docs.filter(doc => {
    const r = doc.data();
    const entrada = new Date(r.entrada);
    const salida = new Date(r.salida);
    return entrada <= hoy && salida > hoy;
  });

  const habitacionesOcupadas = {};
  reservasHoy.forEach(doc => {
    const r = doc.data();
    const key = `${r.sucursal.toLowerCase()}-${r.habitacion}`;
    habitacionesOcupadas[key] = r;
  });

  for (const sucursal of sucursales) {
    const habitacionesRef = collection(db, "sucursales", sucursal, "habitaciones");
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

    habitacionesSnap.forEach(doc => {
      const hab = doc.data();
      const habId = hab.nombre;
      const clave = `${sucursal.toLowerCase()}-${habId}`;
      const reserva = habitacionesOcupadas[clave];

      const estado = reserva ?
        `🔴 Ocupada por ${reserva.nombreCliente} (${reserva.entrada} → ${reserva.salida})` :
        "🟢 Disponible";

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
}
cargarEstadoHabitaciones();

// Registro simulado de nuevo admin
document.getElementById("formNuevoAdmin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailNuevoAdmin").value;
  const li = document.createElement("li");
  li.textContent = email;
  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "Eliminar";
  btnEliminar.onclick = () => li.remove();
  li.appendChild(btnEliminar);
  document.getElementById("listaAdmins").appendChild(li);
  document.getElementById("emailNuevoAdmin").value = "";
});

// Historial hospedaje
async function cargarHistorialHospedaje() {
  const historialRef = collection(db, "historialHospedaje");
  const historialSnap = await getDocs(historialRef);
  const tablaBody = document.getElementById("tablaHistorial");
  tablaBody.innerHTML = "";


  historialSnap.forEach(docSnap => {
    const data = docSnap.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.habitacion}</td>
      <td>${data.entrada}</td>
      <td>${data.salida}</td>
    `;
    tablaBody.appendChild(fila);
  });
}
cargarHistorialHospedaje();
async function cargarReservasPendientes() {
  const reservasRef = collection(db, "Reservas");
  const reservasSnap = await getDocs(reservasRef);
  const lista = document.getElementById("reservasDia");
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
        botones = `<button class="btn-checkin">Check-in</button>`;
      } else if (esCheckOutPendiente) {
        botones = `<button class="btn-checkout">Check-out</button>`;
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
}


cargarReservasPendientes();

// Simulación de cambio de rol
document.getElementById("formCambioRol").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailUsuarioRol").value;
  const mensaje = document.getElementById("mensajeRol");
  mensaje.textContent = `Usuario ${email} ha sido marcado como administrador.`;
  document.getElementById("emailUsuarioRol").value = "";
});

// Reseñas pendientes
async function cargarResenasPendientes() {
  const resenasRef = collection(db, "Reseñas");
  const resenasSnap = await getDocs(resenasRef);
  const contenedor = document.getElementById("resenasPendientes");
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
}

document.getElementById("resenasPendientes").addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  const reseñaRef = doc(db, "Reseñas", id);

  // Selector para obtener el texto ingresado en el textarea
  const respuestaTextarea = document.getElementById(`respuesta-${id}`);
  const respuestaTexto = respuestaTextarea?.value.trim() || "";

  if (e.target.classList.contains("btn-aprobar")) {
    await updateDoc(reseñaRef, {
      estado: "aprobada",
      respuestaAdmin: respuestaTexto
    });
    alert("✅ Reseña aprobada con respuesta guardada.");
  }

  if (e.target.classList.contains("btn-rechazar")) {
    await deleteDoc(reseñaRef);
    alert("🗑️ Reseña eliminada.");
  }

  await cargarResenasPendientes();
  await cargarResumenGeneral();
});



cargarResenasPendientes();

// Resumen general
async function cargarResumenGeneral() {
  let totalDisponibles = 0;
  let totalOcupadas = 0;
  let reservasHoy = 0;
  let ingresosHoy = 0;
  let resenasPendientes = 0;

  const hoy = new Date().toISOString().split("T")[0];

  for (const sucursal of sucursales) {
    const habitacionesRef = collection(db, "sucursales", sucursal, "habitaciones");
    const habitacionesSnap = await getDocs(habitacionesRef);

    habitacionesSnap.forEach(doc => {
      const data = doc.data();
      totalDisponibles += data.disponibles;
      totalOcupadas += (data.total - data.disponibles);
    });
  }

  const reservasRef = collection(db, "Reservas");
  const reservasSnap = await getDocs(reservasRef);
  reservasSnap.forEach(doc => {
    const data = doc.data();
    if (data.entrada === hoy) {
      reservasHoy++;
      ingresosHoy += data.precio || 0;
    }
  });

  const resenasRef = collection(db, "Reseñas");
  const resenasSnap = await getDocs(resenasRef);
  resenasSnap.forEach(doc => {
    const data = doc.data();
    if (data.estado?.toLowerCase() === "pendiente") resenasPendientes++;
  });

  document.getElementById("totalDisponibles").textContent = totalDisponibles;
  document.getElementById("totalOcupadas").textContent = totalOcupadas;
  document.getElementById("reservasHoy").textContent = reservasHoy;
  document.getElementById("ingresosHoy").textContent = `$${ingresosHoy}`;
  document.getElementById("resenasPendientesContador").textContent = resenasPendientes;
}
cargarResumenGeneral();

document.getElementById("reservasDia").addEventListener("click", (e) => {
  const btn = e.target;
  if (btn.classList.contains("btn-checkin")) {
    const cliente = btn.closest(".tarjeta-reserva").querySelector("strong").textContent;
    confirmarCheckIn(cliente);
  }
  
  if (btn.classList.contains("btn-checkout")) {
    const cliente = btn.closest(".tarjeta-reserva").querySelector("strong").textContent;
    confirmarCheckOut(cliente);
  }
  
});

import {
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


async function confirmarCheckIn(nombreCliente) {
  const reservasRef = await getDocs(collection(db, "Reservas"));
  const reserva = reservasRef.docs.find(doc => doc.data().nombreCliente === nombreCliente);

  if (reserva) {
    const reservaDoc = doc(db, "Reservas", reserva.id);
    await updateDoc(reservaDoc, { 
      estado: "en estadia", 
      checkInConfirmado: true // Cambiamos el estado del check-in a confirmado
    });

    alert(`✅ Check-in confirmado para ${nombreCliente}`);
await cargarReservasPendientes();
await cargarEstadoHabitaciones();
await cargarResumenGeneral();

  }
}


// Confirmar Check-Out → mover a historial y eliminar de Reservas
// Confirmar Check-Out → mover a historial y eliminar de Reservas
async function confirmarCheckOut(nombreCliente) {
  const reservasRef = await getDocs(collection(db, "Reservas"));
  const reserva = reservasRef.docs.find(doc => doc.data().nombreCliente === nombreCliente);

  if (reserva) {
    const data = reserva.data();
    const reservaDoc = doc(db, "Reservas", reserva.id);

    // 1. Guardar en historial
    await setDoc(doc(collection(db, "historialHospedaje")), {
      nombre: data.nombreCliente,
      habitacion: data.habitacion,
      entrada: data.entrada,
      salida: data.salida,
      sucursal: data.sucursal // Añadir sucursal al historial
    });

    // 2. Actualizar estado a "finalizada" y confirmar check-out
    await updateDoc(reservaDoc, { 
      estado: "finalizada", 
      checkOutConfirmado: true // Cambiar estado del check-out a confirmado
    });

    // 3. Eliminar la reserva original
    await deleteDoc(reservaDoc);

    alert(`✅ Check-out confirmado para ${nombreCliente}`);
    cargarReservasPendientes();
  }
}



// Mostrar usuarios con acciones
async function cargarUsuarios() {
  const usuariosSnap = await getDocs(collection(db, "usuarios")); // Ajustado a "usuarios"
  const tablaBody = document.querySelector("#tablaUsuarios tbody");
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
}

// Cambiar rol (cliente ↔ admin)
async function cambiarRolUsuario(id, rolActual) {
  const nuevoRol = rolActual === "admin" ? "cliente" : "admin";
  await updateDoc(doc(db, "usuarios", id), { rol: nuevoRol }); // Ajustado a "usuarios"
  alert(`Rol actualizado a ${nuevoRol}`);
  cargarUsuarios(); // Recarga tabla
}

// Eliminar usuario
async function eliminarUsuario(id) {
  const confirmar = confirm("¿Estás seguro de eliminar este usuario?");
  if (!confirmar) return;
  await deleteDoc(doc(db, "usuarios", id)); // Ajustado a "usuarios"
  alert("Usuario eliminado.");
  cargarUsuarios(); // Recarga tabla
}

// Llamar función al cargar
cargarUsuarios();
