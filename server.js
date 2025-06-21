import express from 'express';
import cors from 'cors';
import requestIp from 'request-ip';

// --- Importamos los manejadores (handlers) de la carpeta /api ---
// Esta es la forma más robusta de asegurar que las rutas funcionan
import loginHandler from './api/login.js';
import registerHandler from './api/register.js';
import forgotPasswordHandler from './api/forgot-password.js';
import resetPasswordHandler from './api/reset-password.js';
import generateArticleHandler from './api/generate-article.js';
import getUserStatusHandler from './api/get-user-status.js';
import publishToWpHandler from './api/publish-to-wp.js';
import wpSettingsHandler from './api/wp-settings.js';

const app = express();
const port = 3001; 

// --- Middlewares esenciales ---
app.use(cors());
app.use(express.json());
app.use(requestIp.mw()); 

// --- Rutas de la API ---
app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);
app.post('/api/forgot-password', forgotPasswordHandler);
app.post('/api/reset-password', resetPasswordHandler);
app.post('/api/generate-article', generateArticleHandler);
app.post('/api/get-user-status', getUserStatusHandler);
app.post('/api/publish-to-wp', publishToWpHandler);
app.get('/api/wp-settings', wpSettingsHandler);
app.post('/api/wp-settings', wpSettingsHandler);

// --- Ruta de prueba ---
app.get('/', (req, res) => {
    res.status(200).send('Servidor API de GlyphCode funcionando correctamente.');
});

app.listen(port, (err) => {
  if (err) {
    console.error('Error al iniciar el servidor:', err);
    return;
  }
  console.log(`✅ Servidor API de GlyphCode escuchando en http://localhost:${port}`);
});