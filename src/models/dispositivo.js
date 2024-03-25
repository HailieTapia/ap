const mongoose = require('mongoose');

const dispositivoSchema = mongoose.Schema({
    led: { type: String, required: false },
    pesoAlimento: { type: String, required: false },
    pesoAgua: { type: String, required: false },
    nivelAlimento: { type: String, required: false },
    nivelAgua: { type: String, required: false },
    botonAlimento: { type: String, required: false },
    botonAgua: { type: String, required: false },
    temperatura: { type: String, required: false } // Agregamos el campo temperatura
});

const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema);

module.exports = Dispositivo;
