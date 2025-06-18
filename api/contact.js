// Importamos la herramienta para enviar emails
const nodemailer = require('nodemailer');

// La función principal que se ejecutará cuando se llame a /api/contact
module.exports = async (req, res) => {
  // Solo permitimos que esta función se llame con el método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Obtenemos los datos del formulario que nos envió el frontend
  const { email, clave_acceso } = req.body;

  // Creamos el "transportador" que usará Gmail para enviar el correo.
  // Usamos variables de entorno para la seguridad (¡MUY IMPORTANTE!)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Tu email de Gmail
      pass: process.env.GMAIL_PASS, // Tu contraseña de aplicación de Gmail
    },
  });

  // Creamos las opciones del correo que vamos a enviar
  const mailOptions = {
    from: process.env.GMAIL_USER, // Quién envía el email
    to: process.env.GMAIL_USER,   // A quién le llega el email (a ti mismo)
    subject: `Nuevo Usuario Registrado: ${email}`, // Asunto del correo
    text: `Se ha registrado un nuevo usuario con el correo: ${email}. \nSu clave de acceso fue: ${clave_acceso}`, // Cuerpo del correo
    html: `<p>Se ha registrado un nuevo usuario con el correo: <strong>${email}</strong>.</p><p>Su clave de acceso fue: <strong>${clave_acceso}</strong></p>`,
  };

  // Intentamos enviar el correo
  try {
    await transporter.sendMail(mailOptions);
    // Si todo va bien, respondemos al frontend con un éxito
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    // Si hay un error, lo mostramos en la consola de Vercel y respondemos con un error
    console.error(error);
    return res.status(500).json({ message: 'Error sending email' });
  }
}