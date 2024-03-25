const express=require('express')
const esquema=require('../models/dispositivo')
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');  



const routerd=express.Router()



client.on('connect', () => {
    client.subscribe('Entrada/01/estado', (err) => {
        if (!err) {
            console.log("Subscrito con éxito al topic del estado del dispensador");
        }
    });
});

client.on('message', (topic, message) => {
    // Suponiendo que el topic es "dispensador/estado"
    if (topic === "Entrada/01/estado") {
        const estado = JSON.parse(message.toString()); // Parsea el mensaje a JSON
        const dispositivoId = "66014fded1838eb3f70e0217"; // Asumiendo un ID de dispositivo fijo para el ejemplo

        // Actualizar la base de datos con los nuevos estados
        esquema.updateOne({_id: dispositivoId}, {$set: { 
            temperatura: estado.temperatura ,// Agregamos la temperatura
            humedad: estado.humedad, // Agregamos la temperatura
            estadoFoco: estado.estadoFoco,
            estadoCerradura: estado.estadoCerradura,
            estadoVentilador: estado.estadoVentilador,
            estadoVentilador2: estado.estadoVentilador2
        }})
        .then(result => console.log("Actualización exitosa", result))
        .catch(error => console.error("Error al actualizar el dispositivo", error));
    }
});







routerd.get('/dispositivo/prueba',(req,res)=>{
    res.json({"response":"Prueba Disp"})
})

routerd.post('/dispositivo',(req,res)=>{
    const us= esquema(req.body);
    us.save()
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//leer dispositivo
routerd.get('/dispositivo',(req,res)=>{
    esquema.find()
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//buscar dispositivo
routerd.get('/dispositivo/:id',(req,res)=>{
    const {id}=req.params
    esquema.findById(id)
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
}) 

routerd.post('/dispositivo/temperatura', async (req, res) => {
    const { temperatura } = req.body;
    // Guarda la temperatura en la base de datos o haz lo que necesites con ella
    console.log('Temperatura recibida:', temperatura);
    res.status(200).send('Temperatura recibida con éxito');
});


// Nuevo endpoint para enviar comandos a dispositivos específicos
routerd.post('/dispositivo/comando/:id', (req, res) => {
    const { id } = req.params; // ID del dispositivo
    const { comando } = req.body; // Comando enviado en el cuerpo de la solicitud

    const dispositivoIdValido = "66014fded1838eb3f70e0217";

    // Verificar que el ID del dispositivo es el esperado
    if (id !== dispositivoIdValido) {
        // Si el ID no coincide, enviar una respuesta de error
        return res.status(400).json({ message: "ID de dispositivo inválido." });
    }

    // Si el ID es válido, proceder a publicar el comando al topic MQTT
    client.publish('Entrada/01', comando, (error) => {
        if (error) {
            console.error("Error al publicar mensaje MQTT", error);
            return res.status(500).json({ message: "Error al enviar comando MQTT." });
        }
        res.json({ message: "Comando enviado con éxito." });
    });
});



//eliminar dispositivo
routerd.delete('/dispositivo/:id',(req,res)=>{
    const{id}=req.params;
    esquema.deleteOne({_id:id})
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

module.exports=routerd
