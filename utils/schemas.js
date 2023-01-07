const mongoose = require('mongoose'); // mongoose library
mongoose.connect(process.env['MONGODB_URI']) // mongoDB conection
mongoose.set('strictQuery', false); // set strict query to false

// mongoose schema with globalUser options
const GlobalUserSchema = new mongoose.Schema({
    Type: { type: String, default: 'globalUser' }, // type of database
    user: { type: String }, // user id
    date: { type: Date }, // creation date of dabatase
    hugs: { type: Number, default: 0 }, // number of hugs
    pats: { type: Number, default: 0 }, // number of pats
    kisses: { type: Map, default: new Map() },
    blacklist: { type: Boolean, default: false }, // user blacklist boolean
});

// mongoose schema with guildUser options
const GuildUserSchema = new mongoose.Schema({
    Type: { type: String, default: 'guildUser' }, // type of database
    user: { type: String }, // user id
    guild: { type: String }, // guild id
    date: { type: Date }, // created date of database
    cooldowns: { type: Map, default: new Map() }, // user commands cooldowns
    coins: { type: Number, default: 0 }, // user coins
    xp: { type: Number, default: 0 }, // user xp
    level: { type: Number, default: 0 }, // user level
});

// mongoose schema with guild options
const GuildSchema = new mongoose.Schema({
    Type: { type: String, default: 'guild' }, // type of database
    id: { type: String }, // guild id
    date: { type: Date }, // creation date of database
    prefix: { type: String, default: process.env['PREFIX'] }, // server prefix
    coin: { type: String, default: process.env['COIN_NAME'] }, // server coin name
});

module.exports = {
    globalUser: mongoose.model('globalUser', GlobalUserSchema), // UserSchema model
    guildUser: mongoose.model('guildUser', GuildUserSchema), // GuildUserSchema model
    guilds: mongoose.model('guild', GuildSchema) // GuildSchema model
} 