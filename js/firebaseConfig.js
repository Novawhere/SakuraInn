// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHp5nkTByEJyoeYeiG_nJ4B3B0zU7tObg",
  authDomain: "formulario-9187b.firebaseapp.com",
  projectId: "formulario-9187b",
  storageBucket: "formulario-9187b.firebasestorage.app",
  messagingSenderId: "371979718033",
  appId: "1:371979718033:web:28071deef1c488fb825e30",
  measurementId: "G-6J8PGE2D60",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export services
export { app, auth, db };
