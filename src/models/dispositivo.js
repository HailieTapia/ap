const mongoose = require('mongoose');

const dispositivoSchema = mongoose.Schema({
    temperatura: { type: Number, required: false }, // Campo temperatura
    humedad: { type: Number, required: false }, // Campo humedad
    estadoFoco: { type: String, required: false }, // Campo estadoFoco
    estadoCerradura: { type: String, required: false }, // Campo estadoCerradura
    estadoVentilador: { type: String, required: false }, // Campo estadoVentilador
    estadoVentilador2: { type: String, required: false }, // Campo estadoVentilador2
    fechaMovimientoHuevos: { type: Date, required: false }, // Cenar la fecha y hora del último movimiento de huevos
    claveUnica:{type:String}, ///
    asignacion:{type:Boolean},  ///z
    controlAutomatico: { type: Boolean, required: false } // Agregamos esta línea
});

const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema);

module.exports = Dispositivo;