const express=require('express')
const esquema=require('../models/empresa')

const routerem=express.Router()


routerem.get('/empresas/x', (req, res) => {
    res.json({ "response": "Prueba empresa" })
})

routerem.post('/empresas',(req,res)=>{
    const us= esquema(req.body);
    us.save()
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//leer empresas
routerem.get('/empresas',(req,res)=>{
    esquema.find()
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//buscar producto
routerem.get('/empresas/:id',(req,res)=>{
    const {id}=req.params
    esquema.findById(id)
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//busqueda por el categoria
routerem.get('/empresas/categoria/:categoria',(req,res)=>{
    const {correo} = req.params
    esquema.findOne({ correo })
      .then(data => res.json(data))
      .catch(error => res.json({message:error}))
  })
  

//actualizar producto
routerem.put('/empresas/:id',(req,res)=>{
    const{id}=req.params;
    const{descripcion,mision,vision,valores,politicas,terminos,privacidad,contacto}=req.body
    esquema
    .updateOne({_id:id},{$set:{descripcion,mision,vision,valores,politicas,terminos,privacidad,contacto}})
    .then((data)=>res.json(data))
    .catch((error)=>res.json({message:error}))
})

//eliminar producto
routerem.delete('/empresas/:id',(req,res)=>{
    const{id}=req.params;
    esquema.deleteOne({_id:id})
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

module.exports=routerem