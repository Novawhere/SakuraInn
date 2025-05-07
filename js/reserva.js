import { app, auth, db } from './firebaseConfig.js';
import {
    collection, getDocs, query, where, doc, updateDoc, addDoc, deleteDoc, getDoc
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const habitacionSelect = document.getElementById("habitacion");
const sucursalSelect = document.getElementById("sucursal");
const formReserva = document.getElementById("formReservaCliente");
const confirmationMessage = document.getElementById("confirmationMessage");

let calendar;

async function cargarSucursales() {
    const sucursalesRef = collection(db, "Sucursales");
    const snapshot = await getDocs(sucursalesRef);

    sucursalSelect.innerHTML = `<option value="">Selecciona una sucursal</option>`;
    snapshot.forEach(doc => {
        const suc = doc.data();
        const opt = document.createElement("option");
        opt.value = doc.id;
        opt.textContent = suc.nombre;
        sucursalSelect.appendChild(opt);
    });
}

function mostrarCalendario(eventos) {
    const calendarEl = document.getElementById('calendarioDisponibilidad');
    if (calendar) calendar.destroy();

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: eventos,
        locale: 'es',
        height: 'auto',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        dateClick: function(info) {
            alert(`Día seleccionado: ${info.dateStr}`);
        }
    });

    calendar.render();
}

async function actualizarCalendario(habitacionId) {
    const reservasRef = collection(db, "Reservas");
    const snapshot = await getDocs(query(reservasRef, where("habitacion", "==", habitacionId)));

    const eventos = snapshot.docs.map(doc => {
        const r = doc.data();
        return {
            title: 'Ocupado',
            start: r.entrada,
            end: r.salida,
            color: 'red'
        };
    });

    mostrarCalendario(eventos);
}

async function cargarHabitacionesDisponibles() {
    const sucursalId = sucursalSelect.value;
    if (!sucursalId) return;

    const habitacionesRef = collection(db, "Sucursales", sucursalId, "habitaciones");
    const snapshot = await getDocs(habitacionesRef);

    habitacionSelect.innerHTML = `<option value="">Selecciona una habitación</option>`;
    snapshot.forEach(doc => {
        const habitacion = doc.data();
        const opt = document.createElement("option");
        opt.value = doc.id;
        opt.textContent = `${doc.id} - ${habitacion.tipo} - $${habitacion.precio}`;
        habitacionSelect.appendChild(opt);
    });

    habitacionSelect.addEventListener("change", async () => {
        const habitacionId = habitacionSelect.value;
        if (!habitacionId) return;
        await actualizarCalendario(habitacionId);
    });
}

sucursalSelect.addEventListener("change", cargarHabitacionesDisponibles);

function fechasTraslapadas(entrada1, salida1, entrada2, salida2) {
    return (entrada1 < salida2) && (entrada2 < salida1);
}

async function habitacionDisponible(habitacionId, entrada, salida) {
    const reservasRef = collection(db, "Reservas");
    const snapshot = await getDocs(query(reservasRef, where("habitacion", "==", habitacionId)));

    for (const doc of snapshot.docs) {
        const r = doc.data();
        const rEntrada = new Date(r.entrada);
        const rSalida = new Date(r.salida);
        if (fechasTraslapadas(new Date(entrada), new Date(salida), rEntrada, rSalida)) {
            return false;
        }
    }
    return true;
}

function enviarCorreoReserva(datos) {
    return fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            service_id: 'service_cs1vtpj',
            template_id: 'template_lotf772',
            user_id: 'UXLWG8sF3bN7nKebv',
            template_params: {
                'sucursal': datos.sucursal,
                'habitacion_id': datos.habitacion,
                'nombre_cliente': datos.nombreCliente,
                'fecha_entrada': datos.entrada,
                'fecha_salida': datos.salida,
                'precio': datos.precio,
                'email_cliente': datos.email
            }
        })
    });
}

async function cancelarReserva(idReserva) {
    const confirmacion = confirm("¿Estás seguro de que deseas cancelar esta reserva?");
    if (!confirmacion) return;
    await deleteDoc(doc(db, "Reservas", idReserva));
    alert("Reserva cancelada.");
    cargarReservasUsuario();
}

document.getElementById('reservasBody').addEventListener("click", async (e) => {
        if (e.target.classList.contains("reseñarBtn")) {
            const reservaId = e.target.dataset.id;
            const reservaRef = doc(db, "Reservas", reservaId);
            const reservaSnap = await getDoc(reservaRef);
    
            if (reservaSnap.exists()) {
                const reserva = reservaSnap.data();
                // Aquí guardamos la reserva ID en una variable global
                window.reservaIdParaReseña = reservaId;
    
                // Mostrar el modal de reseña
                const modal = document.getElementById("modalReseña");
                modal.style.display = "block";
            }
        }
    });
async function cargarReservasUsuario() {

    const usuario = JSON.parse(localStorage.getItem("user"));
    if (!usuario) return;

    const reservasRef = collection(db, "Reservas");
    const snapshot = await getDocs(query(reservasRef, where("nombreCliente", "==", usuario.nombre)));
    const tbody = document.getElementById("reservasBody");
    tbody.innerHTML = "";

    snapshot.forEach(doc => {
        const r = doc.data();
        const tr = document.createElement("tr");
        console.log("Estado detectado:", r.estado);


        const estado = (r.estado || "").toLowerCase();
        let estadoReserva = r.estado || "Sin estado";
        let botonAccion = "";

        if (estado === "check out pendiente") {
            botonAccion += `<button data-id="${doc.id}" class="reseñarBtn">Dejar Reseña</button>`;
        }
        

        if (estado === "reservado") {
            botonAccion += `<button data-id="${doc.id}" class="checkInBtn">Check In</button>`;
            botonAccion += `<button data-id="${doc.id}" class="cancelarReservaBtn">Cancelar Reserva</button>`;
        }
        
        if (estado === "en estadia") {
            botonAccion += `<button data-id="${doc.id}" class="checkOutBtn">Check Out</button>`;
        }
        
        tr.innerHTML = `
            <td>${r.habitacion}</td>
            <td>${r.sucursal}</td>
            <td>${r.entrada}</td>
            <td>${r.salida}</td>
            <td>$${r.precio}</td>
            <td>${estadoReserva}</td>
            <td>${botonAccion}</td>
        `;
        tbody.appendChild(tr);
    });

    
}

// ✅ Este bloque va FUERA de cargarReservasUsuario, por ejemplo después de definir la función
const tbody = document.getElementById("reservasBody");
if (!tbody.dataset.listenerAttached) {
    tbody.addEventListener("click", async (e) => {
        const idReserva = e.target.dataset.id;
        if (!idReserva) return;

        if (e.target.classList.contains("cancelarReservaBtn")) {
            cancelarReserva(idReserva);
        } else if (e.target.classList.contains("checkInBtn")) {
            const confirmacion = confirm("¿Confirmar Check-in?");
            if (confirmacion) {
                await actualizarEstadoReserva(idReserva, {
                    checkInConfirmado: false,
                    estado: "check in pendiente"
                });
                alert("Check-in pendiente, espera a que el administrador lo confirme.");
                cargarReservasUsuario();
            }
        } else if (e.target.classList.contains("checkOutBtn")) {
            const confirmacion = confirm("¿Confirmar Check-out?");
            if (confirmacion) {
                await actualizarEstadoReserva(idReserva, {
                    checkOutConfirmado: false,
                    estado: "check out pendiente"
                });
                alert("Check-out pendiente de confirmación del administrador.");
                cargarReservasUsuario();
            }
        }
    });

}


window.addEventListener("DOMContentLoaded", () => {
    cargarSucursales();
    cargarReservasUsuario();

    // Evento submit para guardar reseña
    document.getElementById("formReseña").addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const reseña = document.getElementById("reseña").value;
        const puntuacion = document.getElementById("puntuacion").value;
    
        if (!reseña || !puntuacion) {
            alert("Por favor, llena todos los campos.");
            return;
        }
    
        try {
            const reservaId = window.reservaIdParaReseña; // Usamos el ID de la reserva
            const reservaRef = doc(db, "Reservas", reservaId);
            const reservaSnap = await getDoc(reservaRef);
    
            if (!reservaSnap.exists()) {
                alert("La reserva no existe.");
                return;
            }
    
            // Extraer datos de la reserva
            const reservaData = reservaSnap.data();
    
            // Datos de la reserva
            const habitacion = reservaData.habitacion;
            const sucursal = reservaData.sucursal;
            const nombreCliente = reservaData.nombreCliente;
            const entrada = reservaData.entrada;
            const salida = reservaData.salida;
    
            // Datos del usuario
            const user = auth.currentUser;
            const usuarioId = user.uid;
    
            const usuarioSnap = await getDoc(doc(db, "Usuarios", usuarioId));
            const nombreUsuario = usuarioSnap.exists() ? usuarioSnap.data().nombre : "Usuario desconocido";
    
            // Crear documento de reseña con estado pendiente
            await addDoc(collection(db, "Reseñas"), {
                fecha: new Date(),
                puntuacion,
                reseña,
                reservaId,
                usuarioId,
                nombreUsuario,
                nombreSucursal: sucursal,  // Nombre de la sucursal
                nombreHabitacion: habitacion,  // Nombre de la habitación
                nombreCliente,
                entrada,
                salida,
                estado: "pendiente"  // Estado asignado como pendiente
            });
    
            alert("Gracias por tu reseña.");
            document.getElementById("modalReseña").style.display = "none";
            cargarReservasUsuario();
    
        } catch (error) {
            console.error("Error al guardar la reseña:", error);
            alert("Error al guardar la reseña.");
        }
    });
    
});




async function actualizarEstadoReserva(idReserva, nuevosCampos) {
    const reservaRef = doc(db, "Reservas", idReserva);

    // Obtener los datos actuales de la reserva
    const docSnap = await getDoc(reservaRef);

    if (docSnap.exists()) {
        const reserva = docSnap.data();

        // Verificar si los campos no existen, y agregarlos con valor por defecto
        if (reserva.checkInConfirmado === undefined) {
            nuevosCampos.checkInConfirmado = false; // Valor por defecto si no existe
        }

        if (reserva.checkOutConfirmado === undefined) {
            nuevosCampos.checkOutConfirmado = false; // Valor por defecto si no existe
        }

        // Actualizar la reserva con los nuevos campos
        await updateDoc(reservaRef, nuevosCampos);
    } else {
        console.log("La reserva no existe.");
    }
}


// Llamada al cargar la página
window.addEventListener("DOMContentLoaded", () => {
    cargarReservasUsuario();
});

formReserva.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.getElementById("formReseña").addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const reseña = document.getElementById("reseña").value;
        const puntuacion = document.getElementById("puntuacion").value;
    
        if (!reseña || !puntuacion) {
            alert("Por favor, llena todos los campos.");
            return;
        }
    
        // Guardar la reseña en Firestore
        const reservaRef = doc(db, "Reservas", window.reservaIdParaReseña);
        await updateDoc(reservaRef, {
            reseña: reseña,
            puntuacion: puntuacion,
            estado: "reseñada"
        });
    
        // Cerrar el modal
        const modal = document.getElementById("modalReseña");
        modal.style.display = "none";
    
        alert("Gracias por dejar tu reseña!");
    
        // Recargar las reservas para mostrar los cambios
        cargarReservasUsuario();
    });
    

    const habitacionId = habitacionSelect.value;
    const entrada = document.getElementById("entrada").value;
    const salida = document.getElementById("salida").value;
    const sucursalId = sucursalSelect.value;

    const usuario = JSON.parse(localStorage.getItem("user"));
    const nombreCliente = usuario?.nombre || "Cliente";
    const email = usuario?.correo || "sin-correo@dominio.com";

    if (!habitacionId || !entrada || !salida || !sucursalId) {
        confirmationMessage.textContent = "Por favor complete todos los campos.";
        return;
    }

    const confirmacion = confirm("¿Deseas confirmar la reserva?");
    if (!confirmacion) {
        confirmationMessage.textContent = "Reserva cancelada por el usuario.";
        return;
    }

    if (await habitacionDisponible(habitacionId, entrada, salida)) {
        const sucursalRef = doc(db, "Sucursales", sucursalId);
        const snapshot = await getDoc(sucursalRef);
        const sucursal = snapshot.data();

        const habitacionRef = doc(db, "Sucursales", sucursalId, "habitaciones", habitacionId);
        const habSnapshot = await getDoc(habitacionRef);
        const habitacion = habSnapshot.data();

        // Convertir las fechas de entrada y salida a objetos Date
        const fechaEntrada = new Date(entrada);
        const fechaSalida = new Date(salida);

        // Calcular la diferencia de noches entre la entrada y la salida
        const diferenciaDeTiempo = fechaSalida - fechaEntrada;
        const noches = diferenciaDeTiempo / (1000 * 3600 * 24); // Convertir de milisegundos a días

        // Calcular el precio total por la estancia
        const precioTotal = noches * habitacion.precio;

        // Verificar que las fechas sean correctas
        if (noches <= 0) {
            confirmationMessage.textContent = "La fecha de salida debe ser posterior a la de entrada.";
            return;
        }

        await addDoc(collection(db, "Reservas"), {
            habitacion: habitacionId,
            sucursal: sucursal.nombre,
            entrada,
            salida,
            precio: precioTotal, // Usar el precio total calculado
            email,
            nombreCliente,
            estado: "reservado"

        });

        enviarCorreoReserva({
            nombreCliente, sucursal: sucursal.nombre, habitacion: habitacionId, entrada, salida, precio: precioTotal, email
        });

        confirmationMessage.textContent = "Reserva realizada con éxito.";
        cargarReservasUsuario();
        actualizarCalendario(habitacionId);
    } else {
        confirmationMessage.textContent = "La habitación no está disponible para las fechas seleccionadas.";
    }
});

window.addEventListener("DOMContentLoaded", () => {
    cargarSucursales();
    cargarReservasUsuario();
});
