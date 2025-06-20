// api/publish-to-wp.js

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { userId, title, content, status } = req.body;

    if (!userId || !title || !content || !status) {
        return res.status(400).json({ error: 'Faltan datos para la publicación (userId, título, contenido, estado).' });
    }
    
    // 1. Obtener las credenciales de WP del usuario desde la base de datos
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.wpUrl || !user.wpUsername || !user.wpPassword) {
            return res.status(403).json({ error: 'El usuario no tiene configurada la conexión a WordPress.' });
        }

        // 2. Preparar la llamada a la API REST de WordPress
        // La URL para crear un nuevo post es /wp-json/wp/v2/posts
        let apiUrl = user.wpUrl;
        // Limpiamos la URL para asegurarnos de que no tenga barras extra al final o partes incorrectas
        if (apiUrl.endsWith('/')) {
            apiUrl = apiUrl.slice(0, -1);
        }
        if (apiUrl.endsWith('wp-admin')) {
             apiUrl = apiUrl.replace(/wp-admin\/?$/, ''); // Quita wp-admin/ o wp-admin
             if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0,-1); // Quita la barra final de nuevo si queda
        }
       
        const endpoint = `${apiUrl}/wp-json/wp/v2/posts`;

        // La autenticación se hace con el username y la Contraseña de Aplicación
        const authString = Buffer.from(`${user.wpUsername}:${user.wpPassword}`).toString('base64');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authString}`,
        };
        
        const postData = {
            title: title,
            content: content,
            status: status, // puede ser 'publish' (público) o 'draft' (borrador)
        };

        // 3. Realizar la petición a WordPress para crear el post
        const wpResponse = await axios.post(endpoint, postData, { headers });
        
        // 4. Devolver una respuesta de éxito si todo fue bien
        return res.status(201).json({
            message: '¡Artículo publicado en WordPress con éxito!',
            postLink: wpResponse.data.link // Devolvemos el enlace al post recién creado
        });

    } catch (error) {
        console.error("Error al publicar en WordPress:", error.response ? error.response.data : error.message);
        
        let errorMessage = 'Ocurrió un error en el servidor al intentar publicar.';
        if(error.response && error.response.data) {
             // Intentamos dar un mensaje de error más específico de WordPress si es posible
            errorMessage = error.response.data.message || JSON.stringify(error.response.data);
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = "No se pudo conectar a la URL de WordPress. Revisa que esté bien escrita."
        }
        
        return res.status(500).json({ error: errorMessage });
    }
}