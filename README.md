Deport api (final coderhouse backend 2026)

descripción del proyecto

Deport es una API que desarrollé para organizar torneos y eventos deportivos, principalmente de fútbol, pádel, running, crossfit y otras disciplinas similares.

La idea es que los organizadores puedan publicar sus eventos, establecer fechas, lugares y cupos disponibles, mientras que los participantes pueden registrarse e inscribirse. También cuenta con un sistema de usuarios, roles y permisos, además de tickets para las inscripciones y correos de confirmación.

tecnologías utilizadas

Para desarrollar el proyecto utilicé Node.js y Express, con MongoDB como base de datos y Mongoose para trabajar con los modelos. También incorporé bcrypt para el manejo seguro de contraseñas, jsonwebtoken para los tokens y Passport.js para la autenticación.

Por otro lado, utilicé cookie-parser para manejar las cookies y Nodemailer para el envío de correos. Las variables de entorno se gestionan mediante dotenv y, durante el desarrollo, utilizo nodemon para reiniciar automáticamente el servidor cuando realizo cambios.

estructura del proyecto

Organicé el código dentro de la carpeta `src`, separándolo en distintas capas para que cada parte tenga una responsabilidad clara.

En `routes` están definidas las rutas de la API, mientras que en `controllers` se reciben las peticiones y se preparan las respuestas. La lógica principal se encuentra en `services`, donde se manejan las validaciones y reglas del sistema, como los cupos disponibles, los permisos, los estados de los eventos y las inscripciones.

Para el acceso a la base de datos utilicé DAO y Repository. Los DAO (`UserDAO`, `EventDAO` y `TicketDAO`) son los que trabajan directamente con los modelos de Mongoose, mientras que los repositorios utilizan esos DAO y ofrecen métodos más específicos para cada parte del proyecto.

También están los modelos `User`, `Event` y `Ticket`, junto con sus respectivos DTO (`UserDTO`, `EventDTO` y `TicketDTO`). Estos últimos permiten controlar qué información se devuelve en cada respuesta, evitando exponer contraseñas u otros datos que no deberían estar disponibles.

El resto de la estructura se completa con `config`, donde están la conexión a MongoDB, las variables de entorno y la configuración de Passport; `middlewares`, que contiene los controles de autenticación, permisos y errores; y `utils`, donde agrupé algunas funciones relacionadas con las contraseñas y los tokens.

Por último, `app.js` se encarga de configurar Express y `server.js` de iniciar el servidor.

instalación y ejecución

Para poner en marcha el proyecto primero hay que clonar el repositorio e instalar las dependencias con `npm install`.

Después se debe crear un archivo `.env` en la raíz del proyecto, tomando como referencia el `.env.example`. Allí se configuran los datos necesarios para conectar la base de datos y utilizar los servicios de autenticación y correo.

Entre las variables principales están `PORT`, `MONGO_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` y `NODE_ENV`. Para los correos también se necesitan `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` y `MAIL_FROM`.

El archivo `.env` no se incluye en el repositorio, ya que contiene credenciales privadas. Lo mismo ocurre con `node_modules`.

Una vez configurado todo, se puede iniciar el servidor con `npm run dev` para trabajar en desarrollo o con `npm start` para ejecutarlo normalmente. Por defecto, utiliza el puerto 8080.

usuarios y sesión

El modelo de usuario contiene los campos `first_name`, `last_name`, `email`, `password` y `role`. Actualmente existen tres roles: `user`, `organizer` y `admin`. Cuando alguien se registra, recibe automáticamente el rol `user`.

Las contraseñas se guardan utilizando bcrypt, por lo que nunca quedan almacenadas directamente en texto plano.

registro

El registro se realiza mediante `POST /api/sessions/register`, donde se envían el nombre, apellido, email y contraseña.

Antes de crear la cuenta se validan los campos y el formato del correo, además de comprobar que la contraseña tenga al menos 6 caracteres. También normalizo el email, convirtiéndolo a minúsculas y eliminando espacios, para evitar registros duplicados por diferencias al escribirlo.

Si el usuario ya existe, la API devuelve un 409. Si faltan datos o alguno no cumple las condiciones, devuelve un 400. Cuando el registro se completa correctamente, responde con un 201 y devuelve los datos del usuario sin incluir la contraseña.

Algo importante es que el registro público siempre asigna el rol `user`, evitando que alguien pueda registrarse directamente como administrador u organizador modificando los datos enviados.

inicio de sesión

Para iniciar sesión se utiliza `POST /api/sessions/login`, enviando el email y la contraseña.

El sistema busca al usuario y comprueba la contraseña mediante bcrypt. Si las credenciales son correctas, genera un token JWT con el id, email y rol del usuario, y lo guarda en una cookie llamada `currentUser`.

Esta cookie está configurada como `httpOnly`, tiene una duración de una hora y utiliza `sameSite: lax`. En producción también se activa `secure`.

Si los datos son incorrectos, la API devuelve un 401 con un mensaje genérico de credenciales inválidas. De esta manera no se revela si el problema fue el email o la contraseña.

sesión actual y cierre de sesión

Para consultar quién inició sesión está disponible `GET /api/sessions/current`. Esta ruta verifica la cookie y el token, y devuelve los datos básicos del usuario si la sesión sigue siendo válida. Si no existe una sesión o el token venció, responde con un 401.

El cierre de sesión se realiza mediante `POST /api/sessions/logout`. No necesita recibir datos, simplemente elimina la cookie `currentUser` y finaliza la sesión.

passport

Toda la autenticación está integrada con Passport.js y sus estrategias se encuentran en `src/config/passport.config.js`.

Implementé tres estrategias. `register` se ocupa del registro, validando los datos, comprobando que el email no esté registrado y creando la cuenta con su contraseña hasheada y el rol correspondiente. `login` se encarga de verificar las credenciales, mientras que el controlador genera el token y establece la cookie.

Por último, `current` utiliza `passport-jwt` para recuperar el token desde la cookie `currentUser` y validar la sesión. Cuando todo está correcto, los datos del usuario quedan disponibles en `req.user`.

Dejé esta configuración centralizada para que más adelante sea posible incorporar otros proveedores de autenticación, como Google o GitHub, sin tener que modificar la configuración principal de Express.

roles y permisos

Para controlar el acceso a las distintas funcionalidades implementé dos middlewares: uno de autenticación y otro de autorización.

El primero comprueba que exista una sesión válida. El segundo verifica si el rol del usuario tiene permiso para realizar la acción solicitada.

La diferencia entre ambos errores es importante: el 401 indica que el usuario no inició sesión o que su token no es válido, mientras que el 403 significa que sí está autenticado, pero no tiene los permisos necesarios.

En cuanto a los eventos, cualquier persona puede consultar el listado y los detalles. Sin embargo, para crear uno es necesario tener el rol `organizer` o `admin`.

Lo mismo ocurre al modificar o cancelar eventos, aunque también se controla quién es el propietario. Un organizador solamente puede administrar los eventos que creó, mientras que un administrador tiene acceso a todos.

Las operaciones administrativas de usuarios también están restringidas. Las rutas `GET /api/users`, `GET /api/users/:id` y `PATCH /api/users/:id/role` solamente pueden utilizarse con una cuenta `admin`.

eventos

El modelo `Event` contiene la información de cada evento: título, descripción, categoría, fecha, ubicación, capacidad, precio, estado y organizador.

También tiene algunas validaciones, como exigir que la capacidad sea mayor a cero y que el precio no sea negativo. Los estados disponibles son `draft`, `published`, `cancelled` y `finished`.

El organizador se guarda como una referencia al usuario que creó el evento. Este dato se obtiene directamente de la sesión, por lo que no depende de lo que envíe el cliente.

La lógica de los eventos está concentrada en `events.service.js`. Allí se controla que no se puedan crear o modificar eventos con fechas pasadas y que se respeten las condiciones de capacidad y precio.

Una decisión que tomé fue utilizar bajas lógicas en lugar de eliminar los eventos de la base de datos. Es decir, cuando se cancela uno, simplemente cambia su estado a `cancelled`. Esto puede hacerse mediante `PATCH /api/events/:id/status` o `DELETE /api/events/:id`.

Además, cuando un evento ya está cancelado o finalizado, no se permite modificarlo ni volver a publicarlo.

Las rutas principales son:

- `POST /api/events`: crear un evento.
- `GET /api/events`: consultar los eventos.
- `GET /api/events/:id`: ver el detalle de un evento.
- `PUT /api/events/:id`: modificar un evento.
- `PATCH /api/events/:id/status`: cambiar su estado.

Las operaciones de creación requieren el rol correspondiente, y las de modificación y cambio de estado solamente pueden realizarlas el organizador propietario o un administrador. Si se consulta un evento inexistente, se devuelve un 404; si el identificador tiene un formato incorrecto, un 400.

También agregué filtros, paginación y ordenamiento para facilitar las búsquedas. Se puede filtrar por estado, categoría, ubicación y rango de fechas mediante `status`, `category`, `location`, `dateFrom` y `dateTo`.

Para la paginación están disponibles `page` y `limit`, mientras que `sort` permite ordenar los resultados, por ejemplo, por fecha o precio. La respuesta incluye los eventos encontrados y la información de paginación, como la página actual, el total de resultados y la cantidad de páginas.

tickets e inscripciones

El modelo `Ticket` representa las inscripciones de los usuarios a los eventos. Guarda referencias al usuario y al evento mediante ObjectId, además de la cantidad de lugares, el código de reserva, el estado y las fechas correspondientes.

Los estados disponibles son `confirmed`, `pending` y `cancelled`. También se registra cuándo se creó el ticket y, si se cancela, cuándo ocurrió.

inscripción a eventos

Para inscribirse se utiliza `POST /api/events/:eid/tickets`. Cualquier usuario que haya iniciado sesión puede hacerlo indicando la cantidad de lugares que necesita.

Antes de crear el ticket, `tickets.service.js` comprueba que el evento exista, esté publicado y todavía no haya comenzado. También valida que la cantidad solicitada sea correcta, que el usuario no tenga otra inscripción activa para ese evento y que queden suficientes lugares disponibles.

Para calcular los cupos se tienen en cuenta los tickets `confirmed` y `pending`, ya que ambos ocupan lugares. Los que están cancelados quedan fuera del cálculo.

Si todas las condiciones se cumplen, se crea el ticket con un código de reserva único y la API responde con un 201.

correo de confirmación

También incorporé el envío de correos mediante Nodemailer. Cuando se confirma una inscripción, `mail.service.js` envía un mensaje al usuario con los datos principales de su reserva: código, nombre del evento, fecha, ubicación y cantidad de lugares.

Las credenciales necesarias para enviar los correos se obtienen desde las variables de entorno, evitando dejarlas escritas directamente en el código.

consulta de inscripciones

Cada usuario puede consultar sus propias inscripciones mediante `GET /api/tickets/my-tickets`. La respuesta incluye los datos del ticket y la información principal del evento, sin mostrar inscripciones de otras personas.

Por otro lado, los organizadores pueden consultar los inscriptos de sus propios eventos mediante `GET /api/events/:eid/tickets`. Esta ruta también está disponible para administradores, pero no para usuarios comunes ni organizadores que no sean propietarios del evento.

cancelación de tickets

Para cancelar una inscripción se utiliza `PATCH /api/tickets/:tid/cancel`.

Solamente el dueño del ticket o un administrador pueden realizar esta operación. Si otra persona intenta hacerlo, recibe un 403.

Al cancelar, el ticket no se elimina de la base de datos. Simplemente cambia su estado a `cancelled` y se registra la fecha en `cancelledAt`. También se comprueba que no haya sido cancelado anteriormente.

De esta manera se conserva el historial de las inscripciones y el lugar que ocupaba queda disponible inmediatamente para otro participante.

arquitectura por capas

Durante el desarrollo terminé de organizar el proyecto utilizando una arquitectura por capas formada por DAO, Repository, Service, Controller y DTO.

La idea fue separar las responsabilidades para que cada parte trabaje con lo que le corresponde. Los DAO se encargan de las operaciones directas con MongoDB, mientras que los repositorios ofrecen métodos más relacionados con las necesidades del sistema, como buscar usuarios por email, encontrar eventos publicados o contar tickets activos.

Los servicios utilizan esos repositorios para aplicar las reglas de negocio, y los controladores se mantienen enfocados en recibir las peticiones y devolver las respuestas.

También centralicé el manejo de errores mediante `errorHandler`. Cuando ocurre un problema, los controladores y servicios pueden enviarlo con `next(error)`, y el middleware se encarga de responder con el código correspondiente, como 400, 401, 403, 404, 409 o 500.

Los DTO también forman parte de esta organización, ya que permiten controlar los datos que se devuelven de usuarios, eventos y tickets. Esto evita que se expongan contraseñas u otra información que no debería salir de la API, incluso cuando se utilizan consultas con `populate`.

flujo general de uso

El funcionamiento comienza con el registro de un usuario, que recibe automáticamente el rol `user`. Para probar las funcionalidades de organizador o administrador, los roles se pueden modificar directamente desde la colección `users` de MongoDB Atlas o mediante `PATCH /api/users/:id/role`, siempre que se utilice una cuenta con permisos de administrador.

Después de iniciar sesión, se genera la cookie `currentUser`, que permite mantener la sesión y acceder a las rutas protegidas.

Con una cuenta de organizador se pueden crear eventos, modificarlos y administrar sus inscripciones. Los visitantes también pueden consultar el catálogo, utilizar los filtros y revisar los detalles de cada evento.

Cuando un usuario se inscribe, recibe su código de reserva por correo y puede consultar sus tickets desde su cuenta. Los organizadores y administradores pueden revisar los inscriptos y los cupos ocupados, mientras que los participantes tienen la posibilidad de cancelar sus propias reservas.

Si una inscripción se cancela, el lugar vuelve a quedar disponible para otra persona. Finalmente, el usuario puede cerrar su sesión y la cookie se elimina.