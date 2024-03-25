const mongoose = require('mongoose');

const dispositivoSchema = mongoose.Schema({
    temperatura: { type: Number, required: false }, // Agregamos el campo temperatura
    humedad: { type: Number, required: false }, // Agregamos el campo temperatura
    estadoFoco: { type: String, required: false }, // Agregamos el campo estadoFoco
    estadoCerradura: { type: String, required: false }, // Agregamos el campo estadoCerradura
    estadoVentilador: { type: String, required: false },// Agregamos el campo estadoVentilador
    estadoVentilador2: { type: String, required: false } // Agregamos el campo estadoVentilador
});

const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema);

module.exports = Dispositivo;
