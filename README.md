# Plataforma de Eventos Deportivos - Backend

Proyecto backend desarrollado con Node.js, Express y MongoDB (Mongoose) para la gestión de usuarios, autenticación y eventos deportivos.

Esta entrega corresponde a la **Pre-entrega 3: Autenticación con JWT y cookies**, donde se implementa el sistema de registro, login con contraseñas hasheadas mediante bcrypt, generación de token JWT almacenado en una cookie HttpOnly, ruta protegida para consultar el usuario actual (/current) y cierre de sesión (logout).

---

## Estructura del proyecto

El proyecto organiza sus archivos separando responsabilidades en capas (rutas, controladores, servicios, repositorios, dao, modelos, middlewares y utilidades):

```text
proyecto-eventos/
├── src/
│   ├── app.js                         # Configuración de Express y middlewares
│   ├── server.js                      # Inicialización del servidor
│   ├── config/
│   │   ├── db.js                      # Conexión a MongoDB con Mongoose
│   │   └── env.config.js              # Variables de entorno
│   ├── controllers/
│   │   ├── events.controller.js       # Controlador de eventos
│   │   └── sessions.controller.js     # Controlador de autenticación
│   ├── services/
│   │   ├── events.service.js          # Lógica de eventos
│   │   └── sessions.service.js        # Lógica de negocio de usuarios
│   ├── repositories/
│   │   ├── events.repository.js       # Repositorio de eventos
│   │   └── users.repository.js        # Repositorio de usuarios
│   ├── dao/
│   │   ├── events.dao.js              # Acceso a datos de eventos
│   │   └── users.dao.js               # Acceso a datos de usuarios
│   ├── models/
│   │   ├── Event.js                   # Modelo de Evento
│   │   └── User.js                    # Modelo de Usuario (first_name, last_name, email, password, role)
│   ├── middlewares/
│   │   ├── auth.middleware.js         # Middleware para validar cookie currentUser
│   │   └── errorHandler.middleware.js # Manejo de errores
│   └── utils/
│       ├── customResponse.util.js     # Respuestas formateadas
│       ├── hash.js                    # Funciones para bcrypt (createHash, isValidPassword)
│       └── jwt.js                     # Generar y verificar JWT (generateToken, verifyToken)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Variables de entorno

El proyecto utiliza dotenv para gestionar variables de entorno. Para ejecutarlo en local, se debe crear un archivo `.env` en la raíz tomando los campos de `.env.example`:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/eventos_db?retryWrites=true&w=majority
JWT_SECRET=coderSecretTokenKey2026
JWT_EXPIRES_IN=1h
```

Detalle de variables:
- `PORT`: Puerto en el que escucha el servidor (por defecto 8080).
- `NODE_ENV`: Entorno de ejecución (`development` o `production`). En producción la cookie currentUser se configura con `secure: true`.
- `MONGO_URL`: String de conexión de MongoDB local o MongoDB Atlas.
- `JWT_SECRET`: Clave secreta para firmar y validar tokens JWT.
- `JWT_EXPIRES_IN`: Tiempo de expiración del token (por ejemplo `1h`).

---

## Instalación y ejecución

1. Instalar las dependencias del proyecto:
```bash
npm install
```

2. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

3. Iniciar el servidor en modo producción:
```bash
npm start
```

---

## Tabla de rutas y endpoints

| Método | Ruta | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| GET | `/api/health` | Comprobación de estado del servidor | Público |
| GET | `/api/events` | Obtiene el listado de eventos | Público |
| POST | `/api/sessions/register` | Registro de nuevo usuario en la base de datos | Público |
| POST | `/api/sessions/login` | Inicia sesión y genera cookie HttpOnly `currentUser` | Público |
| GET | `/api/sessions/current` | Devuelve los datos del usuario autenticado | Protegido (requiere cookie) |
| POST | `/api/sessions/logout` | Cierra la sesión y elimina la cookie `currentUser` | Público / Autenticado |

---

## Ejemplos de Request y Response

### 1. POST /api/sessions/register

Registra un nuevo usuario. Valida presencia de campos, formato de email, hashea la contraseña con bcrypt, comprueba duplicados y asigna el rol `user` por defecto. La respuesta no incluye la contraseña.

Request Body:
```json
{
  "first_name": "Ana",
  "last_name": "Gomez",
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Response 201:
```json
{
  "status": "success",
  "payload": {
    "id": "665f2a99c5e3170a1a8c9999",
    "first_name": "Ana",
    "last_name": "Gomez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Response 409 (si el email ya existe):
```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

---

### 2. POST /api/sessions/login

Valida email y contraseña contra la base de datos comparando con bcrypt. Si coinciden, genera un JWT con `{ id, email, role }` y lo guarda en la cookie `currentUser` (HttpOnly, SameSite: Lax, MaxAge: 1 hora). Si no coinciden, devuelve un mensaje genérico para mayor seguridad.

Request Body:
```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Response 200 (además setea la cookie currentUser HttpOnly):
```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Response 401 (credenciales incorrectas — mensaje genérico):
```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

---

### 3. GET /api/sessions/current

Ruta protegida que utiliza el middleware `auth`. Lee la cookie `currentUser`, verifica el token JWT y devuelve los datos básicos del usuario autenticado (`id`, `email`, `role`) sin incluir la contraseña.

Request:
Requiere que la petición incluya la cookie `currentUser` generada en el login.

Response 200 (con la cookie):
```json
{
  "status": "success",
  "payload": {
    "id": "665f2a99c5e3170a1a8c9999",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Response 401 (sin cookie o token inválido/expirado):
```json
{
  "status": "error",
  "message": "No autenticado"
}
```

---

### 4. POST /api/sessions/logout

Elimina la cookie `currentUser` del cliente y confirma el cierre de la sesión.

Request:
No requiere body.

Response 200 (borra la cookie):
```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

---

### 5. GET /api/health

Verifica que el servidor esté activo.

Response 200:
```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

---

## Casos probados

- Registro con datos válidos devuelve 201 y oculta el password.
- Intento de registro con email duplicado devuelve 409.
- Login con email inexistente devuelve 401 con mensaje genérico.
- Login con contraseña incorrecta devuelve 401 con mensaje genérico.
- Login exitoso devuelve 200 y setea la cookie HttpOnly `currentUser`.
- Consulta a /current sin cookie devuelve 401 "No autenticado".
- Consulta a /current con cookie adulterada o expirada devuelve 401 "No autenticado".
- Consulta a /current con cookie válida devuelve 200 con `{ id, email, role }`.
- Logout borra la cookie en el cliente y un llamado posterior a /current devuelve 401.
