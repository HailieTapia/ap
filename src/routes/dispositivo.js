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
routerd.put('/dispositivo/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, temperatura, humedad, estadoFoco, estadoCerradura, estadoVentilador, estadoVentilador2 } = req.body;
    esquema.findByIdAndUpdate(id, {
      nombre,
      temperatura,
      humedad,
      estadoFoco,
      estadoCerradura,
      estadoVentilador,
      estadoVentilador2
    }, { new: true }) // Devuelve el documento actualizado
    .then(data => res.json(data))
    .catch(error => res.json({ message: error }));
});

//eliminar dispositivo
routerd.delete('/dispositivo/:id',(req,res)=>{
    const{id}=req.params;
    esquema.deleteOne({_id:id})
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

module.exports=routerd