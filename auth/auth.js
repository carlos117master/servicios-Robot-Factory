const jwt = require('jsonwebtoken');
const secreto = "secretoNode";


let generarToken = (login) => {
    try {
      return jwt.sign({ login: login }, secreto, { expiresIn: "2 hours" });
    } catch (error) {
      console.error('Error al generar el token:', error);
      return null;
    }
  };


let validarToken = (token) => {
    try {
        let resultado = jwt.verify(token, secreto);
        return resultado;
    } catch (e) {
        return null;
    }
};


let protegerRuta = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token && token.startsWith("Bearer"))
        token = token.slice(7);

    const usuario = validarToken(token);

    if (usuario) {
        req.user = usuario;
        next();
    } else {
        res.status(403).send({ error: "Acceso no autorizado" });
    }
};


module.exports = {
    generarToken: generarToken,
    validarToken: validarToken,
    protegerRuta: protegerRuta
};