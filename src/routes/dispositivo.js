const express=require('express')
const esquema=require('../models/dispositivo')
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');  
const MovimientoHuevos = require('../models/movimientohuevos');


const routerd=express.Router()


routerd.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor');
});

client.on('connect', () => {
    client.subscribe('Entrada/01/estado', (err) => {
        if (!err) {
            console.log("Subscrito con éxito al topic del estado del dispensador");
        }
    });
});
//
client.on('message', (topic, message) => {
    // Suponiendo que el topic es "dispensador/estado"
    if (topic === "Entrada/01/estado") {
        const estado = JSON.parse(message.toString()); // Parsea el mensaje a JSON
        const dispositivoId = "6610cfa2e02e153998505e65"; // Asumiendo un ID de dispositivo fijo para el ejemplo

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

// Modifica el endpoint /dispositivo para filtrar por el usuario
routerd.get('/dispositivo', (req, res) => {
    esquema.find()
        .then(data => res.json(data))
        .catch(error => res.json({ message: error }))
})

router.get('/api/estado-dispositivos', async (req, res) => {
    try {
        // Consulta la base de datos para obtener el estado de los dispositivos
        const estadoDispositivos = await Dispositivo.find({}, { _id: 0, __v: 0 }); // Excluye el campo _id y __v

        res.json(estadoDispositivos); // Devuelve el estado de los dispositivos como respuesta JSON
    } catch (error) {
        console.error("Error al obtener el estado de los dispositivos:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//buscar dispositivo
routerd.get('/dispositivo/:id',(req,res)=>{
    const {id}=req.params
    esquema.findById(id)
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
}) 

//actualizar dispositivo

routerd.put('/dispositivo/:id', (req, res) => {
    const { id } = req.params;
    const { temperatura, humedad, estadoFoco, estadoCerradura, estadoVentilador, estadoVentilador2, fechaMovimientoHuevos, claveUnica, asignacion } = req.body
    esquema
        .updateOne({ _id: id }, { $set: { temperatura, humedad, estadoFoco, estadoCerradura, estadoVentilador, estadoVentilador2, fechaMovimientoHuevos, claveUnica, asignacion } })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }))
})
routerd.post('/dispositivo/comando/:id', async (req, res) => {
    const { id } = req.params; // ID del dispositivo
    const { comando } = req.body; // Comando enviado en el ud
    
    // Obtener la fecha y hora actual en la zona horaria de México
    const fechaHora = new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" });
    
    // Crear un nuevo objeto Date a partir de la fecha y hora en la zona horaria de México
    const fechaHoraMexico = new Date(fechaHora);

    try {
        // Encuentra el dispositivo correspondiente en la base de datos
        const dispositivo = await esquema.findById(id);

        if (!dispositivo) {
            return res.status(404).json({ error: 'Dispositivo no encontrado' });
        }

        // Actualiza la base de datos con el momento de mover huevos
        dispositivo.fechaMovimientoHuevos = fechaHoraMexico;
        await dispositivo.save();

        // Almacena el movimiento de huevos en la tabla movimientohuevos
        const movimientoHuevos = new MovimientoHuevos({
            dispositivoId: id, // Asigna el ID del dispositivo
            fechaMovimiento: fechaHoraMexico // Asigna la fecha y hora del movimiento de huevos
            // Puedes agregar otros campos si es necesario
        });
        await movimientoHuevos.save();

        // Publica el comando al topic MQTT
        const topic = `Entrada/${dispositivo.claveUnica}`; // Corrección de comillas y concatenación
        client.publish(topic, comando, (error) => {
            if (error) {
                console.error("Error al publicar mensaje MQTT", error);
                return res.status(500).json({ message: "Error al enviar comando MQTT." });
            }
            res.json({ message: "Comando enviado con éxito." });
        });
    } catch (error) {
        console.error("Error al enviar comando: ", error);
        res.status(500).json({ error: "Error al enviar comando." });
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
