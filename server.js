const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// 1. Servir las carpetas de los módulos
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/chofer', express.static(path.join(__dirname, 'chofer')));
app.use('/pasajero', express.static(path.join(__dirname, 'pasajero')));
app.use(express.static(path.join(__dirname, 'Public')));

// 2. RUTA MÁGICA: Cuando entren a la web, enviarles el login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

// --- Lógica de Usuarios ---
let usuarios = []; 

app.post('/register', (req, res) => {
    const { telefono, rol } = req.body;
    usuarios.push({ telefono, rol });
    res.json({ mensaje: "Ok" });
});

app.post('/login', (req, res) => {
    const { telefono } = req.body;
    const usuario = usuarios.find(u => u.telefono === telefono);
    if (usuario) res.json(usuario);
    else res.json({ error: "No encontrado" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor listo"));
