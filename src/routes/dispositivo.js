const express = require('express');
const esquema = require('../models/dispositivo');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');

const routerd = express.Router();

routerd.get('/dispositivo/prueba', (req, res) => {
    res.json({"response": "Prueba Disp"});
});

routerd.post('/dispositivo', (req, res) => {
    const us = esquema(req.body);
    us.save()
    .then(data => res.json(data))
    .catch(error => res.json({message: error}));
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

routerd.post('/dispositivo/temperatura', async (req, res) => {
    const {temperatura} = req.body;
    console.log('Temperatura recibida:', temperatura);
    res.status(200).send('Temperatura recibida con éxito');
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
