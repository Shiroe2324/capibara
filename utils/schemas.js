const mongoose = require('mongoose'); // librería para ejecutar MongoDB
mongoose.connect(process.env.MONGODB_URI) // conexión con la base de datos de MongoDB

// esquema de mongodb de la informacion de los usuarios
const UserSchema = new mongoose.Schema({
    Type: { type: String, default: 'user' }, // tipo de base de datos
    user: { type: String }, // id del usuario
    guild: { type: String }, // id del servidor, o si es base global
    date: { type: Date }, // fecha de creación de la base de datos
    coins: { type: Number, default: 0 }, // monedas del usuario
    xp: { type: Number, default: 0 }, // xp del usuario
    level: { type: Number, default: 0 },  // nivel del usuario
    cooldowns: { type: Map, default: new Map() }, // cooldowns de los comandos del usuario
    blacklist: { type: Boolean, default: false }, // si el usuario esta bloqueado del bot
});

const GuildSchema = new mongoose.Schema({
    Type: { type: String, default: 'guild' }, // tipo de base de datos
    id: { type: String }, // id del servidor
    date: { type: Date }, // fecha de creación de la base de datos
    prefix: { type: String, default: process.env.PREFIX }, // prefix del servidor
    coinName: { type: String, default: 'servercoins' }, // nombre de la moneda del servidor
});

module.exports = {
    users: mongoose.model('user', UserSchema), // modelo del UserSchema
    guilds: mongoose.model('guild', GuildSchema) // modelo del GuildSchema
} 