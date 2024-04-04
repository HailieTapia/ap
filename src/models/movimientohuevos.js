const mongoose = require('mongoose');

const movimientoHuevosSchema = mongoose.Schema({
    dispositivoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispositivo' }, // Referencia al dispositivo
    fechaMovimiento: { type: Date, required: true }, // Fecha y hora del movimiento de huevos
    // Otros campos si es necesario
});

const MovimientoHuevos = mongoose.model('movimientohuevos', movimientoHuevosSchema);

module.exports = MovimientoHuevos;
