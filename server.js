const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Nuevo: Necesario para manejar carpetas
require('dotenv').config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- SERVIR ARCHIVOS DEL FRONTEND ---
// Esto le dice al servidor que busque tu HTML, CSS y JS en la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- CONEXIÓN A MONGODB ---
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
    .catch(err => {
        console.error('❌ Error de conexión a MongoDB:', err.message);
        process.exit(1);
    });

// --- RUTAS DE LA API ---
// (Aquí puedes agregar tus rutas de usuarios, traslados, etc., más adelante)

// --- RUTA PARA MOSTRAR LA APP ---
// En lugar de enviar un texto, enviamos tu archivo index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- CONFIGURACIÓN DEL PUERTO ---
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
