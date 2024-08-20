// Ruta de inicio de sesión
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const config = require('../config/config');
const auth = require(__dirname + '/../auth/auth.js');

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ status: 'error', message: 'Token not provided' });

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return res.status(403).json({ status: 'error', message: 'Invalid token' });
    req.userId = decoded.id; 
    next();
  });
}

// Ruta de inicio de sesión
/*router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Comparamos la contraseña enviada con la almacenada en la base de datos
    if (password !== user.password) {
      return res.status(401).json({ status: 'error', message: 'Invalid password' });
    }

    // Si la contraseña coincide, generamos el token JWT
    const token = jwt.sign({ id: user._id }, config.secret, { expiresIn: '1h' });
    res.json({ status: 'success', token });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});*/

/*router.post('/login',async (req, res) => {
  const {login,password} = req.body;
  User.findOne({login,password}).then(resultado => {
  if(resultado){
      res.status(200).send({token: auth.generarToken(resultado)});
     }else{
      res.status(401).send({error:'login incorrecto'});
     }
 });
});*/

router.post('/login', async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  User.find().then((users)=>{
    let userExist = users.filter(user => user.email === email && user.password === password);
    if(userExist.length > 0){
      res.status(200).send({token: auth.generarToken(userExist[0])});
    }else{
      res.status(401).send({error:'login incorrecto'});
    }
  })
})

/*router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    // Verificar las credenciales del usuario
    const user = await User.findOne({ login, password });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'credenciales no validas' });
    }

    // Generar el token
    const token = auth.generarToken(user);

    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'strict' });
    res.json({ status: 'success', token });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});*/


// registro de usuarios
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname, avatar,role } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ email }, { nickname }] });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }else{
      // Crear un nuevo usuario
      const newUser = new User({ email, password, nickname, avatar,role });
      await newUser.save();
    }
    
    res.json({ status: 'success', message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/:usuario_id', auth.protegerRuta, async (req, res) => {
  try {
    const usuarioId = req.params.usuario_id;

    // Busca el usuario en la base de datos por su ID
    const usuario = await User.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al obtener la información del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener la información del usuario' });
  }
});

//ruta para actualizar el email
router.put('/:usuario_id/email', auth.protegerRuta, async (req, res) => {
  try {
    const usuarioId = req.params.usuario_id;
    const { email } = req.body; 

    const isMe = req.user.login._id.toString() === usuarioId;

    if (!isMe) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta operación' });
    }

    // Busca el usuario en la base de datos por su ID
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verifica si el email ya existe en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ mensaje: 'El email ya existe en la base de datos' });
    }

    // Actualiza el email del usuario
    usuario.email = email;
    await usuario.save();

    res.status(200).json({ mensaje: 'Email actualizado correctamente', me: true });
  } catch (error) {
    console.error('Error al actualizar el email del usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el email del usuario' });
  }
});


module.exports = router;
