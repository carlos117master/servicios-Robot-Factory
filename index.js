const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const robots = require('./routes/robots');
const noticias = require('./routes/noticias');
const cookieParser = require('cookie-parser');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/RobotFactory');

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
// Configuración de CORS
/*app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});*/

app.use(cookieParser());
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/robots', robots);
app.use('/noticias', noticias);
app.listen(8080);
