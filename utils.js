const { Message, GuildMember, Client } = require('discord.js') // estructuras de algunos datos

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
    cooldowns: { type: Map, default: new Map() } // cooldowns de los comandos del usuario
});

/** 
* Clase con funciones de ayuda
* @class Utils | Helper
*/
class Utils {
    /**
    * Crea un nuevo helper con el mensaje enviado
    * @param {Message} Msg - El mensaje enviado
    * @param {string[]} Args - Los argumentos del mensaje
    * @param {Client} Client - client del bot (usuario de discord del bot)
    */
    constructor(Msg, Args, Client) {
        this.msg = Msg;
        this.args = Args;
        this.client = Client;
    }


    static users = mongoose.model('user', UserSchema); // model del UserSchema


    /**
    * Funcion que ejecuta una busqueda de los miembros de un server con los datos dados
    * @param {Boolean} allowedAuthor - Boolean para verificar si se incluye al autor del mensaje en la busqueda
    * @returns {GuildMember|object} la informacion del miembro encontrado o un object si hubo algun error
    */
    async findMember(allowedAuthor = false) {
        let member = this.msg.mentions.members.first() || this.msg.guild.members.cache.get(this.args[0]); // busqueda del miembro por medio de mención o de id

        // verificador si se incluye el autor en la busqueda, si está activado y no coloca ningún argumento, devuelve al autor del mensaje
        if (allowedAuthor && !this.args[0]) {
            member = this.msg.member;
        }

        // verificador si no encuentra miembro con mención o id
        if (!member) {
            const name = this.args.join(' ').toLowerCase(); // nombre, tag o apodo de la persona a buscar
            if (!name) return { error: true, messageError: 'Tienes que mencionar a una persona' }; // verificador si no coloca ningun nombre

            member = this.msg.guild.members.cache.find(mb => mb.user.tag?.toLowerCase().includes(name) || mb.nickname?.toLowerCase().includes(name)); // busqueda del miembro por medio de su nombre, tag o apodo
            if (!member) return { error: true, messageError: 'No se encontró a ningún usuario con ese nombre' } // verificador por si no se encuentra a nadie en la busqueda
        }

        return member; // la información del miembro encontrado
    }


    /**
    * establece el cooldown a un comando y un usuario en especifico
    * @param {string} commandName - el nombre del comando
    * @param {string} userId - la id del usuario
    */
    static async setCooldown(commandName, userId) {
        const user = await this.userFetch(userId, 'global'); // base de datos global del usuario
        user.cooldowns.set(commandName, Date.now()) // se establece el cooldown
        await user.save(); // y se guarda la base de datos
    }


    /**
    * formatea una fecha a un texto mas legible
    * @param {number} time - la fecha a formatear
    * @returns {string} un texto con la fecha formateada
    */
    static setTimeFormat(time) {
        let text = ''; // texto de la fecha formateada
        const date = new Date(Math.abs(Date.now() - time)); // fecha formateada

        // tiempos de la fecha dada (años, meses, dias, horas, minutos, segundos)
        const times = [            
            { value: date.getUTCFullYear() - 1970, suffix: date.getUTCFullYear() - 1970 <= 1 ? 'año' : 'años' },
            { value: date.getUTCMonth(), suffix: date.getUTCMonth() <= 1 ? 'mes' : 'meses'},
            { value: date.getUTCDate() - 1, suffix: date.getUTCDate() - 1 <= 1 ? 'dia' : 'dias' },
            { value: date.getUTCHours(), suffix: date.getUTCHours() <= 1 ? 'hora' : 'horas' },
            { value: date.getUTCMinutes(), suffix: date.getUTCMinutes() <= 1 ? 'minuto' : 'minutos' },
            { value: date.getUTCSeconds(), suffix: date.getUTCSeconds() <= 1 ? 'segundo' : 'segundos' }
        ];

        // un ciclo que itera cada tiempo de la fecha dada, si es mayor que 0, agrega el tiempo al texto
        for (let x = 0; x < times.length; x++) {
            if (times[x].value > 0) {
                text += `${times[x].value} ${times[x].suffix} `;
            }
        }

        return text.trim(); // se devuelve la fecha formateada sin espacios al final
    }


    /**
    * añade xp a un usuario en su base de datos global
    * @param {string} userId - la id del usuario 
    * @param {number} xp - la xp a añadir
    * @returns {boolean} un boolean si el usuario sube de nivel
    */
    static async addXp(userId, xp) {
        const user = await this.userFetch(userId, 'global'); // base de datos global del usuario

        user.xp += xp; // xp añadida
        user.level = Math.floor(0.1 * Math.sqrt(user.xp)); // level que tiene por su xp

        await user.save(); // se guarda la base de datos
        return (Math.floor(0.1 * Math.sqrt(user.xp -= xp)) < user.level);  // y se retonan un boolean que verifica si sube de nivel o no
    }


    /**
    * añade coins a un usuario en un servidor
    * @param {string} userId - la id del usuario 
    * @param {string} guildId - la id del servidor
    * @param {number} coins - las monedas a añadir
    * @returns {UsersModel} el usuario a quien se le añadió las coins
    */
    static async addCoins(userId, guildId, coins) {
        const user = await this.userFetch(userId, guildId); // base de datos del usuario en el servidor
        user.coins += coins; // coins añadidas
        await user.save(); // se guarda la base de datos
        return user; // y se retonan los datos del usuario
    }


    /**
    * remueve coins a un usuario en un servidor
    * @param {string} userId - la id del usuario 
    * @param {string} guildId - la id del servidor
    * @param {number} coins - las monedas a retirar
    * @returns {UsersModel} el usuario a quien se le quitó las coins
    */
    static async removeCoins(userId, guildId, coins) {
        const user = await this.userFetch(userId, guildId); // base de datos del usuario en el servidor
        user.coins -= coins; // coins removidas
        user.save(); // se guarda la base de datos
        return user; // y se retonan los datos del usuario
    }


    /**
    * busca a un usuario en alguna base de datos
    * @param {string} userId - la id del usuario 
    * @param {string} guildId - la id del servidor, o global
    * @returns {UsersModel|false} el usuario buscado o un false si no encuentra a nadie
    */
    static async userFetch(userId, guildId) {
        const user = await this.users.findOne({ user: userId, guild: guildId }); // base de datos del usuario
        if (!user) return false; // verificador por si no existe la base de datos
        return user;
    }
}

module.exports = Utils;