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
        const dispositivoId = "660dfa45b38653095450d92f"; // Asumiendo un ID de dispositivo fijo para el ejemplo

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
    const dispositivoId = "660dfa45b38653095450d92f"; 

    try {
        // Guarda la temperatura en la base de datos
        await esquema.updateOne({ _id: dispositivoId }, { $set: { temperatura } });
        

        res.status(200).send('Temperatura recibida con éxito');
    } catch (error) {
        console.error("Error al guardar la temperatura:", error);
        res.status(500).send('Error al guardar la temperatura');
    }
});


routerd.post('/dispositivo/comando/:id', async (req, res) => {
    const { id } = req.params; // ID del dispositivo
    const { comando, fecha } = req.body; // Comando enviado en el cuerpo de la solicitud

    try {
        // Guardar la fecha y hora del comando en la base de datos
        const dispositivo = await esquema.findById(id);
        if (!dispositivo) {
            return res.status(404).json({ error: 'Dispositivo no encontrado' });
        }
        dispositivo.fechaUltimoComando = fecha;
        await dispositivo.save();
        
        // Publicar el comando al dispositivo a través de MQTT u otras acciones necesarias
        
        return res.status(200).json({ message: "Comando enviado con éxito." });
    } catch (error) {
        console.error("Error al enviar el comando:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});





//eliminar dispositivo
routerd.delete('/dispositivo/:id',(req,res)=>{
    const{id}=req.params;
    esquema.deleteOne({_id:id})
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

module.exports=routerd
