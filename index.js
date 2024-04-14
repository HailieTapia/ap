const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const device = require('./src/routes/dispositivo');
const product = require('./src/routes/productos');
const typeUser = require('./src/routes/tipoUsuario');
const user = require('./src/routes/usuarios');
const emp = require('./src/routes/empresa');

// Habilitar CORS para todas las solicitudes desde cualquier origen
app.use(cors());

// Middleware para el manejo de datos JSON
app.use(express.json());

// Ruta de inicio
app.get('/', (req, res) => {
    res.json({ "response": "Prueba de Device" });
});

// Rutas de la API
app.use('/api/', device);
app.use('/api/', product);
app.use('/api/', typeUser);
app.use('/api/', user);
app.use('/api/', emp);

// Configuración de los métodos HTTP permitidos
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// Conección con la base de datos
mongoose.connect(process.env.mongouri)
    .then(() => console.log('Conectado a la base de datos'))
    .catch(error => console.log(error));

// Iniciar el servidor
app.listen(port, () => {
    console.log('Corriendo en el puerto ' + port);
});
