const express = require('express');
const router = express.Router();
const Noticias = require('../models/noticias');
const auth = require(__dirname + '/../auth/auth.js');
const User = require('../models/user');
const fs = require('fs');


router.get('/', auth.protegerRuta, async (req, res) => {
    try {
      const userId = req.user.login._id;
      
      // Obtener todas las noticias y cargar la información del usuario asociado
      const noticias = await Noticias.find().populate('usuarios', 'nickname');
  
      // Agregar el campo 'mine' para indicar si la noticia pertenece al usuario actual
      const noticiasMine = noticias.map(noticia => {
        return {
          ...noticia.toObject(),
          mine: noticia.usuarios.some(usuario => usuario._id.toString() === userId)
        };
      });
  
      res.json({ noticias: noticiasMine });
    } catch (error) {
      console.error('Error al obtener todas las noticias con la información del usuario:', error);
      res.status(500).json({ mensaje: 'Error al obtener las noticias' });
    }
  });

//servicio para publicar una noticia
router.post('/', auth.protegerRuta, async (req, res) => {
    const userId = req.user.login._id;

    const usuario = await User.findById(userId);

  // Verificar si el usuario es administrador
  if (usuario.role !== 'ROLE_ADMIN') {
    return res.status(403).json({ mensaje: 'No tienes permiso para publicar una noticia' });
  }
    const fechaActual = new Date();
    const noticiaData = new Noticias({
      titulo : req.body.titulo,
      imagen : req.body.imagen,
      descripcion : req.body.descripcion,
      usuarios: [userId],
      fecha: fechaActual.toISOString()
    });
    const noticiaImg = noticiaData.imagen;
    const bufferImg = Buffer.from(noticiaImg, 'base64');
    const rutaGuardarImg = `./public/images/${noticiaImg.titulo}.png`;
    fs.writeFile(rutaGuardarImg, bufferImg, async (error) => {
        if (error) {
          return res.status(400).json({ mensaje: 'Error al guardar la imagen', error: error });
        }
try {
    const resultado = await noticiaData.save();
    res.json({ resultado });
  } catch (error) {
    console.error('Error al publicar la noticia:', error);
    res.status(500).json({ error: 'Error al publicar la noticia' });
  }
});
});


router.delete('/:noticia_id/delete', auth.protegerRuta, async (req, res) => {
  const userId = req.user.login._id;

  try {
    const usuario = await User.findById(userId);

    if (usuario.role !== 'ROLE_ADMIN') {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta noticia' });
    }

    const noticia = await Noticias.findByIdAndDelete(req.params.noticia_id);

    if (!noticia) {
      return res.status(404).json({ mensaje: 'Noticia no encontrada' });
    }
    res.json({ mensaje: 'Noticia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la noticia:', error);
    res.status(500).json({ error: 'Error al eliminar la noticia' });
  }
});
  module.exports = router;