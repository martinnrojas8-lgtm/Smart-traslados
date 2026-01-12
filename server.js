const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// CONEXIÓN A MONGO (Asegúrate de usar tu URL de Mongo real aquí)
mongoose.connect('TU_URL_DE_MONGODB', { useNewUrlParser: true, useUnifiedTopology: true });

// --- ESQUEMAS ---

// Esquema de Usuarios
const UsuarioSchema = new mongoose.Schema({
    telefono: String,
    nombre: String,
    tipo: String, // 'chofer' o 'pasajero'
    autoModelo: String,
    autoPatente: String,
    autoColor: String,
    foto: String,
    fotoCarnet: String,
    fotoSeguro: String,
    fotoTarjeta: String,
    pagoActivo: { type: Boolean, default: false } // Para el bloqueo de la app
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Esquema de Tokens (Códigos de Activación)
const TokenSchema = new mongoose.Schema({
    codigo: String,
    usado: { type: Boolean, default: false },
    fechaCreacion: { type: Date, default: Date.now }
});
const Token = mongoose.model('Token', TokenSchema);

// --- RUTAS DE USUARIO ---

app.get('/obtener-usuarios', async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

app.post('/actualizar-perfil-chofer', async (req, res) => {
    const { telefono, nombre, modelo, patente, color, fotoPerfil, fotoCarnet, fotoSeguro, fotoTarjeta, pagoActivo } = req.body;
    
    // Usamos upsert para que si no existe lo cree, y si existe lo actualice
    await Usuario.findOneAndUpdate(
        { telefono: telefono },
        { 
            nombre, 
            autoModelo: modelo, 
            autoPatente: patente, 
            autoColor: color,
            foto: fotoPerfil,
            fotoCarnet,
            fotoSeguro,
            fotoTarjeta,
            pagoActivo // Permite al admin activarlo manualmente también
        },
        { upsert: true }
    );
    res.json({ mensaje: "Ok" });
});

// --- RUTAS DE TOKENS (SISTEMA DE CÓDIGOS) ---

// 1. Generar un Token (Desde el Admin)
app.post('/crear-token', async (req, res) => {
    const { codigo } = req.body;
    const nuevoToken = new Token({ codigo: codigo });
    await nuevoToken.save();
    res.json({ mensaje: "Token creado con éxito" });
});

// 2. Validar un Token (Desde el Chofer)
app.post('/validar-token', async (req, res) => {
    const { codigo, telefono } = req.body;
    
    // Buscamos si el código existe y no ha sido usado
    const tokenEncontrado = await Token.findOne({ codigo: codigo, usado: false });

    if (tokenEncontrado) {
        // Marcamos el token como usado
        tokenEncontrado.usado = true;
        await tokenEncontrado.save();

        // Activamos al chofer
        await Usuario.findOneAndUpdate({ telefono: telefono }, { pagoActivo: true });
        
        res.json({ ok: true, mensaje: "Cuenta activada correctamente" });
    } else {
        res.status(400).json({ ok: false, mensaje: "Código inválido o ya utilizado" });
    }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
