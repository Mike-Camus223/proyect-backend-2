DEPORT API

Deport es una API que desarrollé para organizar torneos y eventos deportivos. Está pensada para deportes como fútbol, pádel, running, crossfit y otros similares. Permite publicar eventos, definir fechas y sedes, y controlar los cupos de los participantes. Además incluye registro, login y sesión de usuarios, roles con distintos permisos, inscripciones mediante tickets y el envío de un mail de confirmación cuando alguien se anota.

TECNOLOGÍAS UTILIZADAS

El proyecto está hecho con Node.js y Express, y la base de datos es MongoDB, conectada mediante Mongoose. Para proteger las contraseñas utilicé bcrypt, para los tokens jsonwebtoken y para leer las cookies cookie-parser. La autenticación se maneja con Passport.js, a través de passport, passport-local y passport-jwt. Los correos se envían con Nodemailer, las variables de entorno se cargan con dotenv y en desarrollo uso nodemon para que el servidor se reinicie solo.

ESTRUCTURA DEL PROYECTO

Todo el código está dentro de la carpeta src y fue separado en capas para mantenerlo ordenado. En routes se definen las rutas y en controllers están los controladores, que se limitan a recibir la petición, llamar al servicio y devolver la respuesta. En services se concentra la lógica de negocio, es decir, la validación de cupos, estados, duplicados y permisos, además del envío de correos.

El acceso a datos está dividido en dos partes. En dao se encuentran UserDAO, EventDAO y TicketDAO, que son los únicos archivos que trabajan directamente con los modelos de Mongoose. En repositories se encuentran los repositorios, que hablan con los DAO y ofrecen métodos pensados para el dominio, como buscar un usuario por email o contar los tickets activos de un evento. En models están los modelos User, Event y Ticket, y en dto están UserDTO, EventDTO y TicketDTO, que filtran lo que se devuelve para que nunca se expongan contraseñas ni datos innecesarios.

En config se encuentra la conexión a MongoDB, la carga del archivo .env y el archivo passport.config.js, donde están todas las estrategias de autenticación. En middlewares están el de autenticación, el de autorización por roles y el que maneja los errores, y en utils están las funciones para hashear contraseñas y para generar y verificar el token. Por último, app.js configura Express y server.js levanta el servidor.

INSTALACIÓN Y EJECUCIÓN

Para correr el proyecto hay que clonar el repositorio e instalar las dependencias con npm install. Luego se crea un archivo .env en la raíz a partir del archivo .env.example y se completa con los datos propios.

Las variables que se necesitan son PORT, que indica el puerto en el que corre el servidor, MONGO_URL, que es la dirección de conexión a MongoDB Atlas, JWT_SECRET, que es la clave con la que se firman los tokens, JWT_EXPIRES_IN, que define cuánto dura el token (se usa 1h), y NODE_ENV, que puede ser development o production. Para el envío de correos también se usan MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS y MAIL_FROM. El archivo .env no se sube al repositorio, ni tampoco node_modules ni ninguna credencial privada.

Una vez configurado, el servidor se inicia con npm run dev en modo desarrollo o con npm start en modo normal. Por defecto escucha en el puerto 8080.

USUARIOS Y SESIÓN

El modelo de usuario tiene first_name, last_name, email, password y role. Los roles posibles son user, organizer y admin, y el rol por defecto es user. La contraseña nunca se guarda en texto plano, sino siempre hasheada.

Registro

El registro se realiza en POST /api/sessions/register, enviando nombre, apellido, email y contraseña. La ruta verifica que lleguen todos los campos, que el email tenga un formato válido y que la contraseña tenga al menos 6 caracteres. Antes de guardar, el email se pasa a minúsculas y se eliminan los espacios, para evitar usuarios duplicados por escribirlo de forma distinta. Si todo es correcto, responde con código 201 y los datos del usuario sin la contraseña. Si el email ya está registrado responde 409, y si falta algún campo o el formato es incorrecto responde 400. El registro público siempre crea cuentas con rol user, y ese rol no se puede modificar desde el cuerpo de la petición.

Login

El inicio de sesión se realiza en POST /api/sessions/login, enviando email y contraseña. Se busca al usuario por su email y se compara la contraseña con la versión hasheada mediante bcrypt. Si los datos son correctos, se genera un token que contiene únicamente el id, el email y el rol del usuario, y se guarda en una cookie llamada currentUser. Esta cookie es httpOnly, por lo que no puede leerse desde JavaScript en el navegador, tiene sameSite lax, dura una hora y en producción se marca como secure. La respuesta es un 200. Si el email no existe o la contraseña es incorrecta, siempre se responde un 401 con el mismo mensaje de credenciales inválidas, y a propósito no se aclara cuál de las dos cosas falló.

Sesión actual

Para saber quién está logueado existe GET /api/sessions/current, una ruta protegida. Lee la cookie, verifica el token y, si es válido, devuelve un 200 con el id, el email y el rol del usuario. Si no hay cookie, o el token está vencido o fue modificado, responde 401.

Logout

El cierre de sesión se hace en POST /api/sessions/logout. No necesita cuerpo, elimina la cookie y responde 200. Después de esto, una consulta a la sesión actual devuelve 401.

Passport

Toda la autenticación pasa por Passport.js, sin cambiar las rutas ni lo que devuelve la API. Las estrategias están centralizadas en src/config/passport.config.js y son tres. La estrategia register usa LocalStrategy: toma los datos del cuerpo, valida los campos obligatorios, normaliza el email, comprueba que no esté repetido, hashea la contraseña y guarda al usuario con rol user. La estrategia login también usa LocalStrategy y solo busca al usuario y compara la contraseña, y el controlador de login es el que genera el token y la cookie una vez que Passport validó al usuario. La estrategia current usa passport-jwt con un extractor propio que lee la cookie currentUser y deja el id, el email y el rol en req.user. El archivo quedó preparado para sumar más adelante proveedores externos como Google o GitHub sin tocar app.js.

ROLES Y PERMISOS

Para distinguir entre un usuario que no inició sesión y uno que sí lo hizo pero no tiene permisos suficientes, agregué dos middlewares. El de autenticación valida la cookie mediante la estrategia current y responde 401 si no hay una sesión válida. El de autorización recibe como parámetro los roles permitidos para cada ruta y los compara con el rol del usuario, respondiendo 403 si no coincide. En resumen, el 401 significa que no se inició sesión o que el token venció o no es válido, mientras que el 403 significa que se inició sesión pero el rol no alcanza para la acción, o que se intenta modificar algo que pertenece a otro usuario.

Cualquier persona puede consultar los eventos publicados, tanto el listado como el detalle de uno puntual. Para crear eventos hay que estar autenticado y tener rol organizer o admin, por lo que un user común recibe un 403. Para modificar o cancelar un evento también hace falta ser organizer o admin, y además se valida la propiedad del recurso: un organizer solo puede tocar los eventos que creó él mismo, mientras que un admin puede modificar o cancelar cualquiera. Las rutas administrativas de usuarios, que son GET /api/users (lista sin mostrar contraseñas), GET /api/users/:id y PATCH /api/users/:id/role, están habilitadas únicamente para el rol admin.

EVENTOS

El modelo Event tiene title, description, category, date, location, capacity, price, status y organizer. La capacidad debe ser mayor a cero y el precio mayor o igual a cero. El estado solo puede ser draft, published, cancelled o finished. El organizer es una referencia por ObjectId al usuario que creó el evento y se toma directamente de la sesión, sin aceptarlo desde el cuerpo de la petición.

Las reglas de negocio están en events.service.js. Al crear o editar un evento no se permite una fecha pasada, la capacidad debe ser mayor a cero y el precio no puede ser negativo. Los eventos nunca se borran físicamente de la base de datos: cancelar un evento significa cambiar su estado a cancelled, ya sea con PATCH /api/events/:id/status o con DELETE /api/events/:id, que realiza la misma baja lógica. Una vez que un evento está cancelled o finished, ya no se puede modificar ni volver a publicar.

Las rutas de eventos son POST /api/events para crear (organizer o admin), GET /api/events para listar (pública), GET /api/events/:id para ver el detalle (pública, responde 404 si no existe), PUT /api/events/:id para modificar y PATCH /api/events/:id/status para cambiar el estado, estas dos últimas solo para el organizer dueño o un admin. Si el id del evento tiene un formato inválido, se responde 400.

El listado soporta filtros, paginación y ordenamiento mediante query params. Se puede filtrar por status, category, location y por rango de fechas con dateFrom y dateTo. Se puede elegir la página y el tamaño con page y limit, y ordenar con sort, por ejemplo sort=date de forma ascendente o sort=-price de forma descendente. La respuesta viene paginada e incluye los datos, la página actual, el límite, el total de resultados y el total de páginas.

TICKETS E INSCRIPCIONES

El modelo Ticket guarda referencias por ObjectId al usuario y al evento, sin embeber objetos completos, además del estado (confirmed, pending o cancelled), la cantidad de lugares (mayor a cero), un código de reserva único, la fecha de creación y la fecha de cancelación.

Inscripción

Cualquier usuario autenticado puede inscribirse a un evento con POST /api/events/:eid/tickets, indicando la cantidad de lugares. Toda la validación está en tickets.service.js, donde se comprueba que el evento exista (si no, responde 404), que esté publicado y no cancelado ni finalizado, que su fecha no haya pasado, que la cantidad sea un número válido mayor a cero, que el usuario no tenga ya un ticket activo para ese evento y que haya cupos suficientes. Para calcular los cupos se suman las cantidades de todos los tickets activos del evento (confirmed o pending) y se restan de la capacidad total, y los tickets cancelados nunca cuentan como cupo ocupado. Si todo está bien, se crea el ticket con su código de reserva y se responde 201.

Correo de confirmación

Cuando la inscripción se confirma, mail.service.js envía un correo al email del usuario mediante Nodemailer, con el código de reserva, el título del evento, la fecha, la ubicación y la cantidad de lugares. Las credenciales del correo se toman siempre de las variables de entorno.

Consulta de tickets

El usuario autenticado puede consultar sus propias inscripciones en GET /api/tickets/my-tickets, que devuelve sus tickets junto con los datos principales del evento (título, fecha, ubicación y estado), sin exponer información de otros usuarios. Para ver todos los inscriptos y los cupos disponibles de un evento existe GET /api/events/:eid/tickets, habilitada únicamente para el organizer dueño de ese evento o para un admin. Cualquier otro usuario recibe 403.

Cancelación

Para cancelar una inscripción se usa PATCH /api/tickets/:tid/cancel. Solo puede hacerlo el dueño del ticket o un admin, y si otro usuario lo intenta recibe 403. El ticket no se elimina: su estado pasa a cancelled, se guarda la fecha en cancelledAt y se valida que no haya sido cancelado antes. Al cancelarse, el cupo queda libre de inmediato para nuevas inscripciones.

ARQUITECTURA POR CAPAS

Finalmente reorganicé todo el código en una arquitectura formal con DAO, Repository, Service, Controller y DTO, sin cambiar el comportamiento externo de ninguna ruta. Los DAO exponen operaciones genéricas de acceso a datos, como findAll, findById, findOne, create, update y count. Los repositorios se apoyan en ellos y ofrecen métodos propios del dominio, como findByEmail, findPublishedEvents, countActiveTickets o cancelTicket. Los servicios consumen únicamente repositorios y concentran las reglas de negocio, y los controladores quedaron livianos.

Los errores se envían con next(error) al middleware centralizado errorHandler, que responde de forma pareja los códigos 400, 401, 403, 404, 409 y 500. Además, los DTO filtran todas las salidas del usuario autenticado, los eventos y los tickets, garantizando que ni las rutas protegidas ni los populate devuelvan contraseñas ni datos sensibles de más.

FLUJO COMPLETO DE USO

Primero se registra un usuario común, que siempre arranca con rol user. Para probar los roles organizer o admin se puede cambiar el campo role directamente en la colección users de MongoDB Atlas, o usar PATCH /api/users/:id/role desde una cuenta admin. Luego se inicia sesión, lo que deja activa la cookie currentUser, y se puede verificar la sesión en la ruta de sesión actual. Con una cuenta organizer o admin se crean eventos y se pueden editar o cambiar de estado. Cualquier visitante puede consultar el catálogo con filtros, paginación y ordenamiento, y un usuario logueado puede inscribirse a un evento y recibir su código de reserva por correo. Después consulta sus entradas, el organizador o administrador controla los cupos ocupados, y si el participante cancela su inscripción, el ticket pasa a cancelled y el cupo se libera al instante para otra persona. Por último, se cierra la sesión.