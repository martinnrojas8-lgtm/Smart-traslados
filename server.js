const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// CONEXIÓN A MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB ✅"))
  .catch(err => console.error("Error conectando a Mongo ❌:", err));

// ESQUEMA DE USUARIO
const UsuarioSchema = new mongoose.Schema({
    telefono: String,
    rol: String
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// SERVIR CARPETAS
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/chofer', express.static(path.join(__dirname, 'chofer')));
app.use('/pasajero', express.static(path.join(__dirname, 'pasajero')));

// RUTA INICIAL (Login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

// REGISTRO (Limpiando datos para evitar rebotes)
app.post('/register', async (req, res) => {
    try {
        const { telefono, rol } = req.body;
        // Guardamos todo en minúsculas y sin espacios
        const nuevoUsuario = new Usuario({ 
            telefono: telefono.trim(), 
            rol: rol.toLowerCase().trim() 
        });
        await nuevoUsuario.save();
        res.json({ mensaje: "Ok" });
    } catch (e) {
        res.status(500).json({ error: "Error al registrar" });
    }
});

// LOGIN (Buscando datos limpios)
app.post('/login', async (req, res) => {
    try {
        const { telefono } = req.body;
        const usuario = await Usuario.findOne({ telefono: telefono.trim() });
        
        if (usuario) {
            // Enviamos el rol siempre en minúscula
            res.json({
                telefono: usuario.telefono,
                rol: usuario.rol.toLowerCase().trim()
            });
        } else {
            res.json({ error: "No encontrado" });
        }
    } catch (e) {
        res.status(500).json({ error: "Error en login" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor Smart Traslados en marcha 🚀"));
