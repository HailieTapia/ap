const mongoose=require('mongoose')
const tipoUsuarioSchema=mongoose.Schema(
    {
        tipo:{type:String,require:true},
    }
)
module.exports=mongoose.model('Tipo',tipoUsuarioSchema)