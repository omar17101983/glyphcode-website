// api/register.js (VERSIÓN CON NOTIFICACIÓN POR CORREO)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer'; // <-- IMPORTAMOS NODEMAILER

const prisma = new PrismaClient();

// --- CONFIGURACIÓN PARA ENVIAR CORREO ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // Usamos Gmail
    auth: {
        user: process.env.GMAIL_USER, // Tu correo desde .env
        pass: process.env.GMAIL_PASS, // Tu contraseña de aplicación desde .env
    },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, clave_acceso } = req.body;

  if (!email || !clave_acceso) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(clave_acceso, 10);

    // Creamos el usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    // --- LÓGICA PARA ENVIAR EL CORREO ---
    try {
        await transporter.sendMail({
            from: `"GlyphCode" <${process.env.GMAIL_USER}>`, // Remitente
            to: process.env.GMAIL_USER, // Te lo envías a ti mismo
            subject: 'Nuevo Usuario Registrado en GlyphCode ✔', // Asunto
            html: `
                <h1>¡Nuevo Registro!</h1>
                <p>Un nuevo usuario se ha registrado en tu plataforma.</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Fecha de Registro:</strong> ${new Date().toLocaleString('es-ES')}</p>
            `, // Cuerpo del correo en HTML
        });
        console.log('Correo de notificación de nuevo usuario enviado con éxito.');
    } catch (emailError) {
        // Si el envío de correo falla, no rompemos el registro.
        // Simplemente lo registramos en la consola del servidor.
        console.error("Error al enviar el correo de notificación:", emailError);
    }
    
    // Devolvemos la respuesta exitosa al usuario
    return res.status(201).json({ message: 'Usuario registrado con éxito.' });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Este correo electrónico ya está registrado.' });
    }
    console.error("Error en el registro:", error);
    return res.status(500).json({ message: 'Ocurrió un error en el servidor durante el registro.' });
  }
}