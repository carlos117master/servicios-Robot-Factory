const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  robot: { type: mongoose.Schema.Types.ObjectId, ref: 'Robot', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
