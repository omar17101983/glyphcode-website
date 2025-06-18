// Importamos la herramienta para enviar emails
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  
  // === INICIO DEL CÓDIGO DE DIAGNÓSTICO ===
  // Estas líneas nos dirán qué está viendo Vercel
  console.log("--- INICIANDO DIAGNÓSTICO DE VARIABLES ---");
  console.log("Tipo de GMAIL_USER:", typeof process.env.GMAIL_USER);
  console.log("Valor de GMAIL_USER (primeros 3 caracteres):", process.env.GMAIL_USER ? process.env.GMAIL_USER.substring(0, 3) + '...' : 'No definido');
  console.log("¿Existe la variable GMAIL_PASS?:", !!process.env.GMAIL_PASS);
  console.log("Longitud de GMAIL_PASS (si existe):", process.env.GMAIL_PASS ? process.env.GMAIL_PASS.length : 'No definido');
  console.log("--- FIN DEL DIAGNÓSTICO ---");
  // === FIN DEL CÓDIGO DE DIAGNÓSTICO ===

  // El resto del código sigue igual...
  const { email, clave_acceso } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: `Nuevo Usuario Registrado: ${email}`,
    text: `Se ha registrado un nuevo usuario con el correo: ${email}. \nSu clave de acceso fue: ${clave_acceso}`,
    html: `<p>Se ha registrado un nuevo usuario con el correo: <strong>${email}</strong>.</p><p>Su clave de acceso fue: <strong>${clave_acceso}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error("ERROR DETALLADO:", error); // Añadimos esto para ver el error completo
    return res.status(500).json({ message: 'Error sending email' });
  }
};