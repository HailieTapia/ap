const express = require('express');
const empresaModel = require('../models/empresa');

const routerem = express.Router();

// Obtener todas las empresas
routerem.get('/empresas', (req, res) => {
    empresaModel.find()
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }));
});

// Crear una nueva empresa
routerem.post('/empresas', (req, res) => {
    const nuevaEmpresa = new empresaModel(req.body);
    nuevaEmpresa.save()
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }));
});

// Obtener una empresa por su ID
routerem.get('/empresas/:id', (req, res) => {
    const { id } = req.params;
    empresaModel.findById(id)
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }));
});

// Actualizar una empresa por su ID
routerem.put('/empresas/:id', (req, res) => {
    const { id } = req.params;
    empresaModel.findByIdAndUpdate(id, req.body, { new: true })
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }));
});

// Eliminar una empresa por su ID
routerem.delete('/empresas/:id', (req, res) => {
    const { id } = req.params;
    empresaModel.findByIdAndDelete(id)
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }));
});

// Agregar una pregunta frecuente a una empresa por su ID
routerem.post('/empresas/:id/preguntas-frecuentes', (req, res) => {
    const { id } = req.params;
    empresaModel.findByIdAndUpdate(
        id,
        { $push: { preguntasFrecuentes: req.body } },
        { new: true }
    )
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }));
});

// Eliminar una pregunta frecuente de una empresa por su ID y el ID de la pregunta frecuente
routerem.delete('/empresas/:empresaId/preguntas-frecuentes/:preguntaId', (req, res) => {
    const { empresaId, preguntaId } = req.params;
    empresaModel.findByIdAndUpdate(
        empresaId,
        { $pull: { preguntasFrecuentes: { _id: preguntaId } } },
        { new: true }
    )
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }));
});
// Actualizar una pregunta frecuente de una empresa por su ID y el ID de la pregunta frecuente
routerem.put('/empresas/:empresaId/preguntas-frecuentes/:preguntaId', (req, res) => {
    const { empresaId, preguntaId } = req.params;
    const { pregunta, respuesta } = req.body; // Obtener la pregunta y respuesta actualizadas desde el cuerpo de la solicitud

    empresaModel.findOneAndUpdate(
        { _id: empresaId, 'preguntasFrecuentes._id': preguntaId },
        { $set: { 'preguntasFrecuentes.$.pregunta': pregunta, 'preguntasFrecuentes.$.respuesta': respuesta } },
        { new: true }
    )
        .then(data => {
            if (!data) {
                return res.status(404).json({ message: 'La pregunta frecuente no fue encontrada' });
            }
            res.json(data);
        })
        .catch(error => res.status(500).json({ message: error }));
});


module.exports = routerem;
