# Plataforma de Eventos Deportivos - Backend API

API REST desarrollada con **Node.js**, **Express** y **MongoDB (Mongoose)** para la gestión de eventos deportivos, usuarios y autenticación segura basada en **JSON Web Tokens (JWT)** y **cookies HTTP-Only**.

---

## 🎯 Pre-entrega 3 — Autenticación con JWT y Cookies

Esta entrega implementa un sistema robusto de autenticación y manejo de sesiones de usuario:
- **Registro de usuarios** con validación estricta de campos obligatorios, formato de email, contraseña segura hasheada con `bcrypt`, control de duplicados y asignación de rol por defecto (`user`).
- **Inicio de sesión (Login)** mediante comparación de hash y respuesta genérica unificada ante errores (`"Credenciales inválidas"`) para prevenir ataques de enumeración de usuarios.
- **Generación de JWT** firmado con clave secreta (`JWT_SECRET`) y expiración configurable (`JWT_EXPIRES_IN`), con payload mínimo `{ id, email, role }` libre de contraseñas u otros datos sensibles.
- **Almacenamiento seguro en Cookie HTTP-Only**: El token se envía en la cookie `currentUser` con directivas `httpOnly: true`, `sameSite: 'lax'`, `maxAge: 3600000` (1 hora) y `secure: true` condicional a producción.
- **Ruta protegida `/api/sessions/current`**: Controlada por el middleware de autenticación `auth`, que extrae y valida la cookie, inyectando el payload en `req.user`.
- **Cierre de sesión (Logout)**: Invalida y elimina la cookie `currentUser`.

---

## 🛠️ Tecnologías

- **Node.js** (Entorno de ejecución JavaScript del lado del servidor)
- **Express.js** (Framework web minimalista y modular)
- **MongoDB & Mongoose** (Base de datos NoSQL y modelado de datos)
- **Bcrypt** (Algoritmo de hash de contraseñas de una vía con sal)
- **JSON Web Token (`jsonwebtoken`)** (Generación y verificación de tokens de sesión)
- **Cookie-Parser** (Extracción y parseo de cookies de autenticación)
- **Dotenv** (Gestión de variables de entorno)
- **Nodemon** (Herramienta de desarrollo para reinicio automático)

---

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura por capas desacoplada que separa claramente responsabilidades (rutas, controladores, servicios, repositorios, DAOs, modelos, middlewares y utilidades):

```text
proyecto-eventos/
├── src/
│   ├── app.js                         # Configuración y middlewares de Express
│   ├── server.js                      # Inicialización del servidor HTTP y DB
│   ├── config/
│   │   ├── db.js                      # Conexión modular a MongoDB con Mongoose
│   │   └── env.config.js              # Carga y centralización de variables de entorno
│   ├── controllers/
│   │   ├── events.controller.js       # Controlador de eventos
│   │   └── sessions.controller.js     # Controlador de registro, login, current y logout
│   ├── services/
│   │   ├── events.service.js          # Lógica de negocio de eventos
│   │   └── sessions.service.js        # Lógica de registro y autenticación
│   ├── repositories/
│   │   ├── events.repository.js       # Capa de abstracción de datos de eventos
│   │   └── users.repository.js        # Capa de abstracción de datos de usuarios
│   ├── dao/
│   │   ├── events.dao.js              # Data Access Object de eventos
│   │   └── users.dao.js               # Data Access Object de usuarios
│   ├── models/
│   │   ├── Event.js                   # Esquema Mongoose para eventos
│   │   └── User.js                    # Esquema Mongoose para usuarios
│   ├── middlewares/
│   │   ├── auth.middleware.js         # Middleware de validación de JWT en cookies
│   │   └── errorHandler.middleware.js # Middleware global de captura de errores
│   └── utils/
│       ├── hash.js                    # Funciones de hash y comparación con bcrypt
│       ├── jwt.js                     # Generación y verificación de tokens JWT
│       └── customResponse.util.js     # Utilitario para respuestas estandarizadas
├── .env.example                       # Plantilla de variables de entorno
├── .gitignore                         # Exclusión de node_modules, .env y temporales
├── package.json                       # Dependencias y scripts de ejecución
└── README.md                          # Documentación completa del proyecto
```

---

## ⚙️ Configuración y Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia el archivo `.env.example`:

```bash
cp .env.example .env
```

Contenido de `.env.example`:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/eventos_db?retryWrites=true&w=majority
JWT_SECRET=coderSecretTokenKey2026
JWT_EXPIRES_IN=1h
```

| Variable | Descripción | Valor por defecto / ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha del servidor Express | `8080` |
| `NODE_ENV` | Entorno de ejecución (`development` o `production`) | `development` |
| `MONGO_URL` | String de conexión a MongoDB local o MongoDB Atlas | `mongodb://localhost:27017/eventos_db` |
| `JWT_SECRET` | Clave secreta privada para firmar y validar tokens JWT | `coderSecretTokenKey2026` |
| `JWT_EXPIRES_IN` | Tiempo de validez del JWT | `1h` (1 hora) |

---

## 🚀 Instalación y Puesta en Marcha

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Mike-Camus223/proyect-backend-2.git
   cd proyect-backend-2
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar el archivo `.env`:**
   Asegurarse de tener el archivo `.env` con las variables descriptas arriba.

4. **Ejecutar el servidor:**
   - **Modo desarrollo** (con recarga automática mediante Nodemon):
     ```bash
     npm run dev
     ```
   - **Modo producción**:
     ```bash
     npm start
     ```

---

## 📖 Documentación de Endpoints

### Tabla Resumen de Rutas

| Método | Endpoint | Descripción | Acceso / Protección |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Verificación de estado del servidor | Público |
| `GET` | `/api/events` | Listado general de eventos deportivos | Público |
| `POST` | `/api/sessions/register` | Registro de nuevo usuario | Público |
| `POST` | `/api/sessions/login` | Autenticación y emisión de cookie `currentUser` | Público |
| `GET` | `/api/sessions/current` | Consulta de datos del usuario autenticado | **Protegido** (Requiere cookie JWT) |
| `POST` | `/api/sessions/logout` | Cierre de sesión y eliminación de cookie | Público / Autenticado |

---

### Detalle y Ejemplos de Request / Response

#### 1. Registro de Usuario: `POST /api/sessions/register`

- **Descripción**: Valida campos obligatorios, normaliza el email, valida longitud de contraseña, evita emails duplicados, asigna rol `user` por defecto y guarda la contraseña hasheada con bcrypt.
- **Request Body**:
  ```json
  {
    "first_name": "Ana",
    "last_name": "Gómez",
    "email": "ana@mail.com",
    "password": "Secreta123"
  }
  ```
- **Response 201 (Created)**:
  ```json
  {
    "status": "success",
    "payload": {
      "id": "665f2a99c5e3170a1a8c9999",
      "first_name": "Ana",
      "last_name": "Gómez",
      "email": "ana@mail.com",
      "role": "user"
    }
  }
  ```
- **Response 400 (Bad Request - campos faltantes o inválidos)**:
  ```json
  {
    "status": "error",
    "message": "Faltan campos obligatorios"
  }
  ```
- **Response 409 (Conflict - email ya existente)**:
  ```json
  {
    "status": "error",
    "message": "El email ya está registrado"
  }
  ```

---

#### 2. Inicio de Sesión: `POST /api/sessions/login`

- **Descripción**: Valida credenciales contra la base de datos. Si son válidas, firma un JWT y lo deposita en la cookie HTTP-Only `currentUser`. Responde con mensaje genérico si las credenciales no coinciden.
- **Request Body**:
  ```json
  {
    "email": "ana@mail.com",
    "password": "Secreta123"
  }
  ```
- **Response 200 (OK)** (además setea la cookie `currentUser` HttpOnly):
  ```json
  {
    "status": "success",
    "message": "Login correcto"
  }
  ```
  *Cabecera de respuesta enviada:*
  ```text
  Set-Cookie: currentUser=eyJhbGciOi...; Max-Age=3600; Path=/; HttpOnly; SameSite=Lax
  ```
- **Response 401 (Unauthorized - credenciales incorrectas)**:
  ```json
  {
    "status": "error",
    "message": "Credenciales inválidas"
  }
  ```

---

#### 3. Usuario Actual: `GET /api/sessions/current`

- **Descripción**: Ruta protegida por el middleware `auth`. Lee la cookie `currentUser`, verifica el token JWT y devuelve el usuario autenticado sin revelar datos sensibles (como la contraseña).
- **Request Headers / Cookies**:
  ```text
  Cookie: currentUser=<token_jwt_valido>
  ```
- **Response 200 (OK - Autenticado)**:
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
- **Response 401 (Unauthorized - sin cookie o token manipulado/expirado)**:
  ```json
  {
    "status": "error",
    "message": "No autenticado"
  }
  ```

---

#### 4. Cierre de Sesión: `POST /api/sessions/logout`

- **Descripción**: Elimina la cookie `currentUser` en el navegador o cliente HTTP para cerrar la sesión activa.
- **Request**: No requiere body.
- **Response 200 (OK)**:
  ```json
  {
    "status": "success",
    "message": "Sesión cerrada"
  }
  ```
  *Cabecera de respuesta enviada:*
  ```text
  Set-Cookie: currentUser=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax
  ```

---

#### 5. Chequeo de Salud del Servidor: `GET /api/health`

- **Response 200 (OK)**:
  ```json
  {
    "status": "ok",
    "message": "Servidor activo"
  }
  ```

---

## 🧪 Casos de Prueba Verificados

1. **Registro exitoso**: El usuario se crea con contraseña hasheada y rol `user`. La respuesta no incluye la propiedad `password`.
2. **Rechazo de email duplicado**: Intentar registrar el mismo email arroja status `409` con el mensaje correspondiente.
3. **Login con email inexistente**: Responde status `401` con el mensaje genérico `"Credenciales inválidas"`.
4. **Login con contraseña incorrecta**: Responde status `401` con `"Credenciales inválidas"`. No se distingue entre fallo de email o contraseña por motivos de seguridad.
5. **Login exitoso**: Retorna status `200` y adjunta la cookie `currentUser` con atributos `HttpOnly`, `SameSite: Lax` y duración de 1 hora.
6. **Acceso a `/current` sin cookie**: Responde status `401` con `"No autenticado"`.
7. **Acceso a `/current` con token manipulado o vencido**: Responde status `401` con `"No autenticado"`.
8. **Acceso a `/current` con cookie válida**: Responde status `200` y expone `{ id, email, role }`.
9. **Logout**: Retorna status `200`, borra la cookie en el cliente, y un intento posterior a `/current` responde `401`.

---

## 🔒 Consideraciones de Seguridad Implementadas

- **Hash seguro de contraseñas**: Implementado con `bcrypt` (10 rondas de salt).
- **Protección contra fuerza bruta y enumeración de usuarios**: Las respuestas de error en login nunca revelan si el fallo fue de usuario o contraseña.
- **Protección contra ataques XSS**: El token JWT reside en una cookie con bandera `httpOnly: true`, impidiendo el acceso a través de scripts de JavaScript del lado del cliente.
- **Protección contra CSRF**: La cookie se emite con la directiva `sameSite: 'lax'`.
- **Exclusión estricta de credenciales**: El archivo `.gitignore` previene la subida accidental de archivos `.env`, carpetas `node_modules` o credenciales privadas al repositorio.
