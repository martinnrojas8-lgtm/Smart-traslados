const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();

app.use(cors());

// Configuración para recibir fotos pesadas (Aumentado a 100mb por seguridad)
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
    estadoRevision: { type: String, default: "pendiente" },
    fechaRegistro: { type: Date, default: Date.now }
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// --- RUTAS DE ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/chofer', express.static(path.join(__dirname, 'chofer')));
app.use('/pasajero', express.static(path.join(__dirname, 'pasajero')));

// --- RUTAS DE API ---

// REGISTRO
app.post('/register', async (req, res) => {
    try {
        const tel = req.body.telefono.trim();
        const rolElegido = req.body.rol.toLowerCase().trim();
        
        const existe = await Usuario.findOne({ telefono: tel });
        if(existe) {
            return res.json({ mensaje: "Ok", usuario: existe }); 
        }

        const nuevoUsuario = new Usuario({ 
            telefono: tel, 
            rol: rolElegido 
        });
        
        await nuevoUsuario.save();
        res.json({ mensaje: "Ok" });
    } catch (e) { 
        res.status(500).json({ error: "Error en registro" }); 
    }
});

// LOGIN
app.post('/login', async (req, res) => {
    try {
        const tel = req.body.telefono.trim();
        const rolElegido = req.body.rol.toLowerCase().trim();
        const usuario = await Usuario.findOne({ telefono: tel, rol: rolElegido });
        
        if (usuario) {
            res.json({ mensaje: "Ok", usuario: usuario });
        } else {
            res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
    } catch (e) { 
        res.status(500).json({ error: "Error en servidor" }); 
    }
});

// ACTUALIZAR PERFIL (Corregido para coincidir con perfil.html)
app.post('/actualizar-perfil-chofer', async (req, res) => {
    try {
        const d = req.body;
        console.log("Recibiendo actualización de perfil para:", d.telefono);

        // Mapeo exacto de los campos que enviamos desde el HTML
        const actualizacion = {
            nombre: d.nombre,
            autoModelo: d.modelo,
            autoPatente: d.patente,
            autoColor: d.color,
            foto: d.fotoPerfil,
            fotoCarnet: d.fotoCarnet,
            fotoSeguro: d.fotoSeguro,
            fotoTarjeta: d.fotoTarjeta,
            estadoRevision: "pendiente" // Cada vez que edita, vuelve a revisión
        };

        const resultado = await Usuario.findOneAndUpdate(
            { telefono: d.telefono.trim() }, 
            actualizacion,
            { new: true }
        );

        if (resultado) {
            console.log("✅ Perfil actualizado correctamente");
            res.json({ mensaje: "Ok" });
        } else {
            console.log("❌ No se encontró el usuario para actualizar");
            res.status(404).json({ error: "Usuario no encontrado" });
        }

    } catch (e) { 
        console.error("❌ Error al guardar perfil:", e);
        res.status(500).json({ error: "Error interno al guardar documentos" }); 
    }
});

app.get('/obtener-usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find().sort({ fechaRegistro: -1 });
        res.json(usuarios);
    } catch (e) {
        res.status(500).json({ error: "Error al obtener lista" });
    }
});

app.get('*', (req, res) => { 
    res.sendFile(path.join(__dirname, 'Public', 'login.html')); 
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor Smart Online en puerto ${PORT} 🚀`));
