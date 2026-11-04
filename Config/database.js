const mongoose = require('mongoose');

// Devuelve "id" además de "_id" en las respuestas JSON (el frontend usa p.id)
mongoose.set('toJSON', { virtuals: true, versionKey: false });

const conectarDB = () => mongoose.connect(process.env.MONGODB_URI);

module.exports = conectarDB;
