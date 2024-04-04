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
        const dispositivoId = "660e085a961df97cfea6de15"; // Asumiendo un ID de dispositivo fijo para el ejemplo

        // Actualizar la base de datos con los nuevos estados
        esquema.updateOne({_id: dispositivoId}, {$set: { 
            temperatura: estado.temperatura,
            humedad: estado.humedad,
            estadoFoco: estado.foco,
            estadoCerradura: estado.cerradura,
            estadoVentilador: estado.ventilador1,
            estadoVentilador2: estado.ventilador2
        }})
        .then(result => console.log("Actualización exitosa", result))
        .catch(error => console.error("Error al actualizar el dispositivo", error));
    }
});

routerd.post('/dispositivo/moverhuevos', async (req, res) => {
    try {
        const fechaHora = new Date(); // Obtiene la fecha y hora actual
        const dispositivoId = "660e085a961df97cfea6de15"; // Asumiendo un ID de dispositivo fijo para el ejemplo

        // Encuentra el dispositivo correspondiente (si es necesario)
        const dispositivo = await esquema.findById(dispositivoId);

        if (!dispositivo) {
            return res.status(404).json({ error: 'Dispositivo no encontrado' });
        }

        // Actualiza la base de datos con el momento de mover huevos
        es.momentoMoverHuevos = fechaHora;
        await dispositivo.save();

        // Responde al cliente
        return res.status(200).json({ message: 'Momento de mover huevos almacenado exitosamente' });
    } catch (error) {
        console.error('Error al almacenar el momento de mover huevos:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
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
    const dispositivoId = "660e085a961df97cfea6de15"; // Asumiendo un ID de dispositivo fijo para el ejemplo

    try {
        // Guarda la temperatura en la base de datos
        await esquema.updateOne({ _id: dispositivoId }, { $set: { temperatura } });
        
        // Envia la temperatura al cliente a través de WebSockets o SSE
        // Ejemplo usando WebSocket: ws.send(JSON.stringify({ temperatura }));
        // Ejemplo usando SSE: sseMiddleware.send({ temperatura });

        res.status(200).send('Temperatura recibida con éxito');
    } catch (error) {
        console.error("Error al guardar la temperatura:", error);
        res.status(500).send('Error al guardar la temperatura');
    }
});


// Nuevo endpoint para enviar comandos a dispositivos específicos
routerd.post('/dispositivo/comando/:id', (req, res) => {
    const { id } = req.params; // ID del dispositivo
    const { comando } = req.body; // Comando enviado en el cuerpo de la solicitud

    const dispositivoIdValido = "660e085a961df97cfea6de15";

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
