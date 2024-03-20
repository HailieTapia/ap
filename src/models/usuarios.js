const mongoose=require('mongoose')
const usuarioSchema=mongoose.Schema(
    {
        nombre:{type:String,require:true},
        apellido:{type:String,require:true},
        correo:{type:String,require:true,unique:true},
        contraseña:{type:String,require:true},
        telefono:{type:String,require:true,unique:true,maxlength:10,minlength:10},
        tipo:{type:String,require:true},
        preguntaRecuperacion:{type:String,require:true},
        respuestaPregunta:{type:String,require:true},
        codigoRecuperacion:{type:String},
        dispositivo:{type:String,unique:true,maxlength:10,minlength:10},
    }
)
module.exports=mongoose.model('usuario',usuarioSchema)