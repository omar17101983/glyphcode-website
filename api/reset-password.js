// api/reset-password.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Faltan el token o la nueva contraseña.' });
    }

    try {
        // 1. Hashear el token recibido para compararlo con el de la BD
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // 2. Buscar al usuario por el token y verificar que no haya expirado
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetTokenExpiry: {
                    gte: new Date(), // gte = Greater Than or Equal to (mayor o igual que ahora)
                },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
        }

        // 3. Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Actualizar la contraseña y limpiar los campos de reseteo
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetTokenExpiry: null,
            },
        });

        res.status(200).json({ message: '¡Contraseña actualizada con éxito!' });

    } catch (error) {
        console.error("Error en reset-password:", error);
        res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
    }
}