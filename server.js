const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- ESTO ES LO QUE VAMOS A CAMBIAR PARA NO COMETER ERRORES ---

// 1. Intentamos servir archivos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// 2. Por si acaso, también servimos archivos desde la carpeta principal
app.use(express.static(__dirname));
// 3. Y por si acaso, también desde dentro de las carpetas de módulos
app.use(express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, 'chofer')));
app.use(express.static(path.join(__dirname, 'pasajero')));

// --- CONEXIÓN A MONGO ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Base de datos conectada'))
    .catch(err => console.log('❌ Error Mongo:', err));

// --- RUTA QUE NO FALLA ---
// Esta función va a intentar buscar el login en todos los lugares posibles
app.get('/', (req, res) => {
    // Primero intenta buscarlo en 'public'
    res.sendFile(path.join(__dirname, 'public', 'login.html'), (err) => {
        if (err) {
            // Si no está en 'public', lo busca en la raíz
            res.sendFile(path.join(__dirname, 'login.html'), (err2) => {
                if (err2) {
                    // Si tampoco está ahí, te avisa qué está viendo el servidor
                    res.status(404).send("El servidor no encuentra el archivo login.html en ninguna carpeta. Revisa GitHub.");
                }
            });
        }
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
