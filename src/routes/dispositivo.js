const express=require('express')
const esquema=require('../models/dispositivo')
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');  



const routerd=express.Router()



client.on('connect', () => {
    client.subscribe('Entrada/01/estado', (err) => {
        if (!err) {
            console.log("Subscrito con éxito al topic del estado del dispensador");
            client.subscribe('Entrada/01/estado'); // Cambia el topic según tu configuración
        }
    });
});
client.on('message', (topic, message) => {
    if (topic === "Entrada/01/estado") { // Verifica el topic recibido
        const estado = JSON.parse(message.toString());

        const dispositivoId = "65ff5db2656ceb696b6022da";

        esquema.updateOne({_id: dispositivoId}, {$set: { 
            temperatura: estado.temp, // Corrige el acceso al campo temperatura
            humedad: estado.hum, // Corrige el acceso al campo humedad
            estadoFoco: estado.foco ? "encendido" : "apagado", // Corrige el acceso al campo foco
            estadoVentilador: estado.ventilador ? "encendido" : "apagado", // Corrige el acceso al campo ventilador
            estadoVentilador2: estado.ventilador2 ? "encendido" : "apagado", // Corrige el acceso al campo ventilador2
            estadoCerradura: estado.cerradura ? "abierta" : "cerrada" // Corrige el acceso al campo cerradura
        }})
        .then(result => console.log("Actualización exitosa", result))
        .catch(error => console.error("Error al actualizar el dispositivo", error));
    }
});


routerd.post('/dispositivo/temperatura', async (req, res) => {
    const { temperatura } = req.body;
    console.log('Temperatura recibida:', temperatura);
    res.status(200).send('Temperatura recibida con éxito');
});

routerd.post('/dispositivo/comando/:id', (req, res) => {
    const { id } = req.params; // ID del dispositivo
    const { comando } = req.body; // Comando enviado en el cuerpo de la solicitud

    const dispositivoIdValido = "65ff5db2656ceb696b6022da";

    //LA LOGICA APLICADA AQUI PARA VERIFICAR EL ID, LO VAMOS A OCUPAR 
    //PARA VERIFICAR SI EL DISPOSITIVO COINCIDE CON ALGUNA QUE TENGA EL USUARIO


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
//eliminar dispositivo
routerd.delete('/dispositivo/:id',(req,res)=>{
    const{id}=req.params;
    esquema.deleteOne({_id:id})
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

module.exports=routerd
