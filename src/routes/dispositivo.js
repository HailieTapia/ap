const express = require('express');
const esquema = require('../models/dispositivo');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');

const routerd = express.Router();

routerd.get('/dispositivo/prueba', (req, res) => {
    res.json({"response": "Prueba Disp"});
});

routerd.post('/dispositivo/temperatura', async (req, res) => {
    try {
        const { temperatura } = req.body;
        console.log('Temperatura recibida:', temperatura); // Agregar console.log para verificar la temperatura recibida
        res.status(200).send('Temperatura recibida con éxito');
    } catch (error) {
        console.error('Error al procesar la temperatura:', error);
        res.status(500).send('Error interno del servidor al procesar la temperatura');
    }
});

routerd.post('/dispositivo', (req, res) => {
    try {
        const { temperatura, humedad, ...otrosDatos } = req.body;
        console.log('Temperatura recibida:', temperatura); // Agregar console.log para verificar la temperatura recibida
        console.log('Humedad recibida:', humedad); // Agregar console.log para verificar la humedad recibida
        const dispositivo = new esquema({ temperatura, humedad, ...otrosDatos });
        dispositivo.save()
            .then(data => res.json(data))
            .catch(error => res.json({message: error}));
    } catch (error) {
        console.error('Error al procesar los datos del dispositivo:', error);
        res.status(500).send('Error interno del servidor al procesar los datos del dispositivo');
    }
});

routerd.get('/dispositivo', (req, res) => {
    esquema.find()
    .then(data => res.json(data))
    .catch(error => res.json({message: error}));
});

routerd.get('/dispositivo/:id', (req, res) => {
    const {id} = req.params;
    esquema.findById(id)
    .then(data => res.json(data))
    .catch(error => res.json({message: error}));
});

routerd.post('/dispositivo/comando/:id', (req, res) => {
    const {id} = req.params;
    const {comando} = req.body;
    client.publish('Entrada/01', comando, (error) => {
        if(error) {
            console.error("Error al publicar mensaje MQTT", error);
            return res.status(500).json({message: "Error al enviar comando MQTT."});
        }
        res.json({message: "Comando enviado con éxito."});
    });
});

routerd.delete('/dispositivo/:id', (req, res) => {
    const {id} = req.params;
    esquema.deleteOne({_id: id})
    .then(data => res.json(data))
    .catch(error => res.json({message: error}));
});

module.exports = routerd;
