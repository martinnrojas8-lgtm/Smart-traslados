const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// IMPORTANTE: Aumentamos el límite para recibir fotos (Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CONEXIÓN A MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB ✅"))
  .catch(err => console.error("Error conectando a Mongo ❌:", err));

// ESQUEMA DE USUARIO MEJORADO
const UsuarioSchema = new mongoose.Schema({
    telefono: { type: String, unique: true },
    rol: String,
    nombre: String,
    foto: String, // Foto de perfil
    // Datos específicos de Chofer
    autoModelo: String,
    autoPatente: String,
    autoColor: String,
    fotoCarnet: String,
    fotoSeguro: String,
    fotoTarjeta: String,
    estadoRevision: { type: String, default: "pendiente" } // Para que tú los habilites luego
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// SERVIR CARPETAS
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/chofer', express.static(path.join(__dirname, 'chofer')));
app.use('/pasajero', express.static(path.join(__dirname, 'pasajero')));

// --- RUTAS DE PERFIL ---

// Actualizar Perfil Pasajero
app.post('/actualizar-perfil', async (req, res) => {
    try {
        const { telefono, nombre, foto } = req.body;
        await Usuario.findOneAndUpdate(
            { telefono: telefono.trim() },
            { nombre, foto }
        );
        res.json({ mensaje: "Ok" });
    } catch (e) {
        res.status(500).json({ error: "Error al guardar perfil" });
    }
});

// Actualizar Perfil Chofer (Documentación completa)
app.post('/actualizar-perfil-chofer', async (req, res) => {
    try {
        const { 
            telefono, nombre, modelo, patente, color, 
            fotoPerfil, fotoCarnet, fotoSeguro, fotoTarjeta 
        } = req.body;

        await Usuario.findOneAndUpdate(
            { telefono: telefono.trim() },
            { 
                nombre, 
                autoModelo: modelo, 
                autoPatente: patente, 
                autoColor: color,
                foto: fotoPerfil,
                fotoCarnet,
                fotoSeguro,
                fotoTarjeta,
                estadoRevision: "pendiente"
            }
        );
        res.json({ mensaje: "Ok" });
    } catch (e) {
        res.status(500).json({ error: "Error al guardar perfil chofer" });
    }
});

// --- RUTAS DE LOGIN Y REGISTRO ---

app.post('/register', async (req, res) => {
    try {
        const { telefono, rol } = req.body;
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

app.post('/login', async (req, res) => {
    try {
        const { telefono } = req.body;
        const usuario = await Usuario.findOne({ telefono: telefono.trim() });
        
        if (usuario) {
            res.json({
                telefono: usuario.telefono,
                rol: usuario.rol.toLowerCase().trim(),
                nombre: usuario.nombre || null // Enviamos el nombre para el filtro del frontend
            });
        } else {
            res.json({ error: "No encontrado" });
        }
    } catch (e) {
        res.status(500).json({ error: "Error en login" });
    }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor Smart Traslados en marcha 🚀"));
