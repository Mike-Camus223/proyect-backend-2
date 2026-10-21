# Deport API

API REST para la gestion de torneos y eventos deportivos.

## Tematica

Deport es una plataforma pensada para la organizacion de torneos y eventos deportivos (futbol, padel, running, crossfit, entre otros). Permite gestionar las publicaciones de cada evento, fechas de realizacion, sedes, modalidades y el control de cupos para los participantes.

## Tecnologias

- Node.js
- Express
- Mongoose
- Bcrypt
- Dotenv
- Nodemon

## Estructura de carpetas

```text
src/
├── app.js
├── server.js
├── config/
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
│   └── errorHandler.middleware.js
└── utils/
    ├── customResponse.util.js
    └── hash.js
```

## Variables de entorno

Crear un `.env` en la raiz con los datos de `.env.example`:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/deport_db
JWT_SECRET=coderSecretTokenKey2026
```

## Como probar el registro

Endpoint: `POST /api/sessions/register`

Campos obligatorios:
- `first_name` (string)
- `last_name` (string)
- `email` (string, formato valido)
- `password` (minimo 6 caracteres)

Ejemplo de body json:
```json
{
  "first_name": "Ana",
  "last_name": "Perez",
  "email": "ana@mail.com",
  "password": "Password123"
}
```

Respuestas:
- `201`: Usuario creado correctamente (devuelve datos sin password).
- `400`: Faltan campos obligatorios o formato de email invalido.
- `409`: El email ya se encuentra registrado.

## Endpoints

- `GET /api/health` - Estado del servidor
- `GET /api/events` - Listado de eventos
- `POST /api/sessions/register` - Registro de usuario
- `POST /api/sessions/login` - Login (proxima entrega)
- `GET /api/sessions/current` - Sesion actual
