import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer'; // ¡LO HEMOS TRAÍDO DE VUELTA!

// Creamos una única instancia de Prisma para usarla en toda la función
const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Nos aseguramos de que solo aceptamos peticiones de tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  // Sacamos el email y la contraseña del cuerpo de la petición
  const { email, clave_acceso } = req.body;

  // Comprobamos que no vengan vacíos
  if (!email || !clave_acceso) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    // --- PASO 1: LÓGICA DE LA BASE DE DATOS ---

    console.log(`Intentando registrar al usuario: ${email}`);

    // Comprobamos si el usuario ya existe para no duplicarlo
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`El email ${email} ya existe. Abortando registro.`);
      return res.status(409).json({ message: 'Este correo electrónico ya está registrado.' });
    }

    // Ciframos la contraseña para no guardarla en texto plano NUNCA
    console.log("Cifrando contraseña...");
    const passwordHash = await bcrypt.hash(clave_acceso, 10);

    // Creamos el usuario en nuestra base de datos de Vercel
    console.log("Guardando usuario en la base de datos...");
    await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
      },
    });
    console.log("Usuario guardado con éxito.");


    // --- PASO 2: LÓGICA DEL EMAIL DE NOTIFICACIÓN ---
    // Si hemos llegado hasta aquí, significa que el usuario se guardó bien.
    // Ahora enviamos el correo.

    console.log(`Enviando email de notificación a ${process.env.GMAIL_USER}...`);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // La variable de entorno de Vercel
        pass: process.env.GMAIL_PASS,  // La contraseña de aplicación de 16 letras
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Te lo envías a ti mismo
      subject: `✅ Nuevo Usuario Registrado en GlyphCode: ${email}`,
      html: `<h1>¡Nuevo Registro!</h1>
             <p>Se ha registrado un nuevo usuario con el siguiente correo:</p>
             <p><b>Email:</b> ${email}</p>
             <p><i>Este es un correo automático de notificación de tu aplicación.</i></p>`,
    });
    console.log("Email de notificación enviado correctamente.");


    // --- PASO 3: RESPUESTA FINAL AL NAVEGADOR ---
    // Si todo (BD y email) ha funcionado, devolvemos el éxito.
    return res.status(201).json({ message: 'Usuario registrado con éxito.' });

  } catch (error) {
    // Si algo en el bloque 'try' falla (la BD o el email)...
    console.error("Error completo en el registro:", error);
    // ...devolvemos un error genérico al usuario.
    return res.status(500).json({ message: 'Ocurrió un error en el servidor durante el registro.' });
  }
}