// api/generate-article.js

import { GoogleGenerativeAI } from '@google/generative-ai';

// Asegúrate de que la variable de entorno está cargada
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Solo permitir peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // El prompt viene del frontend
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'No se ha proporcionado un prompt.' });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Enviamos el texto generado de vuelta al frontend
    res.status(200).json({ generatedText: text });

  } catch (error) {
    console.error('Error al llamar a la API de Gemini:', error);
    res.status(500).json({ error: 'Hubo un error al generar el contenido.', details: error.message });
  }
}