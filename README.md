# Deport API

Deport es una api que arme para la organizacion de torneos y eventos deportivos, la idea es que sirva para cosas como futbol, padel, running, crossfit y otros deportes parecidos. Desde aca se van a poder gestionar las publicaciones de cada evento, las fechas, las sedes, la modalidad y el control de cupos de los participantes. Por ahora el proyecto tiene la base armada y la parte de usuarios con registro, login y sesion, y lo de eventos se va a ir completando en las proximas entregas.

El proyecto esta hecho con Node.js y Express, la base de datos es MongoDB y me conecto con Mongoose. Para las contraseñas uso bcrypt, para los tokens uso jsonwebtoken y para leer las cookies uso cookie-parser. Las variables de entorno las manejo con dotenv y en desarrollo uso nodemon para no tener que reiniciar el servidor a cada rato.

El codigo esta todo dentro de la carpeta src y lo separe por capas para que no quede todo mezclado. En routes estan las rutas, en controllers los controladores que reciben la peticion y responden, en services esta la logica de negocio, despues repositories y dao que son los que hablan con la base, y en models estan los modelos de User y Event. En config esta la conexion a mongo y la carga de las variables de entorno, en middlewares esta el middleware de autenticacion y el que maneja los errores, y en utils deje las funciones de hash con bcrypt y las de generar y verificar el jwt. El archivo app.js arma express y server.js es el que levanta todo.

El modelo de usuario tiene first_name, last_name, email, password y role. El rol por defecto es user y la contraseña nunca se guarda en texto plano, siempre se guarda hasheada.

Para correrlo hay que clonar el repo y hacer npm install para bajar las dependencias. Despues hay que crear un archivo .env en la raiz copiando el .env.example que esta en el repo y completarlo con tus datos. Las variables que pide son PORT que es el puerto donde corre el server, MONGO_URL que es la url de conexion a tu base de mongo atlas, JWT_SECRET que es la clave con la que se firman los tokens, JWT_EXPIRES_IN que es cuanto dura el token (yo uso 1h) y NODE_ENV que puede ser development o production. El .env no esta subido al repo por obvias razones. Una vez configurado se levanta con npm run dev para desarrollo o con npm start si lo queres correr normal, y por defecto queda escuchando en el puerto 8080.

Ahora paso a explicar las rutas que tiene la api.

La primera es GET /api/health que es solo para chequear que el servidor este vivo, no recibe nada y responde asi:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

Tambien esta GET /api/events que devuelve el listado de eventos, por ahora viene vacio porque esa parte todavia no esta terminada.

Para registrarse se usa POST /api/sessions/register. Hay que mandar en el body el nombre, apellido, email y contraseña, por ejemplo:

```json
{
  "first_name": "Pepito",
  "last_name": "Perez",
  "email": "pepito@mail.com",
  "password": "Secreta123"
}
```

La ruta revisa que vengan todos los campos, que el email tenga formato valido y que la contraseña tenga minimo 6 caracteres. El email se pasa a minusculas y se le sacan los espacios antes de guardarlo, asi no se repiten usuarios por escribirlo distinto. Si todo esta bien responde con 201 y los datos del usuario pero sin la contraseña:

```json
{
  "status": "success",
  "payload": {
    "id": "6b01df6d7c90c6fa0e85b023",
    "first_name": "Pepito",
    "last_name": "Perez",
    "email": "pepito@mail.com",
    "role": "user"
  }
}
```

Si el email ya existe responde 409 con:

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

Y si falta algun campo o el formato esta mal devuelve 400.

Para loguearse se usa POST /api/sessions/login mandando el email y la contraseña, por ejemplo:

```json
{
  "email": "pepito@mail.com",
  "password": "Secreta123"
}
```

Ahi se busca el usuario por email y se compara la contraseña con la que esta hasheada usando bcrypt. Si esta todo bien se genera un jwt que lleva solo el id, el email y el rol del usuario (nada de contraseña) y se guarda en una cookie que se llama currentUser. La cookie es httpOnly asi no se puede leer desde javascript en el navegador, tiene sameSite lax, dura una hora y en produccion se marca como secure. La respuesta en ese caso es 200:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Si el email no existe o la contraseña esta mal responde siempre lo mismo, un 401:

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

A proposito no se aclara cual de las dos cosas fallo.

Para ver quien esta logueado esta GET /api/sessions/current. Esta ruta esta protegida con el middleware de auth, que lo que hace es leer la cookie currentUser, verificar el token y si es valido guarda los datos en req.user. Si mandas la peticion con la cookie te devuelve 200:

```json
{
  "status": "success",
  "payload": {
    "id": "6b01df6d7c90c6fa0e85b023",
    "email": "pepito@mail.com",
    "role": "user"
  }
}
```

Si no hay cookie, o el token esta vencido o lo modificaron, responde 401:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

Y por ultimo para cerrar sesion esta POST /api/sessions/logout, que no necesita body, borra la cookie currentUser y responde 200:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Despues de esto si volves a pegarle a current te va a dar 401 porque ya no tenes la cookie.

Lo probe con Postman haciendo el recorrido completo de registrarme, loguearme, entrar a current, hacer logout y volver a current para ver que me tire 401. Tambien probe loguearme con un mail que no existe, con la contraseña mal, entrar a current sin cookie y con un token cambiado a mano, y en todos los casos respondio lo que tenia que responder.

En la ultima actualizacion refactorice la autenticacion para que pase por Passport.js en lugar de tener la logica suelta, pero sin cambiar ninguna ruta ni lo que devuelve la api hacia afuera. Para eso sume passport, passport-local y passport-jwt, inicialice passport en app.js y centralice todas las estrategias en src/config/passport.config.js para que app.js quede limpio.

Arme tres estrategias ahi adentro. La estrategia register usa LocalStrategy con passReqToCallback, toma los datos del body, valida que esten todos los campos obligatorios, normaliza el email, verifica que no este repetido en la base, hashea la contraseña con bcrypt y guarda al usuario con rol user por defecto sin permitir que lo cambien desde el body. La ruta POST /api/sessions/register delega directo en passport.authenticate('register').

La estrategia login tambien usa LocalStrategy y se encarga solamente de buscar el usuario por email y comparar la contraseña con bcrypt, devolviendo el usuario si coincide o fallando con el mismo mensaje generico de credenciales invalidas si algo esta mal. El controlador de login es el que recibe ese usuario autenticado, genera el token jwt firmado con JWT_SECRET y guarda la cookie currentUser httpOnly, manteniendo las mismas variables de entorno de .env.example (PORT, MONGO_URL, JWT_SECRET, JWT_EXPIRES_IN y NODE_ENV).

Para GET /api/sessions/current arme la estrategia current con passport-jwt y un extractor propio que lee la cookie currentUser. Si el token es valido deja { id, email, role } en req.user sin password y si falta la cookie o el token esta vencido o manipulado responde 401. El logout sigue igual eliminando la cookie sin pasar por Passport. Ademas el archivo passport.config.js ya quedo estructurado para que mas adelante se puedan enchufar estrategias de providers externos como Google o GitHub directamente ahi sin tocar app.js.

Para la parte de roles y autorizacion agregue un sistema de permisos separado en middlewares para diferenciar bien cuando alguien no esta logueado y cuando si esta logueado pero no tiene rango suficiente. Los roles posibles en el modelo de usuario son user, organizer y admin, y como siempre el registro publico solo deja crear cuentas con rol user.

Para controlar esto estan los dos middlewares en la carpeta middlewares. El primero es auth.middleware.js que valida la cookie currentUser con la estrategia current de Passport y si no hay sesion valida responde 401 con "No autenticado". El segundo es authorize.middleware.js, un middleware reutilizable que recibe por parametro los roles permitidos para una ruta y los compara contra req.user.role. Si el rol del usuario no coincide responde 403 con:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

La diferencia entre 401 y 403 queda bien marcada asi: el 401 significa que no iniciaste sesion o tu token vencio o es trucho, mientras que el 403 significa que si iniciaste sesion pero tu rol no alcanza para hacer esa accion o estas intentando editar algo de otro usuario.

La matriz de permisos de la plataforma queda armada de esta forma: cualquiera puede consultar los eventos publicados en GET /api/events o buscar uno puntual en GET /api/events/:id sin necesidad de permiso especial. Para crear eventos en POST /api/events hace falta estar autenticado y tener rol organizer o admin, asi que un usuario comun con rol user recibe un 403. Para modificar o cancelar un evento en PUT /api/events/:id, PATCH /api/events/:id/cancel o DELETE /api/events/:id tambien hace falta ser organizer o admin, pero ademas validamos propiedad del recurso: un organizer solo puede editar o cancelar los eventos que creo el mismo (si intenta tocar el evento de otro organizer recibe 403), mientras que un admin puede modificar o cancelar cualquier evento sin importar quien lo creo. Por ultimo, las rutas administrativas de usuarios como GET /api/users (que lista los usuarios sin mostrar contraseñas), GET /api/users/:id y PATCH /api/users/:id/role solo estan habilitadas para el rol admin; si entra un user o un organizer les devuelve 403.

Por ejemplo, si un usuario con rol organizer o admin manda un POST /api/events con un body asi:

```json
{
  "title": "Torneo de Padel Verano",
  "sportType": "Padel",
  "location": "Club Central",
  "date": "2026-12-15T18:00:00.000Z",
  "maxParticipants": 32,
  "price": 5000
}
```

El servidor guarda el evento asignandole automaticamente su id como organizer y responde 201:

```json
{
  "status": "success",
  "payload": {
    "id": "6690...",
    "title": "Torneo de Padel Verano",
    "sportType": "Padel",
    "category": "General",
    "location": "Club Central",
    "date": "2026-12-15T18:00:00.000Z",
    "maxParticipants": 32,
    "price": 5000,
    "status": "published",
    "organizer": "6b01df6d7c90c6fa0e85b023"
  }
}
```

Si esa misma peticion la hace un user comun recibe 403, y si la mandan sin cookie recibe 401. Tambien si alguien manda un id de evento con formato invalido responde 400 y si busca un evento que no existe responde 404.

Para probar todo esto contra la base arme tambien usuarios de prueba con los distintos roles (user, organizer y admin) y comprobe que las rutas privadas sin cookie devuelvan 401, que el user no pueda crear eventos ni ver usuarios, que el organizer pueda crear y modificar sus propios eventos pero no los de otro organizer ni entrar a /api/users, y que el admin pueda hacer todo. Como en las entregas anteriores, ni el archivo .env, ni node_modules ni ninguna credencial privada se suben al repositorio.

Despues sume la entidad completa de eventos con toda la logica de negocio y las consultas avanzadas. El modelo Event en MongoDB tiene title, description, category, date, location, capacity (mayor a 0), price (mayor o igual a 0), status (que solo acepta draft, published, cancelled o finished) y organizer, que es una referencia por ObjectId al usuario que creo el evento y se toma directo desde req.user sin aceptar que lo manden en el body.

Toda la validacion de reglas de negocio vive en la capa de services (events.service.js) y el acceso a datos queda en el repository y el dao. Al crear o editar un evento no se permite poner una fecha pasada, la capacidad tiene que ser mayor a cero y el precio no puede ser negativo. Para cancelar un evento nunca se borra fisicamente de la base de datos, sino que se cambia su estado a cancelled mediante PATCH /api/events/:id/status (o DELETE /api/events/:id que hace la misma baja logica). Ademas, una vez que un evento esta en estado cancelled o finished ya no se puede modificar ni volver a publicar.

Las rutas de eventos quedan asi: POST /api/events para crear eventos (solo organizer o admin), GET /api/events para listar eventos (publico), GET /api/events/:id para ver el detalle de un evento (publico, devuelve 404 si no existe), PUT /api/events/:id para modificar un evento (solo el organizer dueño o un admin) y PATCH /api/events/:id/status para cambiar su estado (tambien solo el dueño o admin). Por ejemplo, para crear un evento valido se manda:

```json
{
  "title": "Torneo Regional de Crossfit",
  "description": "Competencia amateur por equipos en tres categorias",
  "category": "crossfit",
  "location": "Polideportivo Sur",
  "date": "2026-12-20T15:00:00.000Z",
  "capacity": 40,
  "price": 3500
}
```

El listado de GET /api/events ahora soporta filtros, paginacion y ordenamiento por query params. Se puede filtrar por status, category, location y rango de fechas con dateFrom y dateTo, elegir pagina y tamaño con page y limit, y ordenar con sort (por ejemplo sort=date o sort=-price). Un ejemplo de consulta seria GET /api/events?status=published&category=crossfit&page=1&limit=5&sort=date y la respuesta viene paginada con esta estructura:

```json
{
  "status": "success",
  "data": [],
  "page": 1,
  "limit": 5,
  "total": 0,
  "totalPages": 1
}
```

Por ultimo sume todo el modulo de tickets, inscripciones a eventos, control de cupos y notificaciones por email usando Nodemailer. El modelo Ticket en MongoDB guarda referencias por ObjectId a user y event sin embeber objetos completos, ademas de status (que solo acepta confirmed, pending o cancelled), quantity (mayor a cero), reservationCode unico, createdAt y cancelledAt.

Para inscribirse a un evento cualquier usuario autenticado puede mandar un POST /api/events/:eid/tickets pasando en el body la cantidad de lugares, por ejemplo:

```json
{
  "quantity": 2
}
```

Toda la logica de validacion esta en tickets.service.js. Ahi se chequea que el evento exista (si no devuelve 404), que este en estado published y no cancelado ni finalizado, que la fecha todavia no haya pasado, que quantity sea un numero valido mayor a cero, que el usuario no tenga ya un ticket activo para ese mismo evento y que haya cupos suficientes disponibles. La regla de cupos suma las cantidades de todos los tickets activos (confirmed o pending) del evento y las resta de la capacidad total; los tickets en estado cancelled nunca cuentan como cupo ocupado. Si todo esta bien crea el ticket con su reservationCode y responde 201:

```json
{
  "status": "success",
  "payload": {
    "id": "6691...",
    "user": "6b01df6d7c90c6fa0e85b023",
    "event": "6690...",
    "status": "confirmed",
    "quantity": 2,
    "reservationCode": "TCK-A1B2C3D4",
    "cancelledAt": null,
    "createdAt": "2026-11-21T19:00:00.000Z"
  }
}
```

Apenas se confirma la inscripcion, mail.service.js envia un correo de confirmacion al email del usuario mediante Nodemailer con el codigo de reserva, el titulo, la fecha, la ubicacion y la cantidad. Las credenciales de correo se toman siempre desde variables de entorno configuradas en .env (MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS y MAIL_FROM) que tambien quedaron declaradas sin valores privados en .env.example.

Para consultar sus propias inscripciones el usuario autenticado usa GET /api/tickets/my-tickets, que devuelve sus tickets con populate de los datos principales del evento (title, date, location y status) sin exponer informacion de otros usuarios. Por otro lado, para ver todos los inscriptos y cupos disponibles de un evento existe GET /api/events/:eid/tickets, habilitada solamente para el organizer dueño de ese evento o para un admin (un user comun o un organizer de otro evento reciben 403).

Para cancelar una inscripcion se usa PATCH /api/tickets/:tid/cancel. Solo la puede ejecutar el dueño del ticket o un admin (si otro usuario intenta cancelar un ticket ajeno recibe 403). La cancelacion no elimina el ticket de la base sino que cambia su status a cancelled, guarda la fecha en cancelledAt y valida que no haya sido cancelado antes; al pasar a cancelled ese cupo vuelve a quedar libre automaticamente para nuevas inscripciones.

Finalmente reordene todo el codigo en una arquitectura formal por capas con DAO, Repository, Service, Controller y DTO sin cambiar el comportamiento externo de ninguna ruta. Ahora los unicos archivos que importan los modelos de Mongoose son los DAO en src/dao (UserDAO, EventDAO y TicketDAO), que exponen operaciones genericas de acceso a datos como findAll, findById, findOne, create, update y count. Por encima estan los repositories en src/repositories (UserRepository, EventRepository y TicketRepository), que no tocan modelos directamente sino que hablan con su DAO y ofrecen metodos pensados para el dominio como findByEmail, findPublishedEvents, countActiveTickets o cancelTicket.

La capa de services consume unicamente repositories y concentra todas las reglas de negocio: validacion de cupos, estados, duplicados, permisos sobre recursos propios y envio de emails. Los controllers quedaron livianos solo para leer req.body, req.params o req.query, llamar al servicio y devolver la respuesta, mandando cualquier error con next(error) hacia el middleware centralizado errorHandler.middleware.js para distinguir de forma pareja los codigos 400, 401, 403, 404, 409 y 500. Ademas sume la carpeta src/dto con UserDTO, EventDTO y TicketDTO para filtrar todas las salidas de usuario autenticado, eventos y tickets, garantizando que ni las rutas protegidas ni los populate devuelvan contraseñas ni datos sensibles de mas.

Para cerrar la version final de la api quedan integrados todos los modulos en un flujo completo que se puede probar de corrido. Si alguien clona el proyecto y quiere crear usuarios de prueba para todos los roles, primero se registra un usuario comun desde POST /api/sessions/register (que siempre arranca como user), y para probar los permisos de organizer o admin se puede actualizar el campo role directamente en la coleccion users de MongoDB Atlas o usando el endpoint PATCH /api/users/:id/role desde una cuenta admin.

El circuito completo arranca registrando o iniciando sesion con POST /api/sessions/login, lo que deja la cookie currentUser httpOnly activa en el cliente y permite verificar la sesion en GET /api/sessions/current. Con una cuenta organizer o admin se pueden crear eventos en POST /api/events mandando title, description, category, location, date, capacity y price, editar sus datos en PUT /api/events/:id o cambiar su estado en PATCH /api/events/:id/status. Cualquier visitante puede consultar el catalogo con filtros, paginacion y ordenamiento en GET /api/events, y un usuario logueado puede inscribirse desde POST /api/events/:eid/tickets recibiendo su codigo de reserva por email gracias a Nodemailer. Finalmente el usuario consulta sus entradas en GET /api/tickets/my-tickets, el organizador o administrador controla los cupos ocupados en GET /api/events/:eid/tickets, y si el participante cancela desde PATCH /api/tickets/:tid/cancel el ticket pasa a cancelled y libera el cupo al instante para otra persona, cerrando luego la sesion con POST /api/sessions/logout.
