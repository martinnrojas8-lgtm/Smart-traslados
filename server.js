const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();

app.use(cors());

// Configuración para recibir fotos pesadas de iPhone
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// CONEXIÓN A MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB ✅"))
  .catch(err => console.error("Error Mongo ❌:", err));

// ESQUEMA DE USUARIO
const UsuarioSchema = new mongoose.Schema({
    telefono: { type: String, unique: true },
    rol: String,
    nombre: String,
    foto: String,
    autoModelo: String,
    autoPatente: String,
    autoColor: String,
    fotoCarnet: String,
    fotoSeguro: String,
    fotoTarjeta: String,
    estadoRevision: { type: String, default: "pendiente" }
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// --- RUTAS DE ARCHIVOS (CORREGIDAS CON "P" MAYÚSCULA) ---
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/chofer', express.static(path.join(__dirname, 'chofer')));
app.use('/pasajero', express.static(path.join(__dirname, 'pasajero')));

// --- RUTAS DE API ---

app.post('/register', async (req, res) => {
    try {
        const { telefono, rol } = req.body;
        const existe = await Usuario.findOne({ telefono: telefono.trim() });
        if(existe) return res.json({ mensaje: "Ok" }); 
        const nuevoUsuario = new Usuario({ telefono: telefono.trim(), rol: rol.toLowerCase().trim() });
        await nuevoUsuario.save();
        res.json({ mensaje: "Ok" });
    } catch (e) { res.status(500).json({ error: "Error en registro" }); }
});

app.post('/login', async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ telefono: req.body.telefono.trim() });
        if (usuario) res.json(usuario);
        else res.status(404).json({ error: "No registrado" });
    } catch (e) { res.status(500).json({ error: "Error en login" }); }
});

app.post('/actualizar-perfil-chofer', async (req, res) => {
    try {
        const d = req.body;
        await Usuario.findOneAndUpdate({ telefono: d.telefono.trim() }, { 
            nombre: d.nombre, 
            autoModelo: d.modelo, 
            autoPatente: d.patente, 
            autoColor: d.color, 
            foto: d.fotoPerfil, 
            fotoCarnet: d.fotoCarnet,
            fotoSeguro: d.fotoSeguro, 
            fotoTarjeta: d.fotoTarjeta 
        });
        res.json({ mensaje: "Ok" });
    } catch (e) { res.status(500).json({ error: "Error al guardar perfil" }); }
});

// --- RUTA SALVAVIDAS (CORREGIDA CON "P" MAYÚSCULA) ---
app.get('*', (req, res) => { 
    res.sendFile(path.join(__dirname, 'Public', 'login.html')); 
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor Smart Online 🚀"));
