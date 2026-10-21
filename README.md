# Plataforma de Eventos - API

Backend inicial para la plataforma de gestion de eventos e inscripciones desarrollado para el curso de Backend II de Coderhouse.

## Descripcion y Tematica

El proyecto es una API REST para gestionar eventos (conferencias, talleres, meetups) e inscripciones de usuarios. En esta primera entrega se establece la arquitectura base por capas (rutas, controladores, servicios, repositorios, dao y modelos), configurando el servidor Express con modulos ESM y variables de entorno.

## Tecnologias

- Node.js
- Express
- Mongoose
- Dotenv
- Nodemon (desarrollo)

## Estructura del Proyecto

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
    └── customResponse.util.js
```

## Variables de Entorno

Crear un archivo `.env` en la raiz tomando como base el archivo `.env.example`:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/eventos_db
JWT_SECRET=coderSecretTokenKey2026
```

## Instalacion y Uso

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar en modo desarrollo:

```bash
npm run dev
```

3. Ejecutar en modo produccion:

```bash
npm start
```

## Endpoints Disponibles

### Health Check

- **GET** `/api/health`
  - Respuesta (200 OK):
  ```json
  {
    "status": "ok",
    "message": "Servidor activo"
  }
  ```

### Eventos

- **GET** `/api/events`
  - Respuesta (200 OK):
  ```json
  {
    "status": "success",
    "payload": []
  }
  ```

### Sesiones

- **POST** `/api/sessions/register`
- **POST** `/api/sessions/login`
- **GET** `/api/sessions/current`
  - Respuesta (200 OK):
  ```json
  {
    "status": "success",
    "payload": null
  }
  ```
