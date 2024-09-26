const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const productosFilePath = path.join(__dirname, 'productos.json'); // Ruta del archivo JSON

// Middleware para habilitar CORS
app.use(cors());
app.use(express.json());

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'assets/images/uploads/');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Cargar productos desde el archivo JSON al inicio
let productos = [];
if (fs.existsSync(productosFilePath)) {
    const data = fs.readFileSync(productosFilePath);
    productos = JSON.parse(data);
}
// Endpoint para agregar productos
app.post('/productos/upload', upload.single('imagen'), (req, res) => {
    const { nombre, precio, descripcion } = req.body; // Extraer descripcion

    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ninguna imagen.' });
    }

    if (!nombre || !precio || !descripcion) { // Comprobar que descripción no sea vacía
        return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const producto = {
        id: Date.now(),
        nombre,
        precio: parseFloat(precio),
        descripcion, // Usar la descripción extraída
        imagen: `assets/images/uploads/${req.file.filename}`
    };

    productos.push(producto);
    fs.writeFileSync(productosFilePath, JSON.stringify(productos, null, 2)); // Guardar productos en el archivo JSON
    res.status(201).json(producto);
});


// Endpoint para obtener todos los productos
app.get('/productos', (req, res) => {
    res.status(200).json(productos);
});


// Endpoint para obtener un producto por ID
app.get('/productos/:id', (req, res) => {
    const { id } = req.params;
    const producto = productos.find(prod => prod.id === Number(id)); // Comparar como número

    if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
});


// Endpoint para eliminar un producto
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;
    productos = productos.filter(producto => producto.id != id);
    fs.writeFileSync(productosFilePath, JSON.stringify(productos, null, 2));
    res.status(204).send();
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
