const express = require("express");
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json()); // Para interpretar los datos JSON

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "quimiap" 
});

// Ruta para registrar usuarios
app.post('/quimiap', (req, res) => {
    const sql = "INSERT INTO usuario (tipo_documento, num_documento, nombres, apellido, telefono, correo_electronico, contrasena, rol, estado) VALUES (?)";
    const values = [
      req.body.tipo_documento,
      req.body.num_documento,
      req.body.nombres,
      req.body.apellidos,
      req.body.telefono,
      req.body.correo_electronico,
      req.body.contrasena,
      req.body.rol || 'Cliente',
      req.body.estado || 'Pendiente'
    ];
    
    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("Error al insertar usuario:", err);
        return res.status(500).json({ error: "Error al insertar el usuario en la base de datos" });
      }
      return res.status(201).json({ message: "Usuario registrado exitosamente", id: result.insertId });
    });
  });
// Ruta para login de usuario


app.listen(4001, () => {
    console.log("Servidor corriendo en el puerto 4000");
});
