// server.js - El cerebro de tu aplicación en el VPS

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importamos la lógica de tus archivos de API
// (Asegúrate de que las rutas son correctas según tu estructura)
import generateArticleHandler from './api/generate-article.js';
import getUserStatusHandler from './api/get-user-status.js';
import forgotPasswordHandler from './api/forgot-password.js';
import loginHandler from './api/login.js';
import publishToWpHandler from './api/publish-to-wp.js';
import registerHandler from './api/register.js';
import resetPasswordHandler from './api/reset-password.js';
import wpSettingsHandler from './api/wp-settings.js';

// Configuración básica del servidor
const app = express();
const port = 3001; // Usamos un puerto como 3001 para el backend

// Middlewares
app.use(cors()); // Permite peticiones desde cualquier origen (Vercel)
app.use(express.json()); // Permite que el servidor entienda peticiones con cuerpo JSON

// --- Definición de las Rutas de la API ---
// Cada vez que tu frontend haga un fetch a /api/ruta, este servidor lo gestionará.
app.post('/api/generate-article', generateArticleHandler);
app.post('/api/get-user-status', getUserStatusHandler);
app.post('/api/forgot-password', forgotPasswordHandler);
app.post('/api/login', loginHandler);
app.post('/api/publish-to-wp', publishToWpHandler);
app.post('/api/register', registerHandler);
app.post('/api/reset-password', resetPasswordHandler);

// La ruta de wp-settings usa GET y POST
app.get('/api/wp-settings', wpSettingsHandler);
app.post('/api/wp-settings', wpSettingsHandler);


// --- Servir el Frontend (opcional, pero buena práctica) ---
// Esto es por si en el futuro quieres que el VPS también sirva el frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asumimos que tus archivos HTML, CSS, etc. están en la raíz o en una carpeta 'public'
// Si tus archivos (index.html, style.css) están en la raíz, usa esta línea:
app.use(express.static(__dirname)); 

// Si estuvieran en una carpeta 'public', usarías:
// app.use(express.static(path.join(__dirname, 'public')));


// --- Iniciar el Servidor ---
app.listen(port, () => {
  console.log(`✅ Servidor GlyphCode corriendo en el puerto ${port}`);
});