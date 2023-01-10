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
    slaps: { type: Number, default: 0 }, // number of slaps
    kisses: { type: Map, default: new Map() }, // kisses  with all users
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
    prefix: { type: String, default: process.env['PREFIX'] }, // guild prefix
    coin: { type: String, default: process.env['COIN_NAME'] }, // guild coin name
    xp: { type: Object, default: { min: 10, max: 30 } }, // guild minimum and maximum xp value
    minimumBet: { type: Number, default: 20 }, // guild minimum bet 
    crimeValue: { type: Object, default: { min: 100, max: 300, fail: 0.2 }},
    workValue: { type: Object, default: { min: 100, max: 500 }}, // guild work minimum and maximum value
    dailyValue: { type: Number, default: 10000 }, // guild daily value
    levelSystem: { type: Boolean, default: false }, // level system Boolean 
    levelChannel: { type: String, default: 'none' }, // guild levels channel
    levelRoles: { type: Map, default: new Map() }, // guild level roles
    levelMessage: { type: String, default: 'Felicidades {member}! has subido al nivel **{level}**.' } // level message when a user level up
});

module.exports = {
    globalUser: mongoose.model('globalUser', GlobalUserSchema), // UserSchema model
    guildUser: mongoose.model('guildUser', GuildUserSchema), // GuildUserSchema model
    guilds: mongoose.model('guild', GuildSchema) // GuildSchema model
} 