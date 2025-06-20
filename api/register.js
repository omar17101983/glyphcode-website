// api/register.js (VERSIÓN CON CONTROL DE IP)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import requestIp from 'request-ip'; // Necesitaremos instalar esto

const prisma = new PrismaClient();
const transporter = nodemailer.createTransport({ /* ...config... */ });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, clave_acceso } = req.body;
  
  if (!email || !clave_acceso) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    // --- NUEVO: Control de abuso por IP ---
    const clientIp = requestIp.getClientIp(req) || 'IP_DESCONOCIDA';
    const existingUserWithIp = await prisma.user.findFirst({
        where: { lastIp: clientIp }
    });

    // Permitimos, por ejemplo, un máximo de 2 cuentas por IP para el plan gratuito
    if (existingUserWithIp) {
         const ipCount = await prisma.user.count({ where: { lastIp: clientIp }});
         if (ipCount >= 2) { // Puedes ajustar este número
             return res.status(429).json({ message: 'Se ha alcanzado el límite de cuentas gratuitas para esta red. Por favor, considera un plan de pago.' });
         }
    }
    // --- FIN DEL CONTROL DE ABUSO ---

    const hashedPassword = await bcrypt.hash(clave_acceso, 10);
    
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        lastIp: clientIp // Guardamos la IP del usuario
      },
    });

    // ... (lógica para enviar email de notificación) ...

    return res.status(201).json({ message: 'Usuario registrado con éxito.' });

  } catch (error) {
    // ... (manejo de errores existente) ...
  }
}