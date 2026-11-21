import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.config.js';

const PORT = config.port;

// Conectar a la base de datos
connectDB();

// Inicializar el servidor Express
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT} (modo: ${config.nodeEnv})`);
  console.log(`Verificación de salud: http://localhost:${PORT}/api/health`);
});
