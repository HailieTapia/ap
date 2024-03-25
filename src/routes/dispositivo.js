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







router.post('/dispositivo/temperatura', async (req, res) => {
    const { temperatura } = req.body;
    console.log('Temperatura recibida en el servidor:', temperatura); // Agregar este registro para verificar la temperatura recibida en el servidor
    res.status(200).send('Temperatura recibida con éxito');
});

router.post('/dispositivo/humedad', async (req, res) => {
    const { humedad } = req.body;
    console.log('Humedad recibida en el servidor:', humedad); // Agregar este registro para verificar la humedad recibida en el servidor
    res.status(200).send('Humedad recibida con éxito');
});


routerd.post('/dispositivo/datos-sensor', async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        const { nombre, temperatura, humedad, estadoFoco, estadoCerradura, estadoVentilador, estadoVentilador2 } = req.body;

        // Crear una nueva instancia del modelo Dispositivo con los datos recibidos
        const dispositivo = new esquema({ // Aquí estás utilizando 'esquema' en lugar de 'Dispositivo'
            nombre,
            temperatura,
            humedad,
            estadoFoco,
            estadoCerradura,
            estadoVentilador,
            estadoVentilador2
        });

        // Guardar el dispositivo en la base de datos
        await dispositivo.save();

        // Respuesta exitosa
        res.status(201).json({ message: 'Datos del sensor almacenados correctamente.' });
    } catch (error) {
        // Error al guardar los datos del sensor
        console.error('Error al guardar los datos del sensor:', error);
        res.status(500).json({ message: 'Error interno del servidor al guardar los datos del sensor.' });
    }
});
module.exports = routerd;
