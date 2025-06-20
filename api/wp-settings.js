// api/wp-settings.js (VERSIÓN CORREGIDA)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    
    try {
        if (req.method === 'GET') {
            // ----- CAMBIO CLAVE AQUÍ -----
            // Para peticiones GET, leemos el userId desde la URL (req.query)
            const { userId } = req.query; 

            if (!userId) {
                return res.status(401).json({ error: 'Falta el ID del usuario.' });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { wpUrl: true, wpUsername: true },
            });

            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }

            return res.status(200).json(user);

        } else if (req.method === 'POST') {
            // Para peticiones POST, seguimos leyendo desde el cuerpo (req.body)
            const { userId, wpUrl, wpUsername, wpPassword } = req.body;

            if (!userId) {
                return res.status(401).json({ error: 'Usuario no autenticado.' });
            }

            const dataToUpdate = { wpUrl, wpUsername };
            
            if (wpPassword) {
                // Futura encriptación: dataToUpdate.wpPassword = encrypt(wpPassword);
                dataToUpdate.wpPassword = wpPassword;
            }
            
            await prisma.user.update({
                where: { id: userId },
                data: dataToUpdate,
            });
            
            return res.status(200).json({ message: 'Ajustes guardados con éxito.' });

        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error en /api/wp-settings:', error);
        return res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
    }
}