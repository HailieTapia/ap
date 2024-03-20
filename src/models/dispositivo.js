const mongoose=require('mongoose')
const dispositivoSchema=mongoose.Schema(
    {
        modelo:{type:String,require:false},
        estado:{type:String,require:false},
    }
);

const Dispositivo=mongoose.model('Dispositivo',dispositivoSchema)    
module.exports=Dispositivo;