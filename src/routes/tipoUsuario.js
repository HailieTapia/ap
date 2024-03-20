const express=require('express')
const esquema=require('../models/tipoUsuario')

const routert=express.Router()

routert.post('/tipoUsuario',(req,res)=>{
    const us= esquema(req.body);
    us.save()
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//leer tipoUsuario
routert.get('/tipoUsuario',(req,res)=>{
    esquema.find()
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//buscar tipousuario
routert.get('/tipoUsuario/:id',(req,res)=>{
    const {id}=req.params
    esquema.findById(id)
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})


//actualizar tipousuario
routert.put('/tipoUsuario/:id',(req,res)=>{
    const{id}=req.params;
    const{tipo}=req.body
    esquema
    .updateOne({_id:id},{$set:{tipo}})
    .then((data)=>res.json(data))
    .catch((error)=>res.json({message:error}))
})

//eliminar tipousuario
routert.delete('/tipoUsuario/:id',(req,res)=>{
    const{id}=req.params;
    esquema.deleteOne({_id:id})
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

module.exports=routert