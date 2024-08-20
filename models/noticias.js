const mongoose = require('mongoose');

const noticiasSchema = new mongoose.Schema({
   titulo:{type:String},
   descripcion:{type:String},
   imagen:{type:String},
   fecha:{type:String},
   usuarios:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
   }],
});

const Noticias = mongoose.model('noticas', noticiasSchema);

module.exports = Noticias;