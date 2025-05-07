import { auth } from '/js/firebaseConfig.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  registrarUsuarioEnBD,
  limpiarSesion
} from '/js/authHelpers.js';

// Elementos
const emailLogin = document.getElementById("loginEmail");
const passLogin = document.getElementById("loginPass");
const btnLogin = document.getElementById("btnLogin");

const nameRegister = document.getElementById("registerName");
const emailRegister = document.getElementById("registerEmail");
const passRegister = document.getElementById("registerPass");
const btnRegister = document.getElementById("btnRegister");
const emailError = document.getElementById("emailError");
const passError = document.getElementById("passError");

const btnGoogle = document.getElementById("btnGoogle");
const btnGitHub = document.getElementById("btnGitHub");
const btnFacebook = document.getElementById("btnFacebook");
const btnLogout = document.getElementById("btnLogout");

const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");

// 🔹 Guardar sesión
function guardarSesion(user) {
  localStorage.setItem('userEmail', user.email || '');
  localStorage.setItem('userUID', user.uid || '');
  sessionStorage.setItem('hasRedirected', 'true');
}

// 🔹 Manejo de sesión inicial
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const redirected = sessionStorage.getItem('hasRedirected');
    if (!redirected) {
      guardarSesion(user);
      await registrarUsuarioEnBD(user, nameRegister?.value);
      alert(`Bienvenido, ${user.displayName || user.email}`);
      window.location.href = "/index.html";
    }
  } else {
    limpiarSesion();
    console.log("No hay usuario autenticado.");
  }
});

// 🔹 Registro
btnRegister?.addEventListener("click", async (e) => {
  e.preventDefault();

  let valid = true;

  if (!nameRegister.value.trim() || !emailRegister.value.trim() || !passRegister.value.trim()) {
    alert("Por favor, completa todos los campos del registro.");
    return;
  }

  if (!emailRegister.value.includes("@") || !emailRegister.value.includes(".")) {
    emailError.textContent = "Correo inválido";
    valid = false;
  } else {
    emailError.textContent = "";
  }

  const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!regex.test(passRegister.value)) {
    passError.textContent = "Debe tener al menos 8 caracteres y combinar letras y números";
    valid = false;
  } else {
    passError.textContent = "";
  }

  if (valid) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailRegister.value, passRegister.value);
      guardarSesion(cred.user);
      await registrarUsuarioEnBD(cred.user, nameRegister.value);
      alert("¡Registro exitoso!");
      window.location.href = "/index.html";
    } catch (error) {
      alert("Error al registrar: " + error.message);
    }
  }
});

// 🔹 Login con correo
btnLogin?.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!emailLogin.value.trim() || !passLogin.value.trim()) {
    alert("Por favor, ingresa tu correo y contraseña.");
    return;
  }


  console.log("Intentando iniciar sesión con:", emailLogin.value);

  try {
    const cred = await signInWithEmailAndPassword(auth, emailLogin.value, passLogin.value);
    const user = cred.user;

    // Buscar directamente en /usuarios/UID
    const usuarioRef = doc(db, "usuarios", user.uid);
    const usuarioSnap = await getDoc(usuarioRef);

    if (usuarioSnap.exists()) {
      const datosUsuario = usuarioSnap.data();

      // Guardar los datos en localStorage con la clave 'user'
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        correo: datosUsuario.correo,
        rol: datosUsuario.rol,
        creadoEn: datosUsuario.creadoEn,
        nombre: datosUsuario.nombre
      }));

      alert(`Bienvenido, ${datosUsuario.nombre}`);
      sessionStorage.setItem('hasRedirected', 'true');
      window.location.href = "/index.html";
    } else {
      alert("No se encontró el usuario en la base de datos.");
    }
  } catch (error) {
    console.error("Error en Firebase:", error.code, error.message);
    alert("Error al iniciar sesión: " + error.message);
  }
});

// 🔹 Login con proveedor externo
const loginConProveedor = async (provider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    guardarSesion(result.user);
    await registrarUsuarioEnBD(result.user);
    alert("¡Bienvenido!");
    window.location.href = "/index.html";
  } catch (error) {
    alert("Error de autenticación: " + error.message);
  }
};

btnGoogle?.addEventListener("click", () => loginConProveedor(new GoogleAuthProvider()));
btnGitHub?.addEventListener("click", () => loginConProveedor(new GithubAuthProvider()));
btnFacebook?.addEventListener("click", () => loginConProveedor(new FacebookAuthProvider()));

// 🔹 Logout
btnLogout?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    limpiarSesion();
    alert("Sesión cerrada");
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Error al cerrar sesión: ", error.message);
  }
});

// 🔹 Interfaz: alternar paneles login/registro
document.addEventListener("DOMContentLoaded", function () {
  if (!loginPanel || !registerPanel || !showRegisterBtn || !showLoginBtn) {
    console.error("Error: Elementos no encontrados.");
    return;
  }

  showRegisterBtn.addEventListener("click", () => {
    loginPanel.style.display = "none";
    registerPanel.style.display = "block";
  });

  showLoginBtn.addEventListener("click", () => {
    registerPanel.style.display = "none";
    loginPanel.style.display = "block";
  });
});
