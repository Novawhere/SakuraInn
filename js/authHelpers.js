import {
    db
} from '/js/firebaseConfig.js';
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Guardar sesión en localStorage
export function guardarSesion(userInfo) {
    localStorage.setItem('user', JSON.stringify(userInfo));
}


// Obtener datos de usuario desde Firestore (si no están en cache local)
export async function obtenerUsuario(user) {
    const cache = localStorage.getItem('user');
    if (cache) return JSON.parse(cache);

    const ref = doc(db, "usuarios", user.uid); 
    const snap = await getDoc(ref);
    if (snap.exists()) {
        const data = snap.data();
        guardarSesion(data);
        return data;
    } else {
        return null;
    }
}

// Registrar usuario solo si no existe
export async function registrarUsuarioEnBD(user, nombre = "") {
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        const datos = {
            uid: user.uid,
            nombre: nombre || user.displayName || "",
            correo: user.email,
            rol: "cliente",
            creadoEn: new Date(),
        };
        await setDoc(ref, datos);
        guardarSesion(datos);
        return datos;
    } else {
        const datos = snap.data();
        guardarSesion(datos);
        return datos;
    }
}

// Cerrar sesión limpia todo
export function limpiarSesion() {
    localStorage.removeItem('user');
    sessionStorage.removeItem('hasRedirected');
}

export function checkAdmin() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.rol === 'admin') {
        return Promise.resolve(); // Si es admin, resuelve la promesa
    }
    return Promise.reject(); // Si no es admin, rechaza la promesa
}