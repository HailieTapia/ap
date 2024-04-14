const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');

require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

const device = require('./src/routes/dispositivo')
const product = require('./src/routes/productos')
const typeUser = require('./src/routes/tipoUsuario')
const user = require('./src/routes/usuarios')
const emp=require('./src/routes/empresa')


//CORES
const ACCEPTEP_ORIGINS = [
    'http://localhost:3000',
]
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (!origin || ACCEPTEP_ORIGINS.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
// };

// app.use(cors({
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
// }));

//este es el apartado que modificique de los cors
//comienza aqui
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || ACCEPTEP_ORIGINS.includes(origin)) {
            callback(null, true); // Permite la solicitud
        } else {
            callback(new Error('Not allowed by CORS')); // Rechaza la solicitud
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
};

app.use(cors(corsOptions));
//aqui termina 

//midlewares
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ "response": "Prueba de Device" })
})

app.use('/api/', device)
app.use('/api/', product)
app.use('/api/', typeUser)
app.use('/api/', user)
app.use('/api/', emp)


//coneccion con la base de dato
mongoose.connect(process.env.mongouri)
    .then(() => console.log('conectado a la base'))
    .catch(error => console.log(error))
app.listen(port, () => {
    console.log('corriendo en el puerto ' + port)
})
