// api/forgot-password.js

import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'El email es requerido.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        // Importante: aunque no encontremos el usuario, devolvemos un mensaje genérico
        // para no revelar qué correos están registrados y cuáles no.
        if (!user) {
            return res.status(200).json({ message: 'Si tu correo está registrado, recibirás un enlace.' });
        }

        // 1. Generar un token seguro
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // 2. Establecer una fecha de expiración (ej: 1 hora)
        const passwordResetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

        // 3. Guardar el token (hasheado) y la expiración en la base de datos
        await prisma.user.update({
            where: { email },
            data: { passwordResetToken, passwordResetTokenExpiry },
        });

        // 4. Crear la URL de reseteo (IMPORTANTE: cambia 'TU_DOMINIO.com' por tu dominio real cuando lo despliegues)
        const resetUrl = `http://localhost:3000/reset-password.html?token=${resetToken}`;

        // 5. Enviar el email
        await transporter.sendMail({
            from: `"GlyphCode" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: 'Restablecimiento de Contraseña de GlyphCode',
            html: `
                <h1>Solicitud de Restablecimiento de Contraseña</h1>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p>Haz clic en el siguiente enlace para establecer una nueva contraseña. Este enlace es válido por 1 hora:</p>
                <a href="${resetUrl}" style="background-color:#39FF14; color:#0A0A10; padding:12px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">Restablecer Contraseña</a>
                <p>Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
            `,
        });

        return res.status(200).json({ message: 'Si tu correo está registrado, recibirás un enlace.' });

    } catch (error) {
        console.error("Error en forgot-password:", error);
        return res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
    }
}