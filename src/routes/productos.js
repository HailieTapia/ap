const express=require('express')
const esquema=require('../models/productos')

const routerp=express.Router()

routerp.post('/productos',(req,res)=>{
    const us= esquema(req.body);
    us.save()
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//leer productos
routerp.get('/productos',(req,res)=>{
    esquema.find()
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//buscar producto
routerp.get('/productos/:id',(req,res)=>{
    const {id}=req.params
    esquema.findById(id)
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

//busqueda por el categoria
routerp.get('/productos/categoria/:categoria',(req,res)=>{
    const {correo} = req.params
    esquema.findOne({ correo })
      .then(data => res.json(data))
      .catch(error => res.json({message:error}))
  })
  

//actualizar producto
routerp.put('/productos/:id',(req,res)=>{
    const{id}=req.params;
    const{nombre,descripcion,precio,categoria,ruta}=req.body
    esquema
    .updateOne({_id:id},{$set:{nombre,descripcion,precio,categoria,ruta}})
    .then((data)=>res.json(data))
    .catch((error)=>res.json({message:error}))
})

//eliminar producto
routerp.delete('/productos/:id',(req,res)=>{
    const{id}=req.params;
    esquema.deleteOne({_id:id})
    .then(data=>res.json(data))
    .catch(error=>res.json({message:error}))
})

module.exports=routerp