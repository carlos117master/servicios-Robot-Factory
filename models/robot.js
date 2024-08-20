const mongoose = require('mongoose');

const robotSchema = new mongoose.Schema({
   titulo:{type:String},
   likes:{type:Boolean},
   descripcion:{type:String},
   imagen:{type:String},
   fecha:{type:String},
   usuarios:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
   }],
   comentarios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

const Robot = mongoose.model('Robot', robotSchema);

module.exports = Robot;