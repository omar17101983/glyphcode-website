// api/get-user-status.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const planLimits = {
  FREE: 5,
  MEDIUM: 150,
  BUSINESS: 350,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Falta el ID del usuario.' });
  }

  try {
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Reutilizamos la lógica para reiniciar el contador si ha pasado un mes
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

    // Devolvemos la información necesaria para el dashboard
    res.status(200).json({
      plan: user.plan,
      articleCount: user.articleCount,
      limit: limit,
      email: user.email,
    });

  } catch (error) {
    console.error('Error en get-user-status:', error);
    res.status(500).json({ error: 'Hubo un error al obtener el estado del usuario.', details: error.message });
  }
}