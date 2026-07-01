# Sakura Inn - Sistema de Reservas de Hoteles

## Descripción

Sistema de reservas en línea para la cadena de hoteles **Sakura Inn**, con temática japonesa. Proyecto desarrollado como parte de la formación en Ingeniería en Sistemas Computacionales.

![Logo Sakura Inn](assets/images/logo_only_W.png)

## Características

- **5 sucursales:** Tokyo, Kyoto, Osaka, Sapporo, Hiroshima
- **Autenticación:** Registro e inicio de sesión con Email + OAuth (Google, GitHub, Facebook)
- **Dashboard Administrador:** Resumen de operaciones, historial, gestión de usuarios, aprobación de reseñas
- **Calendario de Disponibilidad:** FullCalendar para visualizar fechas ocupadas
- **Notificaciones:** Envío automático de correos de confirmación

## Tech Stack

| Tecnología | Descripción |
|------------|-------------|
| **HTML5** | Estructura semántica |
| **CSS3** | Bootstrap 5 + CSS personalizado |
| **JavaScript ES6+** | Módulos, clases, arrow functions |
| **Firebase v11.6.0** | Auth + Firestore (Backend as a Service) |
| **FullCalendar 5.11.2** | Calendario de disponibilidad |
| **EmailJS** | Envío de correos desde el frontend |
| **Ionicons 7** | Iconografía |

## Capturas de Pantalla

> **Nota:** Las capturas de pantalla deben tomarse después de desplegar la aplicación en GitHub Pages.

### Página Principal
![Página Principal](assets/images/sakura_video.mp4)

### Dashboard Cliente
![Dashboard Cliente](assets/images/habitacion.jpg)

### Dashboard Administrador
![Dashboard Admin](assets/images/gastronomia.jpg)

## Cómo Ejecutar

### Requisitos Previos
- [Visual Studio Code](https://code.visualstudio.com/)
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (extensión de VS Code)

> **Importante:** Es necesario usar Live Server para que los ES modules (type="module") funcionen correctamente. Abrir directamente el archivo HTML en el navegador NO funcionará.

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Novawhere/SakuraInn.git
   ```

2. Abrir la carpeta del proyecto en VS Code:
   ```bash
   cd SakuraInn
   code .
   ```

3. Abrir `index.html` con Live Server:
   - Clic derecho sobre `index.html`
   - Seleccionar "Open with Live Server"

4. El servidor iniciará en el puerto **5501**:
   ```
   http://localhost:5501
   ```

### Configuración de Firebase

Para usar el sistema con tus propias credenciales de Firebase:

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password + proveedores OAuth)
3. Crear Firestore Database
4. Actualizar las credenciales en `js/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

## Estructura del Proyecto

```
SakuraInn/
├── index.html                    # Página principal
├── assets/
│   ├── fonts/                    # Fuentes personalizadas (KATSUMI)
│   ├── images/                   # Imágenes del proyecto
│   │   ├── logo_*.png           # Logos oficiales
│   │   ├── vista_*.jpg          # Vistas de sucursales
│   │   └── *.jpg/jpeg           # Imágenes generales
│   └── videos/                   # Videos de fondo
├── css/                          # Estilos CSS
│   ├── bootstrap.min.css         # Framework CSS
│   ├── nav.css                   # Navegación
│   ├── header.css                # Header/Hero
│   ├── footer.css                # Footer
│   ├── index.css                 # Estilos de página principal
│   ├── main.css                  # Estilos principales
│   ├── carrusel.css              # Carrusel de sucursales
│   ├── login.css                 # Autenticación
│   ├── hotel.css                 # Páginas de hotel
│   ├── dashboard.css             # Dashboard cliente
│   └── dashboard_admin.css       # Dashboard administrador
├── js/                           # JavaScript (Módulos ES6)
│   ├── firebaseConfig.js         # Configuración Firebase
│   ├── login.js                  # Autenticación
│   ├── nav.js                    # Navegación
│   ├── reserva.js                # Sistema de reservas
│   ├── dashboardAdmin.js         # Dashboard administrador
│   ├── hotel.js                  # Lógica de hotel
│   └── authHelpers.js            # Helpers de autenticación
├── views/                        # Vistas HTML
│   ├── login.html                # Login/Registro
│   ├── dashboardCliente.html     # Panel de cliente
│   ├── dashboardAdmin.html       # Panel de administrador
│   ├── SakuraInnTokyo.html       # Sucursal Tokyo
│   ├── SakuraInnKyoto.html       # Sucursal Kyoto
│   ├── SakuraInnOsaka.html       # Sucursal Osaka
│   ├── SakuraInnSapporo.html     # Sucursal Sapporo
│   └── SakuraInnHiroshima.html   # Sucursal Hiroshima
└── README.md                     # Este archivo
```

## Funcionalidades

### Autenticación
- Registro con email y contraseña
- Inicio de sesión con email
- OAuth con Google, GitHub y Facebook

### Reservaciones
- Selección de sucursal y habitación
- Calendario de disponibilidad en tiempo real
- Cálculo automático de precio por noches
- Estados: Reservado → Check-in Pendiente → En Estadía → Check-out Pendiente

### Dashboard Administrador
- Resumen de operaciones
- Historial de reservas
- Gestión de usuarios
- Aprobación de reseñas

## Base de Datos (Firestore)

### Colecciones

| Colección | Descripción |
|-----------|-------------|
| `Usuarios` | Datos de usuarios registrados |
| `Reservas` | Reservaciones realizadas |
| `Sucursales` | Información de hoteles |
| `Reseñas` | Reseñas de clientes |
| `historialHospedaje` | Historial de hospedajes |

### Estructura de Reserva
```javascript
{
  habitacion: "ID_HABITACION",
  sucursal: "NOMBRE_SUCURSAL",
  entrada: "2025-01-15",
  salida: "2025-01-20",
  precio: 5000,
  email: "cliente@email.com",
  nombreCliente: "Juan Pérez",
  estado: "reservado"
}
```

## Autor

**Brian Osmar Trevino Martínez**
- Ingeniero en Sistemas Computacionales
- GitHub: [@Novawhere](https://github.com/Novawhere)

## Licencia

Proyecto académico - Uso educativo

---

> **Nota:** Este proyecto utiliza credenciales de demostración de Firebase. Para producción, se deben actualizar las credenciales en `js/firebaseConfig.js`. El sistema está optimizado para GitHub Pages.
