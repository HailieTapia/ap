const mongoose = require('mongoose');

const dispositivoSchema = mongoose.Schema({
    temperatura: { type: String, required: false }, // Agregamos el campo temperatura
    humedad: { type: String, required: false } // Agregamos el campo temperatura
});

const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema);

module.exports = Dispositivo;
