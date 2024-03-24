const express = require('express');
const nodemailer = require('nodemailer');
const esquema = require('../models/usuarios');
const router = express.Router();

// Configuración del transportador de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "proyeqtocuatri@gmail.com", // Aquí ingresa tu dirección de correo electrónico
        pass: "proyequi1254", // Aquí ingresa tu contraseña de correo electrónico
    },
});


// Endpoint para solicitar recuperación de contraseña
router.post('/usuarios/solicitar-recuperacion', async (req, res) => {
    const { correo } = req.body;
    const usuario = await esquema.findOne({ correo });

    if (!usuario) {
        return res.status(404).json({ error: 'No se encontró un usuario con ese correo electrónico.' });
    }

    // Generación del token de recuperación
    const tokenRecuperacion = jwt.sign(
        { _id: usuario._id },
        'contraseñapass1234', // Aquí deberías usar una clave secreta segura
        { expiresIn: '1h' }
    );

    // URL de recuperación de contraseña
    const enlaceRecuperacion = `http://localhost:3000/registrarse/recuperar-contrasena/${tokenRecuperacion}`;

    // Configuración del correo electrónico
    const mailOptions = {
        from: 'proyeqtocuatri@gmail.com', // Aquí ingresa tu dirección de correo electrónico
        to: correo,
        subject: 'Recuperación de Contraseña',
        html: `<p>Hola ${usuario.nombre},</p>
                <p>Has solicitado restablecer tu contraseña. Por favor, sigue el siguiente enlace para establecer una nueva:</p>
                <a href="${enlaceRecuperacion}">Restablecer contraseña</a>`,
    };

    // Envío del correo electrónico
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.status(500).json({ error: 'Error al enviar el correo electrónico.' });
        } else {
            res.json({ message: 'Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.' });
        }
    });
});

module.exports = router;
