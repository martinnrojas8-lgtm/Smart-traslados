const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // ¡Aquí entra Mongo!
const app = express();

app.use(express.json());

// CONEXIÓN A MONGO (Usando la variable que configuramos en Render)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error conectando a Mongo:", err));

// Esquema de Usuario para que Mongo sepa qué guardar
const UsuarioSchema = new mongoose.Schema({
    telefono: String,
    rol: String
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// SERVIR ARCHIVOS
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/chofer', express.static(path.join(__dirname, 'chofer')));
app.use('/pasajero', express.static(path.join(__dirname, 'pasajero')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

// RUTAS USANDO MONGODB
app.post('/register', async (req, res) => {
    const { telefono, rol } = req.body;
    try {
        const nuevoUsuario = new Usuario({ telefono, rol });
        await nuevoUsuario.save();
        res.json({ mensaje: "Ok" });
    } catch (e) {
        res.json({ error: "Error al registrar" });
    }
});

app.post('/login', async (req, res) => {
    const { telefono } = req.body;
    try {
        const usuario = await Usuario.findOne({ telefono });
        if (usuario) res.json(usuario);
        else res.json({ error: "No encontrado" });
    } catch (e) {
        res.json({ error: "Error en login" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor con Mongo Listo"));
