const mongoose = require('mongoose')

const productoSchema = mongoose.Schema(
    {
        nombre:{type:String,require:true},
        descripcion:{type:String,require:true},
        precio:{type:String,require:true},
        categoria:{type:String,require:true},
        ruta:{type:String,require:true},
    }
)
module.exports=mongoose.model('producto',productoSchema)
