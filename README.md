Deport API

Deport es una api que hice para organizar torneos y eventos deportivos. La idea es que sirva para futbol, padel, running, crossfit y otros deportes parecidos. Desde ahi se pueden publicar eventos, poner fechas y sedes, y controlar los cupos de la gente que se anota. Tambien tiene usuarios con registro, login y sesion, roles con permisos distintos, inscripciones con tickets y un mail de confirmacion cuando alguien se anota.

Con que esta hecho

Use Node.js con Express y MongoDB conectado con Mongoose. Para las contraseñas uso bcrypt, para los tokens jsonwebtoken, para leer cookies cookie-parser y para la autenticacion Passport.js (passport, passport-local y passport-jwt). Los mails se mandan con Nodemailer, las variables de entorno las manejo con dotenv y en desarollo uso nodemon para no tener que reiniciar el servidor a cada rato.

Como esta organizado el codigo

Todo esta dentro de la carpeta src y lo separe por capas para que no quede mezclado. En routes estan las rutas, en controllers los controladores, que solo leen la peticion, llaman al servicio y responden. En services esta la logica de negocio (cupos, estados, duplicados, permisos y envio de mails). En repositories estan los metodos pensados para el dominio, como buscar un usuario por email o contar tickets activos, y estos hablan con los dao, que son los unicos que tocan los modelos de Mongoose (UserDAO, EventDAO y TicketDAO). En models estan User, Event y Ticket, y en dto estan UserDTO, EventDTO y TicketDTO, que filtran lo que se devuelve para que nunca salgan contraseñas ni datos de mas. En config esta la conexion a mongo, la carga del .env y el archivo passport.config.js con todas las estrategias. En middlewares estan el de autenticacion, el de autorizacion por roles y el que maneja los errores, y en utils estan las funciones de hash y de generar y verificar el jwt. El archivo app.js arma express y server.js es el que levanta todo.

Como correrlo

Hay que clonar el repo y hacer npm install. Despues se crea un archivo .env en la raiz copiando el .env.example y completandolo con tus datos. Las variables son PORT (el puerto del server), MONGO_URL (la url de tu base en mongo atlas), JWT_SECRET (la clave para firmar los tokens), JWT_EXPIRES_IN (cuanto dura el token, yo uso 1h), NODE_ENV (development o production) y las del correo, que son MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS y MAIL_FROM. El .env no esta subido al repo, ni tampoco node_modules ni ninguna credencial. Para levantarlo se usa npm run dev en desarrollo o npm start normal, y por defecto escucha en el puerto 8080.

Usuarios y sesion

El usuario tiene first_name, last_name, email, password y role. Los roles son user, organizer y admin, y el rol por defecto es user. La contraseña nunca se guarda en texto plano, siempre hasheada.

Para registrarse se usa POST /api/sessions/register mandando first_name, last_name, email y password, por ejemplo Pepito Perez con el mail pepito@mail.com y la clave Secreta123. Se revisa que vengan todos los campos, que el email tenga formato valido y que la contraseña tenga minimo 6 caracteres. El email se pasa a minusculas y se le sacan los espacios para que no se repitan usuarios por escribirlo distinto. Si sale bien responde 201 con los datos del usuario sin la contraseña, si el email ya existe responde 409 con "El email ya está registrado" y si falta algo o el formato esta mal responde 400. El registro publico siempre crea cuentas con rol user, no se puede cambiar desde el body.

Para loguearse se usa POST /api/sessions/login con email y password. Se busca el usuario y se compara la contraseña con la hasheada usando bcrypt. Si esta bien, se genera un jwt que lleva solo el id, el email y el rol, y se guarda en una cookie llamada currentUser. La cookie es httpOnly para que no se pueda leer desde javascript, tiene sameSite lax, dura una hora y en produccion es secure. Responde 200 con "Login correcto". Si el email no existe o la contraseña esta mal responde siempre 401 con "Credenciales inválidas", y a proposito no se aclara cual de las dos fallo.

Para ver quien esta logueado esta GET /api/sessions/current, que esta protegida. Lee la cookie, verifica el token y si es valido devuelve 200 con el id, el email y el rol. Si no hay cookie, o el token esta vencido o lo modificaron, responde 401 con "No autenticado".

Para cerrar sesion esta POST /api/sessions/logout, que no necesita body, borra la cookie y responde 200 con "Sesión cerrada". Despues de eso, si le pegas a current, te da 401.

Todo esto pasa por Passport. Hay tres estrategias: register y login (las dos con LocalStrategy) y current (con passport-jwt y un extractor propio que lee la cookie). El controlador de login es el que genera el token y la cookie cuando Passport ya valido al usuario. Deje el archivo preparado para que mas adelante se puedan sumar providers externos como Google o GitHub sin tocar app.js.

Roles y permisos

Hay dos middlewares. El de auth valida la cookie y si no hay sesion valida responde 401. El de authorize recibe los roles permitidos para cada ruta y los compara con el rol del usuario, y si no coincide responde 403 con "No tenés permisos para realizar esta acción". La diferencia es simple: el 401 es que no iniciaste sesion o tu token vencio o es falso, y el 403 es que si iniciaste sesion pero tu rol no alcanza o estas queriendo tocar algo de otra persona.

Cualquiera puede ver los eventos en GET /api/events y GET /api/events/:id. Para crear eventos hay que estar logueado y ser organizer o admin, asi que un user comun recibe 403. Para modificar o cancelar un evento tambien hace falta ser organizer o admin, pero ademas se valida de quien es el evento: un organizer solo puede tocar los que creo el, y un admin puede tocar cualquiera. Las rutas de usuarios (GET /api/users, que lista sin mostrar contraseñas, GET /api/users/:id y PATCH /api/users/:id/role) son solo para admin, y si entra un user o un organizer reciben 403.

Eventos

El evento tiene title, description, category, date, location, capacity (mayor a 0), price (0 o mas), status y organizer. El status solo puede ser draft, published, cancelled o finished. El organizer es una referencia al usuario que lo creo y se toma de la sesion, no se acepta desde el body.

Las reglas de negocio estan en events.service.js. Al crear o editar no se permite una fecha pasada, la capacidad tiene que ser mayor a cero y el precio no puede ser negativo. Los eventos nunca se borran de la base, cancelar es cambiar el estado a cancelled, ya sea con PATCH /api/events/:id/status o con DELETE /api/events/:id, que hace la misma baja logica. Una vez que un evento esta cancelled o finished ya no se puede modificar ni volver a publicar.

Las rutas son POST /api/events para crear (organizer o admin), GET /api/events para listar (publica), GET /api/events/:id para ver el detalle (publica, da 404 si no existe), PUT /api/events/:id para modificar y PATCH /api/events/:id/status para cambiar el estado (estas dos solo para el dueño o un admin). Para crear un evento se manda por ejemplo el titulo "Torneo Regional de Crossfit", una descripcion, la categoria crossfit, la ubicacion "Polideportivo Sur", la fecha 2026-12-20T15:00:00.000Z, capacity 40 y price 3500. Si el id del evento tiene formato invalido responde 400.

El listado de GET /api/events acepta filtros, paginacion y orden por query params. Se puede filtrar por status, category, location y por rango de fechas con dateFrom y dateTo, elegir pagina y tamaño con page y limit, y ordenar con sort (por ejemplo sort=date o sort=-price). Un ejemplo seria GET /api/events?status=published&category=crossfit&page=1&limit=5&sort=date, y la respuesta viene con status, data, page, limit, total y totalPages.

Tickets e inscripciones

El ticket guarda referencias por ObjectId al user y al event, ademas de status (confirmed, pending o cancelled), quantity (mayor a cero), un reservationCode unico, createdAt y cancelledAt.

Para anotarse cualquier usuario logueado manda POST /api/events/:eid/tickets con la cantidad de lugares, por ejemplo quantity 2. En tickets.service.js se revisa que el evento exista (si no, 404), que este published y no cancelado ni finalizado, que la fecha no haya pasado, que quantity sea un numero valido mayor a cero, que el usuario no tenga ya un ticket activo para ese evento y que queden cupos suficientes. Para los cupos se suman las cantidades de los tickets activos (confirmed o pending) y se restan de la capacidad, y los cancelled nunca cuentan. Si todo esta bien se crea el ticket con su codigo, por ejemplo TCK-A1B2C3D4, y responde 201.

Apenas se confirma la inscripcion, mail.service.js manda un correo con Nodemailer al email del usuario con el codigo de reserva, el titulo del evento, la fecha, la ubicacion y la cantidad. Las credenciales del mail se toman siempre del .env.

Para ver sus propias inscripciones el usuario usa GET /api/tickets/my-tickets, que trae sus tickets con los datos principales del evento (title, date, location y status) sin mostrar nada de otros usuarios. Para ver todos los inscriptos y los cupos disponibles de un evento esta GET /api/events/:eid/tickets, solo para el organizer dueño de ese evento o un admin, y cualquier otro recibe 403.

Para cancelar una inscripcion se usa PATCH /api/tickets/:tid/cancel. Solo puede hacerlo el dueño del ticket o un admin, y si otro usuario lo intenta recibe 403. No se borra nada, el ticket pasa a cancelled, se guarda la fecha en cancelledAt y se valida que no haya sido cancelado antes. Al cancelarse, el cupo queda libre al instante para otra persona.

Manejo de errores

Los controladores mandan cualquier error con next(error) al middleware errorHandler, que se encarga de responder de forma pareja los codigos 400, 401, 403, 404, 409 y 500.

Como probar todo el recorrido

Primero se registra un usuario desde POST /api/sessions/register, que siempre arranca como user. Para probar organizer o admin se puede cambiar el campo role directamente en la coleccion users de MongoDB Atlas, o usar PATCH /api/users/:id/role desde una cuenta admin. Despues se hace login en POST /api/sessions/login, lo que deja la cookie currentUser activa, y se verifica en GET /api/sessions/current. Con una cuenta organizer o admin se crean eventos, se editan o se cambia su estado. Cualquier visitante puede mirar el catalogo en GET /api/events, y un usuario logueado se puede inscribir en POST /api/events/:eid/tickets y recibe su codigo por mail. Despues ve sus entradas en GET /api/tickets/my-tickets, el organizador o admin controla los cupos en GET /api/events/:eid/tickets, y si el participante cancela desde PATCH /api/tickets/:tid/cancel el ticket pasa a cancelled y el cupo se libera. Al final se cierra la sesion con POST /api/sessions/logout.

AL Final lo probe con Postman haciendo todo ese recorrido con usuarios de los tres roles. Comprobe que las rutas privadas sin cookie dan 401, que un user no puede crear eventos ni ver usuarios, que un organizer puede crear y modificar sus propios eventos pero no los de otro organizer ni entrar a /api/users, y que el admin puede hacer todo. Tambien probe loguearme con un mail que no existe, con la contraseña mal, entrar a current sin cookie y con un token cambiado a mano, y en todos los casos respondio lo que tenia que responder. Ademas, los listados de eventos exiten con y sin filtros, y cuando no hay nada devuelven la lista bacia con total 0 y con esto seria todo.