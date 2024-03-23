const mongoose = require('mongoose');

// Esquema para datos del dispositivo
const dispositivoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  temperatura: {
    type: Number,
    required: true
  },
  humedad: {
    type: Number,
    required: true
  },
  estadoFoco: Boolean,
  estadoCerradura: Boolean,
  estadoVentilador: Boolean,
  estadoVentilador2: Boolean,
  fechaHora: {
    type: Date,
    default: Date.now
  }
});

// Crear el modelo 'Dispositivo' usando el esquema definido anteriormente
const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema);

module.exports = Dispositivo;