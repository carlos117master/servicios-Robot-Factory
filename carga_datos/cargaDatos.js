const mongoose = require('mongoose');
const usuario = require("../models/user");
const robot = require("../models/robot");


mongoose.connect('mongodb://127.0.0.1:27017/RobotFactory');

/*let usuarios = [
    new usuario({ 
        email: 'carlos@gmail.com', password: '1234567' }),
    new usuario(
    { email: 'melanie@gmail.com', password: 'melanie123' })
];*/

const usuarioId = '6630a49f728efb20b8a4e7b2';

const Robots = [
  new robot({
    titulo: 'Publicación 1',
    likes: false,
    descripcion: 'Descripción de la publicación 1',
    fecha: new Date().toISOString(),
    usuarios: usuarioId
  }),
  new robot({
    titulo: 'Publicación 2',
    likes: false,
    descripcion: 'Descripción de la publicación 2',
    fecha: new Date().toISOString(),
    usuarios: usuarioId
  }),
  new robot({
    titulo: 'Publicación 3',
    likes: true,
    descripcion: 'Descripción de la publicación 3',
    fecha: new Date().toISOString(),
    usuarios: usuarioId
  }),
  new robot({
    titulo: 'Publicación 4',
    likes: true,
    descripcion: 'Descripción de la publicación 4',
    fecha: new Date().toISOString(),
    usuarios: usuarioId
  }),
  new robot({
    titulo: 'Publicación 5',
    likes: false,
    descripcion: 'Descripción de la publicación 5',
    fecha: new Date().toISOString(),
    usuarios: usuarioId
  })
];


Robots.forEach(h => h.save());