const express=require('express')
const esquema=require('../models/dispositivo')
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');  



const routerd=express.Router()

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

//actualizar dispositivo
// Actualizar dispositivo

routerd.put('/dispositivo/:id', async (req, res) => {
    const { id } = req.params;
    const { estadoFoco, estadoCerradura, estadoVentilador, estadoVentilador2 } = req.body;
    try {
        await esquema.findByIdAndUpdate(id, {
          estadoFoco,
          estadoCerradura,
          estadoVentilador,
          estadoVentilador2
        }, { new: true });

        // Publicar el estado actualizado al topic MQTT
        if(estadoFoco !== undefined) client.publish('Entrada/01', estadoFoco ? "focoOn" : "focoOff");
        if(estadoCerradura !== undefined) client.publish('Entrada/01', estadoCerradura ? "cerraduraOpen" : "cerraduraClose");
        if(estadoVentilador !== undefined) client.publish('Entrada/01', estadoVentilador ? "ventiladorOn" : "ventiladorOff");
        if(estadoVentilador2 !== undefined) client.publish('Entrada/01', estadoVentilador2 ? "ventilador2On" : "ventilador2Off");

        res.json({ message: "Dispositivo actualizado y mensaje MQTT enviado." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Nuevo endpoint para enviar comandos a dispositivos específicos
routerd.post('/dispositivo/comando/:id', (req, res) => {
    const { id } = req.params; // ID del dispositivo (si necesario para lógica específica)
    const { comando } = req.body; // Asume que el comando viene en el cuerpo de la solicitud

    // Aquí deberías tener alguna lógica para asegurarte de que el comando y el ID son válidos
    // Por ejemplo, verificar que el dispositivo existe, que el comando es soportado, etc.

    // Publicar el comando al topic MQTT
    // Asegúrate de publicar al topic correcto y formatear el mensaje según lo espera tu dispositivo
    client.publish('Entrada/01', comando, (error) => {
        if(error) {
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