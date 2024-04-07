const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');

//modificaciones :


const Usuario = require('../models/usuarios');
const Dispositivo = require('../models/dispositivo');

//////////////////////////////////////////////////////////////////

const esquema = require('../models/usuarios')

const router = express.Router()

//agregue dos endpoints para control de dispositivos por id 


//Endpoint para ver dispositivos de un usuarios 
///////////////////////////////////////////////////////////////////////////////////////////////
router.get('/usuarios/:userId/dispositivos', async (req, res) => {
    const { userId } = req.params;

    try {
        const usuario = await Usuario.findById(userId).populate('dispositivos');
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        res.json(usuario.dispositivos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los dispositivos.' });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////

//Endpoint para asignar Dispositivos


router.put('/usuarios/asignar-dispositivo/:userId', async (req, res) => {
    const { userId } = req.params;
    const { codigoDevice } = req.body;

    try {
        const usuario = await Usuario.findById(userId);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        const dispositivo = await Dispositivo.findOne({ claveUnica: codigoDevice });
        if (!dispositivo) {
            return res.status(404).json({ error: "Dispositivo no encontrado." });
        }

        if (dispositivo.asignacion) {
            return res.status(400).json({ error: "El dispositivo ya está asignado a otro usuario." });
        }

        usuario.dispositivos.push(dispositivo._id);
        dispositivo.asignacion = true;
        await usuario.save();
        await dispositivo.save();

        res.json({ message: 'Dispositivo asignado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al asignar el dispositivo.' });
    }
});


//EndPoint para listar Dispositivos de un usuario 

router.get('/usuarios/:userId/dispositivos', async (req, res) => {
    const { userId } = req.params;

    try {
        const usuario = await esquema.findById(userId).populate('dispositivos');
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        res.json(usuario.dispositivos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los dispositivos.' });
    }
});


/////////////////////////////////////////////////////
// Endpoint de inicio de sesión
router.get('/usuarios/perfil', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Asume que el token viene en el encabezado Authorization como "Bearer <token>"
        const decoded = jwt.verify(token, 'tuSecretKey'); // Usa la misma clave secreta que usaste para firmar el token
        const usuario = await esquema.findById(decoded._id); // Busca el usuario por el ID decodificado del token

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(usuario); // Devuelve el usuario encontrado
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

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

        // Generación del token de recuperación de 8 caracteres
        function generarToken() {
            const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let token = '';
            for (let i = 0; i < 8; i++) {
                token += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            return token;
        }

        const tokenRecuperacion = generarToken();

        // Actualizar el token de recuperación en la base de datos del usuario
        usuario.codigoRecuperacion = tokenRecuperacion;
        await usuario.save();

        // Configuración del correo electrónico
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "p36076220@gmail.com",
                pass: "g j q a o h y x e x s z o f j p",
            },
        });

        const mailOptions = {
            from: 'p36076220@gmail.com',
            to: correo,
            subject: 'Recuperación de Contraseña',
            html: `<p>Hola ${usuario.nombre},</p>
                    <p>Has solicitado restablecer tu contraseña. Tu código de verificación es: <strong>${tokenRecuperacion}</strong></p>`,
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
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});

// Endpoint para verificar el código de recuperación
router.post('/usuarios/verificar-codigo', async (req, res) => {
    try {
        const { correo, codigoRecuperacion } = req.body;
        const usuario = await esquema.findOne({ correo });

        if (!usuario) {
            return res.status(404).json({ error: 'No se encontró un usuario con ese correo electrónico.' });
        }

        // Verificar si el código de recuperación coincide
        if (usuario.codigoRecuperacion === codigoRecuperacion) {
            return res.json({ message: 'Código de recuperación válido.' });
        } else {
            return res.status(400).json({ error: 'Código de recuperación no válido.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});


router.get('/usuarios/obtener-pregunta-seguridad/:email', async (req, res) => {
    try {
        const usuario = await esquema.findOne({ correo: req.params.email });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ pregunta: usuario.preguntaRecuperacion });
    } catch (error) {
        console.error('Error al obtener la pregunta de seguridad:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Endpoint to verify security answer
router.post('/usuarios/verificar-respuesta-seguridad', async (req, res) => {
    try {
        const { correo, respuesta } = req.body;
        const usuario = await esquema.findOne({ correo });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (usuario.respuestaPregunta === respuesta) {
            res.json({ esCorrecta: true });
        } else {
            res.json({ esCorrecta: false });
        }
    } catch (error) {
        console.error('Error al verificar la respuesta:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Endpoint to reset password
router.post('/usuarios/restablecer-contrasena', async (req, res) => {
    try {
        const { correo, nuevaContrasena } = req.body;

        const usuario = await esquema.findOne({ correo });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        usuario.contraseña = nuevaContrasena;
        usuario.codigoRecuperacion = undefined;
        await usuario.save();

        res.json({ message: 'Contraseña actualizada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});


// Endpoint para obtener la pregunta de seguridad
router.get('/usuarios/obtener-pregunta-seguridad/:email', async (req, res) => {
    try {
        const usuario = await esquema.findOne({ correo: req.params.email });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ pregunta: usuario.preguntaRecuperacion });
    } catch (error) {
        console.error('Error al obtener la pregunta de seguridad:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Endpoint para verificar la respuesta de seguridad
router.post('/usuarios/verificar-respuesta-seguridad', async (req, res) => {
    try {
        const { correo, respuesta } = req.body;
        const usuario = await esquema.findOne({ correo });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (usuario.respuestaPregunta === respuesta) {
            res.json({ esCorrecta: true });
        } else {
            res.json({ esCorrecta: false });
        }
    } catch (error) {
        console.error('Error al verificar la respuesta:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;