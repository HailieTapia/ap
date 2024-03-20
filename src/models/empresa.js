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
        contacto: { type: String, require: true },
    }
)
module.exports = mongoose.model('empresa', empresaSchema)
