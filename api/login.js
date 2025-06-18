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
    // 1. Buscamos al usuario por su email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Si el usuario no existe, devolvemos el mismo error para no dar pistas
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 2. Comparamos la contraseña que nos envían con la que tenemos cifrada en la BD
    const passwordIsValid = await bcrypt.compare(clave_acceso, user.passwordHash);
    if (!passwordIsValid) {
      // Si las contraseñas no coinciden
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. ¡Login exitoso!
    // (En la Etapa 2, aquí es donde generaríamos el token JWT)
    return res.status(200).json({ message: 'Login exitoso.' });

  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
  }
}