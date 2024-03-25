const mongoose = require('mongoose');

const dispositivoSchema = mongoose.Schema({
  temperatura: { type: String, required: false }, // Agregamos el campo temperatura
  humedad: { type: String, required: false },
  estadoFoco: { type: String, required: false },
  estadoCerradura: { type: String, required: false },
    estadoVentilador: { type: String, required: false }
});

const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema);

module.exports = Dispositivo;
