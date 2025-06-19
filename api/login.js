// api/login.js (VERSIÓN CORREGIDA)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, clave_acceso } = req.body;

  if (!email || !clave_acceso) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Comparamos con el campo 'password'
    const passwordIsValid = await bcrypt.compare(clave_acceso, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    return res.status(200).json({ 
        message: "Acceso concedido", 
        userId: user.id
    });

  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
  }
}