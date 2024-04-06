const mongoose = require('mongoose')

const empresaSchema = mongoose.Schema(
    {
        descripcion: { type: String, require: true },
        mision: { type: String, require: true },
        vision: { type: String, require: true },
        valores: { type: String, require: true },
        politicas: { type: String, require: true },
        terminos: { type: String, require: true },
        privacidad: { type: String, require: true },
        correo: { type: String, require: true },
        telefono: { type: String, require: true },
        direccion: { type: String, require: true },
        mensaje: { type: String, require: true },
        preguntasFrecuentes: [{ pregunta: String, respuesta: String }]

    }
)
module.exports = mongoose.model('empresa', empresaSchema)
