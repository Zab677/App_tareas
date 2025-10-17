// ============================================
// SERVIDOR NODE.JS - APLICACIÓN DE TAREAS
// ============================================

// 1. IMPORTAR DEPENDENCIAS
// Express: Framework web para crear el servidor
// cors: Permite peticiones desde otros dominios
// body-parser: Procesa datos JSON del cliente
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// 2. CREAR LA APLICACIÓN EXPRESS
const app = express();
//const PORT = 3000; // Puerto donde correrá el servidor

// 3. CONFIGURAR MIDDLEWARES
// Middlewares son funciones que procesan las peticiones
app.use(cors()); // Habilita CORS para peticiones desde el navegador
app.use(bodyParser.json()); // Permite recibir datos en formato JSON
app.use(express.static('public')); // Sirve archivos estáticos (HTML, CSS, JS)

// 4. BASE DE DATOS EN MEMORIA
// Simulamos una base de datos con un array
/*
let tareas = [
  {
    id: 1,
    titulo: 'Aprender Node.js',
    descripcion: 'Completar el tutorial de Node.js',
    categoria: 'Educación',
    prioridad: 'alta',
    completada: false,
    fecha: new Date().toISOString()
  },
  {
    id: 2,
    titulo: 'Hacer la compra',
    descripcion: 'Comprar frutas y verduras',
    categoria: 'Personal',
    prioridad: 'media',
    completada: false,
    fecha: new Date().toISOString()
  }
];
*/
let contadorId = 3; // Para asignar IDs únicos

// 5. RUTAS DEL API (ENDPOINTS)

// RUTA PRINCIPAL - Sirve el HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET /api/tareas - Obtener todas las tareas
app.get('/api/tareas', (req, res) => {
  // req = request (petición del cliente)
  // res = response (respuesta del servidor)
  
  const { categoria, prioridad, completada } = req.query;
  
  let tareasFiltradas = tareas;
  
  // Filtrar por categoría si se proporciona
  if (categoria) {
    tareasFiltradas = tareasFiltradas.filter(t => t.categoria === categoria);
  }
  
  // Filtrar por prioridad si se proporciona
  if (prioridad) {
    tareasFiltradas = tareasFiltradas.filter(t => t.prioridad === prioridad);
  }
  
  // Filtrar por estado si se proporciona
  if (completada !== undefined) {
    const isCompletada = completada === 'true';
    tareasFiltradas = tareasFiltradas.filter(t => t.completada === isCompletada);
  }
  
  res.json(tareasFiltradas);
});

// GET /api/tareas/:id - Obtener una tarea específica
app.get('/api/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id); // params contiene parámetros de la URL
  const tarea = tareas.find(t => t.id === id);
  
  if (tarea) {
    res.json(tarea);
  } else {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
});

// POST /api/tareas - Crear una nueva tarea
app.post('/api/tareas', (req, res) => {
  const { titulo, descripcion, categoria, prioridad } = req.body;
  
  // Validación básica
  if (!titulo || !categoria || !prioridad) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos: titulo, categoria, prioridad' 
    });
  }
  
  const nuevaTarea = {
    id: contadorId++,
    titulo,
    descripcion: descripcion || '',
    categoria,
    prioridad,
    completada: false,
    fecha: new Date().toISOString()
  };
  
  tareas.push(nuevaTarea);
  res.status(201).json(nuevaTarea); // 201 = Created
});

// PUT /api/tareas/:id - Actualizar una tarea
app.put('/api/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tareas.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  
  // Actualizar solo los campos proporcionados
  tareas[index] = {
    ...tareas[index],
    ...req.body,
    id // Mantener el ID original
  };
  
  res.json(tareas[index]);
});

// PATCH /api/tareas/:id/toggle - Alternar estado completado
app.patch('/api/tareas/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const tarea = tareas.find(t => t.id === id);
  
  if (!tarea) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  
  tarea.completada = !tarea.completada;
  res.json(tarea);
});

// DELETE /api/tareas/:id - Eliminar una tarea
app.delete('/api/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tareas.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  
  const tareaEliminada = tareas.splice(index, 1);
  res.json({ mensaje: 'Tarea eliminada', tarea: tareaEliminada[0] });
});

// GET /api/estadisticas - Obtener estadísticas
app.get('/api/estadisticas', (req, res) => {
  const stats = {
    total: tareas.length,
    completadas: tareas.filter(t => t.completada).length,
    pendientes: tareas.filter(t => !t.completada).length,
    porCategoria: {}
  };
  
  // Contar tareas por categoría
  tareas.forEach(t => {
    if (!stats.porCategoria[t.categoria]) {
      stats.porCategoria[t.categoria] = 0;
    }
    stats.porCategoria[t.categoria]++;
  });
  
  res.json(stats);
});

// 6. MANEJO DE ERRORES - Ruta para 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 7. INICIAR EL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 SERVIDOR NODE.JS INICIADO 🚀     ║
  ╠════════════════════════════════════════╣
  ║  Servidor corriendo en:                ║
  ║  👉 http://localhost:${PORT}           ║
  ║                                        ║
  ║  API disponible en:                    ║
  ║  👉 http://localhost:${PORT}/api/tareas  ║
  ╚════════════════════════════════════════╝
  `);

});
