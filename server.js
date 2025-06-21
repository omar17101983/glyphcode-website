// server.js (VERSIÓN CORREGIDA Y ROBUSTA)

import express from 'express';
import cors from 'cors';
import requestIp from 'request-ip';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuración para resolver rutas con ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Importamos los manejadores (handlers) de la carpeta /api ---
// Usamos path.join para crear rutas absolutas y evitar errores
import loginHandler from './api/login.js';
import registerHandler from './api/register.js';
import forgotPasswordHandler from './api/forgot-password.js';
import resetPasswordHandler from './api/reset-password.js';
import generateArticleHandler from './api/generate-article.js';
import getUserStatusHandler from './api/get-user-status.js';
import publishToWpHandler from './api/publish-to-wp.js';
import wpSettingsHandler from './api/wp-settings.js';

const app = express();
const port = 3001; // Puerto interno donde correrá la aplicación

// --- Middlewares esenciales ---
app.use(cors()); // Permite peticiones desde cualquier origen (Vercel)
app.use(express.json()); // Permite al servidor entender el formato JSON
app.use(requestIp.mw()); // Para que `request-ip` funcione en register.js

// --- Definimos las rutas de la API ---
// Cada ruta llama al handler correspondiente
app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);
app.post('/api/forgot-password', forgotPasswordHandler);
app.post('/api/reset-password', resetPasswordHandler);
app.post('/api/generate-article', generateArticleHandler);
app.post('/api/get-user-status', getUserStatusHandler);
app.post('/api/publish-to-wp', publishToWpHandler);

// La ruta de wp-settings necesita manejar GET y POST
app.get('/api/wp-settings', wpSettingsHandler);
app.post('/api/wp-settings', wpSettingsHandler);

// --- Ruta de prueba para saber que el servidor funciona ---
app.get('/', (req, res) => {
    res.send('Servidor API de GlyphCode funcionando correctamente.');
});

// --- Middleware para manejar errores ---
// Se ejecutará si ninguna de las rutas anteriores coincide o si hay un error no capturado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió muy mal en el servidor.' });
});

app.listen(port, () => {
  console.log(`✅ Servidor API de GlyphCode escuchando en http://localhost:${port}`);
});