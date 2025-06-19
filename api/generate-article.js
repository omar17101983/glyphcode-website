// api/generate-article.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const planLimits = {
  FREE: 5,
  MEDIUM: 150,
  BUSINESS: 350,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { prompt, userId } = req.body;

  if (!prompt || !userId) {
    return res.status(400).json({ error: 'Faltan el prompt o el ID del usuario.' });
  }

  try {
    // --- 1. VERIFICACIÓN DE LÍMITES ---
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Comprobar si ha pasado un mes para reiniciar el contador
    const now = new Date();
    const resetDate = new Date(user.usageResetDate);
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
        user = await prisma.user.update({
            where: { id: userId },
            data: { 
                articleCount: 0,
                usageResetDate: now
            }
        });
    }

    const limit = planLimits[user.plan];
    if (user.articleCount >= limit) {
      return res.status(429).json({ 
        error: `Has alcanzado tu límite de ${limit} artículos para el plan ${user.plan}.` 
      });
    }

    // --- 2. GENERACIÓN DE CONTENIDO (si el límite está OK) ---
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // --- 3. ACTUALIZACIÓN DEL CONTADOR ---
    await prisma.user.update({
      where: { id: userId },
      data: { articleCount: { increment: 1 } },
    });

    res.status(200).json({ generatedText: text });

  } catch (error) {
    console.error('Error en generate-article:', error);
    res.status(500).json({ error: 'Hubo un error al generar el contenido.', details: error.message });
  }
}