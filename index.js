const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; // Usar el puerto definido en la variable de entorno PORT o el puerto 3000 por defecto

const device = require('./src/routes/dispositivo');
const product = require('./src/routes/productos');
const typeUser = require('./src/routes/tipoUsuario');
const user = require('./src/routes/usuarios');
const emp = require('./src/routes/empresa');

// CORS
const ACCEPTED_ORIGINS = [
    'http://localhost:3000',
    // Agrega aquí otros orígenes permitidos si es necesario
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
            callback(null, true); // Permite la solicitud
        } else {
            callback(new Error('Not allowed by CORS')); // Rechaza la solicitud
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
};

app.use(cors(corsOptions));

// Middleware para el análisis de cuerpos JSON
app.use(express.json());

// Rutas de la aplicación
app.get('/', (req, res) => {
    res.json({ "response": "Prueba de Device" });
});

app.use('/api/', device);
app.use('/api/', product);
app.use('/api/', typeUser);
app.use('/api/', user);
app.use('/api/', emp);

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a la base de datos'))
    .catch(error => console.error('Error de conexión a la base de datos:', error));

// Iniciar el servidor
app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' + port);
});
