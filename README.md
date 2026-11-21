# Deport API

API REST para la gestion de torneos y eventos deportivos.

## Tematica

Deport es una plataforma pensada para la organizacion de torneos y eventos deportivos (futbol, padel, running, crossfit, entre otros). Permite gestionar las publicaciones de cada evento, fechas de realizacion, sedes, modalidades y el control de cupos para los participantes.

## Tecnologias

- Node.js
- Express
- Mongoose
- Bcrypt
- Jsonwebtoken
- Cookie-parser
- Dotenv
- Nodemon

## Estructura de carpetas

```text
src/
├── app.js
├── server.js
├── config/
│   ├── db.js
│   └── env.config.js
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
├── services/
│   ├── events.service.js
│   └── sessions.service.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
├── models/
│   ├── Event.js
│   └── User.js
├── middlewares/
│   ├── auth.middleware.js
│   └── errorHandler.middleware.js
└── utils/
    ├── customResponse.util.js
    ├── hash.js
    └── jwt.js
```

## Instalacion y ejecucion

Para levantar el proyecto en local primero hay que clonar el repositorio e instalar las dependencias con npm install. 

El proyecto necesita variables de entorno para funcionar. En la raiz se encuentra el archivo .env.example que sirve de guia para crear el archivo .env con el puerto, el entorno, la url de conexion a mongo, la clave secreta del token y su tiempo de vida.

Para iniciar el servidor en modo desarrollo usamos npm run dev, o npm start si queremos ejecutarlo con node de forma directa.

## Endpoints del sistema

A continuacion se detallan las rutas disponibles en la api, incluyendo el metodo, la descripcion y ejemplos de peticion y respuesta de cada una.

| Metodo | Ruta | Descripcion |
| :--- | :--- | :--- |
| GET | /api/health | Chequeo rapido para verificar que el servidor responde |
| GET | /api/events | Devuelve la lista de eventos deportivos cargados |
| POST | /api/sessions/register | Registra un usuario nuevo en la base de datos |
| POST | /api/sessions/login | Inicia sesion y devuelve una cookie con el jwt |
| GET | /api/sessions/current | Consulta los datos del usuario logueado usando la cookie |
| POST | /api/sessions/logout | Cierra la sesion y borra la cookie del navegador |

### Registro de usuario

Permite crear una cuenta en el sistema. Valida que esten todos los campos obligatorios, que el email tenga un formato valido y que la contrasena tenga al menos seis caracteres. Guarda la contrasena hasheada con bcrypt y asigna rol user por defecto.

POST /api/sessions/register

Request:
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

Si el correo ya fue registrado anteriormente el endpoint responde con status 409:
```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

### Inicio de sesion

Busca al usuario por email y verifica la contrasena ingresada contra el hash guardado. Si los datos son correctos genera un token jwt con el id, email y rol, y lo envia dentro de una cookie httpOnly llamada currentUser para mayor seguridad. Si el usuario no existe o la clave esta mal, devuelve un mensaje generico de credenciales invalidas.

POST /api/sessions/login

Request:
```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Response 200 (ademas setea la cookie currentUser HttpOnly):
```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Response 401 (credenciales incorrectas — mensaje generico):
```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

### Usuario actual

Ruta protegida por el middleware de autenticacion. Revisa la cookie currentUser que envia el cliente, comprueba que el jwt sea valido y devuelve los datos basicos del usuario logueado sin mostrar contrasenas ni datos sensibles.

GET /api/sessions/current (con la cookie)

Response 200:
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

Response 401 (sin cookie o token invalido/expirado):
```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### Cierre de sesion

Limpia la cookie currentUser del navegador para terminar la sesion del usuario de forma segura.

POST /api/sessions/logout

Response 200 (borra la cookie):
```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```
