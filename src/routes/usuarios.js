const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');

const esquema = require('../models/usuarios')

const router = express.Router()

// Endpoint de inicio de sesión
router.post('/usuarios/login', async (req, res) => {
    try {
        const usuario = await esquema.findOne({ correo: req.body.correo });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario incorrecto" });
        }

        const contraseñaValida = await esquema.findOne({ contraseña: req.body.contraseña });
        const pass = contraseñaValida;
        if (!contraseñaValida) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }


        const token = jwt.sign(
            { _id: usuario._id, tipo: usuario.tipo },
            'tuSecretKey',
            { expiresIn: '24h' }
        );
        res.json({
            token,
            user: {
                _id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo,
                tipo: usuario.tipo,
                // Puedes agregar más campos según necesites
            }
        });
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }

    //     res.json({ token });
    // } catch (error) {
    //     res.status(500).send('Error en el servidor');
    // }
});


router.get('/usuarios/x', (req, res) => {
    res.json({ "response": "Prueba Users" })
})

router.post('/usuarios', (req, res) => {
    const us = esquema(req.body);
    us.save()
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }))
})

//leer usuarios
router.get('/usuarios', (req, res) => {
    esquema.find()
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }))
})

//buscar usuario
router.get('/usuarios/:id', (req, res) => {
    const { id } = req.params
    esquema.findById(id)
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }))
})

//busqueda por elmail
router.get('/usuarios/correo/:correo', (req, res) => {
    const { correo } = req.params
    esquema.findOne({ correo })
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }))
})


//actualizar usuario
router.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, correo, contraseña, telefono, tipo, preguntaRecuperacion, respuestaPregunta, codigoRecuperacion, dispositivo } = req.body
    esquema
        .updateOne({ _id: id }, { $set: { nombre, apellido, correo, contraseña, telefono, tipo, preguntaRecuperacion, respuestaPregunta, codigoRecuperacion, dispositivo } })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }))
})

//eliminar usuario
router.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    esquema.deleteOne({ _id: id })
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }))
})

//Valido para recuperar contraseña, de aqui para arriba no modificar nada, ya todo funciona

// Configuración del transportador de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "p36076220@gmail.com",
        pass: "g j q a o h y x e x s z o f j p",
    },
});

// Endpoint para solicitar recuperación de contraseña
router.post('/usuarios/solicitar-recuperacion', async (req, res) => {
    try {
        const { correo } = req.body;
        const usuario = await esquema.findOne({ correo });

        if (!usuario) {
            return res.status(404).json({ error: 'No se encontró un usuario con ese correo electrónico.' });
        }

        // Generación del token de recuperación
        const tokenRecuperacion = jwt.sign(
            { _id: usuario._id },
            'tu_clave_secreta', // Reemplazar 'tu_clave_secreta' con tu propia clave secreta
            { expiresIn: '1h' }
        );

        const enlaceRecuperacion = `https://ap-pi.vercel.app/api/usuarios/cambiar-contrasena/${tokenRecuperacion}`;

        // Configuración del correo electrónico
        const mailOptions = {
            from: 'p36076220@gmail.com',
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
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }
});
// Endpoint para verificar el código de recuperación y permitir el cambio de contraseña
router.post('/usuarios/verificar-codigo', async (req, res) => {
    try {
        const { token, nuevaContrasena } = req.body;

        // Verificar si el token de recuperación es válido
        jwt.verify(token, 'tu_clave_secreta', async (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Token de recuperación inválido o expirado.' });
            }

            // Si el token es válido, actualizar la contraseña del usuario
            const usuario = await esquema.findById(decoded._id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }

            // Actualizar la contraseña del usuario
            usuario.contraseña = nuevaContrasena;
            await usuario.save();

            res.json({ message: 'Contraseña actualizada exitosamente.' });
        });
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }
});


module.exports = router;