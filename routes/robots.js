const express = require('express');
const router = express.Router();
const Robot = require('../models/robot');
const auth = require(__dirname + '/../auth/auth.js');
const fs = require('fs');
const { populate } = require('../models/user');
const path = require('path');
const Comment = require('../models/comentarios');

// Ruta para obtener todas las publicaciones con la información del usuario asociado
router.get('/',auth.protegerRuta, async (req, res) => {
  try {
    const userId = req.user.login._id;
    // Obtener todos los robots y cargar la información del usuario asociado
    const robots = await Robot.find().populate('usuarios', 'nickname').populate('comentarios');

    const robotsMine = robots.map(robot => {
      return {
        ...robot.toObject(),
        mine: robot.usuarios.some(usuario => usuario._id.toString() === userId)
      };
    });

    res.json({robots: robotsMine});
  } catch (error) {
    console.error('Error al obtener todos los robots con la información del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener los robots'});
  }
});

//ruta para obtener un robot por id
router.get('/:robot_id',auth.protegerRuta, async (req, res) => {
  try {
    const userId = req.user.login._id;
    const robotId = req.params.robot_id;
    const robot = await Robot.findById(robotId)
      .populate('usuarios', 'nickname avatar')
      .populate({
        path: 'comentarios',
        populate: {
          path: 'usuario',
          select: 'nickname avatar'
        }
      });

      const robotsMine = {
        ...robot.toObject(),
        mine: robot.usuarios.some(usuario => usuario._id.toString() === userId)
      };

    res.json({robots: robotsMine});
  } catch (error) {
    console.error('Error al obtener todos los robots con la información del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener los robots'});
  }
});

/*router.post('/', auth.protegerRuta, async (req, res) => {
  const fechaActual = new Date();
  const userId = req.user.login._id;
  const robotData = new Robot({
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
    imagen: req.body.imagen,
    fecha: fechaActual.toISOString(),
    usuarios: userId,
    mine: true
  }); 

  const robotImg = robotData.imagen;
  const bufferImg = Buffer.from(robotImg, 'base64');
  const rutaGuardarImg = `./public/images/${robotData.titulo}.png`;
  fs.writeFile(rutaGuardarImg, bufferImg, (error) => {
    if (error) {
      return res.status(400).json({ mensaje: 'Error al guardar la imagen', error: error });
    }

    robotData.save()
      .then((resultado) => {
        return res.status(200).json(resultado);
      })
      .catch((error) => {
        return res.status(400).json({ mensaje: 'Error al subir el robot' });
      });
  });
});*/

router.post('/', auth.protegerRuta, async (req, res) => {
  const fechaActual = new Date();
  const userId = req.user.login._id;
  const robotData = new Robot({
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
    imagen: req.body.imagen,
    fecha: fechaActual.toISOString(),
    usuarios: [userId]
  }); 

  const robotImg = robotData.imagen;
  const bufferImg = Buffer.from(robotImg, 'base64');
  const rutaGuardarImg = `./public/images/${robotData.titulo}.png`;
  
  fs.writeFile(rutaGuardarImg, bufferImg, async (error) => {
    if (error) {
      return res.status(400).json({ mensaje: 'Error al guardar la imagen', error: error });
    }

    try {
      const resultado = await robotData.save();
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ mensaje: 'Error al subir el robot' });
    }
  });
});

// Ruta para anadir un nuevo comentario
router.post('/:robotId/comments',auth.protegerRuta, async (req, res) => {
  try {
    const { robotId } = req.params;
    const { text } = req.body;
    const usuarioId = req.user.login._id;
    // Crear el comentario
    const newComment = new Comment({
      text,
      usuario: usuarioId,
      robot: robotId
    });
    
    const savedComment = await newComment.save();

    await savedComment.populate('usuario', 'nickname');

    // Agregar el comentario al robot
    const robot = await Robot.findById(robotId);
    if (!robot) {
      return res.status(404).json({ mensaje: 'Robot no encontrado' });
    }
    
    robot.comentarios.push(savedComment._id);
    await robot.save();

    res.status(201).json({ comment: savedComment });
  } catch (error) {
    console.error('Error al añadir un comentario al robot:', error);
    res.status(500).json({ mensaje: 'Error al añadir el comentario' });
  }
});

// Obtener los comentarios de un robot
router.get('/:robotId/comments', auth.protegerRuta, async (req, res) => {
  try {
    const { robotId } = req.params;

    // Buscar el robot por su ID y obtener los comentarios
    const robot = await Robot.findById(robotId).populate({
      path: 'comentarios',
      populate: { path: 'usuario', select: 'nickname date' }
    });

    if (!robot) {
      return res.status(404).json({ mensaje: 'Robot no encontrado' });
    }

    res.status(200).json({ comentarios: robot.comentarios });
  } catch (error) {
    console.error('Error al obtener los comentarios del robot:', error);
    res.status(500).json({ mensaje: 'Error al obtener los comentarios' });
  }
});

router.put('/:robot_id/edit', auth.protegerRuta, async (req, res) => {
  try {
    const robotId = req.params.robot_id;
    const userId = req.user.login._id;
    
    // Buscar el robot
    const robot = await Robot.findById(robotId);
    
    // Verificar que el robot exista
    if (!robot) {
      return res.status(404).json({ mensaje: 'Robot no encontrado' });
    }
    
    // Verificar que el usuario logueado sea el propietario del robot
    if (robot.usuarios.toString() !== userId.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permisos para actualizar este robot' });
    }
    
    // Actualizar el robot
    robot.titulo = req.body.titulo || robot.titulo;
    robot.descripcion = req.body.descripcion || robot.descripcion;
    robot.imagen = req.body.imagen || robot.imagen;
    
    await robot.save();
    
    res.status(200).json({ mensaje: 'Robot actualizado correctamente', robot });
  } catch (error) {
    console.error('Error al actualizar el robot:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el robot' });
  }
});


// Ruta para eliminar un robot por id
router.delete('/:robot_id/delete', auth.protegerRuta, async (req, res) => {
  try {
    const robotId = req.params.robot_id;
    const userId = req.user.login._id;

    // Buscar el robot
    const robot = await Robot.findByIdAndDelete(robotId);

    // Verificar que el robot exista
    if (!robot) {
      return res.status(404).json({ mensaje: 'Robot no encontrado' });
    }

    // Verificar que el usuario logueado sea el propietario del robot
    if (robot.usuarios.toString() !== userId.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar este robot' });
    }

    res.status(200).json({ mensaje: 'Robot eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el robot:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el robot' });
  }
});




module.exports = router;
