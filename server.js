const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();

app.use(cors());

// Configuración para recibir fotos pesadas (del código de abajo)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// --- CONEXIÓN A MONGODB (Recuperada del código de arriba para que conecte ✅) ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://martinnrojas8:martin123@cluster0.v7z8x.mongodb.net/smart-traslados?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log("Conectado a MongoDB ✅"))
  .catch(err => console.error("Error Mongo ❌:", err));

// --- ESQUEMAS (Tu trabajo del día del código de abajo) ---
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
    pagoActivo: { type: Boolean, default: false }, 
    estadoRevision: { type: String, default: "pendiente" },
    fechaRegistro: { type: Date, default: Date.now }
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

const TokenSchema = new mongoose.Schema({
    codigo: String,
    usado: { type: Boolean, default: false },
    fechaCreacion: { type: Date, default: Date.now }
});
const Token = mongoose.model('Token', TokenSchema);

// --- RUTAS DE ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/chofer', express.static(path.join(__dirname, 'chofer')));
app.use('/pasajero', express.static(path.join(__dirname, 'pasajero')));

// --- API ---

// 1. RUTA DE LOGIN (Recuperada del código de arriba para que puedas entrar)
app.post('/login', async (req, res) => {
    try {
        const tel = req.body.telefono.trim();
        const rolElegido = req.body.rol.toLowerCase().trim();
        const usuario = await Usuario.findOne({ telefono: tel, rol: rolElegido });
        
        if (usuario) {
            console.log(`Login exitoso: ${tel}`);
            res.json({ mensaje: "Ok", usuario: usuario });
        } else {
            res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
    } catch (e) { 
        res.status(500).json({ error: "Error en servidor" }); 
    }
});

// 2. REGISTRO (De tu código de abajo)
app.post('/register', async (req, res) => {
    try {
        const { telefono, rol } = req.body;
        const existe = await Usuario.findOne({ telefono });
        if(existe) return res.json({ mensaje: "Ok", usuario: existe });
        const nuevo = new Usuario({ telefono, rol: rol.toLowerCase() });
        await nuevo.save();
        res.json({ mensaje: "Ok", usuario: nuevo });
    } catch (e) { res.status(500).json({ error: "Error" }); }
});

// 3. OBTENER USUARIOS (Para tu Panel de Admin)
app.get('/obtener-usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find().sort({ fechaRegistro: -1 });
        res.json(usuarios);
    } catch (e) { res.status(500).send(e); }
});

// 4. ACTUALIZAR PERFIL (De tu código de abajo)
app.post('/actualizar-perfil-chofer', async (req, res) => {
    try {
        const d = req.body;
        await Usuario.findOneAndUpdate({ telefono: d.telefono }, { 
            nombre: d.nombre, autoModelo: d.modelo, autoPatente: d.patente, 
            autoColor: d.color, foto: d.fotoPerfil, fotoCarnet: d.fotoCarnet,
            fotoSeguro: d.fotoSeguro, fotoTarjeta: d.fotoTarjeta 
        });
        res.json({ mensaje: "Ok" });
    } catch (e) { res.status(500).json({ error: "Error" }); }
});

// 5. RUTAS DE TOKENS (Para que el panel de admin funcione)
app.post('/crear-token', async (req, res) => {
    const nuevoToken = new Token({ codigo: req.body.codigo });
    await nuevoToken.save();
    res.json({ mensaje: "Token creado" });
});

app.post('/validar-token', async (req, res) => {
    const { codigo, telefono } = req.body;
    const t = await Token.findOne({ codigo, usado: false });
    if (t) {
        t.usado = true; await t.save();
        await Usuario.findOneAndUpdate({ telefono }, { pagoActivo: true });
        res.json({ ok: true });
    } else { res.status(400).json({ ok: false }); }
});

// 6. RUTA ADMIN (Para entrar al panel corregido)
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index-admin.html'));
});

// 7. RUTA RAIZ (Vuelve al login si algo falla)
app.get('*', (req, res) => { 
    res.sendFile(path.join(__dirname, 'Public', 'login.html')); 
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor Smart Online en puerto ${PORT} 🚀`));
